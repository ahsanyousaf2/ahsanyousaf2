/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  transpilePackages: ["@imgly/background-removal", "onnxruntime-web"],
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };

    config.module.rules.push({
      test: /\.mjs$/,
      include: [/onnxruntime-web/],
      type: "javascript/auto",
    });

    return config;
  },
};

module.exports = nextConfig;
