/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  serverRuntimeConfig: {
    // Max request body size for API routes (matches our 20MB frontend limit)
  },
};

module.exports = nextConfig;
