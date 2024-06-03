/**
 * 文字列にシリアライズすることが可能なプリミティブ型。
 */
export type SerializablePrimitive =
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined;

/**
 * 文字列にシリアライズすることが可能なプリミティブになれる型。
 */
// TODO(tai-kun): toJSON が必要か要検討。
export type SerializablePrimitiveObject =
  | { readonly toValue: () => SerializablePrimitive }
  | { readonly toString: () => string };

/**
 * 文字列にシリアライズすることが可能な配列。
 */
export type SerializableArray = readonly SerializableValue[];

/**
 * 文字列にシリアライズすることが可能なオブジェクト。
 */
export type SerializableObject = { readonly [_ in string]?: SerializableValue };

/**
 * 文字列にシリアライズすることが可能な値の型。
 */
export type SerializableValue =
  | SerializablePrimitive
  | SerializablePrimitiveObject
  | SerializableArray
  | SerializableObject;

interface Ctx {
  r: number;
  n: number;
  b: number;
  k: string;
  h1: number;
}

const STR_ESCAPE = /[\u0000-\u001f\u0022\u005c\ud800-\udfff]/;

function inner(c: Ctx, value: SerializableValue): void {
  // L93-L127
  if (typeof value === "string") {
    let str: string,
      nBytes = value.length;

    // テンプレート文字列の 1 ピースが 42 文字未満の場合が多そうなので、残しておく。
    if (nBytes < 42) {
      let i = 0,
        last = -1,
        point: number,
        result = "";

      for (; i < nBytes; i++) {
        point = value.charCodeAt(i);

        if (
          point === 0x22 // '"'
          || point === 0x5c // '\'
        ) {
          last === -1 && (last = 0);
          result += value.slice(last, i) + "\\";
          last = i;
        } else if (point < 32 || (point >= 0xD800 && point <= 0xDFFF)) {
          return update(c, JSON.stringify(value));
        }
      }

      str = (last === -1 && ("\"" + value + "\""))
        || ("\"" + result + value.slice(last) + "\"");
    } else if (nBytes < 5_000 && STR_ESCAPE.test(value) === false) {
      str = "\"" + value + "\"";
    } else {
      str = JSON.stringify(value);
    }

    // 文字列はハッシュ値を計算するための終点なので、ここで更新する。
    update(c, str);
  } else if (typeof value === "number") {
    //  L43-L53
    // JSON ではないので NaN を許容し、Infinity と -Infinity を null と区別する。

    let str: string;

    if (value !== value) {
      str = "NaN";
    } else if (value === Infinity) {
      str = "Inf";
    } else if (value === -Infinity) {
      str = "-Inf";
    } else {
      str = "" + value;
    }

    update(c, str);
  } else if (typeof value === "bigint") {
    // bigint は JSON には無いが、ここでは対応する。
    update(c, "" + value);
  } else if (typeof value === "boolean") {
    update(c, value && "true" || "false");
  } else if (value === null) {
    // null と undefined を区別する。
    update(c, "null");
  } else if (value === undefined) {
    update(c, "undefined");
  } else if (Array.isArray(value)) {
    update(c, "[");

    let i = 0,
      nItems = value.length;

    for (; i < nItems; i++) {
      inner(c, value[i]);
      update(c, ",");
    }

    update(c, "]");
  } else if (Object.hasOwn(value, "toValue")) {
    // @ts-expect-error
    inner(c, value.toValue());
  } else if (Object.hasOwn(value, "toString")) {
    inner(c, value.toString());
  } else {
    update(c, "{");

    let i = 0,
      key: string,
      keys = Object.keys(value),
      nKeys = keys.length;

    for (; i < nKeys; i++) {
      update(c, (key = keys[i]!) + ":");
      inner(c, (value as SerializableObject)[key]);
      update(c, ",");
    }

    update(c, "}");
  }
}

