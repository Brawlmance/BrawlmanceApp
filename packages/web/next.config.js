/** @type {import('next').NextConfig} */
const nextConfig = {
  // packages/web has its own lockfile and node_modules; pin the root so Next
  // doesn't infer the monorepo root from the top-level package-lock.json.
  outputFileTracingRoot: __dirname,
  turbopack: {
    root: __dirname,
  },
}

module.exports = nextConfig
