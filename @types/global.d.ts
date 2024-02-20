/// <reference types="cfg-test/globals" />

declare const __DEV__: unknown

// @ts-ignore
declare module globalThis {
  // isArray の強化
  // @see https://qiita.com/suin/items/b7947ec67defa1c973c7
  interface ArrayConstructor {
    isArray(arg: readonly any[] | any): arg is readonly any[]
  }
}

declare var __sui_singleton: Record<string, any> | undefined

interface Window {
  __sui_singleton?: Record<string, any>
}

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: "development" | "production" | "test" | (string & {})
  }
}
