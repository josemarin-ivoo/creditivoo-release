import {useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import commonStyle from '../../../../../commonStyle';
import {useDispatch, useSelector} from 'react-redux';
import {translate} from '../../../../locales';
import ResImage from '../../../../Utils/Image';
import colorResource from '../../../../Utils/Colors';
import CustomInput from '../../../../Components/CustomInput';
import {CustomButton} from '../../../../Components/CustomButton';
import CustomPBar from '../../../../Components/CustomPBar';
import {GetCards, saveCard} from '../../../../Queries/queries';
import Helper from '../../../../Utils/Helper';
import CommonHandlers from '../../../../Utils/CommonHandlers';

// import Stripe from 'tipsi-stripe';
import {Icon} from 'react-native-elements';

import {AppContext} from '../../../AppContext';
import analytics from '@react-native-firebase/analytics';
import TrackEvents from '../../../../Utils/TrackingEvent';
import {AddPAYCards} from './../../../../redux/PaymentMethodsReducers/PaymentMethodsAction';
import {useLazyQuery} from '@apollo/client';
import {AnalyticsAddPaymentInfo} from './../../../../helpers/analyticHelper';

// Stripe.setOptions({
//   publishableKey: Helper.stripeKey,
//   androidPayMode: Helper.androidPayMode,
// });
export const removeNonNumber = (string = '') => string.replace(/[^\d]/g, '');

const AddPaymentMethod = props => {
  const {appTheme} = useContext(AppContext);
  const [isDark, setDark] = useState(appTheme.type === 'dark');

  useEffect(() => {
    setDark(appTheme.type === 'dark');
  }, [appTheme.type]);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [CardNumber, setCardNumber] = useState('');
  const [expiryDate, setexpiryDate] = useState('');
  const [cvvText, setcvv] = useState('');
  const [
    GetCardsD,
    {loading: cardDataload, error: cardDataerr, data: cardData},
  ] = useLazyQuery(GetCards);

  const [SavecardData, {loading, error, data}] = saveCard();
  const [keyboardStatus, setKeyboardStatus] = useState(false);

  useEffect(() => {
    CommonHandlers.CommonErrorHandler(error, dispatch, navigation);
  }, [error]);

  const SaveCardDetails = async () => {
    Helper.HandleVibration();

    if (btn_enable) {
      return;
    }

    Keyboard.dismiss();
    // try {
    //   await Stripe.createPaymentMethod({
    //     card: {
    //       number: CardNumber,
    //       cvc: cvvText,
    //       expMonth: Number(expiryDate.split('/')[0]),
    //       expYear: Number(expiryDate.split('/')[1]),
    //     },
    //   }).then(function (result) {
    //     SavecardData({
    //       variables: {
    //         token: result.id,
    //       },
    //     });
    //   });
    // } catch (e) {
    //   Helper.ShowAlert(e.message);
    // }
  };

  useEffect(() => {
    if (data) {
      console.log('====================================');
      console.log(JSON.stringify(data));
      console.log('====================================');
      //AnalyticsEvent( TrackEvents.add_payment_info, { 'userEmail': global_data.email, 'brand ': data.saveCard.brand, 'exp_year': data.saveCard.exp_year, 'exp_month': data.saveCard.exp_month } );

      AnalyticsAddPaymentInfo(data.saveCard.brand);
      GetCardsD();
    }
  }, [data]);

  useEffect(() => {
    if (cardData) {
      dispatch(AddPAYCards(cardData));

      props.CloseBottomsheet();
    }
  }, [cardData]);

  const cardNumberUpdate = value => {
    setCardNumber(
      value
        .replace(/\s?/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim(),
    );
  };

  const expiryDateUpdate = value => {
    const clearValue = value.replace(/\D+/g, '');
    let nValue = '';
    if (clearValue.length >= 3) {
      nValue = `${clearValue.slice(0, 2)}/${clearValue.slice(2, 6)}`;
    } else {
      nValue = clearValue;
    }
    setexpiryDate(nValue);
  };
  const CvvUpdate = value => {
    setcvv(value);
  };

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardStatus(true);
    });
    Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardStatus(false);
    });

    // cleanup function
    return () => {
      Keyboard.addListener('keyboardDidShow', () => {
        setKeyboardStatus(true);
      });
      Keyboard.addListener('keyboardDidHide', () => {
        setKeyboardStatus(false);
      });
    };
  }, []);

  useEffect(() => {
    checkAll();
  }, [CardNumber, expiryDate, cvvText]);

  const [btn_enable, setBtnEnable] = useState(false);

  const checkAll = () => {
    if (CardNumber && expiryDate && cvvText) {
      setBtnEnable(false);
    } else {
      setBtnEnable(true);
    }
  };

  return (
    <SafeAreaView
      style={[
        {
          flex: 1,
          backgroundColor: appTheme.background,
          borderTopLeftRadius: isDark ? 0 : 24,
          borderTopRightRadius: isDark ? 0 : 24,
        },
      ]}>
      <View style={styles.headerWrap}>
        <View style={styles.ButtonViewStyles}>
          <TouchableHighlight
            onPress={() => {
              Helper.HandleVibration();
              props.CloseBottomsheet();
            }}
            underlayColor={colorResource.transparent}
            style={{padding: 5}}>
            <Icon
              name="times"
              type="font-awesome-5"
              size={24}
              color={isDark ? colorResource.white : colorResource.black}
            />
          </TouchableHighlight>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{padding: 16, flex: 1}}
        behavior={'height'}
        enabled={Platform.OS === 'ios' ? false : true}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{paddingHorizontal: 12, flex: 1}}>
            <SafeAreaView style={{flex: 1, marginBottom: 8}}>
              <ScrollView
                contentContainerStyle={[
                  commonStyle.wrapper,
                  {backgroundColor: appTheme.background},
                ]}
                keyboardShouldPersistTaps="handled">
                <Text
                  style={[
                    commonStyle.h2,
                    commonStyle.fontBold,
                    {
                      marginBottom: 18,
                      color: isDark
                        ? colorResource.disable_clr
                        : colorResource.black,
                    },
                  ]}>
                  {translate('payment.lbl_credit_page_title')}
                </Text>

                <View style={[commonStyle.flex_1]}>
                  <Text
                    style={[
                      commonStyle.h6,
                      {
                        color: isDark
                          ? colorResource.disable_clr
                          : colorResource.Gray,
                      },
                    ]}>
                    {translate('payment.lbl_credt_card_title')}
                  </Text>
                  <CustomInput
                    maxLength={19}
                    value={CardNumber}
                    onChangeText={value => cardNumberUpdate(value)}
                    keyboardType="number-pad"
                    placeholder="payment.lbl_credit_card_placeholder"
                    autoCapitalize="none"
                  />

                  <View style={styles.CodeContainer}>
                    <View style={styles.itemStyle}>
                      <Text
                        style={[
                          commonStyle.h6,
                          {
                            color: isDark
                              ? colorResource.disable_clr
                              : colorResource.Gray,
                          },
                        ]}>
                        {translate('addpayment.lbl_expiration_date')}
                      </Text>
                      <CustomInput
                        maxLength={7}
                        value={expiryDate}
                        onChangeText={value => expiryDateUpdate(value)}
                        placeholder="payment.lbl_date_placeholder"
                        autoCapitalize="none"
                        keyboardType="number-pad"
                      />
                    </View>
                    <View style={[styles.itemStyle, {marginLeft: 8}]}>
                      <Text
                        style={[
                          commonStyle.h6,
                          {
                            color: isDark
                              ? colorResource.disable_clr
                              : colorResource.Gray,
                          },
                        ]}>
                        CVV
                      </Text>
                      <CustomInput
                        secureTextEntry={true}
                        maxLength={3}
                        value={cvvText}
                        onChangeText={value => CvvUpdate(value)}
                        keyboardType="number-pad"
                        placeholder="payment.lbl_cvv_code"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>
                </View>
              </ScrollView>
            </SafeAreaView>

            {!keyboardStatus && (
              <View style={{bottom: 25, width: '100%'}}>
                <CustomButton
                  title="payment.lbl_save_credit"
                  // disabled={btn_enable}
                  onPress={SaveCardDetails}
                  customButtonStyle={[
                    btn_enable
                      ? (commonStyle.btn_disabled,
                        isDark
                          ? {backgroundColor: colorResource.a1E1E1E}
                          : commonStyle.btn_disabled)
                      : commonStyle.btn_primary,
                  ]}
                  customTitleStyle={[
                    btn_enable ? {color: colorResource.a3E3E3E} : null,
                  ]}
                />
              </View>
            )}
            <CustomPBar showProgress={loading} />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  CodeContainer: {
    marginTop: 18,

    flexDirection: 'row',
    alignItems: 'center',
  },
  itemStyle: {
    flex: 1,
  },
  mainContainer: {
    marginBottom: 34,
    marginTop: 24,
    flexDirection: 'row',
    width: 246,
    alignContent: 'flex-start',
    justifyContent: 'space-between',
  },
  titleText: {
    color: colorResource.black,
    backgroundColor: colorResource.white,
    marginTop: 32,
    marginBottom: 18,
  },
  ButtonViewStyles: {
    flex: 0.1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerWrap: {
    flexDirection: 'row',
    paddingTop: 25,
    paddingHorizontal: 24,
  },
  shareViewStyles: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginLeft: 'auto',
    flexDirection: 'row',
  },
});

export default AddPaymentMethod;
