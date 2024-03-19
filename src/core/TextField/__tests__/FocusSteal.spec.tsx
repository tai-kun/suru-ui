import { expect, test } from "@playwright/experimental-ct-react"
import TextField from "./FocusSteal"

test("Adornment をクリックすると Input にフォーカスがあたる", async ({ mount }) => {
  const component = await mount(<TextField />)
  const input = component.locator("input.SuiTextFieldInput")

  expect(await input.evaluate(el => el.matches(":focus"))).toBe(false)

  const adornment = component.locator("div.SuiTextFieldAdornment")
  await adornment.click()

  expect(await input.evaluate(el => el.matches(":focus"))).toBe(true)
})

test("disableFocusSteal を true にすると Adornment をクリックしても Input にフォーカスがあたらない", async ({ mount }) => {
  const component = await mount(<TextField disableFocusSteal />)
  const input = component.locator("input.SuiTextFieldInput")

  expect(await input.evaluate(el => el.matches(":focus"))).toBe(false)

  const adornment = component.locator("div.SuiTextFieldAdornment")
  await adornment.click()

  expect(await input.evaluate(el => el.matches(":focus"))).toBe(false)
})
