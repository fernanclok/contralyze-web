/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,  // Modo estricto de React (recomendado)
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb', // Increase the body size limit to 10MB
    },
  },
};

export default nextConfig;
