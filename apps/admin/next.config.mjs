/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@lumara/ui', '@lumara/shared', '@lumara/database'],
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
}

export default nextConfig
