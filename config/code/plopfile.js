// @ts-check

import path from "node:path"

/**
 * @param {import("plop").NodePlopAPI} plop
 */
export default plop => {
  // Helpers

  plop.setHelper("basename", arg => path.basename(arg))
  plop.setHelper("dirname", arg =>
    path.normalize(path.dirname(arg))
      .replace(new RegExp(`${path.sep}{2,}`, "g"), "/")
      .replace(new RegExp(`${path.sep}*$`, "g"), ""))
  plop.setHelper("kebab", arg =>
    arg
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .toLowerCase())

  /**
   * @param {string} name
   * @param {`/${string}`} group
   * @param {`/${string}`} dirpath
   */
  const setComponentGenerator = (name, group, dirpath = group) => {
    plop.setGenerator(name, {
      description: "Add a component",
      prompts: [
        {
          type: "input",
          name: "name",
          message: "Component name",
        },
      ],
      actions: [
        {
          type: "add",
          path: `../../src${dirpath}{{name}}/{{name}}.tsx`,
          templateFile: "./templates/component/$name.tsx.hbs",
          transform: template =>
            template
              .replaceAll("__group__", group)
              .replaceAll("__dirname__", dirpath),
        },
        {
          type: "add",
          path: `../../src${dirpath}{{name}}/{{name}}.css`,
          templateFile: "./templates/component/$name.css.hbs",
        },
        {
          type: "add",
          path: `../../src${dirpath}{{name}}/__tests__/{{name}}.spec.tsx`,
          templateFile: "./templates/component/__tests__/$name.spec.tsx.hbs",
        },
        {
          type: "add",
          path: `../../src${dirpath}{{name}}/__tests__/{{name}}.tsx`,
          templateFile: "./templates/component/__tests__/$name.tsx.hbs",
        },
        {
          type: "add",
          path: `../../src${dirpath}{{name}}/{{name}}.stories.tsx`,
          templateFile: "./templates/component/$name.stories.tsx.hbs",
          transform: template =>
            template.replaceAll(
              "__group__",
              group.replace(/^\//, " ").trimEnd(),
            ),
        },
      ],
    })
  }

  // Generators

  setComponentGenerator("c", "/", "/core/")
  setComponentGenerator("b", "/base/")
  setComponentGenerator("l", "/lab/")

  plop.setGenerator("f", {
    description: "Add a function",
    prompts: [
      {
        type: "input",
        name: "outpath",
        message: "Output path",
      },
    ],
    actions: [
      {
        type: "add",
        path: "../../{{dirname outpath}}/{{basename outpath}}.ts",
        templateFile: "./templates/func/$name.ts.hbs",
      },
    ],
  })
}
