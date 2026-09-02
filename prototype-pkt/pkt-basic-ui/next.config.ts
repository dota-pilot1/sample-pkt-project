import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const isGithubPages = process.env.GITHUB_PAGES === "true";
const githubPagesBasePath = "/MES Prototype";

const nextConfig: NextConfig = {
  // Keep Turbopack module resolution scoped to this frontend project when
  // the dev server is launched from the prototype-pkt parent directory.
  turbopack: {
    root: __dirname,
  },
  ...(isProd && { output: "export" }),
  ...(isGithubPages && {
    basePath: githubPagesBasePath,
    assetPrefix: githubPagesBasePath,
  }),
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
