import { useNavigation, StackActions } from '@react-navigation/native';
import React, { useState, useEffect, useContext } from 'react';
import
{
  View,
  Text,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet
} from 'react-native';
import { Icon } from 'react-native-elements';
import commonStyle from '../../../commonStyle';
import { CustomButton } from '../../Components/CustomButton';
import CustomInput from '../../Components/CustomInput';
import { Layout } from '../../Components/Layout';
import { setNewPasswordQuery } from '../../Queries/queries';
import CustomPBar from '../../Components/CustomPBar';
import OtpInputs from '../../Components/OtpInput';
import { translate } from '../../locales';

import clr from '../../Utils/Colors'
import { Routes } from '../../Utils/NavigationRoutes';
import Helper from '../../Utils/Helper';
import { useTheme } from '../../Utils/ThemeProvider';
import ResColors from '../../Utils/Colors';
import { AppContext } from '../AppContext';


export const NewPassword = ( props ) =>
{
  const navigation = useNavigation();
  const { appTheme } = useContext( AppContext );
  const [isDark, setDark] = useState( appTheme.type === 'dark' );
  useEffect( () =>
  {
    setDark( appTheme.type === 'dark' )
  }, [appTheme.type] )

  const [newPassword, setNewPassword] = useState( '' );
  const [forgotEmailParams, { loading, error, data }] = setNewPasswordQuery();
  const [secureText, setSecureText] = useState( true );
  const [otp1, setOtp1] = useState( '' );
  const [otp2, setOtp2] = useState( '' );
  const [otp3, setOtp3] = useState( '' );
  const [otp4, setOtp4] = useState( '' );
  const [fullOtp, setFullOtp] = useState( '' );
  const emailTextUpdate = ( value ) =>
  {
    // setNewPassword(value);
  };
  const passwordTextUpdate = ( value ) =>
  {
    setNewPassword( value );
  };
  const next = () =>
  {
    if ( newPassword == '' )
    {
      return;
    }
    Helper.HandleVibration();
    forgotEmailParams( {
      variables: {
        email: props.route.params.email,
        otp: fullOtp,
        newPassword: newPassword,
      },
    } );
  };

  useEffect( () =>
  {
    error && Helper.ShowAlert( `${ error }` );
  }, [error] );

  useEffect( () =>
  {
    if ( data )
    {
      const pushAction = StackActions.replace( Routes.AUTHSCREENS );
      data.resetPasswordThroughOTP && navigation.dispatch( pushAction );
    }
  }, [data] );

  return (
    <Layout>
      <View
        style={[commonStyle.unAuth_MainContainer, { backgroundColor: appTheme.background }]}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[commonStyle.flex_1]}>
            <Text style={[commonStyle.h2, commonStyle.fontBold, commonStyle.marginBottom_30, { marginTop: 65, color: appTheme.text }]}> {translate( 'pre_login.forgot_password' )} </Text>
            <Text style={[commonStyle.h6, commonStyle.label, commonStyle.marginBottom_10]}> {translate( 'pre_login.lbl_enter_otp' )}
            </Text>

            <View style={styles.opt_container}>
              <OtpInputs placeholder={'\u2B24'} placeholderTextColor={ResColors.disc_rate_clr} selectionColor={clr.black} handleChange={( code ) =>
              {
                setFullOtp( code )
              }} numberOfInputs={4} />
            </View>
            <View style={{ marginTop: 20 }}>
              <CustomInput labelText='pre_login.lbl_new_password' onChangeText={( value ) => passwordTextUpdate( value )} placeholder='pre_login.lbl_password'
                secureTextEntry={secureText} rightIcon={
                  <Icon name={!secureText ? 'eye' : 'eye-slash'} size={18} type="font-awesome-5" color={appTheme.text} onPress={() =>
                  {
                    Helper.HandleVibration();
                    setSecureText( !secureText )
                  }} />
                }
              />
            </View>
            <View style={[commonStyle.buttonViewStyles]}>
              <CustomButton title='pre_login.lbl_submit'
                // disabled={newPassword == '' ? true : false}
                onPress={next}
                customButtonStyle={[( fullOtp == '' || newPassword == '' ) ? ( commonStyle.btn_disabled,
                  isDark ? { backgroundColor: ResColors.a1E1E1E } : commonStyle.btn_disabled
                ) : commonStyle.btn_primary]}
                customTitleStyle={[( fullOtp == '' || newPassword == '' ) ? { color: ResColors.a3E3E3E } : null]} />
            </View>
            <CustomPBar showProgress={loading} />
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create( {

  opt_container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  }
} )

export default NewPassword