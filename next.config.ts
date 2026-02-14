import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    images: {
        remotePatterns: [
            {
                protocol: "http",
                hostname: "localhost",
                port: "9000",
            },
            {
                protocol: "http",
                hostname: process.env.NEXT_PUBLIC_API_URL || "",
                port: "9000",
            },
        ],
        // Disable optimization for images from private IPs (MinIO server)
        // This bypasses SSRF protection for local development
        unoptimized: true,
    },
};

export default nextConfig;
