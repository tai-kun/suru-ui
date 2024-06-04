import React from "react";
import isSlottable from "./isSlottable";
import mergeProps, { type SlotProps } from "./mergeProps";
import useCacheManager from "./useCacheManager";

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

export default function Slot(props: SlotProps) {
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
  });
}
