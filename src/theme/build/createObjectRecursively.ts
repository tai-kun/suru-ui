import type { JsonObject, JsonValue } from "visit-json"
import isPlainObject from "../../utils/isPlainObject"
import isIndex from "./isIndex"

type JsonObjectOrArray = {
  readonly [key: string | number]: JsonValue
}

function toIndex(key: string | number): number {
  return typeof key === "string"
    ? parseInt(key, 10)
    : key
}

function toIndexSafe(key: string | number): number {
  if (typeof key === "string" && isIndex(key)) {
    return parseInt(key, 10)
  }

  if (typeof key === "number" && Number.isSafeInteger(key) && key >= 0) {
    return key
  }

  throw new TypeError(`インデックスが不正です: ${JSON.stringify(key)}`)
}

/**
 * 再帰的にオブジェクトを作成する。
 *
 * @param root オブジェクトのルート。
 * @param pointer ポインタ。
 * @returns 作成されたオブジェクトへの参照と、最後のキー。
 */
export default function createObjectRecursively(
  root: JsonObject,
  pointer: readonly string[],
): {
  /** オブジェクトのルート */
  ref: JsonObject
} | {
  /** オブジェクトへの参照 */
  ref: JsonObject
  /** 作成されたかどうか */
  new: boolean
  /** 最後のキー */
  key: string
} | {
  /** 配列への参照 */
  ref: JsonValue[]
  /** 作成されたかどうか */
  new: boolean
  /** 最後のキー */
  idx: number
} {
  for (
    let i = 0,
      ref: JsonObjectOrArray = root,
      set = false;
    i < pointer.length;
    i++
  ) {
    const key = pointer[i]!
    const next = pointer[i + 1]

    switch (true) {
      case next === undefined && isPlainObject(ref):
        return {
          ref,
          new: set,
          key: key as string,
        }

      case next === undefined && Array.isArray(ref):
        return {
          ref,
          new: set,
          idx: toIndexSafe(key),
        }

      case ref[key] === undefined
        && Array.isArray(ref)
        && (!isIndex(key)
          || toIndex(key) > (ref as ArrayLike<JsonValue>).length):
        throw new RangeError(
          `配列の要素へのアクセスが範囲外です: ${
            pointer
              .slice(0, i + 1)
              .map(p => JSON.stringify(p))
              .join(" > ")
          }`,
        )

      case ref[key] === undefined:
        ref = (ref[key] as JsonObjectOrArray) = {}
        set = true

        break

      case isPlainObject(ref[key]) || Array.isArray(ref[key]):
        ref = ref[key] as JsonObjectOrArray

        break

      default:
        throw new Error(
          `ポインタが示す値はオブジェクトではありません: ${
            pointer
              .slice(0, i + 1)
              .map(p => JSON.stringify(p))
              .join(" > ")
          }`,
        )
    }
  }

  return {
    ref: root,
  }
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest

  describe("src/theme/build/createObjectRecursively", () => {
    test("作成するポインタがルートの場合はそのまま返す", () => {
      const root: any = {}
      const actual = createObjectRecursively(root, [])

      assert.deepEqual(root, {})
      assert.deepEqual(actual, {
        ref: {},
      })
      assert.equal(actual.ref, root)
    })

    test("作成するポインタにオブジェクトが存在する場合はそのまま返す", () => {
      const root: any = {
        a: {
          0: {
            b: 1,
          },
        },
      }
      const actual = createObjectRecursively(root, ["a", "0"])

      assert.deepEqual(root, {
        a: {
          0: {
            b: 1,
          },
        },
      })
      assert.deepEqual(actual, {
        ref: {
          0: {
            b: 1,
          },
        },
        key: "0",
        new: false,
      })
      assert.equal(actual.ref, root.a)
    })

    test("作成するポインタにオブジェクトが存在しない場合は作成する", () => {
      const root: any = {}
      const actual = createObjectRecursively(root, ["a", "0"])

      assert.deepEqual(root, {
        a: {},
      })
      assert.deepEqual(actual, {
        ref: {},
        key: "0",
        new: true,
      })
      assert.equal(actual.ref, root.a)
    })

    test("作成するポインタにオブジェクトが存在しない場合は作成する", () => {
      const root: any = {
        a: [],
      }
      const actual = createObjectRecursively(root, ["a", "0", "b"])

      assert.deepEqual(root, {
        a: [
          {},
        ],
      })
      assert.deepEqual(actual, {
        ref: {},
        key: "b",
        new: true,
      })
      assert.equal(actual.ref, root.a[0])
    })

    test("配列が範囲外の場合はエラーを投げる", () => {
      const root: any = {
        a: [],
      }

      assert.throws(
        () => createObjectRecursively(root, ["a", "1", "b"]),
        /Error: 配列の要素へのアクセスが範囲外です:/u,
      )
    })

    test("ポインタセグメントがインデックスとして有効でも、すでにオブジェクトが存在する場合は、そのオブジェクトのキーとして扱う", () => {
      const root: any = {
        a: {
          0: {
            b: 1,
          },
        },
      }
      const actual = createObjectRecursively(root, ["a", "1", "b"])

      assert.deepEqual(root, {
        a: {
          0: {
            b: 1,
          },
          1: {},
        },
      })
      assert.deepEqual(actual, {
        ref: {},
        key: "b",
        new: true,
      })
      assert.equal(actual.ref, root.a[1])
    })

    test("配列のインデックスをキーに取る", () => {
      const root: any = {
        a: {
          b: [],
        },
      }
      const actual = createObjectRecursively(root, ["a", "b", "0"])

      assert.deepEqual(root, {
        a: {
          b: [],
        },
      })
      assert.deepEqual(actual, {
        ref: [],
        idx: 0,
        new: false,
      })
      assert.equal(actual.ref, root.a.b)
    })
  })
}
