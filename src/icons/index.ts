import * as React from "react"

export interface IconDefinition {
  name: string
  props: {
    className: string
  }
  children: React.JSX.Element
}

if (cfgTest && process.env.CFG_TEST_FILE === import.meta.filename) {
  const { describe, test } = cfgTest

  describe("src/icons/index", () => {
    test.todo("テストを書く")
  })
}
