import createContext, { type Context } from "./createContext";
import digest from "./digest";
import type { SerializableObject, SerializableValue } from "./types";
import update from "./update";

const STR_ESCAPE = /[\u0000-\u001f\u0022\u005c\ud800-\udfff]/;

function inner(c: Context, value: SerializableValue): void {
  switch (true) {
    // L93-L127
    case typeof value === "string": {
      const nBytes = value.length;

      switch (true) {
        case nBytes === 0:
          update(c, "\"\"");

          break;

        case nBytes < 42: {
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

          update(
            c,
            (last === -1 && ("\"" + value + "\""))
              || ("\"" + result + value.slice(last) + "\""),
          );

          break;
        }

        case nBytes < 5_000 && STR_ESCAPE.test(value) === false:
          update(c, "\"" + value + "\"");

          break;

        default:
          update(c, JSON.stringify(value));
      }

      break;
    }

    case typeof value === "number": {
      //  L43-L53
      // JSON ではないので NaN を許容し、Infinity と -Infinity を null と区別する。

      switch (true) {
        case value !== value:
          update(c, "NaN");

          break;

        case value === Infinity:
          update(c, "Inf");

          break;

        case value === -Infinity:
          update(c, "-Inf");

          break;

        default:
          update(c, "" + value);
      }

      break;
    }

    case typeof value === "bigint": {
      // bigint は JSON には無いが、ここでは対応する。
      update(c, "" + value);

      break;
    }

    case typeof value === "boolean": {
      update(c, value && "true" || "false");

      break;
    }

    case value === null: {
      // null と undefined を区別する。
      update(c, "null");

      break;
    }

    case value === undefined: {
      // null と undefined を区別する。
      update(c, "undefined");

      break;
    }

    case Array.isArray(value): {
      update(c, "[");

      for (let i = 0, nItems = value.length; i < nItems; i++) {
        inner(c, value[i]);
        update(c, ",");
      }

      update(c, "]");

      break;
    }

    case Object.hasOwn(value as any, "toValue"): {
      // @ts-expect-error
      inner(c, value.toValue());

      break;
    }

    case Object.hasOwn(value as any, "toString"): {
      inner(c, value.toString());

      break;
    }

    default: {
      update(c, "{");

      for (
        let i = 0,
          key: string,
          keys = Object.keys(value),
          nKeys = keys.length;
        i < nKeys;
        i++
      ) {
        update(c, (key = keys[i]!) + ":");
        inner(c, (value as SerializableObject)[key]);
        update(c, ",");
      }

      update(c, "}");
    }
  }
}

/**
 * murmurhash-js と fast-json-stringify を組み合わせたオブジェクトのハッシュ化関数。
 *
 * @param value - ハッシュ化する値
 * @returns 36 進数表記のハッシュ値。
 * @see [murmurhash-js](https://github.com/mikolalysenko/murmurhash-js)
 * @see [fast-json-stringify](https://github.com/fastify/fast-json-stringify/tree/v5.16.0)
 */
export default function vhash(value: SerializableValue): string {
  if (value === "") {
    // コンテキストの h1 の初期値が 0 なので、空文字列の場合は "0" を返す。
    return "0";
  }

  const context = createContext();
  inner(context, value);

  return digest(context).toString(36);
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { assert, describe, test } = cfgTest;

  describe("@suru-ui/vhash/vhash", () => {
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
