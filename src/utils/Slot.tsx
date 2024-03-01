import * as React from "react"
import composeRefs from "./composeRefs"
import forwardRef, { type HTMLPropsWithRef } from "./forwardRef"
import Slottable from "./Slottable"
import useConstantValue from "./useConstantValue"

/**
 * 子要素が Slottable かどうかを判定する。
 *
 * @param child 子要素。
 * @returns 子要素が Slottable なら true、そうでなければ false。
 */
function isSlottable(
  child: React.ReactNode,
): child is React.ReactElement<React.PropsWithChildren<{}>> {
  return React.isValidElement(child) && child.type === Slottable
}

/**
 * 文字コードが大文字のアルファベットかどうかを判定する。
 *
 * @param charCode 文字コード。
 * @returns 文字コードが大文字のアルファベットなら true、そうでなければ false。
 */
function isAlphabetCode(charCode: number): boolean {
  return charCode >= 65 && charCode <= 90 // A-Z
}

/**
 * ハンドラのプロパティ名かどうかを判定する。
 *
 * @param name プロパティ名。
 * @returns ハンドラのプロパティ名なら true、そうでなければ false。
 */
function isHandlerPropName(name: string): boolean {
  return name.charCodeAt(0) === 111 // o
    && name.charCodeAt(1) === 110 // n
    && isAlphabetCode(name.charCodeAt(2))
}

/**
 * props をマージする際に利用するメモ化オブジェクト。
 */
interface CacheMap {
  /**
   * プロパティ値を取得する。
   *
   * @param name プロパティ名。
   * @param make 新しいプロパティ値を作成する関数。
   * @param deps 依存する値の配列。
   * @returns プロパティ値。
   */
  get(
    name: string,
    make: () => unknown,
    deps: readonly unknown[],
  ): any
}

interface CacheMapManager {
  /**
   * CacheMap を作成する。
   */
  create(): CacheMap & Disposable
}

/**
 * CacheMapManager を作成する。
 *
 * @returns CacheMapManager。
 */
function useCacheMapManager(): CacheMapManager {
  const memory = useConstantValue<
    Record<string, { deps: readonly unknown[]; cache: unknown }>
  >({})

  return {
    create() {
      const memoized = new Set<string>()

      return {
        get(name, make, deps) {
          memoized.add(name)
          const info = memory[name]

          if (info?.deps.every((v, i) => v === deps[i])) {
            return info.cache
          }

          const cache = make()
          memory[name] = { deps, cache }

          return cache
        },
        [Symbol.dispose || Symbol.for("Symbol.dispose")]() {
          for (const name of Object.keys(memory)) {
            if (!memoized.has(name)) {
              delete memory[name]
            }
          }
        },
      }
    },
  }
}

/**
 * 2 つの props をマージする。
 *
 * @param cacheMap CacheMap。
 * @param slotProps Slot コンポーネントの props。
 * @param childProps 子要素の props。
 * @returns マージされた props。
 */
function mergeProps(
  cacheMap: CacheMap,
  slotProps: HTMLPropsWithRef,
  childProps: HTMLPropsWithRef,
): HTMLPropsWithRef {
  const overrideProps: Partial<HTMLPropsWithRef> = { ...childProps }

  for (const name of Object.keys(childProps) as (keyof HTMLPropsWithRef)[]) {
    if ((name as string) === "__proto__") {
      continue
    }

    const slot = slotProps[name]
    const child = childProps[name]

    switch (true) {
      case name === "ref":
        overrideProps[name] = cacheMap.get(
          name,
          () => composeRefs(slot, child),
          [slot, child],
        )

        break

      case name === "style":
        overrideProps[name] = cacheMap.get(
          name,
          () =>
            slot && child
              ? { ...slot, ...child } // child が優先される。
              : (slot || child),
          [slot, child],
        )

        break

      case name === "className":
        overrideProps[name] = cacheMap.get(
          name,
          () =>
            slot && child
              ? `${child} ${slot}` // child を先頭にする。
              : (slot || child),
          [slot, child],
        )

        break

      case isHandlerPropName(name):
        overrideProps[name] = cacheMap.get(
          name,
          () =>
            slot && child
              ? function(this: unknown, ...args: unknown[]) {
                child.apply(this, args) // child を先に呼び出す。
                slot.apply(this, args)
              }
              : (slot || child),
          [slot, child],
        )

        break
    }
  }

  return {
    ...slotProps,
    ...overrideProps,
  }
}

