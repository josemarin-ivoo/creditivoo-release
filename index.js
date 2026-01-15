// index.js
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Firebase deshabilitado - no se está usando
// import './firebase-messaging';

AppRegistry.registerComponent(appName, () => App);
