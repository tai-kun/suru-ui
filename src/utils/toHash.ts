/**
 * 文字列からハッシュに変換する。
 *
 * @param str 文字列。
 * @returns ハッシュ。
 * @see https://github.com/streamich/nano-css/blob/60fcaa63f3d4847b11dd3504a8fb3c7d889db2fb/index.js#L5C1-L11C3
 */
export default function toHash(str: string): string {
  let h = 5381, i = str.length

  while (i) {
    h = (h * 33) ^ str.charCodeAt(--i)
  }

  return (h >>> 0).toString(36)
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest

  describe("src/utils/toHash", () => {
    test("文字列からハッシュに変換する", () => {
      assert.equal(toHash(""), "45h")
      assert.equal(toHash("a".repeat(10)), "ejvtlx")
    })
  })
}
