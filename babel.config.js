module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        alias: {
          
          Components: './src/Components',
          "@shared-constants": "./src/Pages/Auth/Creditivoo/shared/constants",
          "@creditivo-components": "./src/Pages/Auth/Creditivoo/components",
          "@creditivo-style": "./src/Pages/Auth/Creditivoo/styles",
          "@services": "./src/Pages/Auth/Creditivoo/services",
          "@app-services": "./src/Pages/Auth/Creditivoo/app/services",
          //"@font-size": "./src/shared/theme/font-size",
          // "@api": "./src/services/api/index",
          // "@fonts": "./src/shared/theme/fonts",
          // "@colors": "./src/shared/theme/colors",
          // "@theme": "./src/shared/theme",
          // "@models": "./src/services/models",
          // "@services": "./src/services",
          // "@screens": "./src/screensPages/Auth/Creditivoo/screens",
          // "@utils": "./src/utils/",
          // "@assets": "./src/assets/",
          // "@event-emitter": "./src/services/event-emitter",
          // "@local-storage": "./src/services/local-storage",
          // "@features": "./src/app/features",
          // "@components": "./src/Components",
          // "@app-services": "./src/app/services",
          
        },
      },
    ],
    'react-native-reanimated/plugin', // must be last
  ],
};
