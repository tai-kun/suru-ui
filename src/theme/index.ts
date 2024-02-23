import { variables } from "./_constants"
import type { Dict, Flat } from "./_types"

export type Variables = Flat

export const $ = createRecursiveProxy(p => `--sui-${p.join("-")}`) as Dict

function createRecursiveProxy(
  get: (path: string[]) => string,
  _path: string[] = [],
): any {
  return new Proxy(() => {}, {
    get(target, prop, receiver) {
      if (typeof prop !== "string") {
        return Reflect.get(target, prop, receiver)
      }

      if (__DEV__) {
        if (_path.at(-1) === "toString") {
          console.error(
            "SUI: .toString 以下のプロパティにアクセスすることはできません。",
          )
        }
      }

      return createRecursiveProxy(get, [..._path, prop])
    },
    apply() {
      const path = _path.slice(0, -1)

      if (__DEV__) {
        if (_path.at(-1) !== "toString") {
          console.error("SUI: .toString() 以外を呼び出すことはできません。")
        }

        const cssVar = "--sui-" + path.join("-")

        if (!variables.has(cssVar)) {
          console.error(`SUI: ${cssVar} は存在しない CSS 変数です。`)
        }
      }

      return get(path)
    },
  })
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, mock, test } = cfgTest

  describe("src/theme/index", () => {
    test("CSS 変数を取得できる", () => {
      assert.equal(`${$.color.black}`, "--sui-color-black")
    })

    test("CSS 未知の変数にアクセスするとエラーが表示される", () => {
      const error = mock.method(console, "error", () => {})

      // @ts-expect-error
      $.color.unknown.toString()

      assert.equal(error.mock.calls.length, 1)
      assert.equal(
        error.mock.calls[0]?.arguments[0],
        "SUI: --sui-color-unknown は存在しない CSS 変数です。",
      )

      error.mock.restore()
    })

    test(".toString 以外を呼び出すとエラーが表示される", () => {
      const error = mock.method(console, "error", () => {})

      // @ts-expect-error
      $.color()

      assert.equal(error.mock.calls.length, 2)
      assert.equal(
        error.mock.calls[0]?.arguments[0],
        "SUI: .toString() 以外を呼び出すことはできません。",
      )

      error.mock.restore()
    })

    test(".toString 以下のプロパティにアクセスするとエラーが表示される", () => {
      const error = mock.method(console, "error", () => {})

      // @ts-expect-error
      $.color.toString.apply()

      assert.equal(error.mock.calls.length, 3)
      assert.equal(
        error.mock.calls[0]?.arguments[0],
        "SUI: .toString 以下のプロパティにアクセスすることはできません。",
      )

      error.mock.restore()
    })
  })
}
