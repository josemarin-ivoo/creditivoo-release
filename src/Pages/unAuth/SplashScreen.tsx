import React, { useContext, useEffect, useState } from 'react'
import { View, StyleSheet, StatusBar, Platform } from 'react-native'
import { Text } from 'react-native-elements'
import { useDispatch, useSelector } from 'react-redux'
import { DELETE_DATA, GLOBAL_DATA, SWITCH_THEME } from '../../redux/actionTypes'
import commonStyle from '../../../commonStyle'
import { SocialButtons } from '../../Components/SocialButtons'
import { translate } from '../../locales';
import { useNavigation } from '@react-navigation/native';
import Helper from '../../Utils/Helper'
import { cartDelete } from '../../redux/cartAction';
import Colors from '../../Utils/Colors'
import { AppContext } from '../AppContext'
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions'
import PermissionHandler from '../../Utils/PermissionHandler'
import Geolocation from 'react-native-geolocation-service';
import { removeStoreItem, setItemInStorage } from './../../Utils/Storage';
import { Clear_CARTITEMS } from '../../redux/CartCacheReducer/CartCacheAction'
import { ClearCHECKOUT } from '../../redux/CheckoutCacheReducer/CheckoutCacheAction'
import { DELETE_DATETIMESLOT } from '../../redux/DateTimeSlotReducers/DateTimeSlotAction'
import { DELETE_PAYMETHODS } from '../../redux/PaymentMethodsReducers/PaymentMethodsAction'

const SplashScreen = () =>
{
    const { appTheme } = useContext( AppContext );

    const dispatch = useDispatch();

    useEffect( () =>
    {
        dispatch( cartDelete() );
        dispatch( { type: DELETE_DATA } );

        dispatch( ClearCHECKOUT() );
        dispatch( DELETE_DATETIMESLOT() );
        dispatch( DELETE_PAYMETHODS() );

        removeStoreItem( 'CartCacheStatus_customerCart' )
        setItemInStorage( 'CartCacheStatus_isUpdated', '0' );
        setItemInStorage( 'CartCacheStatus_expTime', new Date().toString() );

        PermissionHandler.getCurrentLatLong();

    }, [] )

    const navigation = useNavigation();

    const onPressEmail = () =>
    {

        Helper.HandleVibration();
        navigation.navigate( "Email" )
    }

    return <View style={[styles.mainContainer, { backgroundColor: appTheme.background }]}>
        <StatusBar translucent={true} backgroundColor={Colors.transparent} barStyle={appTheme.type === 'dark' ? "light-content" : "dark-content"} />
        <Text style={[commonStyle.h2, commonStyle.fontBold, styles.msg_signIn_Text, { color: appTheme.text }]}>{translate( 'splash.msg_signIn' )}</Text>
        <SocialButtons showGuestLogin={'show'} EmailNavigation={onPressEmail} />
    </View>
}

const styles = StyleSheet.create( {
    mainContainer: { padding: 16, flex: 1, justifyContent: "center" },
    msg_signIn_Text: { textAlign: "center", marginBottom: 50, },
} )

export default SplashScreen


