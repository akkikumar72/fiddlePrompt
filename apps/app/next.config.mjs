import "./src/env.mjs"
import { withSentryConfig } from "@sentry/nextjs"

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@v1/supabase"],
  experimental: {
    instrumentationHook: process.env.NODE_ENV === "production"
  },
  webpack: (config, { isServer }) => {
    // Monaco editor webpack configuration
    config.resolve.alias = {
      ...config.resolve.alias,
      "monaco-editor": "monaco-editor/esm/vs/editor/editor.api"
    }

    return config
  },
  // Ensure Monaco Editor web workers are properly bundled
  serverExternalPackages: ["monaco-editor"]
}

export default withSentryConfig(nextConfig, {
  silent: !process.env.CI,
  telemetry: false,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  tunnelRoute: "/monitoring",
  // Add this to fix the requestAsyncStorageShim.js issue
  transpileClientSDK: true
})
