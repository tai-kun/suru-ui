import deepmerge from "deepmerge"
import { formatWithOptions } from "node:util"
import visitJson, {
  andBreak,
  BREAK,
  type JsonObject,
  type JsonValue,
  PASS,
  REMOVE,
} from "visit-json"
import isPlainObject from "../../utils/isPlainObject"
import type { CompiledPatchOperation } from "./compilePatchOperation"
import createObjectRecursively from "./createObjectRecursively"
import { PatchOperationMode } from "./schemas"
import toPointer from "./toPointer"

/**
 * JSON Patch の操作を行うオプション。
 */
export interface OperateOptions {
  /**
   * `target` を複製するかどうか。
   *
   * @default false
   */
  clone?: boolean | undefined
  /**
   * 厳密な適用を行うかどうか。
   * `true` の場合、パスが存在しない場合にエラーを投げる。
   * `false` の場合、可能な限り補完を行う。
   *
   * @default undefined
   */
  strict?: boolean | null | undefined
}

/**
 * 書式設定された文字列を返す。
 *
 * @param fmt 書式設定。
 * @param args パラメータ。
 * @returns 書式設定された文字列。
 */
function format(fmt?: any, ...args: unknown[]): string {
  return formatWithOptions(
    {
      depth: 1,
      colors: true,
    },
    fmt,
    ...args,
  )
}

/**
 * JSON Patch の操作を適用する。
 *
 * @param target 操作対象の　JSON オブジェクト。
 * @param op 適用する操作。
 * @param options オプション。
 * @returns 変更後の JSON オブジェクト。
 */
