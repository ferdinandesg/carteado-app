/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GOOGLE_ID:
      "941760915080-or42cc6djhae2kqs91kv24cj8ajchlmf.apps.googleusercontent.com",
    GOOGLE_SECRET: "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",
    SECRET: "JWT"
  },
  images: {
    domains: ['lh3.googleusercontent.com']
  }
};

module.exports = nextConfig;
