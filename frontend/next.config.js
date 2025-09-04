/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['picsum.photos'],
  },
  swcMinify: true,
  transpilePackages: ['@tailwindcss/oxide'],
};

module.exports = nextConfig;
