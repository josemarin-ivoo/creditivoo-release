import type {ExtendedTheme} from '@react-navigation/native';
import {ImageStyle, StyleSheet, ViewStyle} from 'react-native';

interface Style {
  headerContainer: ViewStyle;
  brandContainer: ViewStyle;
  logo: ImageStyle;
  goBackToggle: ViewStyle;
  totalAmountContainer: ViewStyle;
  installmentsContainer: ViewStyle;
  installmentLeftCont: ViewStyle;
  installmentIcon: ViewStyle;
  installmentDescrip: ViewStyle;
  arrowContainer: ViewStyle;
  arrowLogo: ViewStyle;
  button: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const {colors} = theme;
  return StyleSheet.create<Style>({
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginLeft: 8,
      marginTop: 8,
      marginBottom: 20,
    },
    brandContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logo: {
      width: 43,
      height: 43,
      marginRight: 16,
    },
    goBackToggle: {
      marginRight: 8,
    },
    totalAmountContainer: {
      justifyContent: 'center',
      //alignItems: 'center',
      width: '100%',
      height: 42,
      backgroundColor: colors.primary21,
      borderRadius: 8,
      marginTop: 10,
      paddingLeft: 16,
    },
    installmentsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
    },
    installmentLeftCont: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    installmentIcon: {
      backgroundColor: '#03004D',
      width: 32,
      height: 32,
      borderRadius: 5,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    installmentDescrip: {
      marginLeft: 6,
    },
    arrowContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    arrowLogo: {
      marginRight: 2,
    },
    button: {
      marginVertical: 10,
    },
  });
};
