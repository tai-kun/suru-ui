// @ts-check

import path from "node:path";

/**
 * @param {import("plop").NodePlopAPI} plop
 */
export default plop => {
  // Helpers

  plop.setHelper("basename", arg => path.basename(arg));
  plop.setHelper("normalize", arg =>
    path.normalize(arg)
      .replace(new RegExp(`${path.sep}{2,}`, "g"), "/")
      .replace(new RegExp(`${path.sep}*$`, "g"), ""));

  // Generators

  plop.setGenerator("f", {
    description: "関数を追加する",
    prompts: [
      {
        type: "input",
        name: "outpath",
        message: "出力先のパス",
      },
    ],
    actions: [
      {
        type: "add",
        path: "../../src/{{normalize outpath}}.ts",
        templateFile: "./templates/function/$name.ts.hbs",
      },
    ],
  });
};
