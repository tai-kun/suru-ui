import { deepStrictEqual } from "node:assert"
import type { JsonValue } from "visit-json"

/**
 * 値が JSON 値かどうかを判定する。
 *
 * @param value 判定する値。
 * @returns JSON 値ならば true、そうでなければ false。
 */
export default function isJsonValue(value: unknown): value is JsonValue {
  try {
    deepStrictEqual(value, JSON.parse(JSON.stringify(value)))

    return true
  } catch {
    return false
  }
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest

  describe("src/theme/build/isJsonValue", () => {
    test("値が JSON 値かどうかを判定する", () => {
      assert(isJsonValue(null))
      assert(isJsonValue(0))
      assert(isJsonValue(""))
      assert(isJsonValue([]))
      assert(isJsonValue({}))
      assert(!isJsonValue(undefined))
      assert(!isJsonValue(new Date()))
    })
  })
}
