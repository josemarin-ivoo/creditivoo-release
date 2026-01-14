import React, {useMemo, useState, useCallback, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  Image, // Importación añadida
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
import CurrencySelector, {Currency} from '../../components/CurrencySelector';
import {useLatestVesRate} from '../../hooks/useLatestVesRate';
import {formatAmountByCurrency} from '../../utils/currency';
import {Routes} from '../../../../../Utils/NavigationRoutes';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

type RouteParams = {
  PaymentInstallments: {
    purchase: PurchaseResponse | any;
  };
};

type PaymentInstallmentsRouteProp = RouteProp<
  RouteParams,
  'PaymentInstallments'
>;

const mapPaymentToInstallment = (
  payment: Payment,
  index: number,
  allPayments: Payment[],
): Installment => {
  const isApproved = payment.status === PaymentStatus.COMPLETED;
  const isPassDue = payment.status === PaymentStatus.PASS_DUE;

  let installmentNumber: number | undefined;
  if (!payment.isInitialPayment) {
    const nonInitialPaymentsBefore = allPayments
      .slice(0, index)
      .filter(p => !p.isInitialPayment).length;
    installmentNumber = nonInitialPaymentsBefore + 1;
  }

  let status: 'approved' | 'pending' | 'pass_due';
  if (isApproved) {
    status = 'approved';
  } else if (isPassDue) {
    status = 'pass_due';
  } else {
    status = 'pending';
  }

  return {
    id: payment.id.toString(),
    date: payment.paymentDate,
    type: payment.isInitialPayment ? 'initial' : 'installment',
    installmentNumber,
    amount: parseFloat(payment.amount),
    status,
    gemsReward: status === 'pending' ? 47 : undefined,
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
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');

  const {
    rate: exchangeRate,
    loading: isLoadingRate,
    error: exchangeRateError,
    refetch: refetchExchangeRate,
  } = useLatestVesRate(false);

  const prevCurrencyRef = useRef<Currency>('USD');

  useEffect(() => {
    if (
      selectedCurrency === 'BS' &&
      prevCurrencyRef.current !== 'BS' &&
      !isLoadingRate
    ) {
      refetchExchangeRate();
    }
    prevCurrencyRef.current = selectedCurrency;
  }, [selectedCurrency]);

  useEffect(() => {
    if (selectedCurrency === 'BS' && exchangeRateError && !isLoadingRate) {
      setSelectedCurrency('USD');
    }
  }, [selectedCurrency, exchangeRateError, isLoadingRate]);

  const purchaseId = useMemo(() => {
    if (purchase && typeof purchase === 'object' && 'id' in purchase) {
      return typeof purchase.id === 'string'
        ? parseInt(purchase.id, 10)
        : purchase.id;
    }
    return null;
  }, [purchase]);

  const installments = useMemo<Installment[]>(() => {
    if (
      purchase &&
      typeof purchase === 'object' &&
      'payments' in purchase &&
      Array.isArray(purchase.payments)
    ) {
      const payments = purchase.payments as Payment[];
      const sortedPayments = [...payments].sort(
        (a, b) =>
          new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime(),
      );

      return sortedPayments.map((payment, index) =>
        mapPaymentToInstallment(payment, index, sortedPayments),
      );
    }
    return [];
  }, [purchase]);

  const installmentsWithCurrency = useMemo(() => {
    return installments.map(installment => {
      const showSkeleton =
        selectedCurrency === 'BS' && isLoadingRate && !exchangeRate;

      return {
        ...installment,
        displayAmount: showSkeleton
          ? null
          : formatAmountByCurrency(
              installment.amount,
              selectedCurrency,
              exchangeRate,
            ),
        currency: selectedCurrency,
        showSkeleton,
      };
    });
  }, [installments, selectedCurrency, exchangeRate, isLoadingRate]);

  const hasPassDuePayments = useMemo(() => {
    if (
      purchase &&
      typeof purchase === 'object' &&
      'payments' in purchase &&
      Array.isArray(purchase.payments)
    ) {
      const payments = purchase.payments as Payment[];
      return payments.some(
        payment => payment.status === PaymentStatus.PASS_DUE,
      );
    }
    return false;
  }, [purchase]);

  const onRefresh = useCallback(async () => {
    if (!purchaseId) {
      setRefreshing(false);
      return;
    }
    try {
      setRefreshing(true);
      const refreshedPurchase = await getPurchaseById(purchaseId);
      setPurchase(refreshedPurchase);
    } catch (error: any) {
      console.error('[PaymentInstallmentsScreen] Error al refrescar:', error);
    } finally {
      setRefreshing(false);
    }
  }, [purchaseId]);

  const handleCheckboxPress = useCallback(
    (installmentId: string, installmentIndex: number) => {
      const installment = installments[installmentIndex];
      if (!installment || installment.status === 'approved') return;

      const isCurrentlySelected = selectedPayments.has(installmentId);

      if (isCurrentlySelected) {
        const newSelected = new Set<string>();
        installments.forEach((inst, idx) => {
          if (idx < installmentIndex && selectedPayments.has(inst.id)) {
            newSelected.add(inst.id);
          }
        });
        setSelectedPayments(newSelected);
      } else {
        let canSelect = true;
        for (let i = 0; i < installmentIndex; i++) {
          const prevInstallment = installments[i];
          if (
            prevInstallment.status !== 'approved' &&
            !selectedPayments.has(prevInstallment.id)
          ) {
            canSelect = false;
            break;
          }
        }

        if (canSelect) {
          const newSelected = new Set(selectedPayments);
          newSelected.add(installmentId);
          setSelectedPayments(newSelected);
        }
      }
    },
    [installments, selectedPayments],
  );

  const handleBackPress = () => navigation.goBack();
  const handleHelpPress = () => (navigation as any).navigate(Routes.NAVIGATION_HELP);

  const handlePayPress = () => {
    if (!purchaseId || selectedPayments.size === 0) return;

    if (
      purchase &&
      typeof purchase === 'object' &&
      'payments' in purchase &&
      Array.isArray(purchase.payments)
    ) {
      const payments = purchase.payments as Payment[];
      const selectedPaymentObjects = payments.filter(payment =>
        selectedPayments.has(payment.id.toString()),
      );

      (navigation as any).navigate(Routes.NAVIGATION_PURCHASESCONFIRM, {
        purchaseId: purchaseId,
        payments: selectedPaymentObjects,
      });
    }
  };

  const getPlanName = (): string => {
    if (purchase?.financingType) return purchase.financingType.name || 'Plan';
    return 'Plan';
  };

  const getPlanDescription = (): string => {
    if (purchase?.financingType) {
      const days = purchase.financingType.daysBetweenPayments || 14;
      const totalCount = installments.length - 1;
      return `Inicial + ${totalCount} cuotas cada ${days} días`;
    }
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
        {installments.length === 0 ? (
          /* --- ESTADO VACÍO --- */
          <View style={styles.emptyContainer}>
            <Image
              source={require('../../images/notifications/mailbox.png')}
              style={styles.mailboxIcon}
              resizeMode="contain"
            />
            <Text style={styles.emptyText}>No existen cuotas para pagar</Text>
          </View>
        ) : (
          /* --- LISTA DE CUOTAS --- */
          <>
            <View style={styles.currencySelectorContainer}>
              <CurrencySelector
                selectedCurrency={selectedCurrency}
                onCurrencyChange={setSelectedCurrency}
                disabled={isLoadingRate}
                variant="standalone"
              />
            </View>

            <View style={styles.planCard}>
              <Text style={styles.planTitle}>{getPlanName()}</Text>
              <Text style={styles.planDescription}>{getPlanDescription()}</Text>
            </View>

            {hasPassDuePayments && (
              <View style={styles.passDueAlert}>
                <Text style={styles.passDueAlertText}>Tienes pagos pendientes</Text>
              </View>
            )}

            <View style={styles.installmentsContainer}>
              {installmentsWithCurrency.map((item, index) => {
                const isSelected = selectedPayments.has(item.id);
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

              {purchase &&
                !['COMPLETED', 'completed'].includes(purchase.status) && (
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
                )}
            </View>
          </>
        )}
      </View>
    </CurvedHeaderLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  currencySelectorContainer: {
    alignItems: 'flex-end',
    marginBottom: SCREEN_WIDTH * 0.03,
    marginRight: SCREEN_WIDTH * 0.05,
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
    alignSelf: 'center',
    width: SCREEN_WIDTH * 0.85,
  },
  planTitle: {
    fontSize: SCREEN_WIDTH * 0.048,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.textPrimary,
    marginBottom: SCREEN_WIDTH * 0.008,
    textAlign: 'center',
  },
  planDescription: {
    fontSize: SCREEN_WIDTH * 0.033,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.grayMedium,
    textAlign: 'center',
  },
  passDueAlert: {
    backgroundColor: '#FFF3F2',
    borderRadius: 8,
    paddingVertical: SCREEN_WIDTH * 0.03,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    marginBottom: SCREEN_WIDTH * 0.04,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFE5E3',
  },
  passDueAlertText: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interSemiBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.semibold,
    color: '#C53030',
    textAlign: 'center',
  },
  installmentsContainer: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: SCREEN_WIDTH * 0.04,
    borderWidth: 1,
    borderColor: '#6E717C4F',
    marginHorizontal: SCREEN_WIDTH * 0.01,
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
  /* --- ESTILOS VISTA VACÍA --- */
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SCREEN_WIDTH * 0.2,
    paddingHorizontal: SCREEN_WIDTH * 0.1,
  },
  mailboxIcon: {
    width: SCREEN_WIDTH * 0.4,
    height: SCREEN_WIDTH * 0.4,
    marginBottom: SCREEN_WIDTH * 0.05,
  },
  emptyText: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    color: IVOO_COLORS.grayMedium,
    textAlign: 'center',
  },
});

export default PaymentInstallmentsScreen;