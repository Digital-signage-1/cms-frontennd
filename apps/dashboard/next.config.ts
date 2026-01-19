import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@signage/renderer', '@signage/api-client', '@signage/types'],
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
