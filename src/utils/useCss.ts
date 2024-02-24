import * as React from "react"

import { create, type CssLikeObject } from "nano-css"
import { addon as addonCache } from "nano-css/addon/cache.js"
import { addon as addonRule } from "nano-css/addon/rule.js"
import type {
  JsonArrayLike,
  JsonObjectLike,
  JsonPrimitiveLike,
  JsonValueLike,
} from "visit-json"
import onceCell from "./singleton"

// https://github.com/fastify/fast-json-stringify/blob/14338e22fdb39cf12378355d26fa281ec3d636a5/lib/serializer.js#L4
const JSON_STR_ESC_REGEX =
  /[\u0000-\u001f\u0022\u005c\ud800-\udfff]|[\ud800-\udbff](?![\udc00-\udfff])|(?:[^\ud800-\udbff]|^)[\udc00-\udfff]/

const UPPER_CASE_REGEX = /[A-Z]/g

/**
 * JSON の値を文字列に変換する。
 *
 * @param value JSON の値。
 * @returns 文字列。
 */
function stringifyValue(value: JsonValueLike): string {
  return Array.isArray(value)
    ? stringifyArray(value)
    : typeof value === "object" && value !== null
    ? stringifyObject(value)
    : stringifyPrimitive(value)
}

/**
 * JSON の配列を文字列に変換する。
 *
 * @param array JSON の配列。
 * @returns 文字列。
 */
function stringifyArray(array: JsonArrayLike): string {
  return "[" + array.map(stringifyValue) + "]"
}

/**
 * JSON のオブジェクトを文字列に変換する。
 *
 * @param object JSON のオブジェクト。
 * @returns 文字列。
 */
function stringifyObject(object: JsonObjectLike): string {
  let str = "{"

  for (const [key, value] of Object.entries(object)) {
    str += `${stringifyPrimitive(key)}:${stringifyValue(value)},`
  }

  return str + "}"
}

/**
 * JSON のプリミティブを文字列に変換する。
 *
 * @param primitive JSON のプリミティブ。
 * @returns 文字列。
 */
function stringifyPrimitive(primitive: JsonPrimitiveLike): string {
  if (typeof primitive !== "string") {
    return String(primitive ?? null)
  }

  if (JSON_STR_ESC_REGEX.test(primitive)) {
    return JSON.stringify(primitive)
  }

  return `"${primitive}"`
}

export const renderer = onceCell("nano-css", () => {
  const nano = create({
    pfx: "sui",
    kebab(prop: string) {
      return prop.charCodeAt(0) === 45 /* "-" */
        ? prop
        : prop.replace(UPPER_CASE_REGEX, "-$&").toLowerCase()
    },
    stringify: stringifyObject,
  } as {})

  addonCache(nano)
  addonRule(nano)

  return nano
})

/**
 * スタイルルールが適用された CSS のクラス名を返す。
 *
 * @template A スタイルルールを生成するための引数の型。
 * @param make スタイルルールを生成する関数。
 * @param args スタイルルールを生成するための引数。
 * @returns CSS のクラス名。
 */
export default function useCss<A extends readonly unknown[]>(
  make: (...args: A) => CssLikeObject | null | undefined,
  ...args: A
): string {
  return React.useMemo(
    () => {
      const style = make(...args)

      return style == null
        ? ""
        : renderer
          .rule!({ "@layer sui.dynamic": style })
          .substring(1 /* " ".length */)
    },
    args,
  )
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { renderHook } = await import("../utils-dev/react")
  const { normalizeCss } = await import("../utils-dev/normalizeCss")
  const { assert, describe, test } = cfgTest

  describe("src/utils/useCss", () => {
    test("スタイルルールを追加して専用のクラス名を返す", () => {
      const makeStyle = (color: string) => ({
        color,
      })
      using renderResult = renderHook(() => useCss(makeStyle, "red"))
      const { result } = renderResult

      assert.match(result.current, /^sui_[0-9a-z]+$/)
      assert.equal(
        normalizeCss(renderer.raw),
        normalizeCss(`
          @layer sui.dynamic {
            .${result.current} {
              color: red;
            }
          }
        `),
      )
    })
  })
}
