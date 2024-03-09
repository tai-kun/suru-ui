import type { GlobalProvider } from "@ladle/react"
import * as React from "react"
import "../../src/theme/all.css"
import "./components.css"

export const Provider: GlobalProvider = ({ children }) => (
  <React.StrictMode>
    {children}
  </React.StrictMode>
)
