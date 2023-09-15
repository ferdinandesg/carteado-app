/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GOOGLE_ID:
      "941760915080-or42cc6djhae2kqs91kv24cj8ajchlmf.apps.googleusercontent.com",
    GOOGLE_SECRET: "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",
    SECRET: "JWT",
    API_URL: "http://192.168.15.200:3001",
  },
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
