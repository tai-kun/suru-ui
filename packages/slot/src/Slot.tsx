import React from "react";
import { composeRefs } from "./composeRefs";
import { isSlottable } from "./Slottable";
import { useConstantValue } from "./useConstantValue";

/**
 * 文字コードが大文字のアルファベットかどうかを判定する。
 *
 * @param codePoint - 文字コード。
 * @returns 文字コードが大文字のアルファベットなら true、そうでなければ false。
 */
function isAlphabet(codePoint: number): boolean {
  return codePoint >= 65 && codePoint <= 90; // A-Z
}

/**
 * ハンドラのプロパティ名かどうかを判定する。
 *
 * @param name - プロパティ名。
 * @returns ハンドラのプロパティ名なら true、そうでなければ false。
 */
function isHandlerPropName(name: string): boolean {
  return name.charCodeAt(0) === 111 // o
    && name.charCodeAt(1) === 110 // n
    && isAlphabet(name.charCodeAt(2));
}

/**
 * props をマージする際に利用するメモ化オブジェクト。
 */
interface Cache {
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
    // TODO(tai-kun): [Sumbol.dispose || Symbol.for("Symbol.dispose")] を使う。
    dispose(): void;
  };
}

/**
 * CacheManager を作成する。
 *
 * @returns CacheManager。
 */
function useCacheManager(): CacheManager {
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
function mergeProps(
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

function SlotClone(props: SlotProps) {
  const { children, ...slotProps } = props;
  const cacheManager = useCacheManager();

  if (React.isValidElement(children)) {
    const cache = cacheManager.create();

    try {
      return React.cloneElement(
        children,
        mergeProps(cache, slotProps, children.props as SlotProps),
      );
    } finally {
      cache.dispose();
    }
  }

  return React.Children.count(children) > 1
    ? React.Children.only(null)
    : null;
}

export function Slot(props: SlotProps) {
  const { children, ...slotProps } = props;
  const childrenArray = React.Children.toArray(children);
  const slottable = childrenArray.find(isSlottable);

  if (!slottable) {
    return (
      <SlotClone {...slotProps}>
        {children}
      </SlotClone>
    );
  }

  const newElement = slottable.props.children;
  const newChildren = childrenArray.map(child =>
    child !== slottable
      ? child
      : React.Children.count(newElement) > 1
      ? React.Children.only(newElement)
      : React.isValidElement<React.PropsWithChildren<{}>>(newElement)
      ? newElement.props.children
      : null // TODO(tai-kun): 警告を出す？
  );

  return (
    <SlotClone {...slotProps}>
      {React.isValidElement(newElement)
        ? React.cloneElement(newElement, undefined, ...newChildren)
        : null}
    </SlotClone>
  );
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { renderToStaticMarkup } = await import("react-dom/server");
  await import("@happy-dom/global-registrator")
    .then(({ GlobalRegistrator }) => GlobalRegistrator.register());
  const {
    fireEvent,
    render,
    renderHook,
  } = await import("@testing-library/react");
  const { Slottable } = await import("./Slottable");
  const { assert, beforeEach, describe, mock, test } = cfgTest;

  describe("@suru-ui/slot/Slot", () => {
    describe("isAlphabet", () => {
      test("大文字のアルファベットの場合は true を返す", () => {
        const points = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"]
          .map(c => c.charCodeAt(0));

        for (const point of points) {
          assert(isAlphabet(point));
        }
      });

      test("大文字のアルファベットでない場合は false を返す", () => {
        const points = [
          ..."abcdefghijklmnopqrstuvwxyz0123456789!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~",
        ].map(c => c.charCodeAt(0));

        for (const point of points) {
          assert(!isAlphabet(point));
        }
      });
    });

    describe("isHandlerPropName", () => {
      test("ハンドラのプロパティ名の場合は true を返す", () => {
        assert(isHandlerPropName("onClick"));
      });

      test("ハンドラのプロパティ名でない場合は false を返す", () => {
        assert(!isHandlerPropName("style"));
      });
    });

    describe("useCacheManager", () => {
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

    describe("Slot", () => {
      describe("Slot に onClick ハンドラが渡されている", () => {
        const handleClick = mock.fn();

        beforeEach(() => {
          handleClick.mock.resetCalls();
          const renderResult = render(
            <Slot onClick={handleClick}>
              <button type="button" />
            </Slot>,
          );
          fireEvent.click(renderResult.getByRole("button"));
          renderResult.unmount();
        });

        test("onClick ハンドラが呼び出される", () => {
          assert.equal(handleClick.mock.callCount(), 1);
        });
      });

      describe("Slot の子要素に onClick ハンドラが渡されている", () => {
        const handleClick = mock.fn();

        beforeEach(() => {
          handleClick.mock.resetCalls();
          const renderResult = render(
            <Slot>
              <button type="button" onClick={handleClick} />
            </Slot>,
          );
          fireEvent.click(renderResult.getByRole("button"));
          renderResult.unmount();
        });

        test("onClick ハンドラが呼び出される", () => {
          assert.equal(handleClick.mock.callCount(), 1);
        });
      });

      describe("Slot と子要素の両方に onClick ハンドラが渡されている", () => {
        const slotHandleClick = mock.fn();
        const childHandleClick = mock.fn();

        beforeEach(() => {
          slotHandleClick.mock.resetCalls();
          childHandleClick.mock.resetCalls();
          const renderResult = render(
            <Slot onClick={slotHandleClick}>
              <button type="button" onClick={childHandleClick} />
            </Slot>,
          );
          fireEvent.click(renderResult.getByRole("button"));
          renderResult.unmount();
        });

        test("Slot の onClick ハンドラが呼び出される", () => {
          assert.equal(slotHandleClick.mock.callCount(), 1);
        });

        test("子要素の onClick ハンドラが呼び出される", () => {
          assert.equal(childHandleClick.mock.callCount(), 1);
        });
      });

      describe("Slottable を含む", () => {
        test("Slot 下にない Slottable は子要素が展開される", () => {
          const markup = renderToStaticMarkup(
            <button>
              <span>LEFT</span>
              <Slottable>
                <i>Suru</i> UI
              </Slottable>
              <span>RIGHT</span>
            </button>,
          );
          assert.equal(
            markup,
            "<button><span>LEFT</span><i>Suru</i> UI<span>RIGHT</span></button>",
          );
        });

        test("Slot は Slottable の子要素を展開する", () => {
          const markup = renderToStaticMarkup(
            <Slot href="https://github.com/tai-kun/suru-ui">
              <span>LEFT</span>
              <Slottable>
                <a>
                  <i>Suru</i> UI
                </a>
              </Slottable>
              <span>RIGHT</span>
            </Slot>,
          );
          assert.equal(
            markup,
            `<a href="https://github.com/tai-kun/suru-ui"><span>LEFT</span><i>Suru</i> UI<span>RIGHT</span></a>`,
          );
        });
      });
    });
  });
}
