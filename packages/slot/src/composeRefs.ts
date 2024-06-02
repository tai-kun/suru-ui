import React from "react";

/**
 * 複数の ref を結合する。
 *
 * @template T - ref の型。
 * @param refs - ref の配列。
 * @returns 結合された ref。
 */
export function composeRefs<T>(
  ...refs: (React.Ref<T> | undefined)[]
): (instance: T | null) => () => void {
  return function composedRef(ins) {
    const cleanup = refs.map(ref => {
      if (typeof ref === "function") {
        return ref(ins);
      }

      if (ref) {
        ref.current = ins;
      }
    });

    return function cleanupComposedRef() {
      cleanup
        .reverse()
        .forEach(f => f?.());
    };
  };
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, mock, test } = cfgTest;

  describe("@suru-ui/slot/composeRefs", () => {
    test("複数の ref を結合する", () => {
      const refNull = null;
      const refVoid = undefined;
      const refObject = React.createRef();

      const callbackHistory: any[] = [];
      const cleanupHistory: any[] = [];

      const refCleanup1 = mock.fn(() => {
        cleanupHistory.push(1);
      });
      const refCallback1 = mock.fn((_: any) => {
        callbackHistory.push(1);
        return refCleanup1;
      });

      const refCleanup2 = mock.fn(() => {
        cleanupHistory.push(2);
      });
      const refCallback2 = mock.fn((_: any) => {
        callbackHistory.push(2);
        return refCleanup2;
      });

      const composedRef = composeRefs(
        refNull,
        refVoid,
        refObject,
        refCallback1,
        refCallback2,
      );
      const VALUE = {};
      const cleanup = composedRef(VALUE);

      assert.equal(refNull, null);
      assert.equal(refVoid, undefined);
      assert.equal(refObject.current, VALUE);

      assert.equal(refCallback1.mock.calls.length, 1);
      assert.equal(refCallback1.mock.calls[0]?.arguments[0], VALUE);
      assert.equal(refCallback2.mock.calls.length, 1);
      assert.equal(refCallback2.mock.calls[0]?.arguments[0], VALUE);
      assert.deepEqual(callbackHistory, [1, 2]);

      assert.equal(refCleanup1.mock.calls.length, 0);
      assert.equal(refCleanup2.mock.calls.length, 0);

      cleanup();

      assert.equal(refCleanup1.mock.calls.length, 1);
      assert.equal(refCleanup2.mock.calls.length, 1);
      assert.deepEqual(cleanupHistory, [2, 1]);
    });
  });
}
