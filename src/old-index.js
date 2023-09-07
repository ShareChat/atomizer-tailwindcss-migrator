import { transformFromAstSync } from "@babel/core";
import { parse as babelParse } from "@babel/parser";
import { parse as recastParse, print } from "recast";
import { join } from "path";
import { readFileSync, writeFileSync } from "fs";
import tailwindCodemod from "./codemod.js";
// import "./svelte/eslint.cjs";
import atomizer from "atomizer";

console.log(atomizer);

function transform(source, filename, codemod) {
  const ast = recastParse(source, {
    parser: {
      parse(sourceCode) {
        return babelParse(sourceCode, {
          filename,
          tokens: true,
          sourceType: "module",
          plugins: ["typescript", "classProperties", "jsx", "svelte"],
        });
      },
    },
  });

  transformFromAstSync(ast, source, {
    code: false,
    cloneInputAst: false,
    configFile: false,
    plugins: [codemod],
  });

  return print(ast).code;
}

function transformFile(filename) {
  const file = join(process.cwd(), filename);
  const input = readFileSync(file, "utf-8");
  const output = transform(input, filename, tailwindCodemod);
  writeFileSync(file, output);
}

const files = process.argv.slice(2);

files.forEach(transformFile);
