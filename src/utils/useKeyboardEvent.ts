import * as React from "react"
import useEventListener, { type EventTargetLike } from "./useEventListener"

/**
 * ハンドラーを呼び出すか決定する条件の関数表現。
 *
 * @param event キーボードイベント。
 * @returns ハンドラーを呼び出すかどうかの真偽値。
 */
export type KeyboardEventFilterFn = (event: KeyboardEvent) => boolean

/**
 * キーボードイベントをフィルタリングし、ハンドラーを呼び出すか決定する条件。
 *
 * - `true` 無条件で呼び出す。
 * - `false` 呼び出さない。
 * - `KeyboardEventKey` 特定のキーが押されたときに呼び出す。
 * - `RegExp` 一致するキーが押されたときに呼び出す。
 * - `Iterable<string>` 特定のキーが押されたときに呼び出す。空の場合は `false` と同等。
 * - `KeyboardEventFilterFn` 高度にカスタマイズされた条件。
 */
export type KeyboardEventFilter =
  | boolean
  | KeyboardEventKey
  | RegExp
  | Iterable<KeyboardEventKey>
  | KeyboardEventFilterFn

/**
 * キーボードイベントハンドラー。
 *
 * @template T イベントリスナーを登録する対象の型。
 * @param event キーボードイベント。
 */
export type KeyboardEventHandler<T extends EventTargetLike<T>> = (
  this: T,
  event: KeyboardEvent,
) => void

/**
 * `useKeyboardEvent` のオプション。
 *
 * @template T イベントリスナーを登録する対象の型。
 */
export interface UseKeyboardEventOptions<T extends EventTargetLike<T>> {
  /**
   * イベントの種類。
   *
   * @default "keydown"
   */
  event?: "keydown" | "keypress" | "keyup" | undefined
  /**
   * イベントリスナーを登録する対象。
   *
   * @default window
   */
  target?: React.RefObject<T | undefined> | T | null | undefined
  /**
   * イベントリスナーのオプション。
   *
   * @default false
   */
  eventOptions?: boolean | AddEventListenerOptions | undefined
}

/**
 * キーボードイベントを監視する。
 *
 * @template T イベントリスナーを登録する対象の型。
 * @param filter ハンドラーを呼び出すか決定する条件。
 * @param handler キーボードイベントハンドラー。
 * @param options オプション。
 */
export default function useKeyboardEvent<T extends EventTargetLike<T> = Window>(
  filter: KeyboardEventFilter,
  handler: KeyboardEventHandler<T>,
  options: UseKeyboardEventOptions<T> | undefined = {},
): void {
  const {
    event = "keydown",
    target = typeof document !== "undefined" ? window : null,
    eventOptions = false,
  } = options

  useEventListener(
    target as T,
    React.useCallback(
      (element: T) => {
        const predicate: KeyboardEventFilterFn | null =
          // `true` or `false`
          typeof filter === "boolean"
            ? filter ? () => true : null
            // `KeyboardEventKey`
            : typeof filter === "string"
            ? ev => ev.key === filter
            // `RegExp`
            : filter instanceof RegExp
            ? ev => filter.test(ev.key)
            // `Iterable<string>`
            : typeof filter !== "function"
            ? (k => k.size > 0 ? ev => k.has(ev.key) : null)(new Set(filter))
            // `KeyboardEventFilterFn`
            : filter

        if (!predicate) {
          return
        }

        element.addEventListener(
          event,
          function(ev) {
            if (predicate(ev)) {
              handler.call(this, ev)
            }
          },
          eventOptions,
        )
      },
      [
        filter,
        handler,
        ...(typeof eventOptions === "boolean"
          ? [eventOptions, 0, 0, 0]
          : [
            eventOptions.once,
            eventOptions.signal,
            eventOptions.capture,
            eventOptions.passive,
          ]),
      ],
    ),
  )
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { renderHook } = await import("../utils-dev/react")
  const { assert, describe, mock, test } = cfgTest

  describe("src/utils/useKeyboardEvent", () => {
    describe("Client-side", () => {
      test("特定のキーが押されたときにイベントが発火する", () => {
        const div = document.createElement("div")
        const listener = mock.fn()
        using _ = renderHook(() => {
          useKeyboardEvent("m", listener, {
            target: div,
          })
        })

        const mKeydownEv = new KeyboardEvent("keydown", { key: "m" })
        div.dispatchEvent(mKeydownEv)

        const tKeydownEv = new KeyboardEvent("keydown", { key: "t" })
        div.dispatchEvent(tKeydownEv)

        assert.equal(listener.mock.calls.length, 1)
        assert.equal(listener.mock.calls?.[0]?.arguments[0], mKeydownEv)
      })
    })

    describe("Server-side", () => {
      test.todo("テストを書く")
    })
  })
}

