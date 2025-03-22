/** @type {import('next').NextConfig} */

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: false,
  aggresiveFrontEndNavCaching: false,
  reloadOnOnline: false,
  swMinify: false,
  disable: process.env.NODE_ENV === "development",
  workBoxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: /^https?.*/, // Cache all HTTP and HTTPS requests
        handler: "NetworkFirst", // Use NetworkFirst strategy
        options: {
          cacheName: "http-cache",
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
    ],
  },
});

const nextConfig = {};

module.exports = withPWA(nextConfig);
