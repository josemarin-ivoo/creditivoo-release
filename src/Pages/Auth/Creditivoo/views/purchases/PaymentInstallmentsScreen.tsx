import React, {useMemo, useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import CurvedHeaderLayout from '../../components/layouts/CurvedHeaderLayout';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import {InstallmentItem, Installment} from '../../components/purchases';
import {
  PurchaseResponse,
  Payment,
  PaymentStatus,
  getPurchaseById,
} from '../../services/purchases';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

type RouteParams = {
  PaymentInstallments: {
    purchase: PurchaseResponse | any; // Accept both PurchaseResponse and legacy Purchase
  };
};

type PaymentInstallmentsRouteProp = RouteProp<
  RouteParams,
  'PaymentInstallments'
>;

// Helper function to map Payment from API to Installment format
const mapPaymentToInstallment = (
  payment: Payment,
  index: number,
  allPayments: Payment[],
): Installment => {
  // Determine if it's approved (COMPLETED) or pending
  // COMPLETED = approved, all others = pending
  const isApproved = payment.status === PaymentStatus.COMPLETED;
  const isPending =
    payment.status === PaymentStatus.PENDING ||
    payment.status === PaymentStatus.SCHEDULED ||
    payment.status === PaymentStatus.PENDING_CONFIRMATION ||
    payment.status === PaymentStatus.PASS_DUE ||
    payment.status === PaymentStatus.FAILED;

  // Calculate installment number (exclude initial payment)
  let installmentNumber: number | undefined;
  if (!payment.isInitialPayment) {
    // Count how many non-initial payments come before this one
    const nonInitialPaymentsBefore = allPayments
      .slice(0, index)
      .filter(p => !p.isInitialPayment).length;
    installmentNumber = nonInitialPaymentsBefore + 1;
  }

  return {
    id: payment.id.toString(),
    date: payment.paymentDate,
    type: payment.isInitialPayment ? 'initial' : 'installment',
    installmentNumber,
    amount: parseFloat(payment.amount),
    status: isApproved ? 'approved' : 'pending',
    gemsReward: isPending ? 47 : undefined, // TODO: Get actual gems reward from API if available
  };
};

const PaymentInstallmentsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<PaymentInstallmentsRouteProp>();
  const initialPurchase = route.params.purchase;
  const [purchase, setPurchase] = useState<PurchaseResponse | any>(
    initialPurchase,
  );
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(
    new Set(),
  );
  const [refreshing, setRefreshing] = useState(false);

  // Get purchase ID from route params
  const purchaseId = useMemo(() => {
    if (purchase && typeof purchase === 'object' && 'id' in purchase) {
      return typeof purchase.id === 'string'
        ? parseInt(purchase.id, 10)
        : purchase.id;
    }
    return null;
  }, [purchase]);

  // Map payments from API to Installment format
  const installments = useMemo<Installment[]>(() => {
    // Check if purchase has payments array (PurchaseResponse from API)
    if (
      purchase &&
      typeof purchase === 'object' &&
      'payments' in purchase &&
      Array.isArray(purchase.payments)
    ) {
      const payments = purchase.payments as Payment[];
      console.log('[PaymentInstallmentsScreen] Payments recibidos:', payments);

      // Sort payments by paymentDate to ensure correct order
      const sortedPayments = [...payments].sort(
        (a, b) =>
          new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime(),
      );

      return sortedPayments.map((payment, index) =>
        mapPaymentToInstallment(payment, index, sortedPayments),
      );
    }

    // Fallback: return empty array if no payments
    console.warn(
      '[PaymentInstallmentsScreen] No se encontraron payments en la compra',
    );
    return [];
  }, [purchase]);

  // Refresh purchase data
  const onRefresh = useCallback(async () => {
    if (!purchaseId) {
      setRefreshing(false);
      return;
    }

    try {
      setRefreshing(true);
      console.log(
        '[PaymentInstallmentsScreen] Refrescando datos de compra:',
        purchaseId,
      );
      const refreshedPurchase = await getPurchaseById(purchaseId);
      setPurchase(refreshedPurchase);
      console.log(
        '[PaymentInstallmentsScreen] Datos de compra refrescados exitosamente',
      );
    } catch (error: any) {
      console.error(
        '[PaymentInstallmentsScreen] Error al refrescar datos de compra:',
        error,
      );
    } finally {
      setRefreshing(false);
    }
  }, [purchaseId]);

  // Handle checkbox press with sequential selection logic
  const handleCheckboxPress = useCallback(
    (installmentId: string, installmentIndex: number) => {
      const installment = installments[installmentIndex];
      if (!installment) {
        return;
      }

      // If already approved, cannot be toggled
      if (installment.status === 'approved') {
        return;
      }

      // Check if already selected
      const isCurrentlySelected = selectedPayments.has(installmentId);

      if (isCurrentlySelected) {
        // Deselect this payment and all subsequent ones
        const newSelected = new Set<string>();
        installments.forEach((inst, idx) => {
          if (idx < installmentIndex && selectedPayments.has(inst.id)) {
            newSelected.add(inst.id);
          }
        });
        setSelectedPayments(newSelected);
      } else {
        // Check if all previous payments are selected (sequential validation)
        let canSelect = true;
        for (let i = 0; i < installmentIndex; i++) {
          const prevInstallment = installments[i];
          const isPrevApproved = prevInstallment.status === 'approved';
          const isPrevSelected = selectedPayments.has(prevInstallment.id);
          if (!isPrevApproved && !isPrevSelected) {
            canSelect = false;
            break;
          }
        }

        if (canSelect) {
          // Select this payment
          const newSelected = new Set(selectedPayments);
          newSelected.add(installmentId);
          setSelectedPayments(newSelected);
        } else {
          console.log(
            '[PaymentInstallmentsScreen] No se puede seleccionar: deben seleccionarse los pagos anteriores primero',
          );
        }
      }
    },
    [installments, selectedPayments],
  );

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleHelpPress = () => {
    // TODO: Navigate to help screen or show help modal
    console.log('[PaymentInstallmentsScreen] Help pressed');
  };

  const handlePayPress = () => {
    // TODO: Navigate to payment method selection screen
    console.log('[PaymentInstallmentsScreen] Pay pressed');
  };

  const getPlanName = (): string => {
    // Get plan name from financingType
    if (
      purchase &&
      typeof purchase === 'object' &&
      'financingType' in purchase &&
      purchase.financingType
    ) {
      return purchase.financingType.name || 'Plan';
    }
    return 'Plan';
  };

  const getPlanDescription = (): string => {
    // Get description from financingType
    if (
      purchase &&
      typeof purchase === 'object' &&
      'financingType' in purchase &&
      purchase.financingType
    ) {
      const financingType = purchase.financingType;
      const daysBetweenPayments = financingType.daysBetweenPayments || 14;
      const totalCount = installments.length - 1; // Excluding initial
      return `Inicial + ${totalCount} cuotas cada ${daysBetweenPayments} días`;
    }

    // Fallback
    const totalCount = installments.length - 1;
    return `Inicial + ${totalCount} cuotas cada 14 días`;
  };

  return (
    <CurvedHeaderLayout
      title="Pagar cuotas"
      showBackButton={true}
      onBackPress={handleBackPress}
      scroll={true}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[IVOO_COLORS.primary]}
          tintColor={IVOO_COLORS.primary}
        />
      }>
      <View style={styles.container}>
        {/* Plan Details Card */}
        <View style={styles.planCard}>
          <Text style={styles.planTitle}>{getPlanName()}</Text>
          <Text style={styles.planDescription}>{getPlanDescription()}</Text>
        </View>

        {/* Installments List */}
        <View style={styles.installmentsContainer}>
          {installments.map((item, index) => {
            const isSelected = selectedPayments.has(item.id);
            // Check if previous payments are selected (for sequential validation)
            const canSelect =
              index === 0 ||
              installments
                .slice(0, index)
                .every(
                  prevInst =>
                    prevInst.status === 'approved' ||
                    selectedPayments.has(prevInst.id),
                );

            return (
              <InstallmentItem
                key={item.id}
                installment={item}
                isSelected={isSelected}
                isDisabled={!canSelect && !isSelected}
                onCheckboxPress={() => {
                  if (canSelect || isSelected) {
                    handleCheckboxPress(item.id, index);
                  }
                }}
              />
            );
          })}

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.helpButton}
              onPress={handleHelpPress}
              activeOpacity={0.7}>
              <Text style={styles.helpButtonText}>Necesito ayuda</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.payButton}
              onPress={handlePayPress}
              activeOpacity={0.7}>
              <Text style={styles.payButtonText}>Pagar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </CurvedHeaderLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  planCard: {
    backgroundColor: IVOO_COLORS.white,
    borderRadius: 12,
    paddingVertical: SCREEN_WIDTH * 0.03,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    marginBottom: SCREEN_WIDTH * 0.04,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  planTitle: {
    fontSize: SCREEN_WIDTH * 0.055,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.textPrimary,
    marginBottom: SCREEN_WIDTH * 0.008,
    textAlign: 'center',
  },
  planDescription: {
    fontSize: SCREEN_WIDTH * 0.037,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.grayMedium,
    textAlign: 'center',
  },
  installmentsContainer: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: SCREEN_WIDTH * 0.04,
    borderWidth: 1,
    borderColor: '#6E717C4F',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: SCREEN_WIDTH * 0.03,
    paddingTop: SCREEN_WIDTH * 0.03,
  },
  helpButton: {
    flex: 1,
    backgroundColor: IVOO_COLORS.white,
    borderWidth: 1,
    borderColor: IVOO_COLORS.grayLight,
    borderRadius: 12,
    paddingVertical: SCREEN_WIDTH * 0.025,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  helpButtonText: {
    fontSize: SCREEN_WIDTH * 0.035,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interSemiBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.semibold,
    color: IVOO_COLORS.textPrimary,
  },
  payButton: {
    flex: 1,
    backgroundColor: IVOO_COLORS.primary,
    borderRadius: 12,
    paddingVertical: SCREEN_WIDTH * 0.025,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  payButtonText: {
    fontSize: SCREEN_WIDTH * 0.035,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interSemiBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.semibold,
    color: IVOO_COLORS.white,
  },
});

export default PaymentInstallmentsScreen;
