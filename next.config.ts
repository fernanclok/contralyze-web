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
  },
});

const nextConfig = {};

module.exports = withPWA(nextConfig);
