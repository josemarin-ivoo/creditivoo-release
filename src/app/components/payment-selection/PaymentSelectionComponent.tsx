import React from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import moment from 'moment';
import 'moment/locale/es';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {Payment, PaymentStatus} from '@services/api/payments';
import {COLORS, FONTS} from 'app/styles/global.style';
import CustomCheckbox from '@components/inputs/CustomCheckbox';
import {formatCurrency} from 'utils';

moment.locale('es');

interface PaymentSelectionProps {
  payments: Payment[];
  selectedPayments: Payment[];
  onTogglePayment: (payment: Payment) => void;
  onConfirmPayment?: () => void;
  isCompletedTab?: boolean;
}

const PaymentSelectionComponent: React.FC<PaymentSelectionProps> = ({
  payments,
  selectedPayments,
  onTogglePayment,
  onConfirmPayment,
  isCompletedTab = false,
}) => {
  const formatDate = (date: string) => {
    return moment(date).format('DD MMM YYYY');
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return COLORS.primaryGreen;
      case PaymentStatus.SCHEDULED:
        return COLORS.tagsBackground;
      case PaymentStatus.PENDING:
      case PaymentStatus.PENDING_CONFIRMATION:
        return COLORS.primaryBlue;
      case PaymentStatus.PASS_DUE:
      case PaymentStatus.FAILED:
        return COLORS.redAccent;
      default:
        return COLORS.textGrey;
    }
  };

  const getStatusText = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return 'Completado';
      case PaymentStatus.PENDING:
        return 'Pendiente';
      case PaymentStatus.PENDING_CONFIRMATION:
        return 'Pendiente de confirmación';
      case PaymentStatus.SCHEDULED:
        return 'Programado';
      case PaymentStatus.PASS_DUE:
        return 'Vencido';
      case PaymentStatus.FAILED:
        return 'Fallido';
      default:
        return status;
    }
  };

  // Calculate total amount for selected payments
  const totalAmount = selectedPayments
    .map(pmnt => {
      const payment = payments.find(p => p.id === pmnt.id);
      return payment ? parseFloat(payment.amount.replace('$', '')) : 0;
    })
    .reduce((acc, amount) => acc + amount, 0);

  // Render payment item with improved styling
  const renderPaymentItem = ({item}: {item: Payment}) => {
    const isSelected = selectedPayments.some(p => p.id === item.id);
    const statusColor = getStatusColor(item.status as PaymentStatus);
    const isCompleted = item.status === PaymentStatus.COMPLETED;
    const isScheduled = item.status === PaymentStatus.SCHEDULED;
    const isPending = item.status === PaymentStatus.PENDING;
    const isPassDue = item.status === PaymentStatus.PASS_DUE;
    const isPendingConfirmation =
      item.status === PaymentStatus.PENDING_CONFIRMATION;

    return (
      <TouchableOpacity
        style={styles.paymentItemRow}
        onPress={() =>
          !isCompletedTab &&
          (isScheduled || isPending || isPassDue) &&
          onTogglePayment(item)
        }
        disabled={isCompletedTab || !isScheduled || !isPending || !isPassDue}>
        <View style={styles.checkboxContainer}>
          {isCompletedTab ? (
            isCompleted && (
              <View style={styles.completedIndicator}>
                <Text style={styles.completedIndicatorText}>✓</Text>
              </View>
            )
          ) : isPendingConfirmation ? (
            <View style={styles.pendingConfirmationContainer}>
              <Icon
                type={IconType.MaterialCommunityIcons}
                name="clock-time-four-outline"
                size={22}
                color={COLORS.primaryBlue}
              />
            </View>
          ) : (
            (isScheduled || isPending || isPassDue) && (
              <CustomCheckbox
                checked={isSelected}
                onPress={() => onTogglePayment(item)}
              />
            )
          )}
        </View>
        <View style={styles.paymentInfo}>
          <View style={styles.paymentHeader}>
            <Text style={styles.paymentDate}>
              {formatDate(item.paymentDate)}
            </Text>
            <View style={[styles.statusBadge, {backgroundColor: statusColor}]}>
              <Text style={styles.statusText}>
                {getStatusText(item.status as PaymentStatus)}
              </Text>
            </View>
          </View>
          <Text style={styles.paymentAmount}>
            {formatCurrency(item.amount)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={payments}
        renderItem={renderPaymentItem}
        keyExtractor={item => item.id.toString()}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        contentContainerStyle={[
          styles.listContent,
          !isCompletedTab &&
            selectedPayments.length > 0 && {paddingBottom: 100},
        ]}
      />
      {!isCompletedTab && selectedPayments.length > 0 && (
        <View style={[styles.footer, styles.totalSection]}>
          <View style={styles.amountContainer}>
            <Text style={styles.footerText}>Monto a pagar</Text>
            <Text style={styles.footerAmount}>
              {formatCurrency(totalAmount)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={onConfirmPayment}>
            <Text style={styles.confirmButtonText}>Ir a pagar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default PaymentSelectionComponent;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    flex: 1,
    position: 'relative',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  paymentItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentDate: {
    fontFamily: FONTS.urbanistSemiBold,
    fontSize: 15,
    color: COLORS.greyDark,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontFamily: FONTS.urbanistSemiBold,
    fontSize: 12,
    color: '#fff',
  },
  paymentAmount: {
    fontFamily: FONTS.urbanistBold,
    fontSize: 17,
    color: COLORS.primaryBlue,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 10,
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    backgroundColor: '#e3ffe7',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  amountContainer: {
    flex: 1,
  },
  totalSection: {
    backgroundColor: '#e3ffe7',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  footerText: {
    fontSize: 16,
    fontFamily: FONTS.urbanistSemiBold,
    color: COLORS.greyDark,
  },
  footerAmount: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: FONTS.urbanistSemiBold,
    color: COLORS.primaryBlue,
  },
  confirmButton: {
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: FONTS.urbanistSemiBold,
    textAlign: 'center',
  },
  completedIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedIndicatorText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pendingConfirmationContainer: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
