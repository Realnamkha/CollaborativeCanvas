/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_URL_SERVER || "http://localhost:3001"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
