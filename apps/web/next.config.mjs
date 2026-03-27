import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@lumara/ui', '@lumara/shared', '@lumara/database', '@lumara/agents'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
    outputFileTracingRoot: path.join(__dirname, '../../'),
    outputFileTracingIncludes: {
      '/api/**/*': [
        './node_modules/.prisma/client/**',
        '../../node_modules/.prisma/client/**',
        '../../node_modules/@prisma/client/**',
      ],
    },
  },
}

export default nextConfig
