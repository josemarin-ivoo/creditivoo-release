const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);
const {assetExts, sourceExts} = defaultConfig.resolver;

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  transformer: {
    babelTransformerPath: require.resolve(
      'react-native-svg-transformer/react-native',
    ),
  },
  resolver: {
    assetExts: assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
  },
  watchFolders: [
    path.resolve(__dirname),
  ],
  // Excluir carpetas y archivos innecesarios del file watcher
  blockList: [
    // Node modules
    /.*\/node_modules\/.*/,
    // iOS
    /.*\/ios\/Pods\/.*/,
    /.*\/ios\/build\/.*/,
    /.*\/ios\/DerivedData\/.*/,
    /.*\/ios\/.*\.xcuserstate/,
    /.*\/ios\/.*\.xcworkspace\/.*/,
    // Android
    /.*\/android\/\.gradle\/.*/,
    /.*\/android\/build\/.*/,
    /.*\/android\/app\/build\/.*/,
    /.*\/android\/\.idea\/.*/,
    // Git
    /.*\/\.git\/.*/,
    // OS files
    /.*\/\.DS_Store/,
    /.*\/Thumbs\.db/,
    // Logs y temporales
    /.*\/\.metro-health-check.*/,
    /.*\/npm-debug\.log/,
    /.*\/yarn-error\.log/,
    /.*\/\.yarn\/.*/,
    // Coverage y tests
    /.*\/coverage\/.*/,
    /.*\/\.nyc_output\/.*/,
    // Fastlane
    /.*\/fastlane\/report\.xml/,
    /.*\/fastlane\/Preview\.html/,
    /.*\/fastlane\/screenshots\/.*/,
    // Otros
    /.*\/\.vscode\/.*/,
    /.*\/\.idea\/.*/,
    /.*\/\.env\.local/,
    /.*\/\.env\..*\.local/,
  ],
};

module.exports = mergeConfig(defaultConfig, config);
