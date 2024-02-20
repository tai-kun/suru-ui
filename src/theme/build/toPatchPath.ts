import { escapePatchPathComponent } from "./jsonpatch"

/**
 * ポインタを JSON Patch のパスに変換する。
 *
 * @param pointer ポインタ。
 * @returns JSON Patch のパス。
 */
export default function toPatchPath(pointer: readonly (string | number)[]) {
  let path = ""

  for (const comp of pointer) {
    path += "/"
    path += typeof comp === "number"
      ? comp.toString(10)
      : escapePatchPathComponent(comp)
  }

  return path
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest

  describe("src/theme/build/toPatchPath", () => {
    test("機能する", () => {
      assert.equal(toPatchPath([]), "")
      assert.equal(toPatchPath([""]), "/")
      assert.equal(toPatchPath([" "]), "/ ")
      assert.equal(toPatchPath(["a", "b", "c"]), "/a/b/c")
      assert.equal(toPatchPath(["a", "", "b", "c"]), "/a//b/c")
      assert.equal(toPatchPath(["a", "b", "c"]), "/a/b/c")
      assert.equal(toPatchPath(["", "a", "b", "c"]), "//a/b/c")
    })
  })
}
