module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "prettier",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  rules: {
    "no-undef": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-expressions": [
      "error",
      { allowShortCircuit: true },
    ],
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        args: "all",
        argsIgnorePattern: "^_",
        caughtErrors: "all",
        caughtErrorsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        ignoreRestSiblings: true,
      },
    ],
    "@typescript-eslint/no-require-imports": "warn",
  },
  ignorePatterns: ["node_modules/", "dist/", "build/"],
  plugins: ["prettier", "@typescript-eslint"],
};
