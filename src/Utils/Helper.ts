import {Alert} from 'react-native';
import {translate} from '../locales/translate';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import DeviceInfo from 'react-native-device-info';

const Helper = {
  currencyFormat: function (num) {
    return !num
      ? '$0.00'
      : '$' + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  },
  validateEmail: email => {
    var re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  },
  getUniqueId: function () {
    console.log('DeviceInfo.getUniqueId() >>>> ', DeviceInfo.getUniqueId());
    return DeviceInfo.getUniqueId();
  },

  skeletonTimeout: 600,

  // Test Key
  // stripeKey:'pk_test_51JwtoGIAxi5SfSuoH5H2p8fZ6egQVz5UmetDo10jo8s0jDu3fqdRLwgISLGrIc2uP4WDPbxOvUCrXKWxMjjU622N00q0mF2kMG', androidPayMode: 'test',

  // Live Key
  stripeKey:
    'pk_live_51JwtoGIAxi5SfSuoLbFfCC0rkP0vji3fKe3GW5Sbt6MWOsPSoySri4qdzwrz0k1zQvtB31Czs6m1hW5evkGI9RIh00JtNvgElQ',
  androidPayMode: 'production',

  ShowAlert: (msg, title = translate('home.lbl_alert')) => {
    Alert.alert(title, msg, [
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
  },

  ShowAlertWithCallback: (msg:string,{ title = translate('home.lbl_alert'), onPress = () => console.log('OK Pressed') }) => {
    Alert.alert(title, msg, [
      { text: 'OK', onPress: onPress },
    ]);
  },



  addHourstoSystemDate: function (hours) {
    return this.addMintoSystemDate(hours * 60);
  },

  addMintoSystemDate: function (min) {
    let dateTime = new Date();
    dateTime.setMinutes(dateTime.getMinutes() + min);
    return dateTime;
  },

  HandleVibration: function () {
    const options = {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: true,
    };
    ReactNativeHapticFeedback.trigger('impactMedium', options);
  },

  productDetailImageSize: '?width=700&height=700',
  cardImageSize: '?width=600&height=600',
  gridImageSize: '?width=300&height=300',
  listImageSize: '?width=150&height=150',

  androidStoreURL:
    'https://play.google.com/store/apps/details?id=com.ivoo.android&ah=Zv6euNKd51XtsUYtJhA-MMKm4Co',
  iOSStoreURL: 'https://apps.apple.com/in/app/ivoo/id1479559802',
};

export default Helper;
