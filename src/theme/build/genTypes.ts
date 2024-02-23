import { formatWithOptions } from "node:util"
import visitJson, { type JsonObjectLike, type PathSegment } from "visit-json"

/**
 * genTypes 関数のオプション。
 */
export interface GenTypesOptions {
  /**
   * カスタムプロパティの接頭辞。
   */
  readonly prefix?: string | undefined
}

/**
 * CSS カスタムプロパティの型を生成する。
 *
 * @param vars 変数。
 * @param options オプション。
 * @returns カスタムプロパティの型。
 */
export default function genTypes(
  vars: JsonObjectLike,
  options: GenTypesOptions | undefined = {},
) {
  const flat: string[] = []
  const prefix = options.prefix ? `--${options.prefix}-` : "--"
  const raw = (str: string) => `###${str}###`
  const toProp = (path: readonly PathSegment[]) =>
    JSON.stringify(prefix + path.join("-"))
  const dict = visitJson(vars, {
    Array(_, path) {
      const prop = toProp(path)
      flat.push(prop)

      return raw(`{ readonly toString: () => ${prop} }`)
    },
    Primitive(_, path) {
      const prop = toProp(path)
      flat.push(prop)

      return raw(`{ readonly toString: () => ${prop} }`)
    },
    removeEmptyArray: true,
    removeEmptyObject: true,
  })

  return {
    flat,
    dict: formatWithOptions(
      {
        depth: Infinity,
        colors: false,
      },
      dict,
    )
      // raw 関数で囲まれた文字列を置換する。
      .replace(/["']###(.*)###["'],?/g, "$1"),
  }
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest

  describe("src/theme/build/genTypes", () => {
    test("CSS カスタムプロパティの型を生成する", () => {
      assert.deepEqual(
        genTypes(
          {
            foo: "bar",
            bar: [1, 2, 3],
            baz: {
              qux: 42,
            },
          },
          {
            prefix: "sui",
          },
        ),
        {
          flat: [
            "\"--sui-foo\"",
            "\"--sui-bar\"",
            "\"--sui-baz-qux\"",
          ],
          dict: "{\n"
            + "  foo: { readonly toString: () => \"--sui-foo\" }\n"
            + "  bar: { readonly toString: () => \"--sui-bar\" }\n"
            + "  baz: { qux: { readonly toString: () => \"--sui-baz-qux\" } }\n"
            + "}",
        },
      )
    })
  })
}
