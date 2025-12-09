/* eslint-disable prettier/prettier */
import { AppRegistry } from "react-native";
import { name as appName } from "./app.json";
import { Text, TextInput } from "react-native";
import Setup from "./Setup";


// Temporary Hermes microtask fix — remove this scope once RN/Hermes updated
if (global.HermesInternal) {
    // Fix for Hermes microtask scheduling bug
    const oldSetImmediate = global.setImmediate;
    global.setImmediate = (fn, ...args) => {
        try {
            return oldSetImmediate(fn, ...args);
        } catch (e) {
            console.warn('setImmediate failed, falling back to setTimeout', e);
            return setTimeout(fn, 0, ...args);
        }
    };
}


// AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerComponent(appName, () => Setup);

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;
