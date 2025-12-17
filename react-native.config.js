module.exports = {
    project: {
        android: {
            sourceDir: './android',
            manifestPath: './android/app/src/main/AndroidManifest.xml',
            packageName: 'com.ivoo.android', // 🔁 Replace this with your actual app package name
        },
    },
    assets: [
        './node_modules/react-native-dynamic-vector-icons/assets/fonts',
        // Si usas otra librería de iconos, también la pones aquí, ejemplo:
        // './node_modules/react-native-vector-icons/Fonts', 
    ],
    reactNativePath: './node_modules/react-native',
};
