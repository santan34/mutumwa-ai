import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Host',
            value: ':host',
          },
        ],
      },
    ]
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: '(?<tenant>[^.]+).localhost:3000',
            },
          ],
          destination: '/:path*?tenant=:tenant',
        },
      ],
    }
  },
}

export default nextConfig;
