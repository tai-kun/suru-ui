/**
 * 文字列が配列のインデックスとして有効かどうかを判定する。
 *
 * @param str 文字列。
 * @returns 配列のインデックスとして有効なら true。
 */
export default function isIndex(str: string): boolean {
  let len = str.length,
    i = 0,
    c = str.charCodeAt(i)

  if (c === 45) {
    if (len === 1) {
      return false
    }

    c = str.charCodeAt(++i)
  }

  if (
    (c === 48 && i !== len - 1)
    || (c < 48 || c > 57)
  ) {
    return false
  }

  while (++i < len) {
    c = str.charCodeAt(i)

    if (c < 48 || c > 57) {
      return false
    }
  }

  return true
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest

  describe("src/theme/build/isIndex", () => {
    test("文字列が配列のインデックスとして有効かどうかを判定する", () => {
      assert.equal(isIndex("0"), true)
      assert.equal(isIndex("1"), true)
      assert.equal(isIndex("+1"), false)
      assert.equal(isIndex("10"), true)
      assert.equal(isIndex("01"), false)
      assert.equal(isIndex("-1"), true)
      assert.equal(isIndex("-0"), true)
      assert.equal(isIndex("-01"), false)
      assert.equal(isIndex("a"), false)
      assert.equal(isIndex("a0"), false)
      assert.equal(isIndex("0a"), false)
      assert.equal(isIndex("a0a"), false)
    })
  })
}
