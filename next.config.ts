import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/Indoor-Map-Frontend",
  assetPrefix: "/Indoor-Map-Frontend/",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
