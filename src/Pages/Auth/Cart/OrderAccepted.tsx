import React, { useContext, useState } from 'react';
import {View, StyleSheet, BackHandler, TouchableOpacity, Dimensions, Platform, Image} from 'react-native';
import { Text } from 'react-native-elements';
import commonStyle from '../../../../commonStyle';
// import { translate } from '../../../locales';
import ResColors from '../../../Utils/Colors'
import { useNavigation, StackActions, CommonActions } from '@react-navigation/native'
import ProgressiveImage from '../../../Components/ProgressiveImage';
import ResImage from '../../../Utils/Image';
import { translate } from '../../../locales';
import { Routes } from '../../../Utils/NavigationRoutes'
import { useSelector, useDispatch } from 'react-redux';
import { cartDelete } from '../../../redux/cartAction';
import { ToastAndroid } from 'react-native';
import { useEffect } from 'react';
import { CustomButton } from '../../../Components/CustomButton';
import Helper from '../../../Utils/Helper';
import {AppContext} from '../../AppContext';
import { Clear_CARTITEMS } from '../../../redux/CartCacheReducer/CartCacheAction';
import { ClearCHECKOUT } from '../../../redux/CheckoutCacheReducer/CheckoutCacheAction';
import { DELETE_DATETIMESLOT } from '../../../redux/DateTimeSlotReducers/DateTimeSlotAction';
import { DELETE_PAYMETHODS } from '../../../redux/PaymentMethodsReducers/PaymentMethodsAction';
import { removeStoreItem, setItemInStorage } from '../../../Utils/Storage';
import { CLEAR_ORDERED_PRODUCTS } from '../../../redux/actionTypes';
const OrderAccepted = ( props ) =>
{
    const { appTheme } = useContext( AppContext );


    const navigation = useNavigation();
    const dispatch = useDispatch();
    const goToHome = () =>
    {
        Helper.HandleVibration();
        dispatch( cartDelete() );

        removeStoreItem( 'CartCacheStatus_customerCart' )
        setItemInStorage( 'CartCacheStatus_isUpdated', '0' );
        setItemInStorage( 'CartCacheStatus_expTime', new Date().toString() );

        dispatch( { type: CLEAR_ORDERED_PRODUCTS } );

        dispatch( ClearCHECKOUT() );
        dispatch( DELETE_DATETIMESLOT() );
        dispatch( DELETE_PAYMETHODS() );
        navigation.dispatch( StackActions.replace( Routes.APPSCREENS ) );
    }
    const backActionHandler = () =>
    {
        return true;
    };


    // add Frodriguez
    useEffect(() => {
        dispatch(cartDelete());
        // dispatch( Clear_CARTITEMS() );
        dispatch(ClearCHECKOUT());
        dispatch(DELETE_DATETIMESLOT());
        dispatch(DELETE_PAYMETHODS());

        removeStoreItem('CartCacheStatus_customerCart');
        setItemInStorage('CartCacheStatus_isUpdated', '0');
        setItemInStorage('CartCacheStatus_expTime', new Date().toString());
        // Add event listener for hardware back button press on Android
        const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        backActionHandler,
        );

        return () => {
        // clear/remove event listener
        subscription.remove();
        };
  }, []);
  // end Frodriguez

    // useEffect( () =>
    // {

    //     dispatch( cartDelete() );
    //     // dispatch( Clear_CARTITEMS() );
    //     dispatch( ClearCHECKOUT() );
    //     dispatch( DELETE_DATETIMESLOT() );
    //     dispatch( DELETE_PAYMETHODS() );


    //     removeStoreItem( 'CartCacheStatus_customerCart' )
    //     setItemInStorage( 'CartCacheStatus_isUpdated', '0' );
    //     setItemInStorage( 'CartCacheStatus_expTime', new Date().toString() );
    //     // Add event listener for hardware back button press on Android
    //     BackHandler.addEventListener( "hardwareBackPress", backActionHandler );

    //     return () =>
    //         // clear/remove event listener
    //         BackHandler.removeEventListener( "hardwareBackPress", backActionHandler );
    // }, [] );

    return (
        <View>
            <View style={[styles.mainContainer, { backgroundColor: appTheme.background }]}>
                <View style={{ height: "45%", width: "100%", justifyContent: "flex-end", alignItems: "center", }}>
                    <View style={{ alignItems: 'center', justifyContent: "center", }}>
                        <Image source={ResImage.ic_checkout_bag} style={styles.notification_icon} />
                        {/*<ProgressiveImage
                            source={ResImage.ic_checkout_bag}
                            resizeMode="center"
                            style={styles.notification_icon}
                        />*/}
                    </View>
                </View>
                <View style={{ height: "55%", width: "100%", justifyContent: "flex-start", }}>
                    <Text style={[commonStyle.h2, commonStyle.fontBold, { color: appTheme.text, padding: 16, textAlign: "center" }]}>{translate( 'orderaccepted.msg_order_accepted' )}</Text>
                    <Text style={styles.desc_notification}>{translate( 'orderaccepted.msg_order_status' )}</Text>
                    <View style={{ position: "absolute", bottom: Platform.OS === 'ios' ? 85 : 85, width: "100%" }}>

                        <CustomButton
                            title="orderaccepted.lbl_done"
                            onPress={goToHome}
                            customButtonStyle={[
                                commonStyle.btn_primary, commonStyle.fontBold
                            ]}
                        />
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create( {
    mainContainer: {
        padding: 16,
        backgroundColor: ResColors.white,
        height: Dimensions.get( 'window' ).height,
        justifyContent: 'center'
    },
    msg_signIn_Text: { fontSize: 24, textAlign: "center" },
    notification_icon: {
        width: 240,
        height: 240,
    },
    desc_notification: {
        fontSize: 16,
        lineHeight: 24,
        color: ResColors.Gray,
        textAlign: "center",
        marginBottom: 40
    }
} )

export default OrderAccepted

