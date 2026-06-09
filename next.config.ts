const isProd = process.env.NODE_ENV === 'production';
const shouldObfuscate = process.env.OBFUSCATE === 'true';

const internalHost = process.env.TAURI_DEV_HOST || 'localhost';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  assetPrefix: isProd ? undefined : `http://${internalHost}:3000`,
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    // Obfuscate client-side code when OBFUSCATE env var is set
    if (!isServer && shouldObfuscate) {
      try {
        const WebpackObfuscator = require('webpack-obfuscator');
        config.plugins.push(
          new WebpackObfuscator({
            compact: true,
            controlFlowFlattening: false,
            deadCodeInjection: false,
            debugProtection: false,
            disableConsoleOutput: false,
            identifierNamesGenerator: 'mangled',
            log: false,
            renameGlobals: false,
            selfDefending: false,
            simplify: true,
            stringArray: true,
            stringArrayThreshold: 0.5,
            stringArrayEncoding: [],
            unicodeEscapeSequence: false,
          }, [])
        );
      } catch (e) {
        console.warn('WebpackObfuscator not available, skipping obfuscation');
      }
    }
    return config;
  },
};

export default nextConfig;