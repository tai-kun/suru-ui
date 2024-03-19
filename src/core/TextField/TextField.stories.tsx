import type { Story, StoryDefault } from "@ladle/react"
import { TEXT_SIZE_LIST } from "../../theme"
import * as TextField from "./TextField"
// import { dsaHelp } from "../../icons/digital.go.jp/outlined"
// import * as IconButton from "../../lab/IconButton/IconButton"
// import * as Icon from "../Icon/Icon"

export default { title: "TextField" } satisfies StoryDefault

const flexColStyle = {
  gap: 8,
  display: "flex",
  flexDirection: "column",
} as const

export const Basic: Story = () => (
  <TextField.Root>
    <TextField.Input defaultValue="テキスト" />
  </TextField.Root>
)

export const Disabled: Story = () => (
  <TextField.Root>
    <TextField.Input disabled defaultValue="テキスト" />
  </TextField.Root>
)

export const FullWidth: Story = () => (
  <TextField.Root fullWidth>
    <TextField.Input defaultValue="テキスト" />
  </TextField.Root>
)

export const Invalid: Story = () => (
  <TextField.Root>
    <TextField.Input
      defaultValue="1234"
      aria-invalid
    />
  </TextField.Root>
)

export const Size: Story = () => (
  <div style={flexColStyle}>
    {TEXT_SIZE_LIST.map(size => (
      <TextField.Root
        key={size}
        size={size}
      >
        <TextField.Input placeholder={`${size} サイズ`} />
      </TextField.Root>
    ))}
  </div>
)

// export const WithAdornment: Story = () => (
//   <div style={flexColStyle}>
//     <TextField.Root>
//       <TextField.Adornment>¥</TextField.Adornment>
//       <TextField.Input
//         type="number"
//         defaultValue={10}
//       />
//       <TextField.Adornment disableFocusSteal>
//         <IconButton.Root
//           size="sm"
//           color="neutral"
//           variant="light"
//           onClick={() => {
//             // eslint-disable-next-line no-alert
//             alert("clicked")
//           }}
//         >
//           <Icon.Root icon={dsaHelp} />
//         </IconButton.Root>
//       </TextField.Adornment>
//       <TextField.Adornment>万円</TextField.Adornment>
//     </TextField.Root>

//     <TextField.Root>
//       <TextField.Input
//         type="number"
//         defaultValue={10}
//       />
//       <TextField.Adornment>万円</TextField.Adornment>
//       <TextField.Adornment disableFocusSteal>
//         <IconButton.Root
//           size="sm"
//           color="neutral"
//           variant="light"
//           onClick={() => {
//             // eslint-disable-next-line no-alert
//             alert("clicked")
//           }}
//         >
//           <Icon.Root icon={dsaHelp} />
//         </IconButton.Root>
//       </TextField.Adornment>
//       <TextField.Adornment disableFocusSteal>
//         <IconButton.Root
//           size="sm"
//           color="neutral"
//           variant="light"
//           onClick={() => {
//             // eslint-disable-next-line no-alert
//             alert("clicked")
//           }}
//         >
//           <Icon.Root icon={dsaHelp} />
//         </IconButton.Root>
//       </TextField.Adornment>
//     </TextField.Root>

//     <TextField.Root>
//       <TextField.Input
//         type="number"
//         defaultValue={10}
//       />
//       <TextField.Adornment>万円</TextField.Adornment>
//     </TextField.Root>
//   </div>
// )
