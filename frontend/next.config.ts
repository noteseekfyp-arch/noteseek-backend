import type { NextConfig } from "next"

/** Server-side only: where Next.js proxies `/api/*` (avoids browser CORS in local dev). */
const API_PROXY_TARGET =
  process.env.API_PROXY_TARGET?.replace(/\/$/, "") ?? "http://127.0.0.1:8000"

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_PROXY_TARGET}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
