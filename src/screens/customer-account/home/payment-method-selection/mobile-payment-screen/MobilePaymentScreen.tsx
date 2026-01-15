import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {useNavigation, useTheme} from '@react-navigation/native';
import {Separator} from '@shared-components/separator/Separator';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import Clipboard from '@react-native-clipboard/clipboard';
import Input from '@shared-components/input/Input';
import Button from '@shared-components/button/Button';
import ErrorMessage from '@shared-components/error-message/ErrorMessage';
import {Controller, useForm} from 'react-hook-form';
import {ScrollView} from 'react-native-gesture-handler';
import dayjs, {Dayjs} from 'dayjs';
import DatePickerModal from '@shared-components/date-picker-modal/DatePickerModal';
import DropDownPicker from 'react-native-dropdown-picker';
import fonts from '@fonts';
import CustomBottomSheetModal from '@shared-components/bottom-sheet/CustomBottomSheetModal';
import MobilePaymentStatusLayout from './components/MobilePaymentStatusLayout';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from 'store/store';
import {
  fetchTotalPaymentInBs,
  sendMobilePayment,
} from 'store/slices/payment-slice';
import {SCREENS} from '@shared-constants';
import {getExchangeRates} from 'store/slices/financing-slice';
import {truncateNumber, truncateString} from 'utils';
import {getBankAccountInfo, getBankOptions} from 'store/slices/banksSlice';
import {getUserBalance} from 'store/slices/balance-slice';
import {fetchPurchasesByUserId} from 'store/slices/purchase-slice';
import {User} from '@services/api/auth';
import {COLORS, FONTS} from 'app/styles/global.style';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const phoneCodeOptions = [
  {label: '0414', value: '0414'},
  {label: '0424', value: '0424'},
  {label: '0416', value: '0416'},
  {label: '0426', value: '0426'},
  {label: '0412', value: '0412'},
];

