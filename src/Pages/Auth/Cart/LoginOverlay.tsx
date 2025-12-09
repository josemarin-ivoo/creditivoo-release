import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, Image, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { Text, Overlay } from 'react-native-elements';
import { usesAutoDateAndTime } from 'react-native-localize';
import commonStyle from '../../../../commonStyle';
import { SocialButtons } from '../../../Components/SocialButtons';
import { translate } from '../../../locales';
import ResColors from '../../../Utils/Colors'
import { useNavigation } from '@react-navigation/native';
import { BlurView, VibrancyView } from "@react-native-community/blur";
import Helper from '../../../Utils/Helper';
import { AppContext } from '../../AppContext';


const LoginOverlay = ( props ) =>
{
  const [showGuestLoginState, setShowGuestLogin] = useState( 'hide' )
  const { appTheme } = useContext( AppContext );
  const [isDark, setDark] = useState( appTheme.type === 'dark' );
  useEffect( () =>
  {
    setDark( appTheme.type === 'dark' )
  }, [appTheme.type] )

  return (
    // <Overlay overlayStyle={{ borderRadius: 24, width: '100%' }} isVisible={visible} onBackdropPress={props.OnClose}  >
    <TouchableWithoutFeedback onPress={() => { Helper.HandleVibration(); props.OnClose() }}>
      <View style={[styles.container, isDark ? { backgroundColor: ResColors.White80 } : null]}>

        <BlurView
          style={styles.absolute}
          blurType="dark"
          blurAmount={2}
          reducedTransparencyFallbackColor="white"
        />
        <View style={[styles.mainContainer, { backgroundColor: appTheme.background }]}>
          <Text style={[commonStyle.fontBold, styles.msg_signIn_Text, { color: appTheme.text }]}>
            {translate( 'splash.msg_LoginOverlay1' )}
            {/* In order to continue,  */}
          </Text>
          <Text style={[commonStyle.fontBold, styles.msg_signIn_Text, { marginBottom: 26, color: appTheme.text }]}>
            {translate( 'splash.msg_LoginOverlay2' )}
            {/* please sign in */}
          </Text>
          <SocialButtons showGuestLogin={showGuestLoginState} EmailNavigation={props.onPressEmail} />
        </View>

      </View>
    </TouchableWithoutFeedback>
    // </Overlay>

  );
};

const styles = StyleSheet.create( {
  mainContainer: { padding: 16, borderRadius: 24, },
  msg_signIn_Text: { fontSize: 24, textAlign: "center" },
  container: {
    justifyContent: "center",
    alignItems: "center",
    height: Dimensions.get( 'window' ).height,
  },
  absolute: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  }
} )

export default LoginOverlay