const SlotClone = forwardRef(function SlotClone(props: HTMLPropsWithRef) {
  const { children, ...slotProps } = props
  const cacheMapManager = useCacheMapManager()

  if (React.isValidElement(children)) {
    using cacheMap = cacheMapManager.create()

    return React.cloneElement(
      children,
      mergeProps(cacheMap, slotProps, children.props),
    )
  }

  return React.Children.count(children) > 1
    ? React.Children.only(null)
    : null
})

const Slot = forwardRef(function Slot(props: HTMLPropsWithRef) {
  const { children, ...slotProps } = props
  const childrenArray = React.Children.toArray(children)
  const slottable = childrenArray.find(isSlottable)

  if (!slottable) {
    return (
      <SlotClone {...slotProps}>
        {children}
      </SlotClone>
    )
  }

  const newElement = slottable.props.children
  const newChildren = childrenArray.map(child =>
    child !== slottable
      ? child
      : React.Children.count(newElement) > 1
      ? React.Children.only(newElement)
      : React.isValidElement<React.PropsWithChildren<{}>>(newElement)
      ? newElement.props.children
      : null // TODO: 警告を出す。
  )

  return (
    <SlotClone {...slotProps}>
      {React.isValidElement(newElement)
        ? React.cloneElement(newElement, undefined, ...newChildren)
        : null}
    </SlotClone>
  )
})

export default Slot

