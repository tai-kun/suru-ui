import range from "./range"
import replace from "./replace"

/**
 * 値の範囲のチェックポイント。
 *
 * @template K - 値の種別。
 * @template N - 値の名前。
 * @template I - 値がとれるインデックス。
 * @template S - 値の文字列表現。
 */
interface Ckpt<
  K extends string = string,
  N extends string = string,
  I extends number = number,
  S extends string = string,
> {
  /**
   * 値の種別。
   */
  kind: K
  /**
   * 値の名前。
   */
  name: N
  /**
   * 値のインデックス表現。
   */
  index: I
  /**
   * 値の範囲をチェックする。
   *
   * @param index - インデックス。
   * @returns 値の範囲内かどうか。
   */
  inside(index: number): index is I
  /**
   * 値の適用を厳格にする。
   *
   * @param index - インデックス。
   * @returns 値の適用を厳格にするかどうか。
   */
  strict(index: I): boolean
  /**
   * 値の文字列表現。
   *
   * @param index - インデックス。
   * @returns 値の文字列。
   */
  toString(index: I): S
}

/**
 * 値の範囲のチェックポイントを作成する。
 *
 * @template K - 値の種別。
 * @template N - 値の名前。
 * @template I - 値がとれるインデックス。
 * @template S - 値の文字列表現。
 * @param ckpt - 値の範囲のチェックポイント。
 * @returns 値の範囲のチェックポイント。
 */
function createCkpt<
  const K extends string,
  const N extends string,
  const I extends number,
  S extends string = string,
>(ckpt: Ckpt<K, N, I, S>): Ckpt<K, N, I, S> {
  return ckpt
}

/**
 * 文字列をチェックポイントに変換する。
 *
 * @param p - 文字列。
 * @returns チェックポイント。
 */
function toCkpt(p: string) {
  if ((p = p.trim()) === "") {
    return null
  }

  // number -> number
  if (/^[+-]?[0-9]+$/.test(p)) {
    return createCkpt({
      kind: "Int",
      name: "serial",
      index: parseInt(p, 10),
      inside: (_): _ is number => true,
      strict: () => true,
      toString: j => j.toString(10),
    })
  }

  // "sm" -> -1
  // "md" ->  0
  // "lg" ->  1
  if (/^[sml]|sm|md|lg$/i.test(p)) {
    const s = p[0] as "s" | "m" | "l"

    return createCkpt({
      kind: "Size",
      name: `standard-${p.length === 1 ? "single" : "double"}`,
      index: ({
        s: -1,
        m: 0,
        l: 1,
      } as const)[s],
      inside: (j): j is -1 | 0 | 1 => (-1 <= j && j <= 1),
      strict: () => true,
      toString: j => (
        p.length === 1
          ? ({
            "-1": "s",
            "0": "m",
            "1": "l",
          } as const)[j]
          : ({
            "-1": "sm",
            "0": "md",
            "1": "lg",
          } as const)[j]
      ),
    })
  }

  // "xxs" -> -3
  // "xs"  -> -2
  // "xl"  ->  2
  // "xxl" ->  3
  if (/^x+[sl]$/i.test(p)) {
    const n = [...p.slice(0, -1)] as ["x", ..."x"[]]
    const s = p.slice(-1) as "s" | "l"
    const i = n.length + 1
    const u = s === "l"

    return createCkpt({
      kind: "Size",
      name: "extra",
      index: u ? i : -i,
      inside: (j): j is number => !u ? j <= -2 : 2 <= j,
      strict: () => n.length !== 1,
      toString: j => `${"x".repeat(Math.abs(j) - 1)}${s}`,
    })
  }

  // "2xs" -> -3
  // "xs"  -> -2
  // "xl"  ->  2
  // "2xl" ->  3
  if (/^[1-9]+x[sl]$/i.test(p)) {
    const [n, s] = p.split("x") as [string, "s" | "l"]
    const i = parseInt(n, 10) + 1
    const u = s === "l"

    return createCkpt({
      kind: "Size",
      name: "number-extra",
      index: u ? i : -i,
      inside: (j): j is number => !u ? j <= -2 : 2 <= j,
      strict: () => true,
      toString: j => (
        (j = Math.abs(j) - 1) === 1
          ? `x${s}`
          : `${j}x${s}`
      ),
    })
  }

  // "x2s" -> -3
  // "xs"  -> -2
  // "xl"  ->  2
  // "x2l" ->  3
  if (/^x[1-9]+[sl]$/i.test(p)) {
    const n = p.slice(1, -1) as string
    const s = p.slice(-1) as "s" | "l"
    const i = parseInt(n, 10) + 1
    const u = s === "l"

    return createCkpt({
      kind: "Size",
      name: "extra-number",
      index: u ? i : -i,
      inside: (j): j is number => !u ? j <= -2 : 2 <= j,
      strict: () => true,
      toString: j => (
        (j = Math.abs(j) - 1) === 1
          ? `x${s}`
          : `x${j}${s}`
      ),
    })
  }

  return null
}

