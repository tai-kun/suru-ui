/**
 * 範囲を生成する。
 *
 * @param start 開始値。
 * @param end 終了値。
 * @param step ステップ値。
 * @returns 範囲。
 */
export default function* range(start: number, end: number, step: number = 1) {
  if (start > end) {
    for (let i = start; i >= end; i -= step) {
      yield i
    }
  } else {
    for (let i = start; i <= end; i += step) {
      yield i
    }
  }
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest

  describe("src/theme/build/range", () => {
    test("範囲を生成する", () => {
      const actual = [...range(1, 5)]
      const expected = [1, 2, 3, 4, 5]

      assert.deepEqual(actual, expected)
    })

    test("範囲を生成する (逆順)", () => {
      const actual = [...range(5, 1)]
      const expected = [5, 4, 3, 2, 1]

      assert.deepEqual(actual, expected)
    })
  })
}
