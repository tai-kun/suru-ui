import * as TextField from "../TextField"

export default (props: { disableFocusSteal?: boolean }) => {
  const { disableFocusSteal } = props

  return (
    <div>
      <TextField.Root>
        <TextField.Adornment disableFocusSteal={disableFocusSteal}>
          ￥
        </TextField.Adornment>
        <TextField.Input type="number" />
      </TextField.Root>
    </div>
  )
}
