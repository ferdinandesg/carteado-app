module.exports = {
  "*.{ts,tsx,js,jsx,json,md,yml,yaml}": ["prettier --write"],
  "backend/src/**/*.ts": ["eslint --config backend/eslint.config.mjs --fix"],
  "frontend/src/**/*.{ts,tsx}": [
    "eslint --config frontend/eslint.config.mjs --fix",
  ],
  "shared/**/*.ts": ["npm run build --workspace=shared"],
};
