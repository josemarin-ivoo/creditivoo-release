import React, {useState} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import {useSelector} from 'react-redux';
import {RootState} from 'store/store';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import IconDynamic, {IconType} from 'react-native-dynamic-vector-icons';
import PaymentMethodItem from './components/PaymentMethodItem';
import {Payment, PaymentStatus} from '@services/api/payments';
import {SCREENS} from '@shared-constants';
import {FONTS} from 'app/styles/global.style';
import ButtonK from '@shared-components/button/ButtonK';
import {formatCurrency} from 'utils';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

const PaymentMethodSelectScreen: React.FC = () => {
  const navigation = useNavigation();
  const selectedPayments = useSelector(
    (state: RootState) => state.payments.selectedPayments,
  );
  const paymentMethods = useSelector(
    (state: RootState) => state.paymentMethods.methods,
  );

  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);

  const handleMethodSelect = (methodId: number) => {
    setSelectedMethodId(methodId);
  };

  const handleContinue = () => {
    if (selectedMethodId !== null) {
      const selectedMethod = paymentMethods.find(
        method => method.id === selectedMethodId,
      );
      if (selectedMethod) {
        (navigation as any).navigate(SCREENS.PAYMENT_METHOD_DETAIL, {
          paymentMethod: selectedMethod,
        });
      }
    }
  };

  // Helper function to parse amount
  const parseAmount = (amount: string | number): number => {
    if (typeof amount === 'number') {
      return amount;
    }
    const cleaned = amount.toString().replace('$', '').replace(',', '').trim();
    return parseFloat(cleaned) || 0;
  };

  const renderSelectedPayment = ({
    item,
    index,
  }: {
    item: Payment;
    index: number;
  }) => {
    const formattedDate = moment(item.paymentDate).format('D MMM, YYYY');
    const amount = parseAmount(item.amount);
    const formattedAmount = formatCurrency(`$${amount.toFixed(2)}`);
    const isLast = index === selectedPayments.length - 1;
    const isCompleted = item.status === PaymentStatus.COMPLETED;
    const isPassDue = item.status === PaymentStatus.PASS_DUE;

    return (
      <View style={styles.paymentRow}>
        <View style={[styles.paymentItem, isLast && styles.paymentItemLast]}>
          <Text
            style={[
              styles.paymentDate,
              isCompleted && styles.paymentDateCompleted,
            ]}>
            {formattedDate}
          </Text>
          <Text
            style={[
              styles.paymentRef,
              isCompleted && styles.paymentRefCompleted,
              isPassDue && styles.paymentRefPassDue,
            ]}>
            {formattedAmount}
          </Text>
        </View>
        {!isLast && <View style={styles.separator} />}
      </View>
    );
  };

  // Calculate total amount
  const totalAmount = selectedPayments.reduce(
    (total, payment) => total + parseAmount(payment.amount),
    0,
  );

  const mainColor = '#32DD73';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <View style={styles.container}>
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
          <Text style={styles.headerTitle}>Medios de pago</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Payment Items - Stripe Table Style */}
          <View style={styles.paymentsTableContainer}>
            <FlatList
              data={selectedPayments}
              renderItem={({item, index}) =>
                renderSelectedPayment({item, index})
              }
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
              ItemSeparatorComponent={null}
            />
            {/* Total Section - Integrated as table footer */}
            <View style={styles.tableTotalSeparator} />
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total a pagar</Text>
              <Text style={[styles.totalAmount, {color: mainColor}]}>
                {formatCurrency(`$${totalAmount.toFixed(2)}`)}
              </Text>
            </View>
          </View>

          {/* Payment Method Section */}
          <View style={styles.methodSection}>
            <Text style={styles.methodHeader}>Método de pago</Text>
            <PaymentMethodItem
              selectedMethodId={selectedMethodId}
              onPress={handleMethodSelect}
            />
          </View>
        </ScrollView>

        {/* Pay Button */}
        <View style={styles.buttonContainer}>
          <ButtonK
            onPress={handleContinue}
            disabled={selectedMethodId === null}
            title="Pagar ahora"
            style={StyleSheet.flatten([
              styles.payButton,
              selectedMethodId === null && styles.disabledButton,
            ])}
          />
        </View>
      </View>
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
    backgroundColor: '#FAFAFA',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  paymentsTableContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 20,
    overflow: 'hidden',
  },
  paymentRow: {
    width: '100%',
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  paymentItemLast: {
    paddingBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginLeft: 20,
    marginRight: 20,
  },
  paymentDate: {
    fontSize: 12,
    fontFamily: FONTS.urbanistSemiBold,
    color: '#1A1A1A',
  },
  paymentDateCompleted: {
    opacity: 0.6,
  },
  paymentRef: {
    fontSize: 12,
    fontFamily: FONTS.urbanistSemiBold,
    color: '#1A1A1A',
  },
  paymentRefCompleted: {
    opacity: 0.6,
  },
  paymentRefPassDue: {
    color: '#FF4C24',
  },
  tableTotalSeparator: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginTop: 4,
    marginBottom: 4,
  },
  totalSection: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: FONTS.urbanistSemiBold,
    color: '#1A1A1A',
  },
  totalAmount: {
    fontSize: 14,
    fontFamily: FONTS.urbanistBold,
  },
  methodSection: {
    marginBottom: 20,
  },
  methodHeader: {
    fontSize: 14,
    fontFamily: FONTS.urbanistSemiBold,
    color: '#1A1A1A',
    marginBottom: 12,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  payButton: {
    width: '100%',
    borderRadius: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default PaymentMethodSelectScreen;
