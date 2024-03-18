import * as React from "react"

export interface IconDefinition {
  name: string
  props: {
    className: string
  }
  children: React.JSX.Element
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { describe, test } = cfgTest

  describe("src/icons/index", () => {
    test.todo("テストを書く")
  })
}
