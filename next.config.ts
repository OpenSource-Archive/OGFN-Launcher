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
            rotateStringArray: true,
            stringArray: true,
            stringArrayThreshold: 0.75,
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 0.75,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 0.4,
            debugProtection: true,
            debugProtectionInterval: 0,
            disableConsoleOutput: true,
            identifierNamesGenerator: 'hexadecimal',
            log: false,
            numbersToExpressions: true,
            renameGlobals: false,
            selfDefending: true,
            simplify: true,
            splitStrings: true,
            splitStringsChunkLength: 10,
            stringArrayEncoding: ['rc4'],
            transformObjectKeys: true,
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