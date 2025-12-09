import {StyleSheet} from 'react-native';
import Config from 'react-native-config';



 

// Export colors with fallback
export const COLORS: any = {}


export const FONTS = {
  ralewayBold: 'Raleway-Bold',
  ralewaySemiBold: 'Raleway-SemiBold',
  ralewayRegular: 'Raleway-Regular',
  poppinsRegular: 'Poppins-Regular',
  poppinsSemiBold: 'Poppins-SemiBold',
  poppinsBold: 'Poppins-Bold',
  urbanistRegular: 'Urbanist-Regular',
  urbanistSemiBold: 'Urbanist-SemiBold',
  urbanistBold: 'Urbanist-Bold',
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONTS.ralewayBold,
    fontSize: 32,
    color: COLORS.greyDark,
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: {
    fontFamily: FONTS.poppinsRegular,
    fontSize: 18,
    paddingHorizontal: 20,
    color: COLORS.textGrey,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#F5F5F5',
    fontFamily: FONTS.poppinsRegular,
    color: COLORS.greyDark,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primaryBlue,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 40,
  },
  buttonTextPrimary: {
    fontFamily: FONTS.ralewayBold,
    fontSize: 16,
    color: COLORS.white,
  },
  googleButton: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  googleButtonText: {
    fontFamily: FONTS.poppinsRegular,
    fontSize: 16,
    color: COLORS.greyDark,
    marginLeft: 8,
  },
  footerText: {
    fontFamily: FONTS.poppinsRegular,
    color: COLORS.greyLight,
    textAlign: 'center',
    marginTop: 20,
  },
  createAccountText: {
    fontFamily: FONTS.ralewayBold,
    color: COLORS.primaryBlue,
  },
});








