import type { Output } from "valibot"
import visitJson, { type JsonValue, PASS } from "visit-json"
import compilePatchPath from "./compilePatchPath"
import { escapePatchPathComponent } from "./jsonpatch"
import replaceVariable, { type Variables } from "./replaceVariable"
import { PatchOperationMode, type PatchOperationSchema } from "./schemas"

/**
 * コンパイルされたパッチ操作。
 */
export type CompiledPatchOperation = {
  name: string | undefined
  mode:
    | PatchOperationMode.Add
    | PatchOperationMode.Merge
    | PatchOperationMode.Replace
  path: string
  value: JsonValue
  strict: boolean | undefined
} | {
  name: string | undefined
  mode: PatchOperationMode.Copy | PatchOperationMode.Move
  path: string
  from: string
  strict: boolean | undefined
} | {
  name: string | undefined
  mode: PatchOperationMode.Remove
  path: string
  strict: boolean | undefined
}

/**
 * JSON Patch の path を正規化する。
 *
 * @param pathLike パス文字列またはパスセグメントの配列。
 * @returns JSON Patch の path。
 */
function toPatchPath(
  pathLike: string | readonly (string | number)[],
): `/${string}` | "" {
  if (typeof pathLike === "string") {
    pathLike = pathLike
      ? pathLike.replace(/^\s*\//, "").split("/")
      : []
  }

  pathLike = pathLike.map(escapePatchPathComponent)

  return pathLike.length
    ? `/${pathLike.join("/")}`
    : ""
}

/**
 * JSON Patch の操作をコンパイルする。
 *
 * @param op パッチ操作。
 * @param vars 変数。
 * @returns コンパイルされたパッチ操作。
 */
export default function compilePatchOperation(
  op: Output<typeof PatchOperationSchema>,
  vars: Variables,
): CompiledPatchOperation[] {
  const paths = compilePatchPath(toPatchPath(op.path), vars)

  if (!paths.length) {
    return []
  }

  switch (op.mode) {
    case PatchOperationMode.Add:
    case PatchOperationMode.Merge:
    case PatchOperationMode.Replace: {
      const value = visitJson(op.value, {
        Primitive(primitive) {
          if (typeof primitive !== "string") {
            return PASS
          }

          return replaceVariable(primitive, vars)
        },
      })

      return paths.map(path => ({
        name: op.name ?? undefined,
        mode: op.mode,
        path,
        value,
        strict: op.strict ?? undefined,
      }))
    }

    case PatchOperationMode.Copy:
    case PatchOperationMode.Move: {
      const from_ = compilePatchPath(toPatchPath(op.from), vars)

      if (!from_.length) {
        return []
      }

      if (from_.length === 1) {
        return paths.map(path => ({
          name: op.name ?? undefined,
          mode: op.mode,
          from: from_[0]!,
          path,
          strict: op.strict ?? undefined,
        }))
      }

      if (from_.length === paths.length) {
        return paths.map((path, i) => ({
          name: op.name ?? undefined,
          mode: op.mode,
          from: from_[i]!,
          path,
          strict: op.strict ?? undefined,
        }))
      }

      throw new Error(
        [
          "パッチ操作の検証に失敗しました。",
          `  名前: ${op.name ?? "(無名)"}`,
          "",
          `from の要素数が path の要素数と一致しません (${from_.length} !== ${paths.length})`,
          ...from_.map((f, i) => `  from[${i}]: ${JSON.stringify(f)}`),
          ...paths.map((p, i) => `  path[${i}]: ${JSON.stringify(p)}`),
          "",
        ].join("\n"),
      )
    }

    case PatchOperationMode.Remove:
      return paths.map(path => ({
        name: op.name ?? undefined,
        mode: op.mode,
        path,
        strict: op.strict ?? undefined,
      }))
  }
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest

  describe("src/theme/build/compilePatchOperation", () => {
    describe("toPatchPath", () => {
      function eq(path: any, expected: unknown) {
        assert.equal(toPatchPath(path), expected)
        // 2 回適用しても結果が変わらないことを確認する。
        assert.equal(toPatchPath(toPatchPath(path)), expected)
      }

      test("JSON Patch の path を正規化する", () => {
        eq("", "")
        eq(" /", "/")
        eq("/ ", "/ ")
        eq(" ", "/ ")
        eq("/a/b/c", "/a/b/c")
        eq(" /a//b/c", "/a//b/c")
        eq("a/b/c", "/a/b/c")
        eq(" a/b/c", "/ a/b/c")
        eq(" a/b/c", "/ a/b/c")
      })

      test("JSON Patch の path を文字列に変換する", () => {
        eq([], "")
        eq([""], "/")
        eq([" "], "/ ")
        eq(["a", "b", "c"], "/a/b/c")
        eq(["a", "", "b", "c"], "/a//b/c")
        eq(["a", "b", "c"], "/a/b/c")
        eq(["", "a", "b", "c"], "//a/b/c")
      })
    })

    describe("compilePatchOperation", () => {
      test("パッチ操作をコンパイルする", () => {
        const vars: Variables = {
          getValue: name => ({ "/a": 1, "/b": 2 }[name]),
          getNames: () => ["/a", "/b"],
        }

        assert.deepEqual(
          compilePatchOperation(
            {
              mode: PatchOperationMode.Add,
              path: "/c",
              value: 3,
            },
            vars,
          ),
          [
            {
              name: undefined,
              mode: PatchOperationMode.Add,
              path: "/c",
              value: 3,
              strict: undefined,
            },
          ],
        )

        assert.deepEqual(
          compilePatchOperation(
            {
              mode: PatchOperationMode.Merge,
              path: ["c"],
              value: 3,
            },
            vars,
          ),
          [
            {
              name: undefined,
              mode: PatchOperationMode.Merge,
              path: "/c",
              value: 3,
              strict: undefined,
            },
          ],
        )

        assert.deepEqual(
          compilePatchOperation(
            {
              mode: PatchOperationMode.Replace,
              path: "/c",
              value: 3,
              strict: true,
            },
            vars,
          ),
          [
            {
              name: undefined,
              mode: PatchOperationMode.Replace,
              path: "/c",
              value: 3,
              strict: true,
            },
          ],
        )

        assert.deepEqual(
          compilePatchOperation(
            {
              mode: PatchOperationMode.Copy,
              path: "/c",
              from: "/a",
              strict: false,
            },
            vars,
          ),
          [
            {
              name: undefined,
              mode: PatchOperationMode.Copy,
              path: "/c",
              from: "/a",
              strict: false,
            },
          ],
        )

        assert.deepEqual(
          compilePatchOperation(
            {
              mode: PatchOperationMode.Move,
              path: "/c",
              from: "/a",
              strict: null,
            },
            vars,
          ),
          [
            {
              name: undefined,
              mode: PatchOperationMode.Move,
              path: "/c",
              from: "/a",
              strict: undefined,
            },
          ],
        )

        assert.deepEqual(
          compilePatchOperation(
            {
              mode: PatchOperationMode.Remove,
              path: "/c",
            },
            vars,
          ),
          [
            {
              name: undefined,
              mode: PatchOperationMode.Remove,
              path: "/c",
              strict: undefined,
            },
          ],
        )
      })

      test("from と path の要素数が一致しない場合はエラー", () => {
        assert.throws(
          () => {
            compilePatchOperation(
              {
                mode: PatchOperationMode.Copy,
                path: "/c",
                from: "/a/$[[ 1, 2 ]]",
                strict: false,
              },
              {
                getValue: () => undefined,
                getNames: () => [],
              },
            )
          },
          /from の要素数が path の要素数と一致しません \(2 !== 1\)/,
        )
      })
    })
  })
}
