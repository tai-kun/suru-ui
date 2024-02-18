/**
 * キーに対して一意のインスタンスを返す。
 *
 * @template T インスタンスの型。
 * @param key キー。
 * @param init インスタンスを初期化する関数。
 * @returns インスタンス。
 */
export default function singleton<T>(key: string, init: () => T): T {
  const store = typeof document !== "undefined"
    ? (window.__sui_singleton ||= {})
    : (global.__sui_singleton ||= {})

  return (store[key] ||= init())
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest

  describe("src/utils/singleton", () => {
    test("同じキーで呼び出された場合、同じインスタンスが返される", () => {
      const ins1 = singleton("foo", () => ({}))
      const ins2 = singleton("foo", () => ({}))

      assert.equal(ins1, ins2)
    })

    test("異なるキーで呼び出された場合、異なるインスタンスが返される", () => {
      const ins1 = singleton("bar", () => ({}))
      const ins2 = singleton("baz", () => ({}))

      assert.notEqual(ins1, ins2)
    })
  })
}
