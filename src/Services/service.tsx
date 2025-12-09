import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react'
import { View, Text } from 'react-native'

export const tokenFound = async (callback) => {
    const value = await AsyncStorage.getItem('persist:ivo-app');
    var tokenValue = "";
    console.log("_________", value)
    if (value != null) {
        const localStorage = JSON.parse(value).commonReducer;
        tokenValue = JSON.parse(localStorage).token;
        console.log( "_________tokenValue", tokenValue )
        
        return tokenValue == "" ? callback(false) : callback(true)
    } else {
        return callback(false);
    }
}

