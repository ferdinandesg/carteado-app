const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GOOGLE_ID:
      "941760915080-or42cc6djhae2kqs91kv24cj8ajchlmf.apps.googleusercontent.com",
    GOOGLE_SECRET: "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",
    SECRET: "JWT",
    API_URL: process.env.API_URL || "http://172.29.64.1:4000",
  },
  images: {
    domains: ["lh3.googleusercontent.com", "developers.google.com"],
  },
  reactStrictMode: false,
  sassOptions: {
    implementation: "sass-embedded",
    includePaths: [path.join(__dirname, "styles")],
    prependData: `@use 'variables' as *;`,
  },
};

module.exports = nextConfig;
