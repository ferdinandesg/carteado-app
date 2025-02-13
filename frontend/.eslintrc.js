module.exports = {
  extends: [
    "../.eslintrc.js",
    "plugin:react/recommended",
    "next/core-web-vitals",
  ],
  rules: {
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "no-console": 1,
  },
  plugins: ["react"],
  settings: {
    react: {
      version: "detect",
    },
  },
};
