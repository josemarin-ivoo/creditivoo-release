import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
} from 'react-native';
import commonStyle from '../../../../../commonStyle';
import {useSelector} from 'react-redux';
import ResImage from '../../../../Utils/Image';
import ResColor from '../../../../Utils/Colors';
import {CustomButton} from '../../../../Components/CustomButton';
import CustomPBar from '../../../../Components/CustomPBar';
import Helper from '../../../../Utils/Helper';
import {ActionSheetCustom as ActionSheet} from '../../../../Components/CustomeActionSheet/lib';
import {Icon} from 'react-native-elements';
import CustomInput from '../../../../Components/CustomInput';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {
  setPaymentMethodOnCartBanesco,
  setPaymentMethodOnCartbankTransfer,
  setPaymentMethodOnCartMovil,
  setPaymentMethodOnCartPaypal,
  setPaymentMethodOnCartZelle,
} from '../../../../Queries/queries';
import {AppContext} from '../../../AppContext';
import {CopyControl} from './../../../../Components/CopyControl';
import {PriceControl} from './../../../../Components/PriceControl';

const NewPaySlips = props => {
  const [pageTitle, setpageTitle] = useState('');
  const [DocId, setDocId] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [adviceCount, setadviceCount] = useState(0);
  const [imageData, setimageData] = useState<any>([]);

  const actionSheetRef = useRef<any>(null);

  const options = [
    'Tomar la foto',
    'Seleccionar imagen',
    <Text style={{color: 'red'}}>Cancelar</Text>,
  ];

  const [
    setmovil,
    {loading: movilLoading, error: movilError, data: movilData},
  ] = setPaymentMethodOnCartMovil();
  const [
    setzelle,
    {loading: zelleLoading, error: zelleError, data: zelleData},
  ] = setPaymentMethodOnCartZelle();
  const [
    setbanesco,
    {loading: banescoLoading, error: banescoError, data: banescoData},
  ] = setPaymentMethodOnCartBanesco();
  const [
    setbankTransfer,
    {
      loading: bankTransferLoading,
      error: bankTransferError,
      data: bankTransferData,
    },
  ] = setPaymentMethodOnCartbankTransfer();
  const [
    setpaypal,
    {loading: paypalLoading, error: paypalError, data: paypalData},
  ] = setPaymentMethodOnCartPaypal();

  const StoreConfig_data = useSelector(
    (state: any) => state.StoreConfigReducer,
  );

  const [CachepayMethodData, setCachepayMethodData] = useState<any>();

  useEffect(() => {
    setCachepayMethodData(StoreConfig_data.storeConfig.storeConfig.storeConfig);
  }, []);

  useEffect(() => {
    if (movilError) {
      movilError && Helper.ShowAlert(`${movilError}`);
    } else if (zelleError) {
      zelleError && Helper.ShowAlert(`${zelleError}`);
    } else if (bankTransferError) {
      bankTransferError && Helper.ShowAlert(`${bankTransferError}`);
    } else if (paypalError) {
      paypalError && Helper.ShowAlert(`${paypalError}`);
    } else if (banescoError) {
      banescoError && Helper.ShowAlert(`${banescoError}`);
    }
  }, [movilError, zelleError, bankTransferError, paypalError, banescoError]);

  useEffect(() => {
    if (props.payMethodData) {
      switch (props.payType) {
        case 'zelle':
          setpageTitle(
            props.payMethodData.customerCart.available_payment_methods.find(
              item => 'zelle' === item.code,
            )?.title,
          );
          break;
        case 'movil':
          setpageTitle(
            props.payMethodData.customerCart.available_payment_methods.find(
              item => 'movil' === item.code,
            )?.title,
          );
          break;
        case 'hs_bank_transfer':
          setpageTitle(
            props.payMethodData.customerCart.available_payment_methods.find(
              item => 'hs_bank_transfer' === item.code,
            )?.title,
          );
          break;
        case 'hs_paypal':
          setpageTitle(
            props.payMethodData.customerCart.available_payment_methods.find(
              item => 'hs_paypal' === item.code,
            )?.title,
          );
        case 'banesco':
          setpageTitle(
            props.payMethodData.customerCart.available_payment_methods.find(
              item => 'banesco' === item.code,
            )?.title,
          );
          break;
          break;
        default:
          break;
      }
    }
  }, []);

  const processPictures = index => {
    console.log(index);
    Helper.HandleVibration();

    switch (index) {
      case 0:
        setTimeout(() => {
          launchCamera(
            {
              saveToPhotos: false,
              mediaType: 'photo',
              includeBase64: true,
              // maxHeight: 400,
              // maxWidth: 400,
            },
            (response: any) => {
              console.log(response);
              if (response.didCancel) {
                console.log(' Photo picker didCancel');
              } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
              } else {
                setResponse(response);
              }
            },
          );
        }, 200);
        break;
      case 1:
        setTimeout(() => {
          launchImageLibrary(
            {
              // maxWidth: 400, maxHeight: 400,
              // selectionLimit: adviceCount == 1 ? 1 : 2,
              mediaType: 'photo',
              includeBase64: true,
            },
            (response: any) => {
              // console.log({ response });
              if (response.didCancel) {
                console.log(' Photo picker didCancel');
              } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
              } else {
                setResponse(response);
              }
            },
          );
        }, 200);
        break;
      default:
        break;
    }
  };

  const processToUploadImage = () => {
    Helper.HandleVibration();
    if (props.payType == 'movil') {
      let arrTemp: any = [];
      let image = 'data:' + imageData[0].type + ',' + imageData[0].base64;
      arrTemp.push(image);
      if (imageData.length == 2) {
        let image1 = 'data:' + imageData[1].type + ',' + imageData[1].base64;
        arrTemp.push(image1);
      }
      setmovil({
        variables: {
          cart_id: props.cartid,
          payment_methodCode: 'movil',
          image1: arrTemp,
        },
      });
    } else if (props.payType == 'zelle') {
      let arrTemp: any = [];
      let image = 'data:' + imageData[0].type + ',' + imageData[0].base64;
      arrTemp.push(image);
      if (imageData.length == 2) {
        let image1 = 'data:' + imageData[1].type + ',' + imageData[1].base64;
        arrTemp.push(image1);
      }

      setzelle({
        variables: {
          cart_id: props.cartid,
          payment_methodCode: 'zelle',
          image1: arrTemp,
        },
      });
    } else if (props.payType == 'banesco') {
      let arrTemp: any = [];
      let image = 'data:' + imageData[0].type + ',' + imageData[0].base64;
      arrTemp.push(image);
      if (imageData.length == 2) {
        let image1 = 'data:' + imageData[1].type + ',' + imageData[1].base64;
        arrTemp.push(image1);
      }

      setbanesco({
        variables: {
          cart_id: props.cartid,
          payment_methodCode: 'banesco',
          image1: arrTemp,
        },
      });
    } else if (props.payType == 'hs_bank_transfer') {
      let arrTemp: any = [];
      let image = 'data:' + imageData[0].type + ',' + imageData[0].base64;
      arrTemp.push(image);
      if (imageData.length == 2) {
        let image1 = 'data:' + imageData[1].type + ',' + imageData[1].base64;
        arrTemp.push(image1);
      }
      setbankTransfer({
        variables: {
          cart_id: props.cartid,
          payment_methodCode: 'hs_bank_transfer',
          image1: arrTemp,
          document_id: DocId,
        },
      });
    } else if (props.payType == 'hs_paypal') {
      let arrTemp: any = [];
      let image = 'data:' + imageData[0].type + ',' + imageData[0].base64;
      arrTemp.push(image);
      if (imageData.length == 2) {
        let image1 = 'data:' + imageData[1].type + ',' + imageData[1].base64;
        arrTemp.push(image1);
      }
      setpaypal({
        variables: {
          cart_id: props.cartid,
          payment_methodCode: 'hs_paypal',
          image1: arrTemp,
        },
      });
    }
  };

  useEffect(() => {
    paypalData && props.CardSaved('hs_paypal');
  }, [paypalData]);

  useEffect(() => {
    bankTransferData && props.CardSaved('hs_bank_transfer');
  }, [bankTransferData]);

  useEffect(() => {
    zelleData && props.CardSaved('zelle');
  }, [zelleData]);

  useEffect(() => {
    banescoData && props.CardSaved('banesco');
  }, [banescoData]);

  useEffect(() => {
    movilData && props.CardSaved('movil');
  }, [movilData]);

  useEffect(() => {
    response !== null &&
      'assets' in response &&
      (imageData.length == 0
        ? (setadviceCount(response.assets.length),
          setimageData(response.assets))
        : (setadviceCount(ad => ad + 1),
          setimageData(oldArray => [response.assets[0], ...oldArray])));
  }, [response]);

  const {appTheme} = useContext<any>(AppContext);
  const [isDark, setDark] = useState(appTheme.type === 'dark');

  useEffect(() => {
    setDark(appTheme.type === 'dark');
  }, [appTheme.type]);

  return (
    <SafeAreaView
      style={[
        styles.mainContainer,
        {backgroundColor: appTheme.background},
        isDark
          ? {}
          : {
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
            },
      ]}>
      <View style={styles.headerWrap}>
        <View style={[styles.ButtonViewStyles, {marginLeft: -13}]}>
          <TouchableHighlight
            onPress={() => {
              Helper.HandleVibration();
              props.CloseBottomsheet();
            }}
            underlayColor={ResColor.transparent}
            style={{padding: 5}}>
            <Icon
              name="times"
              type="font-awesome-5"
              size={24}
              color={isDark ? ResColor.white : ResColor.black}
            />
          </TouchableHighlight>
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{marginBottom: 105, marginHorizontal: 22}}>
          <Text
            style={[
              commonStyle.h2,
              commonStyle.fontBold,
              styles.titleTextwithmodal,
              {color: appTheme.text},
            ]}>
            {pageTitle}
          </Text>
          {
            //Zelle
            props.payType == 'zelle' && (
              <View style={{marginTop: 15}}>
                <Text
                  style={[
                    commonStyle.h3,
                    commonStyle.fontBold,
                    styles.titleTextwithmodal,
                    {color: appTheme.text},
                  ]}>
                  Pasos para realizar un Zelle
                </Text>
                <View
                  style={{
                    backgroundColor: appTheme.InputBoxBGColor,
                    borderRadius: 10,
                    padding: 20,
                  }}>
                  <View style={[commonStyle.flexDir_Row]}>
                    <View style={[styles.numberContainer, {marginTop: 10}]}>
                      <Text
                        style={[
                          commonStyle.h4,
                          commonStyle.fontBold,
                          styles.numberText,
                        ]}>
                        1
                      </Text>
                    </View>
                    {CachepayMethodData && (
                      <View style={{marginLeft: 15}}>
                        <Text
                          style={[
                            commonStyle.h5,
                            commonStyle.fontBold,
                            {color: appTheme.text, marginRight: 25},
                          ]}>
                          {CachepayMethodData.zelle_step1_title}
                        </Text>

                        <Text
                          style={[
                            commonStyle.h5,
                            commonStyle.fontBold,
                            {
                              color: ResColor.Gray,
                              marginTop: 5,
                              marginRight: 25,
                            },
                          ]}>
                          {CachepayMethodData.zelle_step1_description}
                        </Text>
                        <View style={{alignItems: 'flex-start', marginTop: 10}}>
                          <CopyControl
                            desc={CachepayMethodData.zelle_step1_description}
                          />
                          {/* <Icon
                                            name="copy"
                                            type="font-awesome-5" size={24}
                                            color={ResColor.Green}
                                        /> */}
                        </View>
                      </View>
                    )}
                  </View>

                  <View style={[commonStyle.flexDir_Row, {marginTop: 20}]}>
                    <View style={styles.numberContainer}>
                      <Text
                        style={[
                          commonStyle.h4,
                          commonStyle.fontBold,
                          styles.numberText,
                        ]}>
                        2
                      </Text>
                    </View>
                    <View style={{marginLeft: 15}}>
                      <Text
                        style={[
                          commonStyle.h5,
                          commonStyle.fontBold,
                          {color: appTheme.text, marginRight: 25},
                        ]}>
                        {CachepayMethodData &&
                          CachepayMethodData.zelle_step2_title}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )
          }
          {
            //banesco - Banesco Panamá
            props.payType == 'banesco' && (
              <View style={{marginTop: 15}}>
                <Text
                  style={[
                    commonStyle.h3,
                    commonStyle.fontBold,
                    styles.titleTextwithmodal,
                    {color: appTheme.text},
                  ]}>
                  Pasos para realizar Banesco Panamá
                </Text>
                <View
                  style={{
                    backgroundColor: appTheme.InputBoxBGColor,
                    borderRadius: 10,
                    padding: 20,
                  }}>
                  <View style={[commonStyle.flexDir_Row]}>
                    <View style={[styles.numberContainer, {marginTop: 10}]}>
                      <Text
                        style={[
                          commonStyle.h4,
                          commonStyle.fontBold,
                          styles.numberText,
                        ]}>
                        1
                      </Text>
                    </View>
                    {CachepayMethodData && (
                      <View style={{marginLeft: 15}}>
                        <Text
                          style={[
                            commonStyle.h5,
                            commonStyle.fontBold,
                            {color: appTheme.text, marginRight: 25},
                          ]}>
                          {CachepayMethodData.banesco_step1_title}
                        </Text>

                        <Text
                          style={[
                            commonStyle.h5,
                            commonStyle.fontBold,
                            {
                              color: ResColor.Gray,
                              marginTop: 5,
                              marginRight: 25,
                            },
                          ]}>
                          {CachepayMethodData.banesco_step1_description}
                        </Text>
                        <View style={{alignItems: 'flex-start', marginTop: 10}}>
                          <CopyControl
                            desc={CachepayMethodData.banesco_step1_description}
                          />
                          {/* <Icon
                                            name="copy"
                                            type="font-awesome-5" size={24}
                                            color={ResColor.Green}
                                        /> */}
                        </View>
                      </View>
                    )}
                  </View>

                  <View style={[commonStyle.flexDir_Row, {marginTop: 20}]}>
                    <View style={styles.numberContainer}>
                      <Text
                        style={[
                          commonStyle.h4,
                          commonStyle.fontBold,
                          styles.numberText,
                        ]}>
                        2
                      </Text>
                    </View>
                    <View style={{marginLeft: 15}}>
                      <Text
                        style={[
                          commonStyle.h5,
                          commonStyle.fontBold,
                          {color: appTheme.text, marginRight: 25},
                        ]}>
                        {CachepayMethodData &&
                          CachepayMethodData.banesco_step2_title}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )
          }
          {
            //Paypal
            props.payType == 'hs_paypal' && (
              <View style={{marginTop: 15}}>
                <Text
                  style={[
                    commonStyle.h3,
                    commonStyle.fontBold,
                    styles.titleTextwithmodal,
                    {color: appTheme.text},
                  ]}>
                  Pasos pagar desde Paypal
                </Text>
                <View
                  style={{
                    backgroundColor: appTheme.InputBoxBGColor,
                    borderRadius: 10,
                    padding: 20,
                  }}>
                  <View style={[commonStyle.flexDir_Row]}>
                    <View style={[styles.numberContainer, {marginTop: 10}]}>
                      <Text
                        style={[
                          commonStyle.h4,
                          commonStyle.fontBold,
                          styles.numberText,
                        ]}>
                        1
                      </Text>
                    </View>
                    {CachepayMethodData && (
                      <View style={{marginLeft: 15}}>
                        <Text
                          style={[
                            commonStyle.h5,
                            commonStyle.fontBold,
                            {color: appTheme.text, marginRight: 25},
                          ]}>
                          {CachepayMethodData.hs_paypal_step1_title}
                        </Text>
                        <Text
                          style={[
                            commonStyle.h5,
                            commonStyle.fontBold,
                            {
                              color: ResColor.Gray,
                              marginTop: 5,
                              marginRight: 25,
                            },
                          ]}>
                          {CachepayMethodData.hs_paypal_step1_description}
                        </Text>
                        <View style={{alignItems: 'flex-start', marginTop: 10}}>
                          <CopyControl
                            desc={
                              CachepayMethodData.hs_paypal_step1_description
                            }
                          />
                          {/* <Icon
                                            name="copy"
                                            type="font-awesome-5" size={24}
                                            color={ResColor.Green}
                                        /> */}
                        </View>
                      </View>
                    )}
                  </View>
                  <View style={[commonStyle.flexDir_Row, {marginTop: 20}]}>
                    <View style={styles.numberContainer}>
                      <Text
                        style={[
                          commonStyle.h4,
                          commonStyle.fontBold,
                          styles.numberText,
                        ]}>
                        2
                      </Text>
                    </View>
                    <View style={{marginLeft: 15}}>
                      <Text
                        style={[
                          commonStyle.h5,
                          commonStyle.fontBold,
                          {color: appTheme.text, marginRight: 25},
                        ]}>
                        {CachepayMethodData &&
                          CachepayMethodData.hs_paypal_step2_title}
                      </Text>
                      <Text
                        style={[
                          commonStyle.h5,
                          commonStyle.fontBold,
                          {color: ResColor.Gray, marginTop: 5, marginRight: 25},
                        ]}>
                        {CachepayMethodData &&
                          CachepayMethodData.hs_paypal_step2_description}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )
          }
          {
            // Movil and Bolivers
            props.payType == 'movil' && (
              <View style={{marginTop: 15}}>
                <Text
                  style={[
                    commonStyle.h3,
                    commonStyle.fontBold,
                    styles.titleTextwithmodal,
                    {color: appTheme.text},
                  ]}>
                  Pasos para realizar un Pago Movil
                </Text>

                <View
                  style={{
                    backgroundColor: appTheme.InputBoxBGColor,
                    borderRadius: 10,
                    padding: 20,
                  }}>
                  <View style={[commonStyle.flexDir_Row]}>
                    <View style={[styles.numberContainer, {marginTop: 10}]}>
                      <Text
                        style={[
                          commonStyle.h4,
                          commonStyle.fontBold,
                          styles.numberText,
                        ]}>
                        1
                      </Text>
                    </View>
                    {CachepayMethodData && (
                      <View style={{marginLeft: 15}}>
                        <Text
                          style={[
                            commonStyle.h5,
                            commonStyle.fontBold,
                            {color: appTheme.text, marginRight: 25},
                          ]}>
                          {CachepayMethodData.movil_step1_title}
                        </Text>

                        <Text
                          style={[
                            commonStyle.h5,
                            commonStyle.fontBold,
                            {
                              color: ResColor.Gray,
                              marginTop: 5,
                              marginRight: 25,
                            },
                          ]}>
                          {CachepayMethodData.movil_step1_description}
                        </Text>
                        <View style={{alignItems: 'flex-start', marginTop: 10}}>
                          <CopyControl
                            desc={CachepayMethodData.movil_step1_description}
                          />
                          {/* <Icon
                                            name="copy"
                                            type="font-awesome-5" size={24}
                                            color={ResColor.Green}
                                        /> */}
                        </View>
                      </View>
                    )}
                  </View>
                  <View style={[commonStyle.flexDir_Row, {marginTop: 20}]}>
                    <View style={styles.numberContainer}>
                      <Text
                        style={[
                          commonStyle.h4,
                          commonStyle.fontBold,
                          styles.numberText,
                        ]}>
                        2
                      </Text>
                    </View>
                    <View style={{marginLeft: 15}}>
                      <Text
                        style={[
                          commonStyle.h5,
                          commonStyle.fontBold,
                          {color: appTheme.text, marginRight: 25},
                        ]}>
                        {CachepayMethodData &&
                          CachepayMethodData.movil_step2_title}
                      </Text>
                      <Text
                        style={[
                          commonStyle.h5,
                          commonStyle.fontBold,
                          {color: ResColor.Gray, marginTop: 5, marginRight: 25},
                        ]}>
                        {CachepayMethodData &&
                          CachepayMethodData.movil_step2_description}
                      </Text>
                    </View>
                  </View>
                  <View style={[commonStyle.flexDir_Row, {marginTop: 20}]}>
                    <Image style={{marginTop: 10}} source={ResImage.ic_exal} />
                    <View style={{marginLeft: 15, marginRight: 25}}>
                      <Text
                        style={[
                          commonStyle.h5,
                          commonStyle.fontBold,
                          {color: ResColor.Gray},
                        ]}>
                        {CachepayMethodData &&
                          CachepayMethodData.movil_warning_description}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )
          }
          {
            // Bolivers
            props.payType == 'hs_bank_transfer' && (
              <>
                <View style={{marginTop: 15}}>
                  <Text
                    style={[
                      commonStyle.h3,
                      commonStyle.fontBold,
                      styles.titleTextwithmodal,
                      {color: appTheme.text},
                    ]}>
                    Pasos para realizar la transferencia
                  </Text>

                  {CachepayMethodData && (
                    <View
                      style={{
                        backgroundColor: appTheme.InputBoxBGColor,
                        borderRadius: 10,
                        padding: 20,
                      }}>
                      <View style={[commonStyle.flexDir_Row]}>
                        <View style={[styles.numberContainer, {marginTop: 10}]}>
                          <Text
                            style={[
                              commonStyle.h4,
                              commonStyle.fontBold,
                              styles.numberText,
                            ]}>
                            1
                          </Text>
                        </View>
                        <View style={{marginLeft: 15}}>
                          <Text
                            style={[
                              commonStyle.h5,
                              commonStyle.fontBold,
                              {color: appTheme.text, marginRight: 25},
                            ]}>
                            {CachepayMethodData.hs_bank_transfer_step1_title}
                          </Text>
                          <Text
                            style={[
                              commonStyle.h5,
                              commonStyle.fontBold,
                              {
                                color: ResColor.Gray,
                                marginTop: 5,
                                marginRight: 25,
                              },
                            ]}>
                            {
                              CachepayMethodData.hs_bank_transfer_step1_description
                            }
                          </Text>
                        </View>
                      </View>
                      <View
                        style={{
                          marginLeft: 45,
                          alignItems: 'flex-start',
                          marginTop: 10,
                        }}>
                        <CopyControl
                          desc={
                            CachepayMethodData.hs_bank_transfer_step1_description
                          }
                        />
                      </View>
                      <View style={[commonStyle.flexDir_Row, {marginTop: 20}]}>
                        <View style={styles.numberContainer}>
                          <Text
                            style={[
                              commonStyle.h4,
                              commonStyle.fontBold,
                              styles.numberText,
                            ]}>
                            2
                          </Text>
                        </View>
                        <View style={{marginLeft: 15}}>
                          <Text
                            style={[
                              commonStyle.h5,
                              commonStyle.fontBold,
                              {color: appTheme.text, marginRight: 25},
                            ]}>
                            {CachepayMethodData.hs_bank_transfer_step2_title}
                          </Text>
                          <Text
                            style={[
                              commonStyle.h5,
                              commonStyle.fontBold,
                              {
                                color: ResColor.Gray,
                                marginTop: 5,
                                marginRight: 25,
                              },
                            ]}>
                            {
                              CachepayMethodData.hs_bank_transfer_step2_description
                            }
                          </Text>
                        </View>
                      </View>
                      <View style={[commonStyle.flexDir_Row, {marginTop: 20}]}>
                        <Image
                          style={{marginTop: 10}}
                          source={ResImage.ic_exal}
                        />
                        <View style={{marginLeft: 15}}>
                          <Text
                            style={[
                              commonStyle.h5,
                              commonStyle.fontBold,
                              {color: ResColor.Gray, marginRight: 25},
                            ]}>
                            {
                              CachepayMethodData.hs_bank_transfer_warning_description
                            }
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>

                <View style={{marginTop: 15}}>
                  <Text
                    style={[
                      commonStyle.h5,
                      commonStyle.fontBold,
                      {color: ResColor.Gray, marginTop: 5},
                    ]}>
                    Agrega el Nro.de documento de identidad del propietario de
                    la cuenta bancaria
                  </Text>
                  <View style={{marginTop: 15}}>
                    <CustomInput
                      onChangeText={value => {
                        setDocId(value);
                      }}
                      placeholder={'payment.lbl_docno'}
                    />
                  </View>
                </View>
              </>
            )
          }
          {response !== null && 'assets' in response && (
            <View style={[commonStyle.flexDir_Row, {marginVertical: 23}]}>
              <TouchableHighlight
                onPress={() => {
                  Helper.HandleVibration();
                  setResponse(null);
                  setadviceCount(0);
                  setimageData([]);
                }}
                underlayColor={ResColor.transparent}
                style={{padding: 5}}>
                <Icon
                  name="times"
                  type="font-awesome-5"
                  size={24}
                  color={isDark ? ResColor.white : ResColor.black}
                />
              </TouchableHighlight>
              {imageData.length > 0 &&
                imageData.map((itemM, index) => (
                  <View
                    key={index}
                    style={{
                      alignItems: 'center',
                      flex: 1,
                      justifyContent: 'center',
                    }}>
                    <Image
                      borderRadius={10}
                      source={{uri: `data:image/png;base64,${itemM.base64}`}}
                      style={[commonStyle.he_wi_130, {marginVertical: 15}]}
                    />

                    {/* <Image borderRadius={10} source={{ uri: 'https://b.stripecdn.com/docs/assets/terminal-pre-built-receipt.7879fcc1c9eaea36e3af4dabada4f82b.png' }} style={[commonStyle.he_wi_130]} /> */}
                  </View>
                ))}
              {adviceCount == 1 && (
                <TouchableHighlight
                  onPress={() => {
                    Helper.HandleVibration();
                    actionSheetRef.current.show();
                  }}
                  underlayColor={ResColor.transparent}>
                  <Icon
                    name="plus"
                    color={isDark ? ResColor.white : ResColor.black}
                    type="font-awesome-5"
                  />
                </TouchableHighlight>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <ActionSheet
        ref={actionSheetRef}
        title={null}
        options={options}
        cancelButtonIndex={2}
        destructiveButtonIndex={2}
        onPress={index => processPictures(index)}
      />
      <View
        style={[
          {
            paddingHorizontal: 24,
            bottom: 15,
            width: '100%',
            backgroundColor: 'transparent',
          },
        ]}>
        <CustomButton
          title="payment.lbl_sendpayslip"
          onPress={() => {
            console.log('adviceCount  -->', adviceCount);
            if (adviceCount == 0) {
              actionSheetRef.current.show();
            } else {
              processToUploadImage();
              // Helper.ShowAlert( "Process to save Doc", "" )
            }
          }}
          customButtonStyle={[commonStyle.btn_primary]}
        />
      </View>

      <PriceControl payType={props.payType} />

      <CustomPBar
        showProgress={
          movilLoading ||
          zelleLoading ||
          bankTransferLoading ||
          paypalLoading ||
          banescoLoading
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'white',
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
  titleTextwithmodal: {
    color: ResColor.black,
    paddingTop: 0,
    paddingBottom: 10,
    marginTop: 10,
  },
  numberContainer: {
    backgroundColor: ResColor.Green,
    borderRadius: 20,
    height: 30,
    width: 30,
  },
  numberText: {color: ResColor.white, textAlign: 'center'},
});

export default NewPaySlips;
