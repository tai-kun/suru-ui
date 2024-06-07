import { Slot } from "@suru-ui/slot";
import type { Color, ColorVariant } from "@suru-ui/theme";
import clsx from "clsx";

import "./ButtonStyle.css";

const I = "SuiButtonStyle";

export interface RootParams {
  color: Color | undefined;
  outlined: boolean | undefined;
  variant: ColorVariant | undefined;
}

export interface RootProps extends RootParams {
  children: React.ReactElement;
}

export default function Root(props: RootProps) {
  const {
    color = "blue",
    variant = "solid",
    children,
    outlined,
  } = props;

  return (
    <Slot
      className={clsx(I, [
        `${I}-color-${color}`,
        `${I}-variant-${variant}`,
        outlined && `${I}-outlined`,
      ])}
    >
      {children}
    </Slot>
  );
}
