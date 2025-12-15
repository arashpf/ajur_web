/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  
  // Remove or comment out the turbo: false line
  // experimental: {
  //   turbo: false,
  // },
  
  images: {
    domains: [
      "api.ajur.app", 
      "www.api.ajur.app",
      "localhost",
      "127.0.0.1",
      "via.placeholder.com",
      "images.unsplash.com",
    ],
    unoptimized: true,
  },
  
  async headers() {
    return [
      {
        source: '/.well-known/assetlinks.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json'
          }
        ],
      },
    ]
  },
  
  transpilePackages: ['swiper', 'ssr-window', 'dom7', '@mui/material', '@mui/icons-material'],
}

module.exports = nextConfig