import React, {useContext} from 'react';
import {StyleSheet, Text, TouchableOpacity, View, SafeAreaView, Platform} from 'react-native';
import {WebView} from 'react-native-webview';
import {Layout} from "../../../Components/Layout";
import {useNavigation} from "@react-navigation/native";
import Helper from "../../../Utils/Helper";
import {GLOBAL_DATA} from "../../../redux/actionTypes";
import {Icon} from "react-native-elements";
import {AppContext} from "../../AppContext";
import {translate} from "../../../locales";
import Colors from "../../../Utils/Colors";

const ChatScreen = () => {
    const navigation = useNavigation(); // To handle back navigation
    const {appTheme} = useContext<any>(AppContext);
    // HTML content including the Zenvia Chat script
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Zenvia Chat</title>
    </head>
    <body>
    <!--<h1>Chat demo</h1>-->
      <script src="https://static.zenvia.com/embed/js/zenvia-chat.min.js"></script>
      <script>var chat = new ZenviaChat('fbc4d338fe49461493b0a85e810d40f6').embedded('button').build();</script>
    </body>
    </html>
  `;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={{flex: 1,}}>
                {/* Header */}
                <View style={[styles.header, { backgroundColor: appTheme.background }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        {/*<Text style={styles.backArrow}>←</Text>*/}
                        <Icon
                            name="arrow-left"
                            type="font-awesome-5"
                            color={appTheme.backiconColor}
                        />
                    </TouchableOpacity>
                    <Text style={[styles.title,{color:appTheme.backiconColor}]}>{translate('profile.lbl_chat')}</Text>
                </View>

                {/* WebView */}
                <WebView
                    originWhitelist={['*']}
                    source={{html: htmlContent}}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    style={[styles.webview,{backgroundColor: appTheme.background}]}
                />
            </View>
        </SafeAreaView>

    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'black', // Black background for the entire screen
    },
    container: {
        flex: 1,
        backgroundColor: 'black', // Black background
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 15,
        //borderBottomWidth: 1,
       // borderBottomColor: '#333',
    },
    backButton: {
        padding: 5,
    },
    backArrow: {
        fontSize: 20,
        color: '#fff',
        // White back arrow
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
       // color: '#fff', // White text
        marginLeft: 10,
    },
    webview: {
        flex: 1,
       // backgroundColor: 'transparent', // Ensure the WebView respects the black background
    },
});

export default ChatScreen;
