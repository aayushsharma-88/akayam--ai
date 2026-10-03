/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  serverExternalPackages: ['@prisma/client', 'prisma'],
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
}

export default nextConfig
