// @ts-check

/**
 * @param {import("plop").NodePlopAPI} plop
 */
export default plop => {
  plop.setGenerator("p", {
    description: "パッケージを追加する",
    prompts: [
      {
        type: "name",
        name: "name",
        message: "パッケージ名",
        validate: input =>
          (typeof input === "string" && /^[a-z0-9-][a-z0-9-._]*$/.test(input))
          || "パッケージ名が不正です",
      },
    ],
    actions: [
      {
        type: "add",
        path: "../../packages/{{name}}/package.json",
        templateFile: "./templates/package/package.json.hbs",
      },
      {
        type: "add",
        path: "../../packages/{{name}}/tsconfig.json",
        templateFile: "./templates/package/tsconfig.json.hbs",
      },
      {
        type: "add",
        path: "../../packages/{{name}}/.config/cfg-test.json",
        templateFile: "./templates/package/.config/cfg-test.json.hbs",
      },
      {
        type: "add",
        path: "../../packages/{{name}}/.config/build/esbuild.js",
        templateFile: "./templates/package/.config/build/esbuild.js.hbs",
      },
      {
        type: "add",
        path: "../../packages/{{name}}/.config/build/setup.js",
        templateFile: "./templates/package/.config/build/setup.js.hbs",
      },
      {
        type: "add",
        path: "../../packages/{{name}}/.config/build/tsconfig.build.json",
        templateFile:
          "./templates/package/.config/build/tsconfig.build.json.hbs",
      },
      {
        type: "add",
        path: "../../packages/{{name}}/.config/code/plopfile.js",
        templateFile: "./templates/package/.config/code/plopfile.js.hbs",
        transform: template =>
          template
            .replaceAll("__normalize_outpath__", "{{normalize outpath}}"),
      },
      {
        type: "add",
        path:
          "../../packages/{{name}}/.config/code/templates/function/$name.ts.hbs",
        templateFile:
          "./templates/package/.config/code/templates/function/$name.ts.hbs",
        transform: template =>
          template
            .replaceAll("__normalize_outpath__", "{{normalize outpath}}"),
      },
      {
        type: "add",
        path: "../../packages/{{name}}/scripts/build",
        templateFile: "./templates/package/scripts/build.hbs",
      },
      {
        type: "add",
        path: "../../packages/{{name}}/scripts/check",
        templateFile: "./templates/package/scripts/check.hbs",
      },
      {
        type: "add",
        path: "../../packages/{{name}}/scripts/commit-msg",
        templateFile: "./templates/package/scripts/commit-msg.hbs",
      },
      {
        type: "add",
        path: "../../packages/{{name}}/scripts/setup",
        templateFile: "./templates/package/scripts/setup.hbs",
      },
      {
        type: "add",
        path: "../../packages/{{name}}/scripts/test",
        templateFile: "./templates/package/scripts/test.hbs",
      },
      {
        type: "add",
        path: "../../packages/{{name}}/src/env.d.ts",
        templateFile: "./templates/package/src/env.d.ts.hbs",
      },
      {
        type: "add",
        path: "../../packages/{{name}}/.vscode/settings.json",
        templateFile: "../../.vscode/settings.json",
      },
    ],
  });
};