/**
 * `KeyboardEvent.key` の値。
 *
 * https://developer.mozilla.org/ja/docs/Web/API/UI_Events/Keyboard_event_key_values
 *
 * に行って、以下のコードを実行する。足らない英数字は手動で追加している。
 *
 * ```js
 * console.log(
 *   `export type KeyboardEventKey =
 * ${
 *   [
 *     ...Array.from({ length: 8 }, (_, i) => `"${i + 1}"`),
 *     ...[..."abcdefghijklmnopqrstuvwxyz"].map(c => `"${c}"`),
 *     ...[...document.querySelectorAll("#content > article > section > div > figure > table")]
 *       .filter(tb =>
 *         (tb = tb.querySelector("thead > tr > th:nth-child(1) > code"))
 *         && tb.textContent && tb.textContent.includes("KeyboardEvent.key")
 *       )
 *       .flatMap(
 *         tb => [...tb.querySelectorAll("tbody > tr > td:nth-child(1) > code")],
 *       )
 *       .map(code => code.textContent)
 *   ]
 *     .filter(Boolean)
 *     .map(text => (text = text.match(/"([0-9A-Za-z ]+)"/)) && text[1])
 *     .filter(Boolean)
 *     .sort((a, b) => a.length - b.length)
 *     .sort()
 *     .map(text => `  | ${JSON.stringify(text)}`)
 *     .concat("  | (string & {})")
 *     .join("\n")
 * }`,
 * )
 * ```
 */
