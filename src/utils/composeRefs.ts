import * as React from "react"

function setRef<T>(ref: React.Ref<T> | undefined, node: T) {
  if (typeof ref === "function") {
    ref(node)
  } else if (ref) {
    ;(ref as React.MutableRefObject<T>).current = node
  }
}

/**
 * 複数の ref を結合する。
 *
 * @template T ref の型。
 * @param refs ref の配列。
 * @returns 結合された ref。
 */
export default function composeRefs<T>(
  ...refs: (React.Ref<T> | undefined)[]
): React.RefCallback<T> {
  return node => refs.forEach(ref => setRef(ref, node))
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, mock, test } = cfgTest

  describe("src/utils/composeRefs", () => {
    test("複数の ref を結合する", () => {
      const refNull = null
      const refUndefined = undefined
      const refObject = React.createRef()
      const refCallback = mock.fn()
      const composedRef = composeRefs(
        refNull,
        refUndefined,
        refObject,
        refCallback,
      )
      const VALUE = {}
      composedRef(VALUE)

      assert.equal(refNull, null)
      assert.equal(refUndefined, undefined)
      assert.equal(refObject.current, VALUE)
      assert.equal(refCallback.mock.calls.length, 1)
      assert.equal(refCallback.mock.calls[0]?.arguments[0], VALUE)
    })
  })
}
