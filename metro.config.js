const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

const {assetExts, sourceExts} = defaultConfig.resolver;

const config = {

  transformer: {
    babelTransformerPath: require.resolve(
     'react-native-svg-transformer', 
   ),
  },
  resolver: {
    assetExts: assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...sourceExts, 'cjs', 'jsx', 'svg'], //add here
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