export default function operate(
  target: JsonObject,
  op: CompiledPatchOperation,
  options: OperateOptions | undefined = {},
) {
  const clone = options.clone ? structuredClone : (<T>(x: T) => x)
  const strict = op.strict ?? options.strict ?? false
  const pointer = toPointer(op.path)
  let newObject

  function toError(message: string, ...detail: string[]) {
    return Object.assign(
      new Error(
        [
          message,
          `  strict: ${strict}`,
          `  operation: ${JSON.stringify(op.mode)}`,
          `  path: ${JSON.stringify(op.path)}`,
          ...detail,
        ].join("\n"),
      ),
      {
        // TODO: デバッグ用に追加するか検討。
        // tree: Object.fromEntries(flattenJsonObject(target)),
      },
    )
  }

  if (op.mode === "add" || op.mode === "replace") {
    const point = createObjectRecursively(
      newObject = clone(target),
      pointer,
    )

    if ("new" in point) {
      if (strict) {
        if (op.mode === "add") {
          if (point.new) {
            throw toError(
              "パスまでのオブジェクトが存在しないため、追加できません。"
                + "strict を false にしてください。",
              `  value: ${format(op.value)}`,
            )
          }

          if (
            "key" in point
              ? point.key in point.ref
              : point.idx in point.ref
          ) {
            throw toError(
              "パスが存在するため、追加できません。"
                + "strict を false にするか、代わりに replace モードを使ってください。",
              `  value: ${format(op.value)}`,
            )
          }
        } else if (op.mode === "replace") {
          if (!point.new) {
            throw toError(
              "パスが存在しないため、置換できません。"
                + "strict を false にしてください。",
              `  value: ${format(op.value)}`,
            )
          }

          if (
            "key" in point
              ? !(point.key in point.ref)
              : !(point.idx in point.ref)
          ) {
            throw toError(
              "パスが存在しないため、置換できません。"
                + "strict を false にするか、代わりに add モードを使ってください。",
              `  value: ${format(op.value)}`,
            )
          }
        } else {
          throw new Error(`不明な操作です。: ${op.mode}`)
        }
      }

      if ("key" in point) {
        point.ref[point.key] = op.value
      } else {
        point.ref[point.idx] = op.value
      }
    } else if (strict && op.mode === "add") {
      throw toError(
        "パスが存在するため、追加できません。"
          + "strict を false にするか、代わりに replace モードを使ってください。",
        `  value: ${format(op.value)}`,
      )
    } else if (!isPlainObject(op.value)) {
      throw toError(
        "ルートはオブジェクトでなければなりません。",
        `  value: ${format(op.value)}`,
      )
    } else {
      newObject = op.value
    }
  } else if (op.mode === "merge") {
    const point = createObjectRecursively(
      newObject = clone(target),
      pointer,
    )

    if ("new" in point) {
      if (strict && point.new) {
        throw toError(
          "パスが存在しないため、マージできません。",
          `  value: ${format(op.value)}`,
        )
      }

      if ("key" in point) {
        Object.assign(
          point.ref,
          deepmerge(point.ref, {
            [point.key]: op.value,
          }),
        )
      } else if (
        !isPlainObject(op.value)
        && !Array.isArray(op.value)
      ) {
        point.ref[point.idx] = op.value
      } else if (
        isPlainObject(point.ref[point.idx])
        || Array.isArray(point.ref[point.idx])
      ) {
        point.ref[point.idx] = deepmerge<{}>(point.ref[point.idx]!, op.value)
      } else {
        point.ref[point.idx] = deepmerge<{}>(point.ref, op.value)
      }
    } else if (!isPlainObject(op.value)) {
      throw toError(
        "ルートはオブジェクトでなければなりません。",
        `  value: ${format(op.value)}`,
      )
    } else {
      newObject = deepmerge(point.ref, op.value)
    }
  } else if (op.mode === "copy" || op.mode === "move") {
    const name = op.mode === "copy" ? "コピー" : "移動"
    const fromPointer = toPointer(op.from)
    let fromValue: JsonValue | undefined
    newObject = visitJson(target, (value, path) => {
      if (
        fromPointer.length !== path.length
        || fromPointer.some((comp, i) => comp !== path[i])
      ) {
        return PASS
      }

      fromValue = value as JsonValue

      return op.mode === "move"
        ? andBreak(REMOVE)
        : BREAK
    }) as JsonObject | null

    if (fromValue === undefined) {
      throw toError(
        `${name}元のパスが存在しません。`,
        `  from: ${JSON.stringify(op.from)}`,
      )
    }

    const point = createObjectRecursively(
      newObject = newObject ? clone(newObject) : {},
      pointer,
    )

    if ("new" in point) {
      if (strict) {
        if (point.new) {
          throw toError(
            `パスまでのオブジェクトが存在しないため、${name}できません。`
              + "strict を false にしてください。",
            `  from: ${JSON.stringify(op.from)}`,
          )
        }

        if (
          "key" in point
            ? point.key in point.ref
            : point.idx in point.ref
        ) {
          throw toError(
            `パスが存在するため、${name}できません。`
              + "strict を false にするか、代わりに replace モードを使ってください。",
            `  from: ${JSON.stringify(op.from)}`,
          )
        }
      }

      if ("key" in point) {
        point.ref[point.key] = fromValue
      } else {
        point.ref[point.idx] = fromValue
      }
    } else if (!isPlainObject(fromValue)) {
      throw toError(
        "ルートはオブジェクトでなければなりません。",
        `  from: ${JSON.stringify(op.from)}`,
      )
    } else {
      newObject = fromValue
    }
  } else if (op.mode === "remove") {
    let removed = false
    newObject = visitJson(target, (_, path) => {
      if (
        pointer.length !== path.length
        || pointer.some((comp, i) => comp !== path[i])
      ) {
        return PASS
      }

      removed = true

      return andBreak(REMOVE)
    }) as JsonObject | null

    if (strict && !removed) {
      throw toError("パスが存在しないため、削除できません。")
    }

    newObject ||= {}
  } else {
    throw new Error(`不明な操作です。: ${op.mode}`)
  }

  return newObject
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest

  describe("src/theme/build/operate", () => {
    describe("mode: add", () => {
      describe("strict: false", () => {
        test("パスが存在しない場合は追加する", () => {
          const actual = operate(
            {
              a: 1,
            },
            {
              mode: PatchOperationMode.Add,
              path: "/b/c",
              value: 2,
              strict: undefined,
            },
          )

          assert.deepEqual(actual, {
            a: 1,
            b: {
              c: 2,
            },
          })
        })

        test("パスが存在する場合は置換する", () => {
          const actual = operate(
            {
              a: 1,
              b: {
                c: 2,
              },
            },
            {
              mode: PatchOperationMode.Add,
              path: "/b/c",
              value: 3,
              strict: undefined,
            },
          )

          assert.deepEqual(actual, {
            a: 1,
            b: {
              c: 3,
            },
          })
        })

        test("ルートにオブジェクトを追加できる", () => {
          const actual = operate(
            {
              a: 1,
              b: {
                c: 2,
              },
            },
            {
              mode: PatchOperationMode.Add,
              path: "",
              value: {
                c: 3,
              },
              strict: undefined,
            },
          )

          assert.deepEqual(actual, {
            c: 3,
          })
        })

        test("ルートにオブジェクト以外を追加できない", () => {
          assert.throws(
            () => {
              operate(
                {
                  a: 1,
                  b: {
                    c: 2,
                  },
                },
                {
                  mode: PatchOperationMode.Add,
                  path: "",
                  value: 3,
                  strict: undefined,
                },
              )
            },
          )
        })
      })

      describe("strict: true", () => {
        test("パスが存在しない場合は追加する", () => {
          const actual = operate(
            {
              a: 1,
            },
            {
              mode: PatchOperationMode.Add,
              path: "/b",
              value: 2,
              strict: undefined,
            },
          )

          assert.deepEqual(actual, {
            a: 1,
            b: 2,
          })
        })

        test("パスまでの中間パスが存在しない場合はエラーを投げる", () => {
          assert.throws(
            () => {
              operate(
                {
                  a: 1,
                },
                {
                  mode: PatchOperationMode.Add,
                  path: "/b/c",
                  value: 2,
                  strict: undefined,
                },
                { strict: true },
              )
            },
          )
        })

        test("パスが存在する場合はエラーを投げる", () => {
          assert.throws(
            () => {
              operate(
                {
                  a: 1,
                  b: {
                    c: 2,
                  },
                },
                {
                  mode: PatchOperationMode.Add,
                  path: "/b/c",
                  value: 3,
                  strict: undefined,
                },
                { strict: true },
              )
            },
          )
        })

        test("ルートにオブジェクトを追加できない", () => {
          assert.throws(
            () => {
              operate(
                {
                  a: 1,
                  b: {
                    c: 2,
                  },
                },
                {
                  mode: PatchOperationMode.Add,
                  path: "",
                  value: {
                    c: 3,
                  },
                  strict: undefined,
                },
                { strict: true },
              )
            },
          )
        })
      })
    })

    describe("mode: replace", () => {
      describe("strict: false", () => {
        test("パスが存在しない場合は追加する", () => {
          const actual = operate(
            {
              a: 1,
            },
            {
              mode: PatchOperationMode.Replace,
              path: "/b/c",
              value: 2,
              strict: undefined,
            },
          )

          assert.deepEqual(actual, {
            a: 1,
            b: {
              c: 2,
            },
          })
        })

        test("パスが存在する場合は置換する", () => {
          const actual = operate(
            {
              a: 1,
              b: {
                c: 2,
              },
            },
            {
              mode: PatchOperationMode.Replace,
              path: "/b/c",
              value: 3,
              strict: undefined,
            },
          )

          assert.deepEqual(actual, {
            a: 1,
            b: {
              c: 3,
            },
          })
        })

        test("ルートのオブジェクトを置換できる", () => {
          const actual = operate(
            {
              a: 1,
              b: {
                c: 2,
              },
            },
            {
              mode: PatchOperationMode.Replace,
              path: "",
              value: {
                c: 3,
              },
              strict: undefined,
            },
          )

          assert.deepEqual(actual, {
            c: 3,
          })
        })

        test("ルートのオブジェクト以外に置換できない", () => {
          assert.throws(
            () => {
              operate(
                {
                  a: 1,
                  b: {
                    c: 2,
                  },
                },
                {
                  mode: PatchOperationMode.Replace,
                  path: "",
                  value: 3,
                  strict: undefined,
                },
              )
            },
          )
        })
      })

      describe("strict: true", () => {
        test("パスが存在しない場合はエラーを投げる", () => {
          assert.throws(
            () => {
              operate(
                {
                  a: 1,
                },
                {
                  mode: PatchOperationMode.Replace,
                  path: "/b/c",
                  value: 2,
                  strict: undefined,
                },
                { strict: true },
              )
            },
          )
        })

        test("パスまでの中間パスが存在しない場合はエラーを投げる", () => {
          assert.throws(
            () => {
              operate(
                {
                  a: 1,
                },
                {
                  mode: PatchOperationMode.Replace,
                  path: "/b/c",
                  value: 2,
                  strict: undefined,
                },
                { strict: true },
              )
            },
          )
        })

        test("パスが存在する場合は置換する", () => {
          const actual = operate(
            {
              a: 1,
              b: {
                c: 2,
              },
            },
            {
              mode: PatchOperationMode.Replace,
              path: "/b/c",
              value: 3,
              strict: undefined,
            },
          )

          assert.deepEqual(actual, {
            a: 1,
            b: {
              c: 3,
            },
          })
        })

        test("ルートのオブジェクトを置換できる", () => {
          const actual = operate(
            {
              a: 1,
              b: {
                c: 2,
              },
            },
            {
              mode: PatchOperationMode.Replace,
              path: "",
              value: {
                c: 3,
              },
              strict: undefined,
            },
          )

          assert.deepEqual(actual, {
            c: 3,
          })
        })
      })
    })

    describe("mode: merge", () => {
      describe("strict: false", () => {
        test("パスが存在しない場合は追加する", () => {
          const actual = operate(
            {
              a: 1,
            },
            {
              mode: PatchOperationMode.Merge,
              path: "/b/c",
              value: 2,
              strict: undefined,
            },
          )

          assert.deepEqual(actual, {
            a: 1,
            b: {
              c: 2,
            },
          })
        })

        test("パスが存在する場合はマージする", () => {
          const actual = operate(
            {
              a: 1,
              b: {
                c: 2,
              },
            },
            {
              mode: PatchOperationMode.Merge,
              path: "/b",
              value: {
                d: 3,
              },
              strict: undefined,
            },
          )

          assert.deepEqual(actual, {
            a: 1,
            b: {
              c: 2,
              d: 3,
            },
          })
        })

        test("ルートにオブジェクトをマージできる", () => {
          const actual = operate(
            {
              a: 1,
              b: {
                c: 2,
              },
            },
            {
              mode: PatchOperationMode.Merge,
              path: "",
              value: {
                d: 3,
              },
              strict: undefined,
            },
          )

          assert.deepEqual(actual, {
            a: 1,
            b: {
              c: 2,
            },
            d: 3,
          })
        })

        test("ルートにオブジェクト以外をマージできない", () => {
          assert.throws(
            () => {
              operate(
                {
                  a: 1,
                  b: {
                    c: 2,
                  },
                },
                {
                  mode: PatchOperationMode.Merge,
                  path: "",
                  value: 3,
                  strict: undefined,
                },
              )
            },
          )
        })
      })

      describe("strict: true", () => {
        test("パスが存在しない場合はマージできない", () => {
          assert.throws(
            () => {
              operate(
                {
                  a: 1,
                },
                {
                  mode: PatchOperationMode.Merge,
                  path: "/b/c",
                  value: 2,
                  strict: undefined,
                },
                { strict: true },
              )
            },
          )
        })

        test("パスまでの中間パスが存在しない場合はマージできない", () => {
          assert.throws(
            () => {
              operate(
                {
                  a: 1,
                },
                {
                  mode: PatchOperationMode.Merge,
                  path: "/b/c",
                  value: 2,
                  strict: undefined,
                },
                { strict: true },
              )
            },
          )
        })

        test("パスが存在する場合はマージする", () => {
          const actual = operate(
            {
              a: 1,
              b: {
                c: 2,
              },
            },
            {
              mode: PatchOperationMode.Merge,
              path: "/b",
              value: {
                d: 3,
              },
              strict: undefined,
            },
          )

          assert.deepEqual(actual, {
            a: 1,
            b: {
              c: 2,
              d: 3,
            },
          })
        })

        test("ルートにオブジェクトをマージできる", () => {
          const actual = operate(
            {
              a: 1,
              b: {
                c: 2,
              },
            },
            {
              mode: PatchOperationMode.Merge,
              path: "",
              value: {
                d: 3,
              },
              strict: undefined,
            },
          )

          assert.deepEqual(actual, {
            a: 1,
            b: {
              c: 2,
            },
            d: 3,
          })
        })
      })
    })

    describe("mode: copy", () => {
      describe("strict: false", () => {
        test("コピー元のパスが存在しない場合はエラーを投げる", () => {
          assert.throws(
            () => {
              operate(
                {
                  a: 1,
                },
                {
                  mode: PatchOperationMode.Copy,
                  path: "/b/c",
                  from: "/x",
                  strict: undefined,
                },
              )
            },
          )
        })

        test("コピー先のパスが存在しない場合は追加する", () => {
          const actual = operate(
            {
              a: 1,
            },
            {
              mode: PatchOperationMode.Copy,
              path: "/b/c",
              from: "/a",
              strict: undefined,
            },
          )

          assert.deepEqual(actual, {
            a: 1,
            b: {
              c: 1,
            },
          })
        })

        test("コピー先のパスが存在する場合は置換する", () => {
          const actual = operate(
            {
              a: 1,
              b: {
                c: 2,
              },
            },
            {
              mode: PatchOperationMode.Copy,
              path: "/b/c",
              from: "/a",
              strict: undefined,
            },
          )

          assert.deepEqual(actual, {
            a: 1,
            b: {
              c: 1,
            },
          })
        })

        test("ルートにオブジェクトをコピーできる", () => {
          const actual = operate(
            {
              a: 1,
              b: {
                c: 2,
              },
            },
            {
              mode: PatchOperationMode.Copy,
              path: "",
              from: "/b",
              strict: undefined,
            },
          )

          assert.deepEqual(actual, {
            c: 2,
          })
        })

        test("ルートにオブジェクト以外をコピーできない", () => {
          assert.throws(
            () => {
              operate(
                {
                  a: 1,
                  b: {
                    c: 2,
                  },
                },
                {
                  mode: PatchOperationMode.Copy,
                  path: "",
                  from: "/b/c",
                  strict: undefined,
                },
              )
            },
          )
        })
      })

      describe("strict: true", () => {
        test("コピー元のパスが存在しない場合はエラーを投げる", () => {
          assert.throws(
            () => {
              operate(
                {
                  a: 1,
                },
                {
                  mode: PatchOperationMode.Copy,
                  path: "/b/c",
                  from: "/x",
                  strict: undefined,
                },
                { strict: true },
              )
            },
          )
        })

        test("コピー先のパスが存在しない場合は追加する", () => {
          const actual = operate(
            {
              a: 1,
            },
            {
              mode: PatchOperationMode.Copy,
              path: "/b",
              from: "/a",
              strict: undefined,
            },
            { strict: true },
          )

          assert.deepEqual(actual, {
            a: 1,
            b: 1,
          })
        })

        test("コピー先までの中間パスが存在しない場合はエラーを投げる", () => {
          assert.throws(
            () => {
              operate(
                {
                  a: 1,
                },
                {
                  mode: PatchOperationMode.Copy,
                  path: "/b/c",
                  from: "/a",
                  strict: undefined,
                },
                { strict: true },
              )
            },
          )
        })

        test("コピー先のパスが存在する場合はエラーを投げる", () => {
          assert.throws(
            () => {
              operate(
                {
                  a: 1,
                  b: {
                    c: 2,
                  },
                },
                {
                  mode: PatchOperationMode.Copy,
                  path: "/b/c",
                  from: "/a",
                  strict: undefined,
                },
                { strict: true },
              )
            },
          )
        })
      })
    })

    describe("mode: move", () => {
      describe("strict: false", () => {
        test("移動元のパスが存在しない場合はエラーを投げる", () => {
          assert.throws(
            () => {
              operate(
                {
                  a: 1,
                },
                {
                  mode: PatchOperationMode.Move,
                  path: "/b/c",
                  from: "/x",
                  strict: undefined,
                },
              )
            },
          )
        })

        test("移動先のパスが存在しない場合は追加する", () => {
          const actual = operate(
            {
              a: 1,
            },
            {
              mode: PatchOperationMode.Move,
              path: "/b/c",
              from: "/a",
              strict: undefined,
            },
          )

          assert.deepEqual(actual, {
            b: {
              c: 1,
            },
          })
        })

        test("移動先のパスが存在する場合は置換する", () => {
          const actual = operate(
            {
              a: 1,
              b: {
                c: 2,
              },
            },
            {
              mode: PatchOperationMode.Move,
              path: "/b/c",
              from: "/a",
              strict: undefined,
            },
          )

          assert.deepEqual(actual, {
            b: {
              c: 1,
            },
          })
        })

        test("ルートにオブジェクトを移動できる", () => {
          const actual = operate(
            {
              a: 1,
              b: {
                c: 2,
              },
            },
            {
              mode: PatchOperationMode.Move,
              path: "",
              from: "/b",
              strict: undefined,
            },
          )

          assert.deepEqual(actual, {
            c: 2,
          })
        })

        test("ルートにオブジェクト以外を移動できない", () => {
          assert.throws(
            () => {
              operate(
                {
                  a: 1,
                  b: {
                    c: 2,
                  },
                },
                {
                  mode: PatchOperationMode.Move,
                  path: "",
                  from: "/b/c",
                  strict: undefined,
                },
              )
            },
          )
        })
      })

      describe("strict: true", () => {
        test("移動元のパスが存在しない場合はエラーを投げる", () => {
          assert.throws(
            () => {
              operate(
                {
                  a: 1,
                },
                {
                  mode: PatchOperationMode.Move,
                  path: "/b/c",
                  from: "/x",
                  strict: undefined,
                },
                { strict: true },
              )
            },
          )
        })

        test("移動先のパスが存在しない場合は追加する", () => {
          const actual = operate(
            {
              a: 1,
            },
            {
              mode: PatchOperationMode.Move,
              path: "/b",
              from: "/a",
              strict: undefined,
            },
            { strict: true },
          )

          assert.deepEqual(actual, {
            b: 1,
          })
        })

        test("移動先までの中間パスが存在しない場合はエラーを投げる", () => {
          assert.throws(
            () => {
              operate(
                {
                  a: 1,
                },
                {
                  mode: PatchOperationMode.Move,
                  path: "/b/c",
                  from: "/a",
                  strict: undefined,
                },
                { strict: true },
              )
            },
          )
        })

        test("移動先のパスが存在する場合はエラーを投げる", () => {
          assert.throws(
            () => {
              operate(
                {
                  a: 1,
                  b: {
                    c: 2,
                  },
                },
                {
                  mode: PatchOperationMode.Move,
                  path: "/b/c",
                  from: "/a",
                  strict: undefined,
                },
                { strict: true },
              )
            },
          )
        })
      })
    })

    describe("mode: remove", () => {
      describe("strict: false", () => {
        test("パスが存在しない場合は何もしない", () => {
          const actual = operate(
            {
              a: 1,
            },
            {
              mode: PatchOperationMode.Remove,
              path: "/b/c",
              strict: undefined,
            },
          )

          assert.deepEqual(actual, {
            a: 1,
          })
        })

        test("パスが存在する場合は削除する", () => {
          const actual = operate(
            {
              a: 1,
              b: {
                c: 2,
              },
            },
            {
              mode: PatchOperationMode.Remove,
              path: "/b/c",
              strict: undefined,
            },
          )

          assert.deepEqual(actual, {
            a: 1,
            b: {},
          })
        })
      })

      describe("strict: true", () => {
        test("パスが存在しない場合はエラーを投げる", () => {
          assert.throws(
            () => {
              operate(
                {
                  a: 1,
                },
                {
                  mode: PatchOperationMode.Remove,
                  path: "/b/c",
                  strict: undefined,
                },
                { strict: true },
              )
            },
          )
        })

        test("パスが存在する場合は削除する", () => {
          const actual = operate(
            {
              a: 1,
              b: {
                c: 2,
              },
            },
            {
              mode: PatchOperationMode.Remove,
              path: "/b/c",
              strict: undefined,
            },
            { strict: true },
          )

          assert.deepEqual(actual, {
            a: 1,
            b: {},
          })
        })
      })
    })
  })
}
