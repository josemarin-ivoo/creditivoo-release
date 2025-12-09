import React, { useContext, useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from 'react-native-elements'
import commonStyle from '../../../commonStyle'
import { SocialButtons } from '../../Components/SocialButtons'
import { translate } from '../../locales';
import ResColors from '../../Utils/Colors'
import { useNavigation } from '@react-navigation/native';
import Helper from '../../Utils/Helper'

import { AppContext } from '../AppContext'
import { Routes } from '../../Utils/NavigationRoutes'


const GuestLogin = () =>
{
    const { appTheme } = useContext( AppContext );

    const navigation = useNavigation();
    const onPressEmail = () =>
    {
        /// console.log('Guest')
        Helper.HandleVibration();
        navigation.navigate( Routes.AUTHSCREENS, { screen: 'Email' } )
    }
    return <View style={[styles.mainContainer, { backgroundColor: appTheme.background }]}>
        <Text style={[commonStyle.h2, commonStyle.fontBold, styles.msg_signIn_Text, { color: appTheme.text }]}>{translate( 'splash.msg_signIn' )}</Text>
        <SocialButtons showGuestLogin={'hide'} EmailNavigation={onPressEmail} />
        {/* <TouchableHighlight onPress={() => { navigation.navigate("CreateAccount") }} underlayColor="transparent">
            <Text style={[commonStyle.h4, commonStyle.fontBold, { textAlign: "center"}]}>Register</Text>
        </TouchableHighlight> */}
    </View>
}

const styles = StyleSheet.create( {
    mainContainer: { padding: 16, flex: 1, justifyContent: "center" },
    msg_signIn_Text: { textAlign: "center", marginBottom: 50 },
} )

export default GuestLogin

