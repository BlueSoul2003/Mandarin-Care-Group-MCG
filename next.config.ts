import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
  './src/i18n/request.ts'
);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days for optimized images
  },
  async redirects() {
    return [
      {
        source: '/spiritual',
        destination: '/articles',
        permanent: true,
      },
      {
        source: '/:locale(en|zh-TW)/spiritual',
        destination: '/:locale/articles',
        permanent: true,
      },
      {
        source: '/spiritual/:slug',
        destination: '/articles/:slug',
        permanent: true,
      },
      {
        source: '/:locale(en|zh-TW)/spiritual/:slug',
        destination: '/:locale/articles/:slug',
        permanent: true,
      },
      {
        source: '/lifestyle/:slug',
        destination: '/articles/:slug',
        permanent: true,
      },
      {
        source: '/:locale(en|zh-TW)/lifestyle/:slug',
        destination: '/:locale/articles/:slug',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff|woff2|ttf|otf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
