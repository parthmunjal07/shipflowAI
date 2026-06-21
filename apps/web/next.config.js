import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
};

export default withSentryConfig(nextConfig, {
  org: "your-sentry-org",
  project: "your-sentry-project",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  reactComponentAnnotation: {
    enabled: true,
  },
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,
  disableLogger: true,
});
