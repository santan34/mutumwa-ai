import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: '(?<tenant>[^.]+)\\.test',
            },
          ],
          destination: '/:path*?tenant=:tenant',
        },
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: '(?<tenant>[^.]+)\\.localhost:3000',
            },
          ],
          destination: '/:path*?tenant=:tenant',
        },
      ],
    }
  },
}

export default nextConfig;
