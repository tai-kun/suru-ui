import {
  any,
  type AnySchema,
  array,
  boolean,
  custom,
  enum_,
  literal,
  nullish,
  number,
  object,
  optional,
  type Output,
  record,
  string,
  union,
} from "valibot"
import type { JsonValue } from "visit-json"
import isJsonValue from "./isJsonValue"

export enum PatchOperationMode {
  Add = "add",
  Merge = "merge",
  Replace = "replace",
  Copy = "copy",
  Move = "move",
  Remove = "remove",
}

export const PatchOperationModeSchema = enum_(PatchOperationMode)

export const PointerLikeSchema = array(union([string(), number()]))

export const PatchPathLikeSchema = union([string(), PointerLikeSchema])

export const PatchOperationValueSchema: AnySchema<JsonValue> = any([
  custom(value => isJsonValue(value)),
])

export const PatchOperationAddSchema = object({
  mode: literal(PatchOperationMode.Add),
  path: PatchPathLikeSchema,
  value: PatchOperationValueSchema,
  strict: optional(nullish(boolean())),
})

export const PatchOperationMergeSchema = object({
  mode: literal(PatchOperationMode.Merge),
  path: PatchPathLikeSchema,
  value: PatchOperationValueSchema,
  strict: optional(nullish(boolean())),
})

export const PatchOperationReplaceSchema = object({
  mode: literal(PatchOperationMode.Replace),
  path: PatchPathLikeSchema,
  value: PatchOperationValueSchema,
  strict: optional(nullish(boolean())),
})

export const PatchOperationCopySchema = object({
  mode: literal(PatchOperationMode.Copy),
  path: PatchPathLikeSchema,
  from: PatchPathLikeSchema,
  strict: optional(nullish(boolean())),
})

export const PatchOperationMoveSchema = object({
  mode: literal(PatchOperationMode.Move),
  path: PatchPathLikeSchema,
  from: PatchPathLikeSchema,
  strict: optional(nullish(boolean())),
})

export const PatchOperationRemoveSchema = object({
  mode: literal(PatchOperationMode.Remove),
  path: PatchPathLikeSchema,
  strict: optional(nullish(boolean())),
})

export const PatchOperationSchema = union([
  PatchOperationAddSchema,
  PatchOperationMergeSchema,
  PatchOperationReplaceSchema,
  PatchOperationCopySchema,
  PatchOperationMoveSchema,
  PatchOperationRemoveSchema,
])

export const PatchMatrixSchema = record(union([string(), number()]))

export const PatchSchema = object({
  strict: optional(nullish(boolean())),
  matrix: optional(nullish(PatchMatrixSchema)),
  operations: array(PatchOperationSchema),
})

export const ImportWithOptions = object({
  from: string(),
  build: optional(nullish(boolean())),
})

export const ImportsSchema = record(union([string(), ImportWithOptions]))

export const PatchesSchema = array(PatchSchema)

export const ExportsSchema = object({
  include: array(string()),
  exclude: array(string()),
})

export const BuildSchema = object({
  imports: optional(nullish(ImportsSchema)),
  patches: optional(nullish(PatchesSchema)),
  exports: optional(nullish(ExportsSchema)),
})

if (cfgTest && cfgTest.url === import.meta.url) {
  const { expectType } = await import("tsd")
  const { describe, test } = cfgTest

  describe("src/theme/build/schemas", () => {
    test("PatchOperationSchema は PatchOperationMode のすべての値を実装している", () => {
      expectType<Output<typeof PatchOperationSchema>["mode"]>(
        {} as typeof PatchOperationMode[keyof typeof PatchOperationMode],
      )
    })
  })
}
