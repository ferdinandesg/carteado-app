module.exports = {
  './frontend/**/*.{js,jsx,ts,tsx}': [
    'cd ./frontend && eslint --fix',
    'cd ./frontend && npm test -- --bail --findRelatedTests'
  ],
  './backend/**/*.{js,jsx,ts,tsx}': [
    'cd ./backend && eslint --fix',
    'cd ./backend && npm test -- --bail --findRelatedTests'
  ]
};