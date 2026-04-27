import type { NextConfig } from 'next'
import path from 'path'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../..'),
  transpilePackages: ['@signage/renderer', '@signage/api-client', '@signage/types', 'leaflet'],
  async rewrites() {
    return [
      {
        source: '/api/v1/weather',
        destination: `${API_URL}/api/v1/weather`,
      },
      {
        source: '/api/v1/rss',
        destination: `${API_URL}/api/v1/rss`,
      },
    ]
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.experiments = { ...config.experiments, lazyCompilation: false }
    }
    return config
  },
  images: {
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
