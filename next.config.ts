import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Separate local verification artifacts from a preview already served by an IDE.
  distDir: process.env.ULPANA_BUILD_DIR || '.next',
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
    ] }];
  },
  // Optional build mode for environments which cannot fork worker processes.
  ...(process.env.ULPANA_THREADED_BUILD === '1' ? {
    experimental: { webpackBuildWorker: false, workerThreads: true, cpus: 2, useTypeScriptCli: false },
  } : {}),
};

export default nextConfig;
