import { type JsonObject, type JsonValue } from "visit-json"
import isPlainObject from "../../utils/isPlainObject"
import isIndex from "./isIndex"

function inner(
  value: JsonValue | undefined,
  pointer: readonly string[],
): JsonValue | undefined {
  const [key, ...rest] = pointer

  return value === undefined || key === undefined
    ? value
    : isPlainObject(value)
    ? Object.hasOwn(value, key)
      ? inner(value[key], rest)
      : undefined
    : Array.isArray(value)
    ? isIndex(key)
      ? inner(value.at(key as never), rest)
      : undefined
    : rest.length === 0
    ? value
    : undefined
}

/**
 * ポインタから値を取得する。なければ undefined を返す。
 *
 * @param target JSON オブジェクト。
 * @param pointer ポインタ。
 * @returns 値。
 */
export default function getByPointer(
  target: JsonObject,
  pointer: readonly string[],
): JsonValue | undefined {
  return inner(target, pointer)
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest

  describe("src/theme/build/getByPointer", () => {
    test("ポインタの要素が 0 個の場合、target が返る", () => {
      const target = { a: 1 }
      assert.equal(getByPointer(target, []), target)
    })

    test("ポインタが示す要素を取得する", () => {
      const target = { a: 1 }
      assert.equal(getByPointer(target, ["a"]), 1)
    })

    test("ポインタが示す要素が存在しない場合、undefined が返る", () => {
      const target = { a: 1 }
      assert.equal(getByPointer(target, ["b"]), undefined)
    })

    test("配列を含むオブジェクトのポインタが示す要素を取得する", () => {
      const target = { a: [1, 2] }
      assert.equal(getByPointer(target, ["a", "1"]), 2)
    })

    test("配列からインデックス以外のキーを取得しようとした場合、undefined が返る", () => {
      const target = { a: [1, 2] }
      assert.equal(getByPointer(target, ["a", "length"]), undefined)
    })
  })
}
