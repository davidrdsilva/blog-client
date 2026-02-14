import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "http",
                hostname: "localhost",
                port: "9000",
            },
            {
                protocol: "http",
                hostname: "192.168.255.107",
                port: "9000",
            },
        ],
        // Disable optimization for images from private IPs (MinIO server)
        // This bypasses SSRF protection for local development
        unoptimized: true,
    },
};

export default nextConfig;
