import * as cssTree from "css-tree"

/**
 * CSS を正規化する。
 *
 * @param css 正規化する CSS。
 * @returns 正規化された CSS。
 */
export function normalizeCss(css: string): string {
  return cssTree.generate(cssTree.parse(css))
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest

  describe("src/utils-dev/normalizeCss", () => {
    test("CSS を正規化する", () => {
      assert.equal(
        normalizeCss(`
          .foo {
            color: red;
          }
        `),
        normalizeCss(`
          .foo {color: red;}
        `),
      )
    })
  })
}
