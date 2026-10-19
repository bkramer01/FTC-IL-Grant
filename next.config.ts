import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Runs as a plain Node.js app on Hostinger (node .next/standalone/server.js).
  output: "standalone",
  // pg and nodemailer are server-only Node packages; keep them out of the bundle.
  serverExternalPackages: ["pg", "nodemailer"],
  // Type-check only the app during builds; scripts and tests use dev-only packages
  // that are not installed when the host runs npm with NODE_ENV=production.
  typescript: { tsconfigPath: "tsconfig.build.json" },
};

export default nextConfig;
