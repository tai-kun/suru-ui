// @ts-check
"use strict";

import fs from "node:fs";
import path from "node:path";

const CSS_CUSTOM_PROPERTIES_REGEX = /--sui-([0-9A-Za-z-]+)/g;
const CSS_CUSTOM_PROPERTY_PREFIX = "--sui";
const outFile = "src/css.ts";
const srcDir = "src";

const cssCustomProperties = {};

for (
  const cssFile of [
    "src/appearance/dark.css",
    "src/appearance/light.css",
    "src/layout/desktop.css",
    "src/layout/mobile.css",
  ]
) {
  const cssContent = fs.readFileSync(path.join(srcDir, cssFile), "utf-8");

  for (const [, match] of cssContent.matchAll(CSS_CUSTOM_PROPERTIES_REGEX)) {
    let properties = cssCustomProperties;
    const keys = match.split("-");

    for (let i = 0, len = keys.length; i < len; i++) {
      if (i !== len - 1) {
        properties = properties[keys[i]] ||= {};
      } else {
        properties[keys[i]] = 1;
      }
    }
  }
}

const typeDefinition = `export type CssCustomProperties = {
${
  (function loop(properties, indent, stack) {
    let str = "";

    for (const key in properties) {
      const property = /^[0-9]/.test(key) && !/^[0-9]+$/.test(key)
        ? JSON.stringify(key)
        : key;

      if (typeof properties[key] === "object") {
        str += `${indent}readonly ${property}: {\n`;
        str += loop(properties[key], indent + "  ", [...stack, key]);
        str += `${indent}};\n`;
      } else {
        const name = [...stack, key].join("-");
        const keys = `[${
          [...stack.slice(1), key]
            .map(part => JSON.stringify(part))
            .join(", ")
        }]`;
        str += `${indent}readonly ${property}: {\n`;
        str += `${indent}  readonly $name: "${name}";\n`;
        str += `${indent}  readonly $keys: ${keys};\n`;
        str += `${indent}  readonly toString: () => "var(${name})";\n`;
        str += `${indent}};\n`;
      }
    }

    return str;
  })(cssCustomProperties, "  ", [CSS_CUSTOM_PROPERTY_PREFIX])
}};
`;

fs.writeFileSync(outFile, typeDefinition);
