const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */

// expo-asset 58.x imports react-native/unstable-internals-do-not-use which
// does not exist in RN 0.83. Use resolveRequest (works for nested node_modules)
// to redirect this to the actual AssetSourceResolver location, which re-exports
// it as a named export via our shim at node_modules/react-native/unstable-internals-do-not-use/index.js
const config = {
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === 'react-native/unstable-internals-do-not-use') {
        return {
          filePath: path.resolve(
            __dirname,
            'node_modules/react-native/unstable-internals-do-not-use/index.js'
          ),
          type: 'sourceFile',
        };
      }
      // Fall back to default resolver
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
