import React from "react";

import isSlottable, { type SlottableElement } from "./isSlottable";
import mergeProps, { type SlotProps } from "./mergeProps";
import Slottable from "./Slottable";
import useCacheManager from "./useCacheManager";

function SlotClone(props: SlotProps) {
  const { children, ...slotProps } = props;

  if (!React.isValidElement(children)) {
    return React.Children.only(children), null;
  }

  const cacheManager = useCacheManager();
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

function isValidElementOnly<P>(
  children: React.ReactNode,
): children is React.ReactElement<P> {
  return React.isValidElement<P>(React.Children.only(children));
}

export default function Slot(props: SlotProps) {
  const { children, ...slotProps } = props;
  const newChildren: React.ReactNode[] = React.Children.toArray(children);
  const slottableIndex = newChildren.findIndex(isSlottable);

  if (slottableIndex === -1) {
    return (
      <SlotClone {...slotProps}>
        {children}
      </SlotClone>
    );
  }

  let slottable = newChildren[slottableIndex] as SlottableElement;

  // 子要素が Slottable でなくなるまで探索する。
  while (isSlottable(slottable.props.children)) {
    slottable = slottable.props.children;
  }

  const newElement = slottable.props.children;

  newChildren[slottableIndex] =
    !isValidElementOnly<React.PropsWithChildren<{}>>(newElement)
      ? null // TODO(tai-kun): 警告を出す？
      : newElement.type !== Slot
      ? newElement.props.children
      // Slottable の子要素が Slot の場合、Slottable の前後の要素を
      // その Slot の子要素内に展開する。
      : React.Children.toArray(newElement.props.children).find(isSlottable)
      // Slot 内にすでに Slottable がある場合、その Slottable を使う。
      ? newElement.props.children
      // Slot 内に Slottable がない場合、新たに Slottable を作成する。
      : <Slottable>{newElement.props.children}</Slottable>;

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
  const { fireEvent, render } = await import("@testing-library/react");
  const { default: Slottable } = await import("./Slottable");
  const { assert, beforeEach, describe, mock, test } = cfgTest;

  describe("@suru-ui/slot/Slot", () => {
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

    describe("ネスト", () => {
      test("Slot はネストされた Slot の子要素を展開する", () => {
        const markup = renderToStaticMarkup(
          <Slot data-1>
            <Slot>
              <Slot data-2>
                <Slot>
                  <div data-3>
                    Suru UI
                  </div>
                </Slot>
              </Slot>
            </Slot>
          </Slot>,
        );

        assert.equal(
          markup,
          renderToStaticMarkup(
            <div
              data-3
              data-2
              data-1
            >
              Suru UI
            </div>,
          ),
        );
      });

      test("Slot はネストされた Slottable の子要素を展開する", () => {
        const markup = renderToStaticMarkup(
          <Slot data-1>
            <Slottable>
              <Slottable>
                <Slottable>
                  <div data-2>
                    Suru UI
                  </div>
                </Slottable>
              </Slottable>
            </Slottable>
          </Slot>,
        );

        assert.equal(
          markup,
          renderToStaticMarkup(
            <div
              data-2
              data-1
            >
              Suru UI
            </div>,
          ),
        );
      });

      test("Slot は Slottable を介してネストされた Slot の子要素を展開する", () => {
        const markup = renderToStaticMarkup(
          <Slot data-1>
            <span>1</span>
            <Slottable>
              <Slot data-2>
                <span>2</span>
                <Slottable>
                  <div data-3>Suru UI</div>
                </Slottable>
              </Slot>
            </Slottable>
          </Slot>,
        );

        assert.equal(
          markup,
          renderToStaticMarkup(
            <div
              data-3
              data-2
              data-1
            >
              <span>1</span>
              <span>2</span>
              Suru UI
            </div>,
          ),
        );
      });
    });
  });
}
