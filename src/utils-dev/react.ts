import { GlobalRegistrator } from "@happy-dom/global-registrator"
import {
  type Queries,
  type queries,
  render as _render,
  renderHook as _renderHook,
  type RenderHookOptions,
  type RenderHookResult,
  type RenderOptions,
  type RenderResult,
} from "@testing-library/react"

GlobalRegistrator.register()

export * from "@testing-library/react"

export function render<
  Q extends Queries = typeof queries,
  C extends Element | DocumentFragment = HTMLElement,
  B extends Element | DocumentFragment = C,
>(
  ui: React.ReactNode,
  options: RenderOptions<Q, C, B>,
): RenderResult<Q, C, B> & Disposable

export function render(
  ui: React.ReactNode,
  options?: Omit<RenderOptions, "queries">,
): RenderResult & Disposable

export function render(...args: any): any {
  // @ts-expect-error
  return new Proxy(_render(...args), {
    get(target, prop, receiver) {
      if (prop === Symbol.dispose) {
        return function dispose() {
          target.unmount()
        }
      }

      return Reflect.get(target, prop, receiver)
    },
  })
}

export function renderHook<
  R,
  P,
  Q extends Queries = typeof queries,
  C extends Element | DocumentFragment = HTMLElement,
  B extends Element | DocumentFragment = C,
>(
  render: (initialProps: P) => R,
  options?: RenderHookOptions<P, Q, C, B> | undefined,
): RenderHookResult<R, P> & Disposable {
  // @ts-expect-error
  return new Proxy(_renderHook(render, options), {
    get(target, prop, receiver) {
      if (prop === Symbol.dispose) {
        return function dispose() {
          target.unmount()
        }
      }

      return Reflect.get(target, prop, receiver)
    },
  })
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest

  describe("src/utils-dev/react", () => {
    test("DOM にアクセスできる", () => {
      assert.doesNotThrow(() => document.createElement("div"))
    })
  })
}
