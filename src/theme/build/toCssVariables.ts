import type { JsonObjectLike, JsonValueLike } from "visit-json"
import isPlainObject from "../../utils/isPlainObject"

/**
 * toCssVariables 関数のオプション。
 */
export interface ToCssVariablesOptions {
  /**
   * カスタムプロパティの接頭辞。
   */
  prefix?: string | undefined
  /**
   * インデント文字列。
   */
  indent?: string | undefined
}

/**
 * JSON 値を CSS カスタムプロパティに変換する。
 *
 * @param value 変換する JSON 値。
 * @param options オプション。
 * @returns 変換された CSS カスタムプロパティ。
 */
function inner(
  value: JsonValueLike,
  options: ToCssVariablesOptions,
) {
  let { prefix = "", indent = "" } = options
  let css = ""

  switch (true) {
    case typeof value === "string"
      || typeof value === "number"
      || typeof value === "boolean"
      || Array.isArray(value):
      css += indent
        ? `${indent}--${prefix}: ${value};`
        : `--${prefix}:${value};`

      break

    case isPlainObject(value):
      if (prefix !== "") {
        prefix += "-"
      }

      if (
        indent
        && indent.charCodeAt(0) !== 10
        && indent.charCodeAt(0) !== 13
      ) {
        indent = `\n${indent}`
      }

      for (const key of Object.keys(value)) {
        css += inner(value[key], {
          prefix: prefix + key,
          indent,
        })
      }

      break

    case value == null:
      break

    default:
      throw new TypeError(
        "JSON 値を期待しますが異なる値が渡されました: " + String(value),
      )
  }

  return css
}

/**
 * JSON オブジェクトを CSS カスタムプロパティに変換する。
 *
 * @param object 変換する JSON オブジェクト。
 * @param options オプション。
 * @returns 変換された CSS カスタムプロパティ。
 */
export default function toCssVariables(
  object: JsonObjectLike,
  options: ToCssVariablesOptions | undefined = {},
): string {
  const css = inner(object, options)

  return options.indent
    ? css.substring(1 /* "\n".length */)
    : css
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest

  describe("src/theme/build/toCssVariables", () => {
    test("CSS カスタムプロパティに変換する", () => {
      const value = {
        foo: "red",
        bar: {
          baz: 1129,
          qux: true,
        },
      }
      const actual = toCssVariables(value)

      assert.equal(actual, `--foo:red;--bar-baz:1129;--bar-qux:true;`)
    })

    test("カスタムプロパティの接頭辞を指定する", () => {
      const value = {
        foo: "red",
        bar: {
          baz: 1129,
          qux: true,
        },
      }
      const actual = toCssVariables(value, { prefix: "test" })

      assert.equal(
        actual,
        `--test-foo:red;--test-bar-baz:1129;--test-bar-qux:true;`,
      )
    })

    test("インデント文字列を指定する", () => {
      const value = {
        foo: "red",
        bar: {
          baz: 1129,
          qux: true,
        },
      }
      const actual = toCssVariables(value, { indent: "  " })

      assert.equal(
        actual,
        [
          "  --foo: red;",
          "  --bar-baz: 1129;",
          "  --bar-qux: true;",
        ].join("\n"),
      )
    })
  })
}
