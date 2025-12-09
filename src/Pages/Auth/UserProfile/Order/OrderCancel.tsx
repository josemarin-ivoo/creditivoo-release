import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect, useContext } from "react";
import { BackHandler, Platform, Dimensions, View, StyleSheet, Text } from "react-native";

import commonStyle from "../../../../../commonStyle";
import { CustomButton } from "../../../../Components/CustomButton";
import ProgressiveImage from "../../../../Components/ProgressiveImage";
import { translate } from "../../../../locales";
import ResImage from '../../../../Utils/Image'
import ResColors from '../../../../Utils/Colors'

import { Routes } from './../../../../Utils/NavigationRoutes';
import Helper from "../../../../Utils/Helper";
import { AppContext } from "../../../AppContext";


const OrderCancel = ( props ) =>
{
    const navigation = useNavigation();
    const { appTheme } = useContext( AppContext );
    

    const next = () =>
    {
        Helper.HandleVibration();
        navigation.reset( { index: 1, routes: [{ name: Routes.APPSCREENS },], key: null } )
        //  navigation.navigate( Routes.NAVIGATION_TO_ORDERHISTORY );
    }
    const backActionHandler = () =>
    {
        return true;
    };

    useEffect( () =>
    {
        BackHandler.addEventListener( "hardwareBackPress", backActionHandler );
        return () =>
            BackHandler.removeEventListener( "hardwareBackPress", backActionHandler );
    }, [] );

    return (
        <View>
            <View style={[styles.mainContainer, { backgroundColor: appTheme.background }]}>
                <View style={{ height: "45%", width: "100%", justifyContent: "flex-end", alignItems: "center", }}>
                    <View style={{ alignItems: 'center', justifyContent: "center", }}>
                        <ProgressiveImage
                            source={ResImage.img_cancelledOrder}
                            resizeMode="center"
                            style={styles.notification_icon}
                        />
                    </View>
                </View>
                <View style={{ height: "55%", width: "100%", justifyContent: "flex-start", }}>
                    <Text style={[commonStyle.h2, commonStyle.fontBold, { color: appTheme.text, padding: 16, textAlign: "center" }]}>{translate( 'order.msg_order_cancel' )}</Text>

                    <View style={{ position: "absolute", bottom: Platform.OS === 'ios' ? 85 : 85, width: "100%" }}>
                        <CustomButton
                            title="order.lbl_Continue"
                            onPress={next}
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

export default OrderCancel

