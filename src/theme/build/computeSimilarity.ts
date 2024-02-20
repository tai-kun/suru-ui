const cache: Record<string, Record<string, number>> = {}

function getToNgram(text: string, n: number): { [nGram: string]: number } {
  const ret: { [key: string]: number } = {}

  for (
    let m = 0,
      c: string,
      i: number,
      len = text.length;
    m < n;
    m++
  ) {
    for (i = 0; i < len - m; i++) {
      c = text.substring(i, i + m + 1)
      ret[c] = ret[c] ? ret[c]! + 1 : 1
    }
  }

  return ret
}

function getValuesSum(ret: { [nGram: string]: number }): number {
  let sum = 0

  for (const cnt of Object.values(ret)) {
    sum += cnt
  }

  return sum
}

/**
 * 類似度を計算する。
 *
 * @param a 1 つめの文字列。
 * @param b 2 つめの文字列。
 * @returns 類似度。
 * @see https://qiita.com/gomaoaji/items/603904e31f965d759293
 */
export default function computeSimilarity(a: string, b: string): number {
  if (a === b) {
    return 1
  }

  if (a in cache && b in cache[a]!) {
    return cache[a]![b]!
  }

  const aGram = getToNgram(a, 3)
  const bGram = getToNgram(b, 3)
  const keyOfAGram = Object.keys(aGram)
  const keyOfBGram = Object.keys(bGram)
  const abKey = keyOfAGram.filter(n => keyOfBGram.includes(n))
  const dot = abKey.reduce(
    (prev, key) => prev + Math.min(aGram[key]!, bGram[key]!),
    0,
  )
  const abLengthMul = Math.sqrt(getValuesSum(aGram) * getValuesSum(bGram))
  const ret = dot / abLengthMul
  ;(cache[a] ||= {})[b] = ret
  ;(cache[b] ||= {})[a] = ret

  return ret
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest

  describe("src/theme/build/computeSimilarity", () => {
    test("完全一致で 1", () => {
      assert(computeSimilarity("abc", "abc") === 1)
    })

    test("部分一致で 0 より大きく 1 より小さい", () => {
      assert(computeSimilarity("abc", "abd") < 1)
      assert(computeSimilarity("abc", "abd") > 0)
    })

    test("完全不一致で 0", () => {
      assert(computeSimilarity("abc", "def") === 0)
    })
  })
}
