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

if (cfgTest && cfgTest.url === import.meta.url) {
  const { describe, test } = cfgTest;

  describe("@suru-ui/vhash/types", () => {
    test.todo("テスト");
  });
}
