import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends("../.eslintrc.js"),
  {
    ignores: ["dist", "node_modules"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-console": [
        1,
        {
          allow: ["warn", "error"],
        },
      ],
    },
    files: ["src/**/*.ts"],
  },
  {
    files: ["src/tests/**/*.ts", "src/**/*.test.ts"],
    rules: {
      "no-console": 0,
    },
  },
];
