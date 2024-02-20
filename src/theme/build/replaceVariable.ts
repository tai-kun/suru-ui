import type { JsonPrimitive } from "visit-json"
import computeSimilarity from "./computeSimilarity"
import replace from "./replace"

/**
 * 変数の置換をスキップすることを示す値。`null` と同義。
 */
export const IGNORE = Symbol.for("replaceVariable.IGNORE")

/**
 * 変数を置換を指示する値。`undefined` は変数の値が存在しないことを示す。
 */
export type SetValue = JsonPrimitive | typeof IGNORE | undefined

/**
 * 変数の値を取得する機能。
 */
export type Variables = {
  /**
   * 変数の値を取得する。
   *
   * @param name 変数名。
   * @returns 変数の値。
   */
  readonly getValue: (name: string) => SetValue
  /**
   * 変数名のリストを取得する。
   *
   * @returns 変数名のリスト。
   */
  readonly getNamse: (emit: never) => Iterable<string>
} | {
  /**
   * 変数の値を取得する。
   *
   * @param name 変数名。
   * @returns 変数の値。
   */
  readonly getValue: (name: string) => SetValue
  /**
   * 変数名のリストを取得する。
   *
   * @param emit 変数名を通知する関数。
   */
  readonly getNames: (emit: (name: string) => void) => void
} | {
  readonly [name: string]: SetValue
}

/**
 * 変数の値を取得する機能を正規化する。
 *
 * @param vars 変数の値を取得する機能。
 * @returns 正規化された変数の値を取得する機能。
 */
function normalizeVariables(vars: Variables): {
  getValue(name: string): SetValue
  getNames(emit: (name: string) => void): void
} {
  if (
    "getValue" in vars
    && "getNames" in vars
    && typeof vars.getValue === "function"
    && typeof vars.getNames === "function"
  ) {
    return {
      getValue: vars.getValue,
      getNames(emit) {
        let emitImpl: (name: string) => void

        function emitFn(name: string): void {
          if (emitImpl) {
            emitImpl(name)
          }
        }

        // @ts-expect-error
        const names = vars.getNames(emitFn)

        if (
          names !== null
          && typeof names === "object"
          && typeof names[Symbol.iterator] === "function"
        ) {
          emitImpl = () => {
            console.error(
              "SUI: getNames が反復可能なオブジェクトを返したので、"
                + "emit を使うことはできません。",
            )
          }

          for (const name of names) {
            emit(name)
          }
        } else {
          emitImpl = emit
        }
      },
    }
  }

  return {
    getValue(name) {
      return vars[name as never]
    },
    getNames(emit) {
      for (const key in Object.keys(vars)) {
        if (Object.hasOwn(vars, key)) {
          emit(key)
        }
      }
    },
  }
}

/**
 * `${{ 変数名 }}` という文字列を変数の値に置き換える。
 *
 * @param text 置き換える文字列。
 * @param vars 変数の値。
 * @param options オプション。
 * @returns 置き換えた文字列。
 */
export default function replaceVariable(
  text: string,
  vars: Variables,
): string {
  const { getValue, getNames } = normalizeVariables(vars)
  const [replaced] = replace(text, ["${{", "}}"], part => {
    const name = part.trim()
    const value = getValue(name)

    if (value === null || value === IGNORE) {
      return "${{" + part + "}}"
    }

    if (value !== undefined) {
      return String(value)
    }

    const similar: { key: string; score: number }[] = []
    let maxKeyLen = 0

    function emit(key: string): void {
      const score = computeSimilarity(name, key)

      if (score > 0.8) {
        similar.push({ key, score })
        maxKeyLen = Math.max(maxKeyLen, key.length)
      }
    }

    getNames(emit)

    throw new Error(
      [
        `変数 ${JSON.stringify(part)} が見つかりません。`,
        `文字列: ${JSON.stringify(text)}`,
        `類似の変数:${similar.length ? "" : " なし"}`,
        ...similar
          .sort((a, b) => b.score - a.score)
          .map(({ key, score }) => `  ${key.padEnd(maxKeyLen)}  (${score})`),
      ].join("\n"),
    )
  })

  return replaced!
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest

  describe("src/theme/build/replaceVariable", () => {
    test("変数を置き換える", () => {
      assert.equal(
        replaceVariable("a${{b}}c${{d}}e", {
          getValue: name => ({ b: 1, d: 2 })[name],
          getNames: () => ["b", "d"],
        }),
        "a1c2e",
      )
    })

    test("変数を置き換える", () => {
      assert.equal(
        replaceVariable("a${{b}}c${{d}}e", {
          b: 1,
          d: 2,
        }),
        "a1c2e",
      )
    })

    test("変数が見つからない", () => {
      assert.throws(
        () => {
          replaceVariable(" ${{a}}", {
            getValue: () => undefined,
            getNames: () => ["b"],
          })
        },
        "Error: 変数 \"a\" が見つかりません。",
      )
    })

    test("変数が見つからない", () => {
      assert.throws(
        () => {
          replaceVariable(" ${{a}}", {
            getValue: () => undefined,
            getNames: emit => {
              emit("b")
            },
          })
        },
        "Error: 変数 \"a\" が見つかりません。",
      )
    })

    test("変数内の空白を無視する", () => {
      assert.equal(
        replaceVariable("${{ a }}", {
          getValue: name => ({ a: 1 })[name],
          getNames: () => ["a"],
        }),
        "1",
      )
    })

    test("変数内の変数を置き換える", () => {
      assert.equal(
        replaceVariable("${{ a${{ b }} }}", {
          getValue: name => ({ a1: 0, b: 1 })[name],
          getNames: () => ["a1", "b"],
        }),
        "0",
      )
    })

    test("変数が見つからない", () => {
      assert.throws(
        () => {
          replaceVariable("${{ a${{ b }} }}", {
            getValue: name => ({ b: 1 })[name],
            getNames: () => ["b"],
          })
        },
        "Error: 変数 \"a1\" が見つかりません。",
      )
    })
  })
}
