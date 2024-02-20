import type { Output } from "valibot"
import visitJson, { type JsonObject, PASS } from "visit-json"
import compilePatchOperation from "./compilePatchOperation"
import getByPointer from "./getByPointer"
import operate, { type OperateOptions } from "./operate"
import type { Variables } from "./replaceVariable"
import type { PatchOperationSchema } from "./schemas"
import toPatchPath from "./toPatchPath"
import toPointer from "./toPointer"

/**
 * JSON Patch の操作を適用するオプション。
 */
export interface ApplyPatchOptions extends OperateOptions {}

/**
 * JSON Patch の操作を適用する。
 *
 * @param target 操作対象の　JSON オブジェクト。
 * @param operations 適用する操作。
 * @param options オプション。
 * @returns 変更後の JSON オブジェクト。
 */
export default function applyPatch(
  target: JsonObject,
  operations: readonly Output<typeof PatchOperationSchema>[],
  options?: ApplyPatchOptions | undefined,
): JsonObject {
  for (const operation of operations) {
    const vars: Variables = {
      getValue(name) {
        const pointer = toPointer(name)
        const value = getByPointer(target, pointer)

        if (
          value == null
          || typeof value === "string"
          || typeof value === "number"
          || typeof value === "boolean"
        ) {
          return value
        }

        // throw new TypeError(
        //   `変数 ${name} が JSON プリミティブではない値を参照しています。`,
        // )
        return undefined
      },
      getNames(emit) {
        visitJson(target, {
          Primitive(_, path) {
            emit(toPatchPath(path))

            return PASS
          },
        })
      },
    }

    for (const op of compilePatchOperation(operation, vars)) {
      target = operate(target, op, options)
    }
  }

  return target
}

if (cfgTest && cfgTest.url === import.meta.url) {
  const { PatchOperationMode } = await import("./schemas")
  const { assert, describe, test } = cfgTest

  describe("src/theme/build/applyPatch", () => {
    test("機能する", () => {
      const target = {
        a: 1,
        b: 2,
        c: 3,
      }
      const actual = applyPatch(target, [
        { mode: PatchOperationMode.Add, path: "/d", value: 4 },
        { mode: PatchOperationMode.Remove, path: "/b" },
        { mode: PatchOperationMode.Replace, path: "/c", value: 5 },
      ])

      assert.deepEqual(actual, {
        a: 1,
        c: 5,
        d: 4,
      })
    })
  })
}
