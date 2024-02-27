import isPlainObject from "./isPlainObject"

/**
 * オブジェクトが React.RefObject かどうかを判定する。
 *
 * @template T オブジェクトの型。
 * @param obj 判定するオブジェクト。
 * @returns obj が React.RefObject なら true、そうでなければ false。
 */
export default function isRefObject<T>(
  obj: React.RefObject<T> | T | null | undefined,
): obj is React.RefObject<T> {
  return isPlainObject(obj) && Object.hasOwn(obj, "current")
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const React = await import("react")
  const { assert, describe, test } = cfgTest

  describe("src/utils/isRefObject", () => {
    test("React.RefObject なら true を返す", () => {
      assert(isRefObject(React.createRef()))
    })

    test("null または undefined なら false を返す", () => {
      assert(!isRefObject(null))
      assert(!isRefObject(undefined))
    })
  })
}
