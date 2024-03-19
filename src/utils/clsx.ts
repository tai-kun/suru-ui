export type ClassPrimitive = string | number | boolean | null | undefined

export type ClassObject = { readonly [_ in string]?: ClassValue }

export type ClassValue = ClassArray | ClassObject | ClassPrimitive

export type ClassArray = readonly ClassValue[]

function inner(val: ClassValue, ctx: string): string {
  let str = "", tmp: string

  switch (true) {
    case val === false || val == null:
      return ""

    case val === true:
      return ctx

    case typeof val === "string" || typeof val === "number":
      if (ctx || val) {
        ctx && (ctx += "-")

        return ctx + val
      }

      return ""

    case Array.isArray(val):
      for (const key of val) {
        if (tmp = inner(key, ctx)) {
          str && (str += " ")
          str += tmp
        }
      }

      return str

    default:
      !ctx && (ctx = "Sui")
      ctx += "-"

      for (const key of Object.keys(val)) {
        if (tmp = inner(val[key], ctx + key)) {
          str && (str += " ")
          str += tmp
        }
      }

      return str
  }
}

/**
 * クラス名を生成する。
 * オブジェクト以下にはすべて `Sui-` が先頭に付与され、キー、インデックス、値がハイフンで連結される。
 *
 * @param inputs - クラス名。
 * @returns クラス名。
 * @example
 * ``` ts
 * clsx("foo", { bar: true, baz: "value" }) // => "foo Sui-bar Sui-baz-value"
 * ```
 * @see https://github.com/lukeed/clsx/
 */
function clsx(...inputs: ClassValue[]): string {
  let idx = 0, tmp: string, str = "", len = inputs.length

  while (idx < len) {
    if (tmp = inner(inputs[idx++], "")) {
      str && (str += " ")
      str += tmp
    }
  }

  return str
}

/**
 * クラス名を生成する。
 *
 * @param inputs - クラス名。
 * @returns クラス名。
 * @example
 * ``` ts
 * clsx("hello", true && "foo", false && "bar") // => "hello foo"
 * clsx({ foo: true }) // => ""
 * ```
 */
function lite(...inputs: ClassPrimitive[]): string {
  let idx = 0, tmp, str = "", len = inputs.length

  while (idx < len) {
    if (tmp = inputs[idx++]) {
      if (typeof tmp === "string") {
        str += (str && " ") + tmp
      }
    }
  }

  return str
}

