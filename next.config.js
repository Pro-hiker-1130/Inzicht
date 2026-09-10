/** @type {import('next').NextConfig} */
const nextConfig = {
  // better-sqlite3 ships native bindings; it must be require()'d at runtime
  // on the server, not bundled by webpack, or the native .node file won't
  // be found.
  serverExternalPackages: ['better-sqlite3'],
};

module.exports = nextConfig;
