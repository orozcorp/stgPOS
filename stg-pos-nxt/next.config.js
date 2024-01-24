/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "stgfinal.s3.amazonaws.com",
        pathname: "/**/*",
      },
      {
        protocol: "https",
        hostname: "s3.eu-central-1.amazonaws.com",
        pathname: "/**/*",
      },
      {
        protocol: "https",
        hostname: "stgfinal.s3.us-east-1.amazonaws.com",
        pathname: "/**/*",
      },
      {
        protocol: "https",
        hostname: "stgfinal.s3.us-east-2.amazonaws.com",
        pathname: "/**/*",
      },
      {
        protocol: "https",
        hostname: "orozcorp.s3.us-east-2.amazonaws.com",
        pathname: "/**/*",
      },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**/*" },
      { protocol: "https", hostname: "s3.amazonaws.com", pathname: "/**/*" },
    ],
    unoptimized: false,
  },
};

export default nextConfig;