if (cfgTest && cfgTest.url === import.meta.url) {
  const { renderToStaticMarkup } = await import("react-dom/server")
  const {
    fireEvent,
    render,
    renderHook,
  } = await import("../utils-dev/react")
  const { assert, beforeEach, describe, mock, test } = cfgTest

  describe("src/utils/Slot", () => {
    describe("isSlottable", () => {
      test("Slottable 要素の場合は true を返す", () => {
        const child = <Slottable>{null}</Slottable>
        assert(isSlottable(child))
      })

      test("Slottable 要素でない場合は false を返す", () => {
        const child = <div />
        assert(!isSlottable(child))
      })
    })

    describe("isAlphabetCode", () => {
      test("大文字のアルファベットの場合は true を返す", () => {
        const codes = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"]
          .map(c => c.charCodeAt(0))

        for (const code of codes) {
          assert(isAlphabetCode(code))
        }
      })

      test("大文字のアルファベットでない場合は false を返す", () => {
        const codes = [
          ..."abcdefghijklmnopqrstuvwxyz0123456789!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~",
        ].map(c => c.charCodeAt(0))

        for (const code of codes) {
          assert(!isAlphabetCode(code))
        }
      })
    })

    describe("isHandlerPropName", () => {
      test("ハンドラのプロパティ名の場合は true を返す", () => {
        assert(isHandlerPropName("onClick"))
      })

      test("ハンドラのプロパティ名でない場合は false を返す", () => {
        assert(!isHandlerPropName("style"))
      })
    })

    describe("useCacheMapManager", () => {
      test("メモ化された値を返す", () => {
        const slotStyle = { color: "red" }
        const childStyle = { color: "blue" }
        using renderResult = renderHook(
          ({ name, slot, child }) => {
            const manager = useCacheMapManager()
            using cacheMap = manager.create()
            const resultValue = cacheMap.get(
              name,
              () => ({ ...slot, ...child }),
              [slot, child],
            )

            return resultValue
          },
          {
            initialProps: {
              name: "style",
              slot: slotStyle,
              child: childStyle,
            },
          },
        )
        const { result, rerender } = renderResult
        const style1 = result.current

        assert.deepEqual(style1, {
          color: "blue",
        })

        rerender({
          name: "style",
          slot: slotStyle,
          child: childStyle,
        })
        const style2 = result.current

        assert.deepEqual(style2, {
          color: "blue",
        })
        assert.equal(style1, style2)
      })

      test("値が変更されると新しい値が返される", () => {
        const slotStyle = { color: "red" }
        const childStyle = { color: "blue" }
        using renderResult = renderHook(
          ({ name, slot, child }) => {
            const manager = useCacheMapManager()
            using cacheMap = manager.create()
            const resultValue = cacheMap.get(
              name,
              () => ({ ...slot, ...child }),
              [slot, child],
            )

            return resultValue
          },
          {
            initialProps: {
              name: "style",
              slot: slotStyle,
              child: childStyle,
            },
          },
        )
        const { result, rerender } = renderResult
        const style1 = result.current

        rerender({
          name: "style",
          slot: slotStyle,
          child: { color: "green" },
        })
        const style2 = result.current

        assert.deepEqual(style2, {
          color: "green",
        })
        assert.notEqual(style1, style2)
      })

      test("不要なキャッシュが削除される", () => {
        const slotStyle = { color: "red" }
        const childStyle = { color: "blue" }
        using renderResult = renderHook(
          ({ name, slot, child, memoize }) => {
            const manager = useCacheMapManager()
            using cacheMap = manager.create()
            let resultValue

            if (memoize) {
              resultValue = cacheMap.get(
                name,
                () => ({ ...slot, ...child }),
                [slot, child],
              )
            }

            return resultValue
          },
          {
            initialProps: {
              name: "style",
              slot: slotStyle,
              child: childStyle,
              memoize: true,
            },
          },
        )
        const { result, rerender } = renderResult
        const style1 = result.current

        rerender({
          name: "style",
          slot: slotStyle,
          child: childStyle,
          memoize: false, // メモ化しないため、style のキャッシュが削除される。
        })
        const style2 = result.current

        rerender({
          name: "style",
          slot: slotStyle,
          child: childStyle,
          memoize: true,
        })
        const style3 = result.current

        assert.deepEqual(style1, {
          color: "blue",
        })
        assert.equal(style2, undefined)
        assert.deepEqual(style3, {
          color: "blue",
        })
        assert.notEqual(style1, style3)
      })
    })

    describe("Slot", () => {
      describe("Slot に onClick ハンドラが渡されている", () => {
        const handleClick = mock.fn()

        beforeEach(() => {
          handleClick.mock.resetCalls()
          using renderResult = render(
            <Slot onClick={handleClick}>
              <button type="button" />
            </Slot>,
          )
          fireEvent.click(renderResult.getByRole("button"))
        })

        test("onClick ハンドラが呼び出される", () => {
          assert.equal(handleClick.mock.callCount(), 1)
        })
      })

      describe("Slot の子要素に onClick ハンドラが渡されている", () => {
        const handleClick = mock.fn()

        beforeEach(() => {
          handleClick.mock.resetCalls()
          using renderResult = render(
            <Slot>
              <button type="button" onClick={handleClick} />
            </Slot>,
          )
          fireEvent.click(renderResult.getByRole("button"))
        })

        test("onClick ハンドラが呼び出される", () => {
          assert.equal(handleClick.mock.callCount(), 1)
        })
      })

      describe("Slot と子要素の両方に onClick ハンドラが渡されている", () => {
        const slotHandleClick = mock.fn()
        const childHandleClick = mock.fn()

        beforeEach(() => {
          slotHandleClick.mock.resetCalls()
          childHandleClick.mock.resetCalls()
          using renderResult = render(
            <Slot onClick={slotHandleClick}>
              <button type="button" onClick={childHandleClick} />
            </Slot>,
          )
          fireEvent.click(renderResult.getByRole("button"))
        })

        test("Slot の onClick ハンドラが呼び出される", () => {
          assert.equal(slotHandleClick.mock.callCount(), 1)
        })

        test("子要素の onClick ハンドラが呼び出される", () => {
          assert.equal(childHandleClick.mock.callCount(), 1)
        })
      })

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
          )
          assert.equal(
            markup,
            "<button><span>LEFT</span><i>Suru</i> UI<span>RIGHT</span></button>",
          )
        })

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
          )
          assert.equal(
            markup,
            `<a href="https://github.com/tai-kun/suru-ui"><span>LEFT</span><i>Suru</i> UI<span>RIGHT</span></a>`,
          )
        })
      })
    })
  })
}
