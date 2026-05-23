/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @react-three/drei ships ESM that benefits from being transpiled by Next.
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
};

export default nextConfig;
