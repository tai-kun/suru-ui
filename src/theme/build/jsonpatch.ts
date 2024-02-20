/**
 * JSON Patch の path を正規化する。
 *
 * @param pathComponent パスセグメント。
 * @returns JSON Patch の path。
 */
export function escapePatchPathComponent(
  pathComponent: string | number,
): string {
  return typeof pathComponent === "number"
    ? pathComponent.toString(10)
    : pathComponent.indexOf("/") === -1 && pathComponent.indexOf("~") === -1
    ? pathComponent
    : pathComponent.replace(/~/g, "~0").replace(/\//g, "~1")
}

/**
 * JSON Patch の path を逆正規化する。
 *
 * @param pathComponent パスセグメント。
 * @returns JSON Patch の path。
 */
export function unescapePatchPathComponent(
  pathComponent: string | number,
): string {
  return typeof pathComponent === "number"
    ? pathComponent.toString(10)
    : pathComponent.indexOf("~") === -1
    ? pathComponent
    : pathComponent.replace(/~1/g, "/").replace(/~0/g, "~")
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest

  describe("src/theme/build/jsonpatch", () => {
    describe("escapePatchPathComponent", () => {
      test("パスセグメントをエスケープする", () => {
        assert.equal(escapePatchPathComponent("a"), "a")
        assert.equal(escapePatchPathComponent("a/b"), "a~1b")
        assert.equal(escapePatchPathComponent("a~b"), "a~0b")
        assert.equal(escapePatchPathComponent(1), "1")
      })
    })

    describe("unescapePatchPathComponent", () => {
      test("パスセグメントをアンエスケープする", () => {
        assert.equal(unescapePatchPathComponent("a"), "a")
        assert.equal(unescapePatchPathComponent("a~1b"), "a/b")
        assert.equal(unescapePatchPathComponent("a~0b"), "a~b")
        assert.equal(unescapePatchPathComponent(1), "1")
      })
    })
  })
}