const MobilePaymentScreen = () => {
  const theme = useTheme();
  const {colors} = theme;
  const {
    control,
    handleSubmit,
    formState: {errors, isDirty, dirtyFields},
    setValue,
  } = useForm({
    defaultValues: {
      bank: '',
      phoneCode: '0414',
      phone: '',
      paymentDate: dayjs(),
      reference: '',
    },
  });
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();

  const selectedPayments = useSelector(
    (state: RootState) => state.payments.selectedPayments,
  );

  const totalPaymentInBs = useSelector(
    (state: RootState) => state.payments.totalPaymentInBs,
  );

  const user = useSelector((state: RootState) => state.auth.user as User);
  const [modalVisible, setModalVisible] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [open, setOpen] = useState(false);
  const [openCode, setOpenCode] = useState(false);
  const {bankOptions, bankAccountInfo} = useSelector(
    (state: RootState) => state.banks,
  );

  useEffect(() => {
    dispatch(getExchangeRates());
    dispatch(getBankOptions());
    dispatch(getBankAccountInfo());
    const selectedPaymentIds = selectedPayments.map(pymnt => pymnt.id);
    dispatch(fetchTotalPaymentInBs(selectedPaymentIds));
  }, [dispatch, selectedPayments]);

  const onSubmit = async (data: {
    bank: string;
    phoneCode: string;
    phone: string;
    paymentDate: Dayjs;
    reference: string;
  }) => {
    try {
      if (selectedPayments.length > 0) {
        const selectedPaymentIds = selectedPayments.map(pymnt => pymnt.id);
        const mobilePaymentResponse = await dispatch(
          sendMobilePayment({
            paymentIds: selectedPaymentIds,
            phone: `${data.phoneCode}${data.phone}`,
            bank: data.bank,
            reference: data.reference,
            paymentDate: data.paymentDate,
          }),
        ).unwrap();
        console.log('mobilePaymentResponse-->', mobilePaymentResponse);
        refreshUserData();
        navigation.navigate(SCREENS.HOME as never);
      }
    } catch (error) {
      console.log('Error :', error);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    Clipboard.setString(text);
  };

  const handleInputPress = () => {
    setIsDatePickerVisible(true);
  };

  const handleCloseDateModal = () => {
    setIsDatePickerVisible(false);
  };

  const handleCloseStatusModal = () => {
    setModalVisible(false);
  };

  const handleDateChange = () => {
    setValue('paymentDate', selectedDate);
    setIsDatePickerVisible(false);
  };

  const refreshUserData = () => {
    dispatch(getUserBalance(user.id));
    dispatch(fetchPurchasesByUserId(user.id));
  };

  const bankInfo = useMemo(() => {
    return [
      {
        title: 'Número de teléfono',
        value: '04129933455',
        copyable: true,
      },
      {title: 'RIF', value: 'J-30455555-3', copyable: true},
      {title: 'Banco', value: 'Banco de Venezuela', copyable: false},
    ];
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.primaryBackground}>
        <View style={styles.primaryOval} />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Pago móvil</Text>
        </View>
      </View>

      <View style={styles.contentCard}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Monto a pagar</Text>
          <View style={styles.totalAmount}>
            <Text style={styles.amountText}>
              {truncateNumber(totalPaymentInBs, 2)} Bs
            </Text>
          </View>
          <Separator />
          <Text style={styles.dataTitle}>DATOS DEL PAGO MÓVIL</Text>
          <View style={styles.bankInfoContainer}>
            {bankInfo.map(info => (
              <View key={info.title} style={styles.bankInfo}>
                <Text style={styles.bankInfoLabel}>{info.title}</Text>
                <View style={styles.infoWithCopyIcon}>
                  <Text style={styles.bankInfoValue}>
                    {truncateString(info.value || '', 32)}
                  </Text>
                  {info.copyable && (
                    <TouchableOpacity
                      onPress={() => handleCopyToClipboard(info.value || '')}
                      style={styles.copyIconContainer}>
                      <Icon
                        name="copy"
                        type={IconType.Feather}
                        size={18}
                        color={colors.totalBlack}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
          <Text style={styles.paymentMadeTitle}>DATOS DEL PAGO REALIZADO</Text>

          <View style={styles.formSection}>
            <View style={styles.formGroup}>
              <Text
                style={{
                  fontFamily: FONTS.urbanistBold,
                  fontSize: 18,
                  color: COLORS.greyDark,
                  marginBottom: 10,
                }}>
                Banco
              </Text>
              <Controller
                control={control}
                name="bank"
                rules={{required: 'El banco es obligatorio'}}
                render={({field: {onChange, value}}) => (
                  <>
                    <DropDownPicker
                      open={open}
                      value={value}
                      items={bankOptions}
                      setOpen={setOpen}
                      setValue={val => onChange(val)}
                      onChangeValue={val => onChange(val)}
                      placeholder="Banco Emisor"
                      zIndex={3000}
                      zIndexInverse={1000}
                      style={{
                        backgroundColor: '#F5F5F5',
                        borderRadius: 12,
                        borderWidth: 0,
                        marginBottom: 15,
                        width: '100%',
                      }}
                      textStyle={{
                        fontFamily: FONTS.urbanistRegular,
                        fontSize: 16,
                        color: COLORS.greyDark,
                      }}
                      placeholderStyle={{
                        color: COLORS.textGrey,
                        fontFamily: FONTS.urbanistRegular,
                        fontSize: 16,
                      }}
                      maxHeight={200}
                      listMode="SCROLLVIEW"
                      scrollViewProps={{
                        nestedScrollEnabled: true,
                      }}
                    />
                    {errors.bank && (
                      <ErrorMessage message={errors.bank.message || 'Error'} />
                    )}
                  </>
                )}
              />
            </View>

            <View style={styles.formGroup}>
              <Text
                style={{
                  fontFamily: FONTS.urbanistBold,
                  fontSize: 18,
                  color: COLORS.greyDark,
                  marginBottom: 10,
                }}>
                Teléfono
              </Text>
              <View style={styles.codeAndPhoneContainer}>
                <View style={{flex: 1, marginRight: 8}}>
                  <Controller
                    control={control}
                    name="phoneCode"
                    rules={{required: 'El código de operadora es obligatorio'}}
                    render={({field: {onChange, value}}) => (
                      <DropDownPicker
                        open={open ? false : openCode}
                        value={value}
                        items={phoneCodeOptions}
                        setOpen={setOpenCode}
                        setValue={cb => {
                          const newValue = cb(value);
                          onChange(newValue);
                        }}
                        placeholder="0414"
                        zIndex={1500}
                        zIndexInverse={500}
                        style={{
                          backgroundColor: '#F5F5F5',
                          borderRadius: 12,
                          borderWidth: 0,
                          height: 48,
                          paddingHorizontal: 14,
                          fontFamily: FONTS.urbanistRegular,
                          fontSize: 16,
                          color: COLORS.greyDark,
                          width: '100%',
                        }}
                        containerStyle={{
                          height: 48,
                          width: '100%',
                        }}
                        dropDownContainerStyle={{
                          borderRadius: 12,
                          borderWidth: 0,
                          width: '100%',
                        }}
                        textStyle={{
                          fontFamily: FONTS.urbanistRegular,
                          fontSize: 16,
                          color: COLORS.greyDark,
                        }}
                        placeholderStyle={{
                          color: COLORS.textGrey,
                          fontFamily: FONTS.urbanistRegular,
                          fontSize: 16,
                        }}
                        maxHeight={150}
                        listMode="SCROLLVIEW"
                        scrollViewProps={{nestedScrollEnabled: true}}
                      />
                    )}
                  />
                </View>
                <View style={{flex: 2}}>
                  <Controller
                    control={control}
                    name="phone"
                    rules={{
                      required: 'El teléfono es obligatorio',
                      pattern: {
                        value: /^[0-9]{7}$/,
                        message: 'El teléfono debe tener 7 dígitos',
                      },
                    }}
                    render={({field: {onChange, onBlur, value}}) => (
                      <Input
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Teléfono"
                        keyboardType="numeric"
                        borderColor={errors.phone && COLORS.error}
                        style={{
                          backgroundColor: '#F5F5F5',
                          borderRadius: 12,
                          borderWidth: 0,
                          height: 48,
                          paddingHorizontal: 14,
                          fontFamily: FONTS.urbanistRegular,
                          fontSize: 16,
                          color: COLORS.greyDark,
                          width: '100%',
                        }}
                        placeholderTextColor={COLORS.textGrey}
                      />
                    )}
                  />
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text
                style={{
                  fontFamily: FONTS.urbanistBold,
                  fontSize: 18,
                  color: COLORS.greyDark,
                  marginBottom: 10,
                }}>
                Fecha de pago
              </Text>
              <TouchableOpacity onPress={handleInputPress}>
                <Controller
                  control={control}
                  name="paymentDate"
                  render={({field: {value}}) => (
                    <Input
                      value={value.format('DD/MM/YYYY')}
                      placeholder="Fecha de pago"
                      editable={false}
                      style={{
                        backgroundColor: '#F5F5F5',
                        borderRadius: 12,
                        borderWidth: 0,
                        height: 48,
                        paddingHorizontal: 14,
                        fontFamily: FONTS.urbanistRegular,
                        fontSize: 16,
                        color: COLORS.greyDark,
                        width: '100%',
                      }}
                      placeholderTextColor={COLORS.textGrey}
                    />
                  )}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text
                style={{
                  fontFamily: FONTS.urbanistBold,
                  fontSize: 18,
                  color: COLORS.greyDark,
                  marginBottom: 10,
                }}>
                Últimos 4 dígitos
              </Text>
              <Controller
                control={control}
                name="reference"
                rules={{
                  required: 'Los últimos 4 dígitos son obligatorios',
                  pattern: {
                    value: /^[0-9]{4}$/,
                    message: 'Debe contener exactamente 4 dígitos',
                  },
                }}
                render={({field: {onChange, onBlur, value}}) => (
                  <>
                    <Input
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Últimos 4 dígitos. Ref"
                      keyboardType="numeric"
                      borderColor={errors.reference && COLORS.error}
                      style={{
                        backgroundColor: '#F5F5F5',
                        borderRadius: 12,
                        padding: 14,
                        fontFamily: FONTS.urbanistRegular,
                        fontSize: 16,
                        color: COLORS.greyDark,
                        borderWidth: 0,
                        width: '100%',
                      }}
                      placeholderTextColor={COLORS.textGrey}
                    />
                    {errors.reference && (
                      <ErrorMessage
                        message={errors.reference.message || 'Error'}
                      />
                    )}
                  </>
                )}
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Validar pago"
              onPress={handleSubmit(onSubmit)}
              disabled={!isDirty}
            />
          </View>
        </ScrollView>
      </View>

      <Modal
        visible={isDatePickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseDateModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>Fecha de pago</Text>
              <TouchableOpacity onPress={handleCloseDateModal}>
                <Icon
                  name="x"
                  type={IconType.Feather}
                  size={24}
                  color={COLORS.greyDark}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.dateDisplay}>
              <Text style={styles.dateText}>
                {selectedDate.format('DD/MM/YYYY')}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleDateChange}>
              <Text style={styles.confirmButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CustomBottomSheetModal
        isVisible={modalVisible}
        onClose={handleCloseStatusModal}
        accessibilityLabel="Bottom Sheet Modal"
        bottomSheetScrollView>
        <MobilePaymentStatusLayout
          successful={false}
          onClose={handleCloseStatusModal}
        />
      </CustomBottomSheetModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  primaryBackground: {
    position: 'relative',
    height: SCREEN_HEIGHT * 0.16,
    backgroundColor: COLORS.primaryBlue,
    overflow: 'hidden',
  },
  primaryOval: {
    position: 'absolute',
    bottom: -90,
    right: -120,
    width: 500,
    height: 250,
    backgroundColor: COLORS.primaryBlue,
    borderTopLeftRadius: 250,
    borderTopRightRadius: 250,
    transform: [{rotate: '5deg'}],
  },
  headerContent: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.03,
    left: 20,
    right: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: FONTS.urbanistSemiBold,
    color: '#fff',
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -40,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    fontFamily: FONTS.urbanistSemiBold,
    color: '#333',
    marginVertical: 10,
  },
  dataTitle: {
    fontSize: 18,
    fontFamily: FONTS.urbanistSemiBold,
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  totalAmount: {
    alignItems: 'center',
    marginBottom: 10,
  },
  amountText: {
    fontSize: 22,
    fontFamily: FONTS.urbanistSemiBold,
    color: COLORS.primaryBlue,
  },
  bankInfoContainer: {
    marginVertical: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
  },
  bankInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bankInfoLabel: {
    fontSize: 14,
    fontFamily: FONTS.urbanistRegular,
    color: COLORS.greyDark,
  },
  infoWithCopyIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bankInfoValue: {
    fontSize: 15,
    fontFamily: FONTS.urbanistSemiBold,
    color: COLORS.primaryBlue,
    marginRight: 8,
  },
  copyIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMadeTitle: {
    marginTop: 24,
    marginBottom: 16,
    fontSize: 18,
    fontFamily: FONTS.urbanistSemiBold,
    color: '#333',
    textAlign: 'center',
  },
  formSection: {
    marginTop: 16,
  },
  formGroup: {
    marginBottom: 16,
    width: '100%',
  },
  codeAndPhoneContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  phoneCodeDropdown: {
    width: 100,
  },
  phoneContainer: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  datePickerTitle: {
    fontSize: 18,
    fontFamily: FONTS.urbanistSemiBold,
    color: COLORS.greyDark,
  },
  dateDisplay: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 15,
    backgroundColor: COLORS.greyLight,
    borderRadius: 8,
  },
  dateText: {
    fontSize: 24,
    fontFamily: FONTS.urbanistSemiBold,
    color: COLORS.primaryBlue,
  },
  confirmButton: {
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.urbanistSemiBold,
  },
});

export default MobilePaymentScreen;
