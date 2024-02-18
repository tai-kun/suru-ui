type ObjectLike = ArrayLike<any> | ((...args: any) => any)

/**
 * プレーンオブジェクトを取り出す。
 *
 * @template T プレーンオブジェクトをとり得る型
 */
export type ExtractPlainObject<T> = T extends ObjectLike ? never
  : T extends Record<keyof any, any> ? T
  : never

/**
 * プレーンオブジェクトか判定する。
 *
 * @template T オブジェクトを取りうる値
 * @param x オブジェクトを取りうる値
 * @returns プレーンオブジェクトの場合は true、それ以外は false
 * @example
 * ```ts
 * const valid = isPlainObject({})
 * console.log(valid) // => true
 *
 * const valid = isPlainObject(Object.create(null))
 * console.log(valid) // => true
 *
 * const invalid = isPlainObject([])
 * console.log(invalid) // => false
 *
 * const invalid = isPlainObject(null)
 * console.log(invalid) // => false
 *
 * const invalid = isPlainObject(new Map())
 * console.log(invalid) // => false
 * ```
 */
export default function isPlainObject<T>(obj: T): obj is ExtractPlainObject<T> {
  return (
    obj !== null
    && typeof obj === "object"
    && (
      obj.constructor === Object // {}
      || obj.constructor === undefined // Object.create(null)
    )
  )
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { expectType } = await import("tsd")
  const { assert, describe, test } = cfgTest

  describe("src/utils/isPlainObject", () => {
    test("example", () => {
      assert.equal(isPlainObject({}), true)
      assert.equal(isPlainObject({ a: 1, b: 2 }), true)
      assert.equal(isPlainObject(Object.create(null)), true)
      assert.equal(isPlainObject([]), false)
      assert.equal(isPlainObject(null), false)
      assert.equal(isPlainObject(new Date()), false)
    })

    test("プレーンオブジェクトの場合は true を返す", () => {
      assert.equal(isPlainObject({}), true)
      assert.equal(isPlainObject({ a: 1, b: 2 }), true)
      assert.equal(isPlainObject(Object.create(null)), true)
    })

    test("プレーンオブジェクト以外の場合は false を返す", () => {
      assert.equal(isPlainObject([]), false)
      assert.equal(isPlainObject(new Date()), false)
      assert.equal(isPlainObject(/test/), false)
      assert.equal(isPlainObject(() => {}), false)
      assert.equal(isPlainObject(new Map()), false)
      assert.equal(isPlainObject(new Set()), false)
      assert.equal(isPlainObject(new WeakMap()), false)
      assert.equal(isPlainObject(new WeakSet()), false)
      assert.equal(isPlainObject(null), false)
      assert.equal(isPlainObject(undefined), false)
      assert.equal(isPlainObject(123), false)
      assert.equal(isPlainObject("test"), false)
      assert.equal(isPlainObject(true), false)
      assert.equal(isPlainObject(Symbol("test")), false)
    })

    describe("tsd", () => {
      test("プレーンオブジェクトを判定できる", () => {
        const object = {}

        if (isPlainObject(object)) {
          expectType<{}>(object)
        } else {
          expectType<never>(object)
        }
      })

      test("関数と混同しない", () => {
        const func = () => {}

        if (isPlainObject(func)) {
          expectType<never>(func)
        } else {
          expectType<() => void>(func)
        }
      })

      test("toString を持つオブジェクトを通す", () => {
        const union = {} as (
          | null
          | number
          | { toString(): string }
        )

        expectType<ExtractPlainObject<typeof union>>(
          {} as { toString(): string },
        )

        if (isPlainObject(union)) {
          // オブジェクト以外を通しているように見えるが、実際に使用できるプロパティは限られる。
          expectType<number | { toString(): string }>(union)
          expectType<"toString">({} as keyof typeof union)
        } else {
          expectType<null>(union)
        }
      })
    })
  })
}
