export * from "./build.js";

if (cfgTest && cfgTest.url === import.meta.url) {
  const { describe, test } = cfgTest;

  describe("src/index", () => {
    test.todo("no tests");
  });
}
