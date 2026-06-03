/** @type {import('lint-staged').Configuration} */
module.exports = {
  "*.{ts,tsx,js,jsx,json,md,yml,yaml}": "prettier --write",

  "backend/src/**/*.ts": (files) =>
    `eslint --config backend/eslint.config.mjs --fix ${files.join(" ")}`,

  "frontend/src/**/*.{ts,tsx}": (files) =>
    `eslint --config frontend/eslint.config.mjs --fix ${files.join(" ")}`,

  "shared/**/*.ts": () => "npm run ts-check -w shared",
};
