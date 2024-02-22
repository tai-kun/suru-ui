import type { JsonObjectLike, JsonValueLike } from "visit-json"
import isPlainObject from "../../utils/isPlainObject"

export type Nil = null | undefined

export type CssPrimitive = string | number | boolean

export type ReadonlyArrayable<T> = T | readonly T[]

/**
 * toCssVariables 関数のオプション。
 */
export interface ToCssVariablesOptions {
  /**
   * カスタムプロパティの接頭辞。
   */
  readonly prefix?: string | undefined
  /**
   * インデント文字列。
   */
  readonly indent?: string | undefined
  /**
   * null に対して設定する値。
   */
  readonly null?:
    | Nil
    | ReadonlyArrayable<CssPrimitive>
    | (() => ReadonlyArrayable<CssPrimitive> | Nil)
  /**
   * undefined に対して設定する値。
   */
  readonly undefined?:
    | Nil
    | ReadonlyArrayable<CssPrimitive>
    | (() => ReadonlyArrayable<CssPrimitive> | Nil)
}

function toLine(
  indent: string,
  prefix: string,
  value: ReadonlyArrayable<CssPrimitive>,
): string {
  return indent
    ? `${indent}--${prefix}: ${value};`
    : `--${prefix}:${value};`
}

function toCallable<T>(value: T | (() => T)): () => T {
  // @ts-expect-error
  return typeof value === "function" ? value : (() => value)
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
  let css = "", tmp

  switch (true) {
    case typeof value === "string"
      || typeof value === "number"
      || typeof value === "boolean"
      || Array.isArray(value):
      css += toLine(indent, prefix, value as ReadonlyArrayable<CssPrimitive>)

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
          ...options,
          prefix: prefix + key,
          indent,
        })
      }

      break

    case value === null:
      if ((tmp = toCallable(options.null)()) != null) {
        css += toLine(indent, prefix, tmp)
      }

      break

    case value === undefined:
      if ((tmp = toCallable(options.undefined)()) != null) {
        css += toLine(indent, prefix, tmp)
      }

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
