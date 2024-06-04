/**
 * 文字コードが大文字のアルファベットかどうかを判定する。
 *
 * @param codePoint - 文字コード。
 * @returns 文字コードが大文字のアルファベットなら true、そうでなければ false。
 */
function isAlphabet(codePoint: number): boolean {
  return codePoint >= 65 && codePoint <= 90; // A-Z
}

/**
 * ハンドラのプロパティ名かどうかを判定する。
 *
 * @param name - プロパティ名。
 * @returns ハンドラのプロパティ名なら true、そうでなければ false。
 */
export default function isHandlerPropName(name: string): boolean {
  return name.charCodeAt(0) === 111 // o
    && name.charCodeAt(1) === 110 // n
    && isAlphabet(name.charCodeAt(2));
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest;

  describe("@suru-ui/slot/isHandlerPropName", () => {
    describe("isAlphabet", () => {
      test("大文字のアルファベットの場合は true を返す", () => {
        const points = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"]
          .map(c => c.charCodeAt(0));

        for (const point of points) {
          assert(isAlphabet(point));
        }
      });

      test("大文字のアルファベットでない場合は false を返す", () => {
        const points = [
          ..."abcdefghijklmnopqrstuvwxyz0123456789!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~",
        ].map(c => c.charCodeAt(0));

        for (const point of points) {
          assert(!isAlphabet(point));
        }
      });
    });

    describe("isHandlerPropName", () => {
      test("ハンドラのプロパティ名の場合は true を返す", () => {
        assert(isHandlerPropName("onClick"));
      });

      test("ハンドラのプロパティ名でない場合は false を返す", () => {
        assert(!isHandlerPropName("style"));
      });
    });
  });
}
