import { unescapePatchPathComponent } from "./jsonpatch"

/**
 * JSON Patch のパスをポインタに変換する。
 *
 * @param patchPath JSON Patch のパス。
 * @returns ポインタ。
 */
export default function toPointer(patchPath: string): string[] {
  if (!patchPath) {
    return []
  }

  return patchPath
    .replace(/^\s*\//, "")
    .split("/")
    .map(comp => unescapePatchPathComponent(comp))
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest

  describe("src/theme/build/toPointer", () => {
    test("JSON Patch の path を解析する", () => {
      assert.deepEqual(toPointer(""), [])
      assert.deepEqual(toPointer("/"), [""])
      assert.deepEqual(toPointer("/a/b/c"), ["a", "b", "c"])
      assert.deepEqual(toPointer("/a//b/c"), ["a", "", "b", "c"])
      assert.deepEqual(toPointer("/a/b/c"), ["a", "b", "c"])
      assert.deepEqual(toPointer("/a/0/c"), ["a", "0", "c"])
      assert.deepEqual(toPointer("a/10/c"), ["a", "10", "c"])
      assert.deepEqual(toPointer("a/01/c"), ["a", "01", "c"])
      assert.deepEqual(toPointer("a/-1/c"), ["a", "-1", "c"])
      assert.deepEqual(toPointer("/a/1~12"), ["a", "1/2"])
    })
  })
}