// dprint-ignore
function update(c: Ctx, key: string): void {
  let i = 0,
    k1: number,
    h1b: number,
    remainderKey = "";

  switch (c.r) {
    case 3:
      remainderKey = c.k[c.b]! + c.k[c.b + 1] + c.k[c.b + 2];
      break;

    case 2:
      remainderKey = c.k[c.b]! + c.k[c.b + 1];
      break;

    case 1:
      remainderKey = c.k[c.b]!;
  }

  // c.r, c.n, c.b, c.k を更新する。
  c.b = (c.k = remainderKey + key).length - (
    c.r = c.k.length & 3 // c.k.length % 4
  );
  c.n += key.length;

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

/**
 * murmurhash-js と fast-json-stringify を組み合わせたオブジェクトのハッシュ化関数。
 *
 * @param value - ハッシュ化する値
 * @returns ハッシュ値
 * @see [murmurhash-js](https://github.com/mikolalysenko/murmurhash-js)
 * @see [fast-json-stringify](https://github.com/fastify/fast-json-stringify/tree/v5.16.0)
 */
// dprint-ignore
export function vhash(value: SerializableValue): string {
  if (value === "") {
    // h1 の初期値が 0 なので、空文字列の場合は "0" を返す。
    return "0";
  }

  const c: Ctx = {
    r: 0,
    n: 0,
    b: 0,
    k: "",
    h1: 0, // シード値
  };

  inner(c, value);

  let k1 = 0;

  switch (c.r) {
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

  return (c.h1 >>> 0).toString(36);
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest;

  describe("@suru-ui/styled/vhash", () => {
    describe("文字列のハッシュ化", () => {
      test("空の文字列", () => {
        assert.equal(vhash(""), "0");
      });

      test("エスケープが不要な文字列", () => {
        assert.match(vhash("abc"), /^[0-9a-z]+$/);
      });

      test("エスケープが必要な文字列", () => {
        assert.match(vhash("a\"b\\c"), /^[0-9a-z]+$/);
      });

      test("JSON に変換する", () => {
        assert.match(vhash("a\nb"), /^[0-9a-z]+$/);
      });
    });

    describe("数値のハッシュ化", () => {
      test("NaN", () => {
        assert.match(vhash(NaN), /^[0-9a-z]+$/);
      });

      test("Infinity", () => {
        assert.match(vhash(Infinity), /^[0-9a-z]+$/);
      });

      test("-Infinity", () => {
        assert.match(vhash(-Infinity), /^[0-9a-z]+$/);
      });

      test("数値", () => {
        assert.match(vhash(123), /^[0-9a-z]+$/);
      });
    });

    describe("真偽値のハッシュ化", () => {
      test("true", () => {
        assert.match(vhash(true), /^[0-9a-z]+$/);
      });

      test("false", () => {
        assert.match(vhash(false), /^[0-9a-z]+$/);
      });
    });

    describe("null のハッシュ化", () => {
      test("null", () => {
        assert.match(vhash(null), /^[0-9a-z]+$/);
      });
    });

    describe("undefined のハッシュ化", () => {
      test("undefined", () => {
        assert.match(vhash(undefined), /^[0-9a-z]+$/);
      });
    });

    describe("配列のハッシュ化", () => {
      test("空の配列", () => {
        assert.match(vhash([]), /^[0-9a-z]+$/);
      });

      test("配列", () => {
        assert.match(vhash([1, "a", true, null, undefined]), /^[0-9a-z]+$/);
      });
    });

    describe("オブジェクトのハッシュ化", () => {
      test("空のオブジェクト", () => {
        assert.match(vhash({}), /^[0-9a-z]+$/);
      });

      test("オブジェクト", () => {
        assert.match(
          vhash({ a: 1, b: "a", c: true, d: null, e: undefined }),
          /^[0-9a-z]+$/,
        );
      });
    });

    describe("プリミティブになれるオブジェクトのハッシュ化", () => {
      test("toValue メソッドを持つオブジェクト", () => {
        const obj = {
          value: 123,
          toValue() {
            return this.value;
          },
        };

        assert.match(vhash(obj), /^[0-9a-z]+$/);
        assert.equal(vhash(obj), vhash(123));
      });

      test("toString メソッドを持つオブジェクト", () => {
        const obj = {
          value: "a",
          toString() {
            return this.value;
          },
        };

        assert.match(vhash(obj), /^[0-9a-z]+$/);
        assert.equal(vhash(obj), vhash("a"));
      });
    });

    test("ハッシュが衝突しない", () => {
      const hashList = [
        vhash(""),
        vhash("abc"),
        vhash("a\"b\\c"),
        vhash("a\nb"),

        vhash(NaN),
        vhash(Infinity),
        vhash(-Infinity),
        vhash(true),
        vhash(false),
        vhash(null),
        vhash(undefined),

        vhash("NaN"),
        vhash("Infinity"),
        vhash("-Infinity"),
        vhash("true"),
        vhash("false"),
        vhash("null"),
        vhash("undefined"),

        vhash([]),
        vhash([1, "a", true, null, undefined]),
        vhash({}),
        vhash({ a: 1, b: "a", c: true, d: null, e: undefined }),
      ];

      assert.deepEqual([...new Set(hashList)], hashList);
    });
  });
}
