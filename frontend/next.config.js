const path = require("path");
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Só NEXT_PUBLIC_* é exposto ao browser. Server vars (GOOGLE_*, NEXTAUTH_*, API_URL)
  // vêm de .env / docker e ficam apenas em process.env no Node (API routes, etc.)
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1",
    NEXT_PUBLIC_SOCKET_URL:
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "developers.google.com",
      },
    ],
  },
  reactStrictMode: false,
  transpilePackages: ["shared"],

  // Todo .scss compilado como entrada (módulos e globals) recebe automaticamente
  // os tokens/mixins do design-system via `variables`. Partials (`_*.scss`)
  // importados por @use não passam pelo prepend e devem declarar o próprio
  // `@use "design-system" as *;`.
  sassOptions: {
    implementation: "sass",
    includePaths: [path.join(__dirname, "src/styles")],
    prependData: `@use "variables" as *;`,
  },
  // Next 16 uses Turbopack by default; empty config acknowledges custom sassOptions only.
  turbopack: {},
};

module.exports = nextConfig;
