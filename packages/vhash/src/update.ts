import type { Context } from "./createContext";

/**
 * ハッシュのコンテキストを更新する。
 *
 * @param c - ハッシュのコンテキスト。
 * @param data - ハッシュ値を計算するデータ (ASCII 文字列)。
 */
// dprint-ignore
export default function update(c: Context, data: string): void {
  if (__DEV__) {
    if (data.length !== [...data].length) {
      console.error("SUI(vhash): ASCII 文字列ではないデータが渡されました: ", data);
    }
  }

  let i = 0,
    k1: number,
    h1b: number,
    mod = "";

  // 前回の update で余ったデータを取得する。
  switch (c.m) {
    case 3:
      mod = c.k[c.b]! + c.k[c.b + 1] + c.k[c.b + 2];
      break;

    case 2:
      mod = c.k[c.b]! + c.k[c.b + 1];
      break;

    case 1:
      mod = c.k[c.b]!;
  }

  // コンテキストの r, n, b, k を更新する。
  c.b = (c.k = mod + data).length - (c.m = c.k.length & 3);
  c.n += data.length;

  while (i < c.b) {
    k1 = (c.k.charCodeAt(i) & 0xff)
      | ((c.k.charCodeAt(++i) & 0xff) << 8)
      | ((c.k.charCodeAt(++i) & 0xff) << 16)
      | ((c.k.charCodeAt(++i) & 0xff) << 24);
    ++i;

    k1 = (((k1 & 0xffff) * 0xcc9e2d51) + ((((k1 >>> 16) * 0xcc9e2d51) & 0xffff) << 16)) & 0xffffffff;
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = (((k1 & 0xffff) * 0x1b873593) + ((((k1 >>> 16) * 0x1b873593) & 0xffff) << 16)) & 0xffffffff;

    c.h1 ^= k1;

    c.h1 = (c.h1 << 13) | (c.h1 >>> 19);
    h1b = (((c.h1 & 0xffff) * 5) + ((((c.h1 >>> 16) * 5) & 0xffff) << 16)) & 0xffffffff;
    c.h1 = ((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16);
  }
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { describe, test } = cfgTest;

  describe("@suru-ui/vhash/update", () => {
    test.todo("テスト");
  });
}
