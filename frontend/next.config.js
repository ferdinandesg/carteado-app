const path = require("path");
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GOOGLE_ID: process.env.GOOGLE_ID,
    GOOGLE_SECRET: process.env.GOOGLE_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "https://carteado.ferdinandes.com.br",
  },
  images: {
    domains: ["lh3.googleusercontent.com", "developers.google.com"],
  },
  reactStrictMode: false,
  transpilePackages: ['shared'],

  sassOptions: {
    implementation: "sass-embedded",
    includePaths: [path.join(__dirname, "styles")],
    prependData: `@use 'variables' as *;`,
  },
  // Removed manual react / react-dom aliasing: Next.js and Node ESM resolver
  // will correctly resolve workspace-hoisted React and its jsx-runtime.
  webpack: (config) => config
};

module.exports = nextConfig;