export default Object.assign(clsx, { lite })

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest

  describe("src/utils/clsx", () => {
    test("example", () => {
      assert.equal(
        clsx("foo", { bar: true, baz: "value" }),
        "foo Sui-bar Sui-baz-value",
      )
    })

    test("strings", () => {
      assert.equal(clsx(""), "")
      assert.equal(clsx("foo"), "foo")
      assert.equal(clsx(true && "foo"), "foo")
      assert.equal(clsx(false && "foo"), "")
    })

    test("strings (variadic)", () => {
      assert.equal(clsx(""), "")
      assert.equal(clsx("foo", "bar"), "foo bar")
      assert.equal(clsx(true && "foo", false && "bar", "baz"), "foo baz")
      assert.equal(clsx(false && "foo", "bar", "baz", ""), "bar baz")
    })

    test("numbers", () => {
      assert.equal(clsx(1), "1")
      assert.equal(clsx(12), "12")
      assert.equal(clsx(0.1), "0.1")
      assert.equal(clsx(0), "")

      assert.equal(clsx(Infinity), "Infinity")
      assert.equal(clsx(NaN), "")
    })

    test("numbers (variadic)", () => {
      assert.equal(clsx(0, 1), "1")
      assert.equal(clsx(1, 2), "1 2")
    })

    test("objects", () => {
      assert.equal(clsx({}), "")
      assert.equal(clsx({ foo: true }), "Sui-foo")
      assert.equal(clsx({ foo: true, bar: false }), "Sui-foo")
      assert.equal(clsx({ foo: "hiya", bar: 1 }), "Sui-foo-hiya Sui-bar-1")
      assert.equal(
        clsx({ foo: 1, bar: 0, baz: 1 }),
        "Sui-foo-1 Sui-bar-0 Sui-baz-1",
      )
      assert.equal(clsx({ "-foo": 1, "--bar": 1 }), "Sui--foo-1 Sui---bar-1")
    })

    test("objects (variadic)", () => {
      assert.equal(clsx({}, {}), "")
      assert.equal(clsx({ foo: 1 }, { bar: 2 }), "Sui-foo-1 Sui-bar-2")
      assert.equal(
        clsx({ foo: 1 }, null, { baz: 1, bat: 0 }),
        "Sui-foo-1 Sui-baz-1 Sui-bat-0",
      )
      assert.equal(
        clsx({ foo: 1 }, {}, {}, { bar: "a" }, { baz: null, bat: Infinity }),
        "Sui-foo-1 Sui-bar-a Sui-bat-Infinity",
      )
    })

    test("objects (nested)", () => {
      assert.equal(clsx({ foo: { bar: true } }), "Sui-foo-bar")
      assert.equal(clsx({ foo: { bar: false } }), "")
      assert.equal(clsx({ foo: { bar: true, baz: false } }), "Sui-foo-bar")
      assert.equal(
        clsx({ foo: { bar: true, baz: true } }),
        "Sui-foo-bar Sui-foo-baz",
      )
      assert.equal(
        clsx({ foo: { bar: true }, baz: true }),
        "Sui-foo-bar Sui-baz",
      )
      assert.equal(
        clsx({ foo: { bar: true, baz: false }, bat: 1 }),
        "Sui-foo-bar Sui-bat-1",
      )
      assert.equal(clsx({ foo: { bar: { baz: true } } }), "Sui-foo-bar-baz")
    })

    test("arrays", () => {
      assert.equal(clsx([]), "")
      assert.equal(clsx(["foo"]), "foo")
      assert.equal(clsx(["foo", "bar"]), "foo bar")
      assert.equal(clsx(["foo", 0 && "bar", 1 && "baz"]), "foo baz")
    })

    test("arrays (nested)", () => {
      assert.equal(clsx([[[]]]), "")
      assert.equal(clsx([[["foo"]]]), "foo")
      assert.equal(clsx([true, [["foo"]]]), "foo")
      assert.equal(clsx(["foo", ["bar", ["", [["baz"]]]]]), "foo bar baz")
      assert.equal(clsx([[[{ foo: "bar" }]]]), "Sui-foo-bar")
    })

    test("arrays (variadic)", () => {
      assert.equal(clsx([], []), "")
      assert.equal(clsx(["foo"], ["bar"]), "foo bar")
      assert.equal(clsx(["foo"], null, ["baz", ""], true, "", []), "foo baz")
    })

    test("arrays (no `push` escape)", () => {
      assert.equal(clsx({ push: 1 }), "Sui-push-1")
      assert.equal(clsx({ pop: true }), "Sui-pop")
      assert.equal(clsx({ push: true }), "Sui-push")
      assert.equal(
        clsx("hello", { world: 1, push: true }),
        "hello Sui-world-1 Sui-push",
      )
    })

    describe("lite", () => {
      const fn: any = lite

      test("strings", () => {
        assert.equal(fn(""), "")
        assert.equal(fn("foo"), "foo")
        assert.equal(fn(true && "foo"), "foo")
        assert.equal(fn(false && "foo"), "")
      })

      test("strings (variadic)", () => {
        assert.equal(fn(""), "")
        assert.equal(fn("foo", "bar"), "foo bar")
        assert.equal(fn(true && "foo", false && "bar", "baz"), "foo baz")
        assert.equal(fn(false && "foo", "bar", "baz", ""), "bar baz")
      })

      test("emptys", () => {
        assert.equal(fn(""), "")
        assert.equal(fn(undefined), "")
        assert.equal(fn(null), "")
        assert.equal(fn(0), "")
      })

      // lite ignores all non-strings
      test("non-strings", () => {
        // number
        assert.equal(fn(1), "")
        assert.equal(fn(1, 2), "")
        assert.equal(fn(Infinity), "")
        assert.equal(fn(NaN), "")
        assert.equal(fn(0), "")

        // objects
        assert.equal(fn({}), "")
        assert.equal(fn(null), "")
        assert.equal(fn({ a: 1 }), "")
        assert.equal(fn({ a: 1 }, { b: 2 }), "")

        // arrays
        assert.equal(fn([]), "")
        assert.equal(fn(["foo"]), "")
        assert.equal(fn(["foo", "bar"]), "")

        // functions
        assert.equal(fn(fn), "")
        assert.equal(fn(fn, fn), "")
      })
    })
  })
}