/**
 * `$[[<始まり>..<終わり>]]` という文字列を置き換える。
 *
 * @param text - 置き換える文字列。
 * @returns 置き換えた文字列。
 */
export default function replaceRange(text: string): string[] {
  return replace(
    text,
    ["$[[", "]]"],
    part =>
      part.split(",").flatMap(item => {
        if ((item = item.trim()).indexOf("..") === -1) {
          return item
        }

        return item.split("..").flatMap((_, i, list) => {
          const [p0, p1] = list.slice(i)

          if (!p0) {
            throw new RangeError(`無効なループ範囲: ${part}`)
          }

          if (!p1) {
            return []
          }

          const c0: Ckpt | null = toCkpt(p0)
          const c1: Ckpt | null = toCkpt(p1)

          if (c0 === null || c1 === null || c0.kind !== c1.kind) {
            throw new RangeError(`無効なループ範囲: ${p0}..${p1}`)
          }

          const stack: string[] = []

          for (const i of range(c0.index, c1.index)) {
            if (c0.inside(i)) {
              if (
                c0.name !== c1.name
                && c0.strict(i)
                && c1.inside(i)
                && c1.strict(i)
              ) {
                throw new RangeError(`不連続なループ範囲: ${p0}..${p1}`)
              }

              if (c0.name === c1.name || !c1.inside(i) || !c1.strict(i)) {
                stack.push(c0.toString(i))
              } else {
                stack.push(c1.toString(i))
              }
            } else if (c1.inside(i)) {
              stack.push(c1.toString(i))
            } else {
              throw new RangeError(`不連続なループ範囲: ${p0}..${p1}`)
            }
          }

          if (i > 0 && list.length > 2) {
            stack.shift()
          }

          return stack
        })
      }),
  )
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest

  function assertCkpt(
    input: string,
    value: number,
    expected:
      | null
      | { [P in keyof Ckpt]: Ckpt[P] extends Function ? any : Ckpt[P] },
  ): void {
    const actual: Ckpt | null = toCkpt(input)

    if (expected === null) {
      assert.equal(actual, null)
    } else {
      assert.notEqual(actual, null)
      assert.deepEqual(
        {
          kind: actual!.kind,
          name: actual!.name,
          index: actual!.index,
          inside: actual!.inside(value),
          strict: actual!.strict(actual!.index),
          toString: actual!.toString(value),
        },
        {
          kind: expected.kind,
          name: expected.name,
          index: expected.index,
          inside: expected.inside,
          strict: expected.strict,
          toString: expected.toString,
        },
      )
    }
  }

  describe("src/theme/build/replaceRange", () => {
    describe("toCkpt", () => {
      describe("Int", () => {
        test("input: \"1\"", () => {
          assertCkpt("1", 1, {
            kind: "Int",
            name: "serial",
            index: 1,
            inside: true,
            strict: true,
            toString: "1",
          })
          assertCkpt("1", 2, {
            kind: "Int",
            name: "serial",
            index: 1,
            inside: true,
            strict: true,
            toString: "2",
          })
        })

        test("input: \"-1\"", () => {
          assertCkpt("-1", -1, {
            kind: "Int",
            name: "serial",
            index: -1,
            inside: true,
            strict: true,
            toString: "-1",
          })
          assertCkpt("-1", 0, {
            kind: "Int",
            name: "serial",
            index: -1,
            inside: true,
            strict: true,
            toString: "0",
          })
        })
      })

      describe("Size", () => {
        test("input: \"s\"", () => {
          assertCkpt("s", -1, {
            kind: "Size",
            name: "standard-single",
            index: -1,
            inside: true,
            strict: true,
            toString: "s",
          })
          assertCkpt("s", 0, {
            kind: "Size",
            name: "standard-single",
            index: -1,
            inside: true,
            strict: true,
            toString: "m",
          })
          assertCkpt("s", 1, {
            kind: "Size",
            name: "standard-single",
            index: -1,
            inside: true,
            strict: true,
            toString: "l",
          })
          assertCkpt("s", 2, {
            kind: "Size",
            name: "standard-single",
            index: -1,
            inside: false,
            strict: true,
            toString: undefined,
          })
        })

        test("input: \"sm\"", () => {
          assertCkpt("sm", -1, {
            kind: "Size",
            name: "standard-double",
            index: -1,
            inside: true,
            strict: true,
            toString: "sm",
          })
          assertCkpt("sm", 0, {
            kind: "Size",
            name: "standard-double",
            index: -1,
            inside: true,
            strict: true,
            toString: "md",
          })
          assertCkpt("sm", 1, {
            kind: "Size",
            name: "standard-double",
            index: -1,
            inside: true,
            strict: true,
            toString: "lg",
          })
          assertCkpt("sm", 2, {
            kind: "Size",
            name: "standard-double",
            index: -1,
            inside: false,
            strict: true,
            toString: undefined,
          })
        })

        test("input: \"xs\"", () => {
          assertCkpt("xs", -3, {
            kind: "Size",
            name: "extra",
            index: -2,
            inside: true,
            strict: false,
            toString: "xxs",
          })
          assertCkpt("xs", -2, {
            kind: "Size",
            name: "extra",
            index: -2,
            inside: true,
            strict: false,
            toString: "xs",
          })
          assertCkpt("xs", -1, {
            kind: "Size",
            name: "extra",
            index: -2,
            inside: false,
            strict: false,
            toString: "s",
          })
          assertCkpt("xs", 2, {
            kind: "Size",
            name: "extra",
            index: -2,
            inside: false,
            strict: false,
            toString: "xs",
          })
        })

        test("input: \"xxs\"", () => {
          assertCkpt("xxs", -3, {
            kind: "Size",
            name: "extra",
            index: -3,
            inside: true,
            strict: true,
            toString: "xxs",
          })
          assertCkpt("xxs", -2, {
            kind: "Size",
            name: "extra",
            index: -3,
            inside: true,
            strict: true,
            toString: "xs",
          })
          assertCkpt("xxs", -1, {
            kind: "Size",
            name: "extra",
            index: -3,
            inside: false,
            strict: true,
            toString: "s",
          })
          assertCkpt("xxs", 2, {
            kind: "Size",
            name: "extra",
            index: -3,
            inside: false,
            strict: true,
            toString: "xs",
          })
        })

        test("input: \"2xs\"", () => {
          assertCkpt("2xs", -3, {
            kind: "Size",
            name: "number-extra",
            index: -3,
            inside: true,
            strict: true,
            toString: "2xs",
          })
          assertCkpt("2xs", -2, {
            kind: "Size",
            name: "number-extra",
            index: -3,
            inside: true,
            strict: true,
            toString: "xs",
          })
          assertCkpt("2xs", -1, {
            kind: "Size",
            name: "number-extra",
            index: -3,
            inside: false,
            strict: true,
            toString: "0xs",
          })
          assertCkpt("2xs", 2, {
            kind: "Size",
            name: "number-extra",
            index: -3,
            inside: false,
            strict: true,
            toString: "xs",
          })
        })

        test("input: \"x2s\"", () => {
          assertCkpt("x2s", -3, {
            kind: "Size",
            name: "extra-number",
            index: -3,
            inside: true,
            strict: true,
            toString: "x2s",
          })
          assertCkpt("x2s", -2, {
            kind: "Size",
            name: "extra-number",
            index: -3,
            inside: true,
            strict: true,
            toString: "xs",
          })
          assertCkpt("x2s", -1, {
            kind: "Size",
            name: "extra-number",
            index: -3,
            inside: false,
            strict: true,
            toString: "x0s",
          })
          assertCkpt("x2s", 2, {
            kind: "Size",
            name: "extra-number",
            index: -3,
            inside: false,
            strict: true,
            toString: "xs",
          })
        })
      })
    })

    describe("replaceRange", () => {
      describe("Int", () => {
        test("増加", () => {
          assert.deepEqual(replaceRange("$[[1..3]]"), ["1", "2", "3"])
        })

        test("減少", () => {
          assert.deepEqual(replaceRange("$[[3..1]]"), ["3", "2", "1"])
        })

        test("3 つ以上のチェックポイント", () => {
          assert.deepEqual(replaceRange("$[[1..2..4]]"), [
            "1",
            "2",
            "3",
            "4",
          ])
        })

        test("カンマ区切り", () => {
          assert.deepEqual(replaceRange("$[[0,2..4]]"), [
            "0",
            "2",
            "3",
            "4",
          ])
        })
      })

      describe("Size", () => {
        test("standard-single", () => {
          assert.deepEqual(replaceRange("$[[s..l]]"), ["s", "m", "l"])
        })

        test("standard-double", () => {
          assert.deepEqual(replaceRange("$[[sm..lg]]"), ["sm", "md", "lg"])
        })

        test("standard-single と standard-double でエラー", () => {
          assert.throws(() => replaceRange("$[[s..sm]]"), /不連続なループ範囲/)
        })

        test("extra", () => {
          assert.deepEqual(replaceRange("$[[xxxs..xxs]]"), [
            "xxxs",
            "xxs",
          ])
          assert.deepEqual(replaceRange("$[[xl..xxxl]]"), [
            "xl",
            "xxl",
            "xxxl",
          ])
        })

        test("extra は standard と併用できる。", () => {
          assert.deepEqual(replaceRange("$[[s..xxl]]"), [
            "s",
            "m",
            "l",
            "xl",
            "xxl",
          ])
          assert.deepEqual(replaceRange("$[[sm..xxl]]"), [
            "sm",
            "md",
            "lg",
            "xl",
            "xxl",
          ])
        })

        test("extra は standard を跨ごうとするとエラー", () => {
          assert.throws(() => replaceRange("$[[xs..xl]]"), /不連続なループ範囲/)
        })

        test("number-extra", () => {
          assert.deepEqual(replaceRange("$[[2xs..4xs]]"), [
            "2xs",
            "3xs",
            "4xs",
          ])
          assert.deepEqual(replaceRange("$[[2xl..4xl]]"), [
            "2xl",
            "3xl",
            "4xl",
          ])
        })

        test("number-extra は extra の一部と併用できる", () => {
          assert.deepEqual(replaceRange("$[[xs..2xs]]"), [
            "xs",
            "2xs",
          ])
          assert.deepEqual(replaceRange("$[[2xs..xs]]"), [
            "2xs",
            "xs",
          ])
          assert.deepEqual(replaceRange("$[[2xl..xl]]"), [
            "2xl",
            "xl",
          ])
          assert.deepEqual(replaceRange("$[[xl..2xl]]"), [
            "xl",
            "2xl",
          ])
        })

        test("number-extra は standard と併用できる。", () => {
          assert.deepEqual(replaceRange("$[[s..2xl]]"), [
            "s",
            "m",
            "l",
            "xl",
            "2xl",
          ])
          assert.deepEqual(replaceRange("$[[sm..2xl]]"), [
            "sm",
            "md",
            "lg",
            "xl",
            "2xl",
          ])
        })

        test("number-extra は standard を跨ごうとするとエラー", () => {
          assert.throws(
            () => replaceRange("$[[2xs..2xl]]"),
            /不連続なループ範囲/,
          )
        })

        test("number-extra は extra の一部と併用できない", () => {
          assert.throws(
            () => replaceRange("$[[xxl..3xl]]"),
            /不連続なループ範囲/,
          )
        })

        test("extra-number", () => {
          assert.deepEqual(replaceRange("$[[x2s..x4s]]"), [
            "x2s",
            "x3s",
            "x4s",
          ])
          assert.deepEqual(replaceRange("$[[x2l..x4l]]"), [
            "x2l",
            "x3l",
            "x4l",
          ])
        })

        test("extra-number は extra の一部と併用できる", () => {
          assert.deepEqual(replaceRange("$[[xs..x2s]]"), [
            "xs",
            "x2s",
          ])
          assert.deepEqual(replaceRange("$[[x2s..xs]]"), [
            "x2s",
            "xs",
          ])
          assert.deepEqual(replaceRange("$[[x2l..xl]]"), [
            "x2l",
            "xl",
          ])
          assert.deepEqual(replaceRange("$[[xl..x2l]]"), [
            "xl",
            "x2l",
          ])
        })

        test("extra-number は standard と併用できる。", () => {
          assert.deepEqual(replaceRange("$[[s..x2l]]"), [
            "s",
            "m",
            "l",
            "xl",
            "x2l",
          ])
          assert.deepEqual(replaceRange("$[[sm..x2l]]"), [
            "sm",
            "md",
            "lg",
            "xl",
            "x2l",
          ])
        })

        test("extra-number は standard を跨ごうとするとエラー", () => {
          assert.throws(
            () => replaceRange("$[[x2s..x2l]]"),
            /不連続なループ範囲/,
          )
        })

        test("extra-number は extra の一部と併用できない", () => {
          assert.throws(
            () => replaceRange("$[[xxl..x3l]]"),
            /不連続なループ範囲/,
          )
        })

        test("extra-number は number-extra の一部と併用できない", () => {
          assert.throws(
            () => replaceRange("$[[2xs..x3s]]"),
            /不連続なループ範囲/,
          )
        })

        test("extra-number は number-extra を跨ごうとするとエラー", () => {
          assert.throws(
            () => replaceRange("$[[x2s..x2l]]"),
            /不連続なループ範囲/,
          )
        })

        test("extra-number は extra の一部と併用できない", () => {
          assert.throws(
            () => replaceRange("$[[xxl..x3l]]"),
            /不連続なループ範囲/,
          )
        })

        test("カンマ区切り", () => {
          assert.deepEqual(replaceRange("$[[s,sm..lg,x2l..x4l]]"), [
            "s",
            "sm",
            "md",
            "lg",
            "x2l",
            "x3l",
            "x4l",
          ])
        })
      })
    })

    test("使用例", () => {
      assert.deepEqual(replaceRange("/above_h/h$[[1..6]]"), [
        "/above_h/h1",
        "/above_h/h2",
        "/above_h/h3",
        "/above_h/h4",
        "/above_h/h5",
        "/above_h/h6",
      ])
      assert.deepEqual(replaceRange("/h$[[1..6]]/mb"), [
        "/h1/mb",
        "/h2/mb",
        "/h3/mb",
        "/h4/mb",
        "/h5/mb",
        "/h6/mb",
      ])
    })
  })
}
