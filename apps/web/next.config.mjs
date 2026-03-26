/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@lumara/ui', '@lumara/shared', '@lumara/database'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
}

export default nextConfig
