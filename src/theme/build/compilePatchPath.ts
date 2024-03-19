import replaceRange from "./replaceRange"
import replaceVariable, { type Variables } from "./replaceVariable"

/**
 * パッチのパスをコンパイルする。
 *
 * @param patchPath - パッチのパス。
 * @param variables - 変数の値を取得する機能。
 * @returns コンパイルされたパッチのパス。
 */
export default function compilePatchPath(
  patchPath: string,
  variables: Variables,
): string[] {
  return replaceRange(patchPath).map(p => replaceVariable(p, variables))
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest

  describe("src/theme/build/compilePatchPath", () => {
    test("範囲も変数もなければそのまま返す。", () => {
      assert.deepEqual(
        compilePatchPath("/a/b/0", {
          getValue: name => ({ "/a/b": 1, "/a/b/0": 2 }[name]),
          getNames: () => ["/a/b", "/a/b/0"],
        }),
        ["/a/b/0"],
      )
    })

    test("入れ子の変数を置き換える", () => {
      assert.deepEqual(
        compilePatchPath("/path/to/${{ /a/b/${{ /a/b }} }}", {
          getValue: name => ({ "/a/b": 1, "/a/b/1": 2 }[name]),
          getNames: () => ["/a/b", "/a/b/1"],
        }),
        ["/path/to/2"],
      )
    })

    test("範囲を置き換える", () => {
      assert.deepEqual(
        compilePatchPath("/path/to/${{ /a/b/$[[ 1..3 ]] }}", {
          getValue: name => ({
            "/a/b/1": 2,
            "/a/b/2": 3,
            "/a/b/3": 4,
          }[name]),
          getNames: () => ["/a/b/1", "/a/b/2", "/a/b/3"],
        }),
        [
          "/path/to/2",
          "/path/to/3",
          "/path/to/4",
        ],
      )
    })
  })
}
