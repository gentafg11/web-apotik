/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // optional rewrites to proxy /api/* to backend during dev
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:5001/api/auth/:path*',
      },
      {
        source: '/api/expense/:path*',
        destination: 'http://localhost:5001/api/expense/:path*',
      },
      {
        source: '/api/report/:path*',
        destination: 'http://localhost:5001/api/report/:path*',
      },
      {
        source: '/api/sale/:path*',
        destination: 'http://localhost:5001/api/sale/:path*',
      },
      {
        source: '/api/user/:path*',
        destination: 'http://localhost:5001/api/user/:path*',
      },
      {
        source: '/api/upload', // Only upload API to backend
        destination: 'http://localhost:5001/api/upload',
      },
    ];
  },
};
module.exports = nextConfig;
