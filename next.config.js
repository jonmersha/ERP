/** @type {import('next').NextConfig} */
import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  // output: 'export', // Optional if we want a static PWA
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withPWA(nextConfig);
