process.env.EXPO_ROUTER_DISABLE_RN_NAVIGATION_CHECK = '1';

const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');
const path = require('path');


const config = getDefaultConfig(__dirname);

// Custom resolver to fix broken expo-router 57 experimental native toolbar on Android
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    context.originModulePath &&
    context.originModulePath.includes('StackToolbarMenu') &&
    (moduleName === './native' || moduleName.endsWith('/native'))
  ) {
    return {
      filePath: path.resolve(
        __dirname,
        'node_modules/expo-router/build/layouts/stack-utils/toolbar/StackToolbarMenu/native.js'
      ),
      type: 'sourceFile',
    };
  }

  if (moduleName.endsWith('.xml')) {
    return {
      filePath: path.resolve(__dirname, 'src/utils/emptyMock.js'),
      type: 'sourceFile',
    };
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Use turborepo to restore the cache when possible
config.cacheStores = [
  new FileStore({ root: path.join(__dirname, 'node_modules', '.cache', 'metro') }),
];

module.exports = config;

