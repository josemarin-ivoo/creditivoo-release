import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import IconDynamic, {IconType} from 'react-native-dynamic-vector-icons';
import {FONTS} from 'app/styles/global.style';
import {PaymentMethodModel} from '@services/api/payments';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from 'store/store';
import {Switch} from 'react-native';
import CustomInput from 'app/components/inputs/CustomInput';
import CurrencyInput from 'react-native-currency-input';
import BankSelector from 'app/components/inputs/BankSelector';
import Clipboard from '@react-native-clipboard/clipboard';
import ButtonK from '@shared-components/button/ButtonK';
import {
  fetchTotalPaymentInBs,
  createPaymentReferenceThunk,
  fetchExchangeRate,
  fetchPaymentsByPurchaseIds,
  setSelectedPayments,
} from 'store/slices/payment-slice';
import {SCREENS} from '@shared-constants';
import PaymentSuccessModal from '@components/payments/PaymentSuccessModal';
import CustomMessageAlert, {
  CustomMessageType,
} from '@components/payment-selection/CustomMessageAlert';
import {formatCurrency, formatCurrencyBs} from 'utils';
import DatePicker from 'react-native-date-picker';

interface PaymentMethodField {
  id: number;
  name: string;
  hint: string;
  type: string;
  isRequired: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tenantId?: number;
  paymentMethodTenantId?: number;
}

interface PaymentOwnerData {
  id: number;
  data: string;
  isActive: boolean;
  paymentMethodTenantId: number;
  tenantId: number;
  createdAt: string;
  updatedAt: string;
}

type RouteParams = {
  PaymentMethodDetail: {
    paymentMethod: PaymentMethodModel & {
      paymentOwnerFields?: PaymentMethodField[];
      paymentOwnerData?: PaymentOwnerData[];
      defaultCurrency?: 'USD' | 'VES';
      allowSwapCurrency?: boolean;
      showRate?: boolean;
      showCustomMessage?: boolean;
      customMessage?: string;
      customMessageColor?: CustomMessageType;
    };
  };
};