export type KeyboardEventKey =
  | " "
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "AVRInput"
  | "AVRPower"
  | "Accept"
  | "Add"
  | "Again"
  | "AllCandidates"
  | "Alphanumeric"
  | "Alt"
  | "AltGraph"
  | "AppSwitch"
  | "ArrowDown"
  | "ArrowLeft"
  | "ArrowRight"
  | "ArrowUp"
  | "Attn"
  | "AudioBalanceLeft"
  | "AudioBalanceRight"
  | "AudioBassBoostDown"
  | "AudioBassBoostToggle"
  | "AudioBassBoostUp"
  | "AudioBassDown"
  | "AudioBassUp"
  | "AudioFaderFront"
  | "AudioFaderRear"
  | "AudioSurroundModeNext"
  | "AudioTrebleDown"
  | "AudioTrebleUp"
  | "AudioVolumeDown"
  | "AudioVolumeMute"
  | "AudioVolumeUp"
  | "Backspace"
  | "BrightnessDown"
  | "BrightnessUp"
  | "BrowserBack"
  | "BrowserFavorites"
  | "BrowserForward"
  | "BrowserHome"
  | "BrowserRefresh"
  | "BrowserSearch"
  | "BrowserStop"
  | "Call"
  | "Camera"
  | "CameraFocus"
  | "Cancel"
  | "CapsLock"
  | "ChannelDown"
  | "ChannelUp"
  | "Clear"
  | "Clear"
  | "ClosedCaptionToggle"
  | "CodeInput"
  | "ColorF0Red"
  | "ColorF1Green"
  | "ColorF2Yellow"
  | "ColorF3Blue"
  | "ColorF4Grey"
  | "ColorF5Brown"
  | "Compose"
  | "ContextMenu"
  | "Control"
  | "Convert"
  | "Copy"
  | "CrSel"
  | "Cut"
  | "DVR"
  | "Dead"
  | "Decimal"
  | "Delete"
  | "Dimmer"
  | "DisplaySwap"
  | "Divide"
  | "Eisu"
  | "Eject"
  | "End"
  | "EndCall"
  | "Enter"
  | "EraseEof"
  | "Escape"
  | "ExSel"
  | "Execute"
  | "Exit"
  | "F1"
  | "F10"
  | "F11"
  | "F12"
  | "F13"
  | "F14"
  | "F15"
  | "F16"
  | "F17"
  | "F18"
  | "F19"
  | "F2"
  | "F20"
  | "F3"
  | "F4"
  | "F5"
  | "F6"
  | "F7"
  | "F8"
  | "F9"
  | "FavoriteClear0"
  | "FavoriteClear1"
  | "FavoriteClear2"
  | "FavoriteClear3"
  | "FavoriteRecall0"
  | "FavoriteRecall1"
  | "FavoriteRecall2"
  | "FavoriteRecall3"
  | "FavoriteStore0"
  | "FavoriteStore1"
  | "FavoriteStore2"
  | "FavoriteStore3"
  | "FinalMode"
  | "Find"
  | "Finish"
  | "Fn"
  | "FnLock"
  | "GoBack"
  | "GoHome"
  | "GroupFirst"
  | "GroupLast"
  | "GroupNext"
  | "GroupPrevious"
  | "Guide"
  | "GuideNextDay"
  | "GuidePreviousDay"
  | "HangulMode"
  | "HanjaMode"
  | "Hankaku"
  | "HeadsetHook"
  | "Help"
  | "Hibernate"
  | "Hiragana"
  | "HiraganaKatakana"
  | "Home"
  | "Hyper"
  | "Info"
  | "Insert"
  | "InstantReplay"
  | "JunjaMode"
  | "KanaMode"
  | "KanjiMode"
  | "Katakana"
  | "Key11"
  | "Key12"
  | "LastNumberRedial"
  | "LaunchApplication1"
  | "LaunchApplication10"
  | "LaunchApplication11"
  | "LaunchApplication12"
  | "LaunchApplication13"
  | "LaunchApplication14"
  | "LaunchApplication15"
  | "LaunchApplication16"
  | "LaunchApplication2"
  | "LaunchApplication3"
  | "LaunchApplication4"
  | "LaunchApplication5"
  | "LaunchApplication6"
  | "LaunchApplication7"
  | "LaunchApplication8"
  | "LaunchApplication9"
  | "LaunchCalculator"
  | "LaunchCalendar"
  | "LaunchContacts"
  | "LaunchMail"
  | "LaunchMediaPlayer"
  | "LaunchMusicPlayer"
  | "LaunchMyComputer"
  | "LaunchPhone"
  | "LaunchScreenSaver"
  | "LaunchSpreadsheet"
  | "LaunchWebBrowser"
  | "LaunchWebCam"
  | "LaunchWordProcessor"
  | "Link"
  | "ListProgram"
  | "LiveContent"
  | "Lock"
  | "LogOff"
  | "MannerMode"
  | "MediaApps"
  | "MediaAudioTrack"
  | "MediaFastForward"
  | "MediaLast"
  | "MediaPause"
  | "MediaPlay"
  | "MediaPlayPause"
  | "MediaRecord"
  | "MediaRewind"
  | "MediaSkipBackward"
  | "MediaSkipForward"
  | "MediaStepBackward"
  | "MediaStepForward"
  | "MediaStop"
  | "MediaTopMenu"
  | "MediaTrackNext"
  | "MediaTrackPrevious"
  | "Meta"
  | "MicrophoneToggle"
  | "MicrophoneVolumeDown"
  | "MicrophoneVolumeMute"
  | "MicrophoneVolumeUp"
  | "ModeChange"
  | "Multiply"
  | "NavigateIn"
  | "NavigateNext"
  | "NavigateOut"
  | "NavigatePrevious"
  | "NextCandidate"
  | "NextFavoriteChannel"
  | "NextUserProfile"
  | "NonConvert"
  | "Notification"
  | "NumLock"
  | "OnDemand"
  | "PageDown"
  | "PageUp"
  | "Pairing"
  | "Paste"
  | "Pause"
  | "PinPDown"
  | "PinPMove"
  | "PinPToggle"
  | "PinPUp"
  | "Play"
  | "PlaySpeedDown"
  | "PlaySpeedReset"
  | "PlaySpeedUp"
  | "Power"
  | "PowerOff"
  | "PreviousCandidate"
  | "PrintScreen"
  | "Process"
  | "Props"
  | "RandomToggle"
  | "RcLowBattery"
  | "RecordSpeedNext"
  | "Redo"
  | "RfBypass"
  | "Romaji"
  | "STBInput"
  | "STBPower"
  | "ScanChannelsToggle"
  | "ScreenModeNext"
  | "ScrollLock"
  | "Select"
  | "Separator"
  | "Settings"
  | "Shift"
  | "SingleCandidate"
  | "Soft1"
  | "Soft2"
  | "Soft3"
  | "Soft4"
  | "SpeechCorrectionList"
  | "SpeechInputToggle"
  | "SplitScreenToggle"
  | "Standby"
  | "Subtitle"
  | "Subtract"
  | "Super"
  | "Symbol"
  | "SymbolLock"
  | "TV"
  | "TV3DMode"
  | "TVAntennaCable"
  | "TVAudioDescription"
  | "TVAudioDescriptionMixDown"
  | "TVAudioDescriptionMixUp"
  | "TVContentsMenu"
  | "TVDataService"
  | "TVInput"
  | "TVInputComponent1"
  | "TVInputComponent2"
  | "TVInputComposite1"
  | "TVInputComposite2"
  | "TVInputHDMI1"
  | "TVInputHDMI2"
  | "TVInputHDMI3"
  | "TVInputHDMI4"
  | "TVInputVGA1"
  | "TVMediaContext"
  | "TVNetwork"
  | "TVNumberEntry"
  | "TVPower"
  | "TVRadioService"
  | "TVSatellite"
  | "TVSatelliteBS"
  | "TVSatelliteCS"
  | "TVSatelliteToggle"
  | "TVTerrestrialAnalog"
  | "TVTerrestrialDigital"
  | "TVTimer"
  | "Tab"
  | "Teletext"
  | "Undo"
  | "Unidentified"
  | "VideoModeNext"
  | "VoiceDial"
  | "WakeUp"
  | "Wink"
  | "Zenkaku"
  | "ZenkakuHanaku"
  | "ZoomIn"
  | "ZoomOut"
  | "ZoomToggle"
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z"
  | (string & {})
