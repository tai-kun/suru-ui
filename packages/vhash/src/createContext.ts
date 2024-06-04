/**
 * ハッシュ値の計算に必要なコンテキストの型。
 */
export interface Context {
  /**
   * 最後の更新時に余ったデータのバイト数。
   */
  m: number;
  /**
   * 全データのバイト数。
   */
  n: number;
  /**
   * 最後の更新時に使ったデータのバイト数。
   */
  b: number;
  /**
   * 最後の更新時における全データ。
   */
  k: string;
  h1: number;
}

/**
 * ハッシュ値の計算に必要なコンテキストを作成する。
 *
 * @param seed - ハッシュのシード値。
 * @returns ハッシュ値の計算に必要なコンテキスト。
 */
export default function createContext(seed: number | undefined = 0): Context {
  return {
    m: 0,
    n: 0,
    b: 0,
    k: "",
    h1: seed,
  };
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { describe, test } = cfgTest;

  describe("@suru-ui/vhash/createContext", () => {
    test.todo("テスト");
  });
}
