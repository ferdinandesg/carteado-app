/** @type {import('lint-staged').Configuration} */
module.exports = {
  "*.{json,md,yml,yaml}": "prettier --write",

  "backend/src/**/*.ts": [
    "prettier --write",
    "eslint --config backend/eslint.config.mjs --fix",
  ],

  "frontend/src/**/*.{ts,tsx}": [
    "prettier --write",
    "eslint --config frontend/eslint.config.mjs --fix",
  ],

  "shared/**/*.ts": [
    "prettier --write",
    () => "npm run ts-check -w shared",
  ],
};