const PaymentMethodDetailScreen = () => {
  const route = useRoute<RouteProp<RouteParams, 'PaymentMethodDetail'>>();
  const navigation = useNavigation();
  const {paymentMethod} = route.params;
  const dispatch = useDispatch();
  const selectedPayments = useSelector(
    (state: RootState) => state.payments.selectedPayments,
  );
  const totalPaymentInBs = useSelector(
    (state: RootState) => state.payments.totalPaymentInBs,
  );
  const isLoading = useSelector((state: RootState) => state.payments.isLoading);
  const exchangeRate = useSelector(
    (state: RootState) => state.payments.exchangeRate,
  );
  const [showInBs, setShowInBs] = useState(
    paymentMethod.defaultCurrency === 'VES',
  );
  const [formData, setFormData] = useState<Record<string, string | boolean>>(
    {},
  );
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {},
  );
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date());

  // Calculate total amount
  const totalAmount = selectedPayments.reduce(
    (total, payment) => total + Number(payment.amount),
    0,
  );

  const handleToggleCurrency = (value: boolean) => {
    setShowInBs(value);
    if (value) {
      const selectedPaymentIds = selectedPayments.map(payment => payment.id);
      dispatch(fetchTotalPaymentInBs(selectedPaymentIds) as any);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (showInBs) {
      const selectedPaymentIds = selectedPayments.map(payment => payment.id);
      dispatch(fetchTotalPaymentInBs(selectedPaymentIds) as any);
    }
    console.log('Fetching exchange rate...');
    dispatch(fetchExchangeRate() as any);
  }, [dispatch, selectedPayments, showInBs]);

  // Debug log for exchange rate
  useEffect(() => {
    console.log('Current exchange rate state:', exchangeRate);
  }, [exchangeRate]);

  // Use centralized currency formatters
  const formatAmount = (amount: string | number) => {
    return showInBs ? formatCurrencyBs(amount) : formatCurrency(amount);
  };

  const handleInputChange = (fieldName: string, value: string | boolean) => {
    // If the field is numeric, only allow numbers
    if (
      typeof value === 'string' &&
      paymentMethod.paymentOwnerFields?.find(f => f.name === fieldName)
        ?.type === 'number'
    ) {
      // Remove any non-numeric characters
      value = value.replace(/[^0-9]/g, '');
    }

    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));
    setTouchedFields(prev => ({
      ...prev,
      [fieldName]: true,
    }));
  };

  const handleCopy = (data: string, id: number) => {
    Clipboard.setString(data);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000); // Reset after 2 seconds
  };

  const isFormValid = (() => {
    if (!paymentMethod.paymentOwnerFields) return false;

    return paymentMethod.paymentOwnerFields.every(field => {
      if (!field.isActive) return true; // Skip inactive fields
      if (!field.isRequired) return true; // Skip non-required fields

      const value = formData[field.name];
      if (field.type === 'boolean') {
        return value === true;
      }
      return value !== undefined && value !== '';
    });
  })();

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setIsSubmitting(true);
    const selectedPaymentIds = selectedPayments.map(payment => payment.id);
    const paymentData = Object.entries(formData).map(([field, value]) => ({
      field,
      value: value.toString(),
    }));

    const payload = {
      selectedPaymentsIds: selectedPaymentIds,
      paymentData,
      paymentMethodId: paymentMethod.id,
      amount: showInBs ? totalPaymentInBs.toString() : totalAmount.toString(),
      currency: showInBs ? 'VES' : 'USD',
    };

    try {
      await dispatch(createPaymentReferenceThunk(payload) as any).unwrap();

      // Get unique purchase IDs from selected payments
      const purchaseIds = [
        ...new Set(selectedPayments.map(payment => payment.purchaseId)),
      ];

      // Refetch payments for all affected purchases
      await dispatch(fetchPaymentsByPurchaseIds(purchaseIds) as any).unwrap();

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating payment reference:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowSuccessModal(false);
    navigation.navigate(SCREENS.HOME as never);
    dispatch(setSelectedPayments([]));
  };

  const renderField = (field: PaymentMethodField) => {
    if (!field.isActive) return null;

    // Determine keyboard type based on field type
    let keyboardType: 'default' | 'email-address' | 'numeric' | 'phone-pad' =
      'default';
    if (field.type === 'email') keyboardType = 'email-address';
    if (field.type === 'number') keyboardType = 'numeric';
    if (field.type === 'phone') keyboardType = 'phone-pad';

    if (field.type === 'boolean') {
      return (
        <View key={field.id} style={styles.fieldContainer}>
          <View style={styles.checkboxContainer}>
            <Text style={styles.fieldLabel}>
              {field.name}
              {field.isRequired && <Text style={styles.requiredStar}> *</Text>}
            </Text>
            <Switch
              value={(formData[field.name] as boolean) || false}
              onValueChange={value => handleInputChange(field.name, value)}
              trackColor={{false: '#E5E5E5', true: '#32DD73'}}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E5E5E5"
            />
          </View>
        </View>
      );
    }

    if (field.type === 'bank-select') {
      const value = (formData[field.name] as string) || '';
      const isRequired = field.isRequired;
      const isEmpty = value.trim() === '';
      const isTouched = touchedFields[field.name];
      const showError = isRequired && isEmpty && isTouched;

      return (
        <View key={field.id} style={styles.fieldContainer}>
          <BankSelector
            label={field.name}
            value={value}
            onChange={value => handleInputChange(field.name, value)}
            error={showError ? 'Este campo es requerido' : undefined}
            isRequired={isRequired}
          />
        </View>
      );
    }

    if (field.type === 'date') {
      const value = (formData[field.name] as string) || '';
      const isRequired = field.isRequired;
      const isEmpty = value.trim() === '';
      const isTouched = touchedFields[field.name];
      const showError = isRequired && isEmpty && isTouched;
      return (
        <View key={field.id} style={styles.fieldContainer}>
          <TouchableOpacity onPress={() => setOpen(true)} activeOpacity={1}>
            <View pointerEvents="none">
              <CustomInput
                label={field.name + (isRequired ? ' *' : '')}
                placeholder={field.hint}
                value={value}
                readOnly={true}
                error={showError ? 'Este campo es requerido' : undefined}
              />
            </View>
          </TouchableOpacity>
          <DatePicker
            modal
            open={open}
            date={date}
            mode="date"
            onConfirm={selectedDate => {
              setOpen(false);
              setDate(selectedDate);
              handleInputChange(
                field.name,
                selectedDate.toLocaleDateString('es-ES'),
              );
            }}
            onCancel={() => {
              setOpen(false);
            }}
          />
        </View>
      );
    }

    // Campo decimal (monto con decimales)
    if (field.type === 'decimal') {
      const value = (formData[field.name] as string) || '';
      const isRequired = field.isRequired;
      const isEmpty = value.trim() === '';
      const isTouched = touchedFields[field.name];
      const showError = isRequired && isEmpty && isTouched;

      return (
        <View key={field.id} style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            {field.name}
            {isRequired && <Text style={styles.requiredStar}> *</Text>}
          </Text>

          <CurrencyInput
            value={value ? Number(value.replace(/,/g, '.')) : null}
            onChangeValue={v =>
              handleInputChange(field.name, v ? v.toString() : '')
            }
            delimiter="."
            separator="," // coma como separador decimal
            precision={2}
            minValue={0}
            style={styles.currencyInput}
            placeholder={field.hint}
          />

          {showError && (
            <Text style={styles.errorText}>Este campo es requerido</Text>
          )}
        </View>
      );
    }

    const value = (formData[field.name] as string) || '';
    const isRequired = field.isRequired;
    const isEmpty = value.trim() === '';
    const isTouched = touchedFields[field.name];
    const showError = isRequired && isEmpty && isTouched;

    return (
      <View key={field.id} style={styles.fieldContainer}>
        <CustomInput
          label={field.name + (isRequired ? ' *' : '')}
          placeholder={field.hint}
          value={value}
          onChangeText={value => handleInputChange(field.name, value)}
          keyboardType={keyboardType}
          error={showError ? 'Este campo es requerido' : undefined}
        />
      </View>
    );
  };

  const renderPaymentInfo = () => {
    if (!paymentMethod.paymentOwnerData?.length) return null;

    return (
      <View style={styles.paymentInfoContainer}>
        <View style={styles.paymentInfoHeader}>
          <IconDynamic
            name="information-circle-outline"
            type={IconType.Ionicons}
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.paymentInfoTitle}>Información de pago</Text>
        </View>
        <View style={styles.paymentInfoContent}>
          {paymentMethod.paymentOwnerData.map(item => (
            <View key={item.id} style={styles.paymentInfoItem}>
              <View style={styles.paymentInfoDataContainer}>
                <Text style={styles.paymentInfoData}>{item.data}</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.copyButton,
                  copiedId === item.id && styles.copyButtonActive,
                ]}
                onPress={() => handleCopy(item.data, item.id)}>
                <IconDynamic
                  name={copiedId === item.id ? 'checkmark' : 'copy-outline'}
                  type={IconType.Ionicons}
                  size={20}
                  color={copiedId === item.id ? '#FFFFFF' : '#32DD73'}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        enabled={true}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <View style={styles.backButtonCircle}>
              <IconDynamic
                name="arrow-back"
                type={IconType.Ionicons}
                size={24}
                color="#FFFFFF"
              />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{paymentMethod.name}</Text>
          <View style={styles.headerRight} />
        </View>

        {/* White Card */}
        <View style={styles.contentCard}>
          {/* Custom Message Alert */}
          {paymentMethod.showCustomMessage && paymentMethod.customMessage && (
            <CustomMessageAlert
              visible={true}
              message={paymentMethod.customMessage}
              type={paymentMethod.customMessageColor || 'primary'}
            />
          )}
          <View style={styles.totalSection}>
            <View style={styles.totalLeft}>
              <Text style={styles.totalLabel}>Total a pagar</Text>
              <Text style={styles.totalAmount}>
                {formatAmount(showInBs ? totalPaymentInBs : totalAmount)}
              </Text>
              {paymentMethod.showRate && (
                <Text style={styles.exchangeRate}>
                  Tasa del día: {exchangeRate?.rate || 'Cargando...'} Bs/USD
                </Text>
              )}
            </View>
            {paymentMethod.allowSwapCurrency && (
              <View style={styles.currencyToggle}>
                <Text style={styles.currencyLabel}>Ver en Bs</Text>
                <Switch
                  value={showInBs}
                  onValueChange={handleToggleCurrency}
                  trackColor={{false: '#E5E5E5', true: '#32DD73'}}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="#E5E5E5"
                />
              </View>
            )}
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {renderPaymentInfo()}
            <View style={styles.formContainer}>
              {paymentMethod.paymentOwnerFields?.map(field =>
                renderField(field),
              )}
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <ButtonK
              onPress={handleSubmit}
              disabled={!isFormValid || isLoading || isSubmitting}
              title={isSubmitting ? 'Procesando pago...' : 'Confirmar pago'}
            />
          </View>
        </View>

        <PaymentSuccessModal
          visible={showSuccessModal}
          onCancel={handleCancel}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  backButtonCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#32DD73',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.urbanistBold,
    fontSize: 22,
    color: '#000000',
  },
  headerRight: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  totalSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#E9FBF0',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLeft: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: FONTS.urbanistSemiBold,
    color: '#999999',
  },
  totalAmount: {
    fontSize: 18,
    fontFamily: FONTS.urbanistSemiBold,
    color: '#32DD73',
  },
  currencyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  currencyLabel: {
    fontSize: 14,
    fontFamily: FONTS.urbanistRegular,
    color: '#999999',
    marginRight: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  formContainer: {
    gap: 2,
  },
  fieldContainer: {
    marginBottom: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 18,
    fontFamily: FONTS.urbanistSemiBold,
    color: '#000000',
  },
  requiredStar: {
    //color: theme['color-danger-500'],
  },
  paymentInfoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  paymentInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#32DD73',
    gap: 8,
  },
  paymentInfoTitle: {
    fontSize: 18,
    fontFamily: FONTS.urbanistSemiBold,
    color: '#FFFFFF',
  },
  paymentInfoContent: {
    padding: 16,
    gap: 12,
  },
  paymentInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  paymentInfoDataContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
  },
  paymentInfoData: {
    fontSize: 15,
    fontFamily: FONTS.urbanistSemiBold,
    color: '#32DD73',
  },
  copyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#32DD73',
  },
  copyButtonActive: {
    backgroundColor: '#32DD73',
    borderColor: '#32DD73',
  },
  buttonContainer: {
    marginTop: 20,
    paddingBottom: 10,
    width: '100%',
  },
  disabledButton: {
    opacity: 0.5,
  },
  exchangeRate: {
    fontSize: 14,
    fontFamily: FONTS.urbanistRegular,
    color: '#999999',
    marginTop: 4,
  },
  currencyInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontFamily: FONTS.urbanistRegular,
    color: '#000000',
    marginBottom: 4,
  },
  errorText: {
    fontFamily: FONTS.urbanistRegular,
    fontSize: 12,
    color: '#FF4C24',
    marginTop: 5,
  },
});

export default PaymentMethodDetailScreen;
