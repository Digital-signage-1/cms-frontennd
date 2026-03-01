import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  transpilePackages: ['@signage/renderer', '@signage/api-client', '@signage/types', 'leaflet'],
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.experiments = { ...config.experiments, lazyCompilation: false }
    }
    return config
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
      },
    ],
  },
}

export default nextConfig
