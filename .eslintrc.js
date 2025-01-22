module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: ["eslint:recommended", "prettier"],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
  },
  rules: {
    "prettier/prettier": "warn",
    "no-unused-vars": "off",
  },
  ignorePatterns: ["node_modules/", "dist/", "build/"],
  plugins: ["prettier", "@typescript-eslint"],
};
