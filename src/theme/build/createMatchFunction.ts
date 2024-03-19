import { Minimatch, type MinimatchOptions } from "minimatch"

export interface MatchPatterns {
  /**
   * マッチするファイルパスのパターン。
   *
   * @default []
   */
  readonly include?: string | readonly string[] | null | undefined
  /**
   * マッチしないファイルパスのパターン。
   *
   * @default []
   */
  readonly exclude?: string | readonly string[] | null | undefined
}

function toArray<T>(value: T | readonly T[]): readonly T[] {
  return Array.isArray(value) ? value : [value]
}

/**
 * ファイルパスがパターンにマッチするかどうかを判定する関数を作成する。
 *
 * @param patterns - マッチングパターン。
 * @returns ファイルパスがパターンにマッチするかどうかを判定する関数。
 */
export default function createMatchFunction(patterns: MatchPatterns): {
  /**
   * ファイルパスがパターンにマッチするかどうかを判定する。
   *
   * @param file - ファイルパス。
   * @returns ファイルパスがパターンにマッチするかどうか。
   */
  (file: string): boolean
} {
  const include = [...new Set(toArray(patterns.include ?? []))]
  const exclude = [...new Set(toArray(patterns.exclude ?? []))]

  if (include.length === 0) {
    return function match() {
      return false
    }
  }

  const mmOpts: MinimatchOptions = {
    dot: true,
    platform: "linux",
  }
  const incMms = include.map(inc => new Minimatch(inc, { ...mmOpts }))
  const excMms = exclude.map(exc => new Minimatch(exc, { ...mmOpts }))

  return function match(file: string): boolean {
    return (
      incMms.some(mm => mm.match(file))
      && !excMms.some(mm => mm.match(file))
    )
  }
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest

  describe("src/theme/build/createMatchFunction", () => {
    test("機能する", () => {
      const match = createMatchFunction({
        include: ["**/*"],
        exclude: ["**/node_modules/**"],
      })

      assert.equal(match("src/theme/build/utils/createMatch.ts"), true)
      assert.equal(match("src/theme/build/utils/node_modules/foo.js"), false)
    })
  })
}
