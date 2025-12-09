import Colors from './Colors';
import Image from './Image';

// Light theme colors
export const lightColors = {
  type: 'light',
  background: Colors.white,
  //primary: Colors.Green, // '#512DA8',
  primary: Colors.greenBackground,
  text: Colors.black,
  InputBoxBGColor: '#F7F7F7',
  statusBar: 'dark-content',
  iconColor: Colors.black,
  SearchiconColor: Colors.black,
  backiconColor: Colors.black,
  whiteOpacity08: 'rgba(255, 255, 255, 0.8)',
  disc_rate_clr: Colors.disc_rate_clr,
  animHead: Colors.White90,
  inputTextcolor: Colors.blackShade,
  placeholderTextColor: Colors.Gray,
  prodetailbackiconColor: Colors.black,
  ic_share_new: Image.ic_share,
  ic_Plus: Image.ic_plus_gray,
  profileimage: Image.ic_profile_black,
};

// Dark theme colors
export const darkColors = {
  type: 'dark',
  background: Colors.black,
  primary: Colors.Green, //'#B39DDB',
  text: Colors.white,
  InputBoxBGColor: '#393939',
  statusBar: 'light-content',
  iconColor: Colors.Gray,
  SearchiconColor: Colors.white,
  backiconColor: Colors.white,
  whiteOpacity08: 'rgba(0,0,0,0.8)',
  disc_rate_clr: Colors.white,
  animHead: Colors.black,
  inputTextcolor: Colors.white,
  placeholderTextColor: Colors.white,
  prodetailbackiconColor: Colors.a696969,
  ic_share_new: Image.ic_share_new,
  ic_Plus: Image.ic_Plus,
  profileimage: Image.ic_profile_black,
};

export const greenColors = {
  type: 'green',
  background: Colors.greenBackground,
  primary: Colors.greenBackground, // '#512DA8',
  text: Colors.black,
  InputBoxBGColor: '#F7F7F7',
  statusBar: 'dark-content',
  iconColor: Colors.black,
  SearchiconColor: Colors.black,
  backiconColor: Colors.black,
  whiteOpacity08: 'rgba(255, 255, 255, 0.8)',
  disc_rate_clr: Colors.disc_rate_clr,
  animHead: Colors.White90,
  inputTextcolor: Colors.blackShade,
  placeholderTextColor: Colors.Gray,
  prodetailbackiconColor: Colors.black,
  ic_share_new: Image.ic_share,
  ic_Plus: Image.ic_plus_gray,
  profileimage: Image.ic_profile_black,
};

//export type themeColors = typeof lightColors;
