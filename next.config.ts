// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* existing config options here */
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Don't attempt to bundle prisma or other server-only dependencies on the client side
            config.resolve.fallback = {
                ...config.resolve.fallback,
                'async_hooks': false,
                'fs': false,
                'net': false,
                'tls': false,
                'pg-native': false,
            };
        }
        return config;
    },
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
};

export default nextConfig;