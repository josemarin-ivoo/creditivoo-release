import { useLazyQuery } from '@apollo/client';
import { useNavigation, StackActions } from '@react-navigation/native';
import React, { useState, useEffect, useContext } from 'react'
import { View, Text, StyleSheet, Platform, TouchableWithoutFeedback, Keyboard, } from 'react-native'
import { Icon, Input } from 'react-native-elements';
import commonStyle from '../../../commonStyle';
import { CustomButton } from '../../Components/CustomButton';
import CustomInput from '../../Components/CustomInput';
import { Layout } from '../../Components/Layout';
import { forgotEmail } from '../../Queries/queries';
import Toast from 'react-native-simple-toast';
import CustomPBar from '../../Components/CustomPBar'
import { translate } from '../../locales';
import { Routes } from '../../Utils/NavigationRoutes';
import Helper from '../../Utils/Helper';
import { useTheme } from '../../Utils/ThemeProvider';
import colorResource from '../../Utils/Colors';
import { useSelector } from 'react-redux';
import { AppContext } from '../AppContext';
import { moderateScale } from 'react-native-size-matters';
export const ForgotPassword = ( props ) =>
{

    const navigation = useNavigation();
    const { appTheme } = useContext( AppContext );
    const [isDark, setDark] = useState( appTheme.type === 'dark' );
    useEffect( () =>
    {
        setDark( appTheme.type === 'dark' )
    }, [appTheme.type] )

    const [email, setemail] = useState( "" );
    const [forgotEmailParams, { loading, error, data }] = forgotEmail()

    const emailTextUpdate = ( value ) =>
    {
        setemail( value.trim() );
    }
    const next = () =>
    {
        if ( email == '' )
        {
            return;
        }
        Helper.HandleVibration();
        if ( Helper.validateEmail( email ) )
        {
            forgotEmailParams( { variables: { email: email } } );
        } else
        {
            Toast.show( translate( 'email.msg_email_valid' ) );
        }
    }
    useEffect( () =>
    {
        if ( error )
        {
            error && Helper.ShowAlert( `${ error }` );
        }
    }, [error] )

    useEffect( () =>
    {
        if ( data )
        {
            navigation.dispatch(
                StackActions.replace( Routes.NAVIGATION_TO_NEWPASSWORD, { email: email } ) )
        }
    }, [data] )
    return <Layout>
        <View
            style={[commonStyle.unAuth_MainContainer, { backgroundColor: appTheme.background }]}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={[commonStyle.flex_1]}>
                    <Text style={[commonStyle.h2, commonStyle.fontBold, commonStyle.marginBottom_24, { marginTop: 55, color: appTheme.text }]}>{translate( 'pre_login.forgot_password' )}</Text>
                    <CustomInput labelText='pre_login.enter_email_for_account'
                        onChangeText={value => emailTextUpdate( value )}
                        keyboardType='email-address'
                        placeholder='pre_login.lbl_email_address'
                        autoCapitalize='none' />
                    {/* <View style={[commonStyle.buttonViewStyles]}> */}
                    <View style={{ marginTop: moderateScale( 16 ) }} >
                        <CustomButton title='pre_login.lbl_submit'
                            // disabled={email == '' ? true : false}
                            onPress={next}
                            // customButtonStyle={[email == '' ? commonStyle.btn_disabled : commonStyle.btn_primary]}
                            customButtonStyle={[email == '' ? ( commonStyle.btn_disabled,
                                isDark ? { backgroundColor: colorResource.a1E1E1E } : commonStyle.btn_disabled
                            ) : commonStyle.btn_primary]}
                            customTitleStyle={[email == '' ? { color: colorResource.a3E3E3E } : null]} />
                    </View>
                    <CustomPBar showProgress={loading} />
                </View>
            </TouchableWithoutFeedback>
        </View>
    </Layout>
}



