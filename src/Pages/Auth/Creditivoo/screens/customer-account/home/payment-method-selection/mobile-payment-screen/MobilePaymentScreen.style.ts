import {ImageStyle, StyleSheet, ViewStyle} from 'react-native';
import {ExtendedTheme} from '@react-navigation/native';

interface Style {
  container: ViewStyle;
  phoneLogo: ViewStyle;
  totalAmount: ViewStyle;
  bankLogoContainer: ViewStyle;
  bankLogo: ImageStyle;
  bankInfoContainer: ViewStyle;
  bankInfo: ViewStyle;
  infoWithCopyIcon: ViewStyle;
  copyIconContainer: ViewStyle;
  bankDropdown: ViewStyle;
  bankDropdownLabel: ViewStyle;
  input: ViewStyle;
  codeAndPhoneContainer: ViewStyle;
  phoneCodeDropdown: ViewStyle;
  phoneContainer: ViewStyle;
  dateAndDigitsContainer: ViewStyle;
  dateInput: ViewStyle;
  fourDigitsInput: ViewStyle;
  button: ViewStyle;
  paymentMadeTitle: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const {colors} = theme;

  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      padding: 12,
    },
    phoneLogo: {
      marginTop: 8,
      marginBottom: 12,
      alignSelf: 'center',
    },
    totalAmount: {
      marginVertical: 12,
      alignItems: 'center',
    },
    bankLogoContainer: {
      alignSelf: 'center',
      marginTop: 16,
      marginBottom: 22,
    },
    bankLogo: {
      width: 90,
      height: 90,
      borderRadius: 15,
      resizeMode: 'cover',
    },
    bankInfoContainer: {
      marginTop: 18,
      marginBottom: 26,
    },
    bankInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginLeft: 12,
      marginRight: 28,
      alignItems: 'center',
    },
    infoWithCopyIcon: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    copyIconContainer: {
      position: 'absolute',
      top: 7,
      right: -16,
    },
    paymentMadeTitle: {
      marginTop: 3,
      marginBottom: 12,
    },
    bankDropdown: {
      //marginBottom: 15
    },
    bankDropdownLabel: {marginBottom: 5},
    input: {
      //marginTop: 1,
    },
    codeAndPhoneContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 4,
    },
    phoneCodeDropdown: {
      position: 'relative',
    },
    phoneContainer: {
      minWidth: 260,
    },
    dateAndDigitsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    dateInput: {
      minWidth: 110,
    },
    fourDigitsInput: {minWidth: 240},
    button: {
      marginBottom: 40,
    },
  });
};
