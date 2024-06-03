// @ts-check

import { build } from "@suru-ui/build";

await Promise.all([
  build(),
  build({ jsx: true }),
]);
