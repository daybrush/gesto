const builder = require("@daybrush/builder");

module.exports = builder([
  {
    name: "Gesto",
    input: "src/index.umd.ts",
    output: "./dist/gesto.js",
    exports: "default",
    resolve: true,
  },
  {
    name: "Gesto",
    input: "src/index.umd.ts",
    output: "./dist/gesto.min.js",
    resolve: true,
    uglify: true,
    exports: "default",
  },
  {
    name: "Gesto",
    input: "src/index.ts",
    output: "./dist/gesto.esm.js",
    format: "es",
    exports: "named",
  },
  {
    name: "Gesto",
    input: "src/index.umd.ts",
    output: "./dist/gesto.cjs.js",
    format: "cjs",
    exports: "default",
  },
]);
