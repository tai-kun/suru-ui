import { ThemeState } from "@ladle/react"
import type { GlobalProvider } from "@ladle/react"
import * as React from "react"
import clsx from "../../src/utils/clsx"
import "./components.css"

export const Provider: GlobalProvider = (
  {
    children,
    globalState: {
      theme,
    },
  },
) => (
  <React.StrictMode>
    <div
      className={clsx.lite(
        "theme-provider",
        theme === ThemeState.Dark && "sui-dark",
      )}
    >
      {children}
    </div>
  </React.StrictMode>
)
