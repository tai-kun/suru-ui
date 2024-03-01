import toHash from "./toHash"

const RULE_SIZE_MAX = 4_096

const SUI_HASH_REGEX = /\b__SUI_HASH__\b/g

const UPPER_CASE_REGEX = /[A-Z]/g

interface CssRendererState {
  cnt: number
  els: HTMLStyleElement[]
}

export type CssPrimitive = string | number | boolean | null | undefined | {
  readonly toString: () => string
}

export type CssObject = {
  [Key in keyof any]?: CssValue | undefined
}

export type CssArray = CssValue[]

export type CssValue = CssPrimitive | CssObject | CssArray

export interface CssRenderer {
  /**
   * style 要素の作成に失敗した場合に蓄積される CSS の文字列。
   */
  raw: string[]
  /**
   * CSS ルールをスタイルに挿入する。
   *
   * @param rule CSS のルールを生成する関数。
   * @returns CSS ルールに関する情報。
   */
  put(rule: (hash: string) => CssObject): {
    /**
     * CSS ルールのハッシュ値。
     */
    hash: string
  }
}

/**
 * style 要素をドキュメントに追加する。
 *
 * @param state CSS レンダラーの状態。
 */
function setElement(state: CssRendererState): void {
  if (state.cnt++ % RULE_SIZE_MAX === 0) {
    const styleEl = document.head.appendChild(document.createElement("style"))
    styleEl.setAttribute("data-sui", "")
    state.cnt = 1
    state.els.push(styleEl)
  }
}

/**
 * CSS のルールを style 要素に挿入する。
 *
 * @param state CSS レンダラーの状態。
 * @param rule CSS のルール。
 */
function insertRule(state: CssRendererState, rule: string): void {
  const styleEl = state.els.at(-1)!
  const sheet = styleEl.sheet!
  sheet.insertRule(rule, sheet.cssRules.length)
}

/**
 * CSS のプロパティ名に変換する。カスタムプロパティ名と思われる場合はそのまま返す。
 *
 * @param prop プロパティ名。
 * @returns CSS のプロパティ名。
 */
function toCssProp(prop: string): string {
  return prop.charCodeAt(0) === 45 /* "-" */
    ? prop
    : prop.replace(UPPER_CASE_REGEX, "-$&").toLowerCase()
}

/**
 * JSON オブジェクトを CSS に変換する。
 *
 * @param rule JSON オブジェクト。
 * @returns CSS。
 */
function toCss(rule: CssObject): string[] {
  const strs: string[] = []

  for (const [prop, value] of Object.entries(rule)) {
    if (value != null) {
      if (typeof value === "object" && !Array.isArray(value)) {
        strs.push(`${prop}{${toCss(value).join("")}}`)
      } else if (prop.charCodeAt(0) !== 64 /* "@" */) {
        strs.push(`${toCssProp(prop)}:${value};`)
      } else if (typeof value !== "object") {
        strs.push(`${prop} ${value};`)
      }
    }
  }

  return strs
}

/**
 * CSS のレンダラーを作成する。
 *
 * @returns CSS のレンダラー。
 */
export default function createCssRenderer(): CssRenderer {
  const state: CssRendererState = {
    cnt: 0,
    els: [],
  }

  return {
    raw: [],
    put(toRule) {
      const css = toCss(toRule("__SUI_HASH__"))
      const hash = toHash(css.join(""))
      const rules = css.map(c => c.replace(SUI_HASH_REGEX, hash))

      if (typeof document === "undefined") {
        this.raw.push(...rules)

        return { hash }
      }

      try {
        setElement(state)
      } catch (err) {
        if (__DEV__) {
          console.error(
            "SUI(utils/createCssRenderer): style 要素の作成に失敗しました。",
            err,
          )
        }

        this.raw.push(...rules)

        return { hash }
      }

      for (const rule of rules) {
        try {
          insertRule(state, rule)
        } catch (err) {
          if (__DEV__) {
            console.error(
              `SUI(utils/createCssRenderer): CSS のルールの挿入に失敗しました: ${rule}`,
              err,
            )
          }

          this.raw.push(...rules)
        }
      }

      return { hash }
    },
  }
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest

  describe("src/utils/createCssRenderer", () => {
    test("CSS のルールをスタイルに挿入する", () => {
      const renderer = createCssRenderer()
      const { hash } = renderer.put(hash => ({
        "@charset": "\"UTF-8\"",
        [`@keyframes sui-${hash}`]: {
          from: { color: "red" },
          to: { color: "blue" },
        },
        [`.sui-${hash}`]: {
          color: "red",
          "&:hover": {
            color: "blue",
          },
        },
      }))

      assert.deepEqual(renderer.raw, [
        `@charset "UTF-8";`,
        `@keyframes sui-${hash}{from{color:red;}to{color:blue;}}`,
        `.sui-${hash}{color:red;&:hover{color:blue;}}`,
      ])
    })
  })
}
