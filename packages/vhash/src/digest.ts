import type { Context } from "./createContext";

/**
 * ハッシュ値を計算するために渡されたすべてのデータのダイジェストを計算する。
 *
 * @param c - ハッシュのコンテキスト。
 * @returns ダイジェスト。
 */
// dprint-ignore
export default function digest(c: Context): number {
  if (__DEV__) {
    const data = c.k.slice(c.b);

    if (data.length !== [...data].length) {
      console.error("SUI(vhash): ASCII 文字列ではないデータが渡されました: ", data);
    }
  }

  let k1 = 0;

  switch (c.m) {
    case 3:
      k1 ^= (c.k.charCodeAt(c.b + 2) & 0xff) << 16;
      break;

    case 2:
      k1 ^= (c.k.charCodeAt(c.b + 1) & 0xff) << 8;
      break;

    case 1:
      k1 ^= c.k.charCodeAt(c.b) & 0xff;
  }

  k1 = (((k1 & 0xffff) * 0xcc9e2d51) + ((((k1 >>> 16) * 0xcc9e2d51) & 0xffff) << 16)) & 0xffffffff;
  k1 = (k1 << 15) | (k1 >>> 17);
  k1 = (((k1 & 0xffff) * 0x1b873593) + ((((k1 >>> 16) * 0x1b873593) & 0xffff) << 16)) & 0xffffffff;

  c.h1 ^= k1;

  c.h1 ^= c.n;

  c.h1 ^= c.h1 >>> 16;
  c.h1 = (((c.h1 & 0xffff) * 0x85ebca6b) + ((((c.h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
  c.h1 ^= c.h1 >>> 13;
  c.h1 = (((c.h1 & 0xffff) * 0xc2b2ae35) + ((((c.h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16)) & 0xffffffff;
  c.h1 ^= c.h1 >>> 16;

  return c.h1 >>> 0
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { describe, test } = cfgTest;

  describe("@suru-ui/vhash/digest", () => {
    test.todo("テスト");
  });
}
