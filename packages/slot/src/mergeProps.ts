import React from "react";

import { composeRefs } from "./composeRefs";
import isHandlerPropName from "./isHandlerPropName";
import type { Cache } from "./useCacheManager";

export interface SlotProps<T = unknown>
  extends React.RefAttributes<T>, React.AllHTMLAttributes<T>
{}

/**
 * 2 つの props をマージする。
 *
 * @param cache - Cache。
 * @param slotProps - Slot コンポーネントの props。
 * @param childProps - 子要素の props。
 * @returns マージされた props。
 */
export default function mergeProps(
  cache: Cache,
  slotProps: SlotProps,
  childProps: SlotProps,
): SlotProps {
  const overrideProps: Partial<SlotProps> = { ...childProps };

  for (const name of Object.keys(childProps) as (keyof SlotProps)[]) {
    if ((name as string) === "__proto__") {
      continue;
    }

    const slot = slotProps[name];
    const child = childProps[name];

    switch (true) {
      case name === "ref":
        overrideProps[name] = cache.get(
          name,
          () => composeRefs(slot, child),
          [slot, child],
        );

        break;

      case name === "style":
        overrideProps[name] = cache.get(
          name,
          () =>
            slot && child
              ? { ...slot, ...child } // child が優先される。
              : (slot || child),
          [slot, child],
        );

        break;

      case name === "className":
        overrideProps[name] = cache.get(
          name,
          () =>
            slot && child
              ? `${child} ${slot}` // child を先頭にする。
              : (slot || child),
          [slot, child],
        );

        break;

      case isHandlerPropName(name):
        overrideProps[name] = cache.get(
          name,
          () =>
            slot && child
              ? function(this: unknown, ...args: unknown[]) {
                child.apply(this, args); // child を先に呼び出す。
                slot.apply(this, args);
              }
              : (slot || child),
          [slot, child],
        );

        break;
    }
  }

  return {
    ...slotProps,
    ...overrideProps,
  };
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { describe, test } = cfgTest;

  describe("@suru-ui/slot/mergeProps", () => {
    test.todo("テスト");
  });
}
