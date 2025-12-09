import {Platform, StyleSheet} from 'react-native';
import clrs from './src/Utils/Colors';

const font = 'Gilroy-Regular';
export default StyleSheet.create({
  wrapper: {
    color: clrs.blackShade,
    fontFamily: font,
    backgroundColor: clrs.white,
  },
  colorPrimary: {
    color: clrs.Green,
  },

  colorCategory: {
    color: clrs.category_font_color,
  },

  colorWhite: {
    color: clrs.white,
  },

  h1: {
    fontSize: 44,
    lineHeight: 58,
    fontFamily: font,
  },
  h2: {
    fontSize: 32,
    lineHeight: 40,
    fontFamily: 'Gilroy-Bold',
  },
  h3: {
    fontSize: 24,
    lineHeight: 28,
    fontFamily: 'Gilroy-Bold',
  },
  h4: {
    fontSize: 18,
    lineHeight: 28,
    fontFamily: 'Inter-Regular',
  },
  h5: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },

  h6: {
    fontSize: 14,
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },
  h7: {
    fontSize: 12,
    fontFamily: font,
    lineHeight: 20,
  },
  h8: {
    fontSize: 11,
    fontFamily: font,
    lineHeight: 16,
  },
  h9: {
    fontSize: 18,
    lineHeight: 28,
    fontFamily: 'Inter-Bold',
  },
  profileHeader: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: 'Gilroy-Bold',
  },

  fontNormal: {
    fontWeight: '400',
  },
  fontBasics: {
    fontWeight: '500',
  },
  fontSemiBold: {
    fontWeight: '600',
  },
  fontBold: {
    fontWeight: '700',
  },
  customfontsize: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    fontFamily: 'Gilroy-Bold',
  },
  input: {
    height: 48,
    borderRadius: 16,
    backgroundColor: clrs.SmokeWhite,
    fontSize: 16,
    lineHeight: 24,
    // paddingHorizontal: 16,
  },
  label: {
    color: clrs.Gray,
  },
  h3_otp: {
    fontSize: 24,
    fontFamily: 'Gilroy-Bold',
  },
  otp_placefont: {
    fontSize: 10,
  },
  btn: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
    fontWeight: '700',
    color: clrs.white,
  },
  btnshwdow: {
    shadowColor: clrs.Green,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    // elevation: 1,
  },
  btnStyle: {
    borderRadius: 16,
    // height: 48,
    paddingBottom: 14,
    paddingTop: 10,
  },
  btnStyle_40: {
    borderRadius: 16,
    height: 40,
  },
  btn_disabled: {
    backgroundColor: clrs.disable_clr,
    borderColor: clrs.disable_clr,
  },
  btn_primary: {
    backgroundColor: clrs.Green,
    borderColor: clrs.Green,
  },
  btn_secondary: {
    backgroundColor: clrs.NavSelectorclr,
  },
  btn_fb: {
    backgroundColor: clrs.fb_clr,
    borderColor: clrs.fb_clr,
  },
  btn_apple: {
    backgroundColor: clrs.black,
    borderColor: clrs.black,
  },
  btn_google: {
    backgroundColor: clrs.white,
    borderColor: clrs.inactiveDots,
    borderWidth: 1,
  },
  btn_mail: {
    backgroundColor: clrs.disable_clr,
    borderColor: clrs.disable_clr,
  },
  btn_full: {
    width: '100%',
  },
  // btngreay: {
  //     backgroundColor: clrs.disable_clr,
  //     color: clrs.black,
  //     justifyContent: 'center',
  //     alignItems: 'center',
  //     height: 48,
  //     lineHeight: 24,
  //     borderRadius: 16,
  //     marginBottom: 5,
  //     marginTop: 5,
  //     width: '48%',

  // },
  // btnaddcart: {
  //     backgroundColor: clrs.Green,
  //     color: clrs.white,
  //     justifyContent: 'center',
  //     alignItems: 'center',
  //     height: 48,
  //     width: '48%',
  //     lineHeight: 24,
  //     borderRadius: 16,
  //     marginBottom: 5,
  //     marginTop: 5,

  // },

  profileContainer: {
    backgroundColor: clrs.SmokeWhite,
    justifyContent: 'center',
    alignContent: 'center',
    borderRadius: 16,
  },

  profileOptionIcons: {
    height: 24,
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  profile_icon_image: {
    height: 24,
    aspectRatio: 1,
    resizeMode: 'contain',
  },

  BottomGreenButtonContainer: {
    backgroundColor: clrs.Green,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    height: 48,
  },

  titlePageHeaderText: {color: clrs.black, padding: 0},
  productListcontentContainerStyle: {
    paddingVertical: 20,
    alignItems: 'flex-start',
  },
  productCardMainContainer: {flex: 1, marginBottom: 20, zIndex: 1},
  wishlistImage: {position: 'absolute', top: 8, left: 8},

  productCardImageContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    overflow: 'hidden',
    backgroundColor: clrs.white,
    position: 'relative',
    borderRadius: 16,
    justifyContent: 'center',
  },
  productDetailNavContainer: {
    flex: 0.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  productDetailNavSelection: {backgroundColor: clrs.NavSelectorclr},

  // Submit Buttons // password -- newpassword -- forgotpassword -- changemobile
  buttonViewStyles: {position: 'absolute', bottom: 25, width: '100%'},

  unAuth_MainContainer: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 16,
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 40 : 40,
  }, // password -- newpassword -- forgotpassword -- changemobile --mobileverification -- email -- create Account

  fontSize_18: {fontSize: 18},

  he_wi_100per: {
    width: '100%',
    height: Platform.OS == 'android' ? '100%' : '100%',
    alignSelf: 'center',
  },
  he_wi_15: {width: 15, height: 15},
  he_wi_24: {width: 24, height: 24},
  he_wi_30: {width: 30, height: 30},
  he_wi_35: {width: 35, height: 35},
  he_wi_40: {width: 40, height: 40},
  he_wi_88: {width: 88, height: 88},
  he_wi_130: {width: 130, height: 130},
  he_wi_150: {width: 150, height: 150},
  he_wi_170: {width: 170, height: 170},
  he_wi_240: {width: 240, height: 240},

  he_wi_100per_custom: {
    width: '100%',
    height: Platform.OS == 'android' ? '50%' : '100%',
  },

  minHeight_100: {minHeight: 100},

  maxWidth_75Per: {maxWidth: '75%'},
  Width_100Per: {width: '100%'},

  flex_1pt: {flex: 0.1},
  flex_2pt: {flex: 0.2},
  flex_3pt: {flex: 0.3},
  flex_4pt: {flex: 0.4},
  flex_5pt: {flex: 0.5},
  flex_7pt: {flex: 0.7},
  flex_15pt: {flex: 0.15},
  flex_85pt: {flex: 0.85},

  flex_1: {flex: 1},

  justifyContent_Center: {justifyContent: 'center'},
  justifyContent_flex_start: {justifyContent: 'flex-start'},
  justifyContent_flex_end: {justifyContent: 'flex-end'},
  justifyContent_space_around: {justifyContent: 'space-around'},
  justifyContent_space_evenly: {justifyContent: 'space-evenly'},
  justifyContent_space_between: {justifyContent: 'space-between'},

  flexDir_Row: {flexDirection: 'row'},
  flexDir_Row_reverse: {flexDirection: 'row-reverse'},
  flexDir_col: {flexDirection: 'column'},
  flexDir_col_reverse: {flexDirection: 'column-reverse'},

  padding_5: {padding: 5},
  padding_8: {padding: 8},
  padding_10: {padding: 10},
  padding_12: {padding: 12},
  padding_15: {padding: 15},
  padding_16: {padding: 16},
  padding_24: {padding: 24},

  paddingHome_24: {paddingLeft: 24, paddingRight: 24},

  margin_left_24: {marginLeft: 24},
  margin_left_16: {marginLeft: 16},
  margin_left_0: {marginLeft: 0},

  paddingLeft_13: {paddingLeft: 13},
  paddingLeft_10: {paddingLeft: 10},

  paddingBottom_16: {paddingBottom: 16},
  paddingBottom_50: {paddingBottom: 50},
  paddingBottom_400: {paddingBottom: 400},

  margin_8: {margin: 8},
  margin_16: {margin: 16},
  margin_24: {margin: 24},

  marginTop_2: {marginTop: 2},
  marginTop_5: {marginTop: 5},
  marginTop_8: {marginTop: 8},
  marginTop_16: {marginTop: 16},
  marginTop_30: {marginTop: 30},
  marginTop_25: {marginTop: 25},
  marginTop_20: {marginTop: 20},
  marginTop_40: {marginTop: 40},

  marginHorizontal_10: {marginHorizontal: 10},
  margin_horizontal_16: {marginHorizontal: 16},

  marginBottom_10: {marginBottom: 10},
  marginBottom_15: {marginBottom: 15},
  marginBottom_20: {marginBottom: 20},
  marginBottom_24: {marginBottom: 24},
  marginBottom_30: {marginBottom: 30},
  marginBottom_60: {marginBottom: 60},

  paddingRight_8: {paddingRight: 8},
  paddingRight_10: {paddingRight: 15},
  paddingRight_12: {paddingRight: 12},

  marginRight_10: {marginRight: 10},
  marginRight_20: {marginRight: 20},
  marginRight_40: {marginRight: 40},

  marginVertical_8: {marginVertical: 8},
  marginVertical_10: {marginVertical: 10},
  marginVertical_20: {marginVertical: 20},

  paddingVertical_20: {paddingVertical: 20},

  paddingHorizontal_24: {paddingHorizontal: 24},
  paddingHorizontal_16: {paddingHorizontal: 16},
});
