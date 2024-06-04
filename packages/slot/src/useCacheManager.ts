import { useConstantValue } from "./useConstantValue";

/**
 * props をマージする際に利用するメモ化オブジェクト。
 */
export interface Cache {
  /**
   * プロパティ値を取得する。
   *
   * @param name - プロパティ名。
   * @param make - 新しいプロパティ値を作成する関数。
   * @param deps - 依存する値の配列。
   * @returns プロパティ値。
   */
  get(
    prop: string,
    make: () => unknown,
    deps: readonly unknown[],
  ): any;
}

interface CacheManager {
  /**
   * Cache を作成する。
   */
  create(): Cache & {
    /**
     * 不要なキャッシュを削除する。
     */
    // TODO(tai-kun): [Sumbol.dispose || Symbol.for("Symbol.dispose")] を使う。
    dispose(): void;
  };
}

/**
 * CacheManager を作成する。
 *
 * @returns CacheManager。
 */
export default function useCacheManager(): CacheManager {
  const memory = useConstantValue<
    Record<string, { deps: readonly unknown[]; cache: unknown }>
  >({});

  return {
    create() {
      const memoized = new Set<string>();

      return {
        get(name, make, deps) {
          memoized.add(name);
          const info = memory[name];

          if (info?.deps.every((v, i) => v === deps[i])) {
            return info.cache;
          }

          const cache = make();
          memory[name] = { deps, cache };

          return cache;
        },
        dispose() {
          for (const name of Object.keys(memory)) {
            if (!memoized.has(name)) {
              delete memory[name];
            }
          }
        },
      };
    },
  };
}

if (cfgTest && cfgTest.url === import.meta.url) {
  await import("@happy-dom/global-registrator")
    .then(({ GlobalRegistrator }) => GlobalRegistrator.register());
  const { renderHook } = await import("@testing-library/react");
  const { assert, describe, test } = cfgTest;

  describe("@suru-ui/slot/useCacheManager", () => {
    test("メモ化された値を返す", () => {
      const slotStyle = { color: "red" };
      const childStyle = { color: "blue" };
      const { result, rerender } = renderHook(
        ({ name, slot, child }) => {
          const manager = useCacheManager();
          const cache = manager.create();

          try {
            return cache.get(
              name,
              () => ({ ...slot, ...child }),
              [slot, child],
            );
          } finally {
            cache.dispose();
          }
        },
        {
          initialProps: {
            name: "style",
            slot: slotStyle,
            child: childStyle,
          },
        },
      );
      const style1 = result.current;

      assert.deepEqual(style1, {
        color: "blue",
      });

      rerender({
        name: "style",
        slot: slotStyle,
        child: childStyle,
      });
      const style2 = result.current;

      assert.deepEqual(style2, {
        color: "blue",
      });
      assert.equal(style1, style2);
    });

    test("値が変更されると新しい値が返される", () => {
      const slotStyle = { color: "red" };
      const childStyle = { color: "blue" };
      const { result, rerender } = renderHook(
        ({ name, slot, child }) => {
          const manager = useCacheManager();
          const cache = manager.create();

          try {
            return cache.get(
              name,
              () => ({ ...slot, ...child }),
              [slot, child],
            );
          } finally {
            cache.dispose();
          }
        },
        {
          initialProps: {
            name: "style",
            slot: slotStyle,
            child: childStyle,
          },
        },
      );
      const style1 = result.current;

      rerender({
        name: "style",
        slot: slotStyle,
        child: { color: "green" },
      });
      const style2 = result.current;

      assert.deepEqual(style2, {
        color: "green",
      });
      assert.notEqual(style1, style2);
    });

    test("不要なキャッシュが削除される", () => {
      const slotStyle = { color: "red" };
      const childStyle = { color: "blue" };
      const { result, rerender } = renderHook(
        ({ name, slot, child, memoize }) => {
          const manager = useCacheManager();
          const cache = manager.create();

          try {
            let resultValue;

            if (memoize) {
              resultValue = cache.get(
                name,
                () => ({ ...slot, ...child }),
                [slot, child],
              );
            }

            return resultValue;
          } finally {
            cache.dispose();
          }
        },
        {
          initialProps: {
            name: "style",
            slot: slotStyle,
            child: childStyle,
            memoize: true,
          },
        },
      );
      const style1 = result.current;

      rerender({
        name: "style",
        slot: slotStyle,
        child: childStyle,
        memoize: false, // メモ化しないため、style のキャッシュが削除される。
      });
      const style2 = result.current;

      rerender({
        name: "style",
        slot: slotStyle,
        child: childStyle,
        memoize: true,
      });
      const style3 = result.current;

      assert.deepEqual(style1, {
        color: "blue",
      });
      assert.equal(style2, undefined);
      assert.deepEqual(style3, {
        color: "blue",
      });
      assert.notEqual(style1, style3);
    });
  });
}
