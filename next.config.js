/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Add support for WebSocket in webpack
    config.externals = [...(config.externals || [])];
    if (isServer) {
      config.externals.push({
        'bufferutil': 'bufferutil',
        'utf-8-validate': 'utf-8-validate',
      });
    }
    return config;
  },
}

module.exports = nextConfig
