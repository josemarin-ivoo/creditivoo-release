import { useLazyQuery } from '@apollo/client';
import { useNavigation, StackActions } from '@react-navigation/native';
import React, { useState, useEffect, useContext } from 'react'
import { View, Text, TouchableHighlight, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native'
import { Icon, Input } from 'react-native-elements';
import commonStyle from '../../../commonStyle';
import { CustomButton } from '../../Components/CustomButton';
import CustomInput from '../../Components/CustomInput';
import { Layout } from '../../Components/Layout';
import { changePhone, mobileVerification } from '../../Queries/queries';
import Toast from 'react-native-simple-toast';
import CustomPBar from '../../Components/CustomPBar'
import { translate } from '../../locales';
import { Routes } from '../../Utils/NavigationRoutes';
import ResorceColor from '../../Utils/Colors';
import { useDispatch, useSelector } from 'react-redux';
import { GLOBAL_DATA } from '../../redux/actionTypes';
import Helper from '../../Utils/Helper';
import { AppContext } from '../AppContext';
import { useCustomer } from './../../Services/useCustomer';
import { moderateScale } from 'react-native-size-matters';

export const ChangeMobile = ( props ) =>
{
    const navigation = useNavigation();

    const dispatch = useDispatch()
    const { appTheme } = useContext( AppContext );
    const [isDark, setDark] = useState( appTheme.type === 'dark' );
    useEffect( () =>
    {
        setDark( appTheme.type === 'dark' )
    }, [appTheme.type] )

    const [phone, setPhone] = useState( "" );
    const [ChangePhoneParams, { loading, error, data }] = changePhone()
    const [sendOTPParams, { loading: otpLoad, error: otperror, data: otpdata }] = mobileVerification()
    const { getCustomer, data: customerData, loading: customerLoading, error: customerError } = useCustomer();

    const [phone_pincode, setphone_pincode] = useState( "" );

    useEffect( () =>
    {
        setPhone( props.route.params.mobile.replace( /^0+/, '' ) )
        setphone_pincode( props.route.params.phone_pincode )
    }, [props.route.params.mobile, props.route.params.phone_pincode] )


    const phoneTextUpdate = ( value ) =>
    {
        setPhone( value.replace( /^0+/, '' ) );
    }
    const next = () =>
    {
        if ( phone == '' || phone_pincode == '' ) 
        {
            return;
        }
        Helper.HandleVibration();
        ChangePhoneParams( { variables: { phone: phone, phone_pincode: phone_pincode } } );
    }

    useEffect( () =>
    {
        error && Helper.ShowAlert( `${ error }` );
        otperror && Helper.ShowAlert( `${ otperror }` );
    }, [error, otperror] )

    useEffect( () =>
    {
        //change Number API
        if ( data )
        {
            // dispatch( { type: GLOBAL_DATA, payload: { phone: phone } } );

            getCustomer();

            //sendOTPParams( { variables: { phone: phone } } );

        }
    }, [data] )

    // useEffect( () =>
    // {
    //     if ( otpdata )
    //     {
    //         navigation.navigate( Routes.NAVIGATION_TO_VERIFICATION, { mobile: phone, isnew: props.route.params.isnew, passoword: '' } )
    //     }
    // }, [otpdata] )

    useEffect( () =>
    {
        if ( customerData )
        {
            // console.log( JSON.stringify( customerData ) )

            dispatch( { type: GLOBAL_DATA, payload: { Fname: customerData.customer.firstName, Lname: customerData.customer.lastName, wishListId: customerData.customer.wishlist.id, is_phone_verified: customerData.customer.is_phone_verified, phone: phone, customerData: customerData.customer } } );

            setTimeout( function ()
            {
                navigation.reset( { index: 1, routes: [{ name: Routes.NAVIGATION_to_ACCOUNTSUCCESS }], key: null } )
            }, 1000 );
        }
    }, [customerData] )


    return <Layout>
        <View
            style={[commonStyle.unAuth_MainContainer, { backgroundColor: appTheme.background }]}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={[commonStyle.flex_1]}>
                    <Text style={[commonStyle.h2, commonStyle.fontBold, commonStyle.marginBottom_30, { marginTop: 65, color: appTheme.text }]}>{translate( 'pre_login.lbl_enter_phone_number' )}</Text>

                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 0.25, marginEnd: 10 }}>
                                <Text style={[commonStyle.h6, commonStyle.label, { marginBottom: 5, color: appTheme.text }]}>{translate( 'pre_login.lbl_code' )}</Text>

                                <Input maxLength={4} style={[{
                                    height: 48, borderRadius: 16, fontSize: 16, textAlign: 'center', color: isDark ? appTheme.text : ResorceColor.blackShade, justifyContent: "center", textAlignVertical: "center"
                                }]}
                                    containerStyle={[commonStyle.input, { height: 48, backgroundColor: appTheme.InputBoxBGColor }]}
                                    inputContainerStyle={{ borderColor: "transparent" }}
                                    textAlignVertical="center"
                                    keyboardType='phone-pad'
                                    value={phone_pincode}
                                    onChangeText={value => setphone_pincode( value )}
                                    placeholder={'+58'}
                                    placeholderTextColor={isDark ? appTheme.text : ResorceColor.Gray}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <CustomInput maxLength={15} labelText="pre_login.lbl_enter_phone_number" onChangeText={value => phoneTextUpdate( value )} keyboardType='numeric' value={phone} placeholder="pre_login.lbl_enter_your_phone_number" />
                            </View>
                        </View>

                        <View style={{ marginTop: moderateScale( 16 ) }} >
                            <CustomButton title="pre_login.lbl_submit"
                                onPress={next}
                                customButtonStyle={[( phone == '' || phone_pincode == '' ) ? ( commonStyle.btn_disabled,
                                    isDark ? { backgroundColor: ResorceColor.a1E1E1E } : commonStyle.btn_disabled
                                ) : commonStyle.btn_primary]}
                                customTitleStyle={[( phone == '' || phone_pincode == '' ) ? { color: ResorceColor.a3E3E3E } : null]} />
                        </View>

                    </View>

                    <CustomPBar showProgress={loading || otpLoad || customerLoading} />
                </View>
            </TouchableWithoutFeedback>
        </View>
    </Layout>
}

