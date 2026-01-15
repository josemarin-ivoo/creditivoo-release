import {StyleSheet, Dimensions} from 'react-native';

const {width} = Dimensions.get('window');

const createStyles = (theme: any) => {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: 'white',
    },
    layout: {
      flex: 1,
      padding: 20,
    },
    header: {
      marginTop:-20,
      marginBottom: 25,
    },
    headerLogoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      paddingHorizontal: 20,
      width: '100%',
    },
    backButton: {
      position: 'absolute',
      left: 0,
      zIndex: 1,
    },
    progressBarContainer: {
      marginTop: 20,
      flex: 1,
      flexDirection: 'row',
    },
    progressSegment: {
      flex: 1,
      height: 15,
      borderRadius: 25,
      marginHorizontal: 2,
    },
    progressSegmentActive: {
      backgroundColor: theme['color-primary-500'],
    },
    progressSegmentInactive: {
      backgroundColor: '#E0E0E0',
    },
    container: {
      marginTop: 16,
      // flex: 1,
      // justifyContent: 'space-between',
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 100,
    },
    formContainer: {
      // flex: 1, // This will be removed
    },
    title: {
      marginBottom: 10,
      fontSize: 35,
    },
    subtitle: {
      marginRight: "10%",
      marginBottom: 30,
    },
    input: {
      marginBottom: 10,
    },
    button: {
      marginTop: 14,
    },
    otpContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 20,
    },
    otpInput: {
      width: 48,
      height: 48,
      borderBottomWidth: 1,
      textAlign: 'center',
      fontSize: 20,
      borderColor: '#E0E0E0',
    },
    otpInputFocused: {
      borderColor: theme['color-primary-500'],
      borderBottomWidth: 2,
    },
    resendContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
    },
    resendText: {
      fontSize: 16,
    },
    resendLink: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme['color-primary-500'],
      marginLeft: 5,
    },
    iconSize: {
      width: 40,
      height: 40,
    },
    cameraButtonContainer: {
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 20,
    },
    cameraButton: {
      backgroundColor: '#f0f0f0',
      padding: 20,
      borderRadius: 50,
      marginTop: 20,
    },
    loadingContainer: {
      alignItems: 'center',
      //marginBottom: 10,
    },
    processingText: {
      marginTop: 10,
    },
  });
};

export default createStyles;