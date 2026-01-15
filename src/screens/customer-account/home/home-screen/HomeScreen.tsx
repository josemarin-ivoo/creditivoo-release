import React, {useEffect, useMemo, useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ScrollView,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Card,
  Text as KittenText,
  useTheme,
  ThemeType,
} from '@ui-kitten/components';
import {SafeAreaView} from 'react-native-safe-area-context';
import {RootState, AppDispatch} from 'store/store';
import {setSelectedPurchaseIds} from 'store/slices/purchase-slice';
import {fetchPaymentsByPurchaseIds} from 'store/slices/payment-slice';
import {getUserBalance} from 'store/slices/balance-slice';
import {fetchPurchasesByUserId} from 'store/slices/purchase-slice';
import {FONTS} from 'app/styles/global.style';
import {SCREENS} from '@shared-constants';
import {PaymentStatus} from '@services/api/payments';
import IvooLogo from '../../../../assets/svgs/IvooLogo.svg';
import MainIvooPhoto from '../../../../assets/img/main-ivoo-photo.jpeg';

type PurchaseStatusCategory = 'IN_PROGRESS' | 'OVERDUE' | 'COMPLETED';

const PURCHASE_STATUS_FILTERS: {
  key: PurchaseStatusCategory;
  label: string;
}[] = [
  {key: 'IN_PROGRESS', label: 'En progreso'},
  {key: 'OVERDUE', label: 'Atrasadas'},
  {key: 'COMPLETED', label: 'Completadas'},
];

const PURCHASE_STATUS_LABELS: Record<PurchaseStatusCategory, string> = {
  IN_PROGRESS: 'En progreso',
  OVERDUE: 'Atrasada',
  COMPLETED: 'Completada',
};

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const [refreshing, setRefreshing] = useState(false);
  const [purchaseStatusFilter, setPurchaseStatusFilter] =
    useState<PurchaseStatusCategory>('IN_PROGRESS');
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const isInitialLoadRef = useRef(true);

  const {user} = useSelector((state: RootState) => state.auth);
  const {userPurchases, isLoading: purchasesLoading} = useSelector(
    (state: RootState) => state.purchases,
  );
  const {payments} = useSelector((state: RootState) => state.payments);

  const parseAmount = (value?: string | number | null) => {
    if (typeof value === 'number') {
      return Number.isNaN(value) ? 0 : value;
    }
    if (typeof value === 'string') {
      const normalized = value.replace(/[^0-9.-]/g, '');
      const parsed = parseFloat(normalized);
      return Number.isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const formatCurrency = (value: number) => {
    const safeValue = Number.isFinite(value) ? value : 0;
    return `$${safeValue.toLocaleString('es-VE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return '';
    }
    const parsed = new Date(dateString);
    if (Number.isNaN(parsed.getTime())) {
      return dateString;
    }
    return parsed.toLocaleDateString('es-VE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const purchaseSnapshots = useMemo(() => {
    return userPurchases.map(purchase => {
      const purchasePayments = payments.filter(
        payment => payment.purchaseId === purchase.id,
      );
      const totalInstallments = purchasePayments.length;
      const completedInstallments = purchasePayments.filter(
        payment => payment.status === PaymentStatus.COMPLETED,
      ).length;
      const pendingPayments = purchasePayments.filter(
        payment => payment.status !== PaymentStatus.COMPLETED,
      );
      const pendingAmountFromPayments = pendingPayments.reduce(
        (sum, payment) => sum + parseAmount(payment.amount),
        0,
      );
      const totalAmountValue = parseAmount(purchase.totalAmount);
      const hasPaymentData = purchasePayments.length > 0;
      const pendingAmount = hasPaymentData
        ? pendingAmountFromPayments
        : Math.max(totalAmountValue - parseAmount(purchase.initial_payment), 0);
      const paidAmount = hasPaymentData
        ? Math.max(totalAmountValue - pendingAmount, 0)
        : parseAmount(purchase.initial_payment);
      const nextPayment = pendingPayments
        .slice()
        .sort(
          (a, b) =>
            new Date(a.paymentDate).getTime() -
            new Date(b.paymentDate).getTime(),
        )[0];

      let statusCategory: PurchaseStatusCategory = 'IN_PROGRESS';
      if (purchase.status === 'COMPLETED' || pendingAmount <= 0) {
        statusCategory = 'COMPLETED';
      } else if (
        pendingPayments.some(
          payment =>
            payment.status === PaymentStatus.PASS_DUE ||
            payment.status === PaymentStatus.FAILED,
        )
      ) {
        statusCategory = 'OVERDUE';
      }

      return {
        id: purchase.id,
        deviceName:
          purchase.device?.name ||
          purchase.device?.brand?.name ||
          `Compra #${purchase.id}`,
        createdAt: purchase.createdAt,
        totalInstallments,
        completedInstallments,
        pendingAmount: Math.max(pendingAmount, 0),
        paidAmount: Math.max(paidAmount, 0),
        totalAmountValue,
        nextPaymentDate: nextPayment?.paymentDate,
        nextPaymentAmount: nextPayment
          ? parseAmount(nextPayment.amount)
          : undefined,
        statusCategory,
        raw: purchase,
      };
    });
  }, [userPurchases, payments]);

  const filteredPurchases = useMemo(() => {
    switch (purchaseStatusFilter) {
      case 'OVERDUE':
        return purchaseSnapshots.filter(
          purchase => purchase.statusCategory === 'OVERDUE',
        );
      case 'COMPLETED':
        return purchaseSnapshots.filter(
          purchase => purchase.statusCategory === 'COMPLETED',
        );
      default:
        return purchaseSnapshots.filter(
          purchase => purchase.statusCategory === 'IN_PROGRESS',
        );
    }
  }, [purchaseSnapshots, purchaseStatusFilter]);

  const summaryTotals = useMemo(() => {
    // Calculate totals based on actual payments with correct statuses
    let totalToPay = 0;
    let paid = 0;
    let totalInstallments = 0;
    let completedInstallments = 0;

    filteredPurchases.forEach(purchase => {
      const purchasePayments = payments.filter(
        payment => payment.purchaseId === purchase.id,
      );

      purchasePayments.forEach(payment => {
        const amount = parseAmount(payment.amount);
        const status = payment.status;

        // Total a pagar: payments with status SCHEDULED, PASS_DUE, PENDING
        if (
          status === PaymentStatus.SCHEDULED ||
          status === PaymentStatus.PASS_DUE ||
          status === PaymentStatus.PENDING
        ) {
          totalToPay += amount;
        }

        // Pagado: payments with status COMPLETED
        if (status === PaymentStatus.COMPLETED) {
          paid += amount;
        }

        totalInstallments += 1;
        if (status === PaymentStatus.COMPLETED) {
          completedInstallments += 1;
        }
      });
    });

    return {
      totalToPay,
      pending: totalToPay, // Pending is the same as total to pay
      paid,
      totalInstallments,
      completedInstallments,
    };
  }, [filteredPurchases, payments]);

  const handleOpenPayments = (purchaseId: number) => {
    (navigation as any).navigate(SCREENS.PURCHASE_DETAIL, {
      purchaseId,
    });
  };

  const getStatusForFilter = (
    filter: PurchaseStatusCategory,
  ): 'PASS_DUE' | 'COMPLETED' | undefined => {
    switch (filter) {
      case 'OVERDUE':
        return 'PASS_DUE';
      case 'COMPLETED':
        return 'COMPLETED';
      default:
        return undefined;
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      if (user) {
        const status = getStatusForFilter(purchaseStatusFilter);
        // Get fresh purchases first
        const purchasesResult = await dispatch(
          fetchPurchasesByUserId({userId: user.id, status}),
        );
        // Then get the latest balance
        await dispatch(getUserBalance(user.id));
        // Use the fresh purchases from the result to update payments
        const freshPurchases = Array.isArray(purchasesResult.payload)
          ? purchasesResult.payload
          : [];
        const latestPurchaseIds = freshPurchases.map((p: {id: number}) => p.id);
        await dispatch(fetchPaymentsByPurchaseIds(latestPurchaseIds));
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, user, purchaseStatusFilter]);

  // Initialize default selected purchases (all PENDING purchases)
  useEffect(() => {
    if (userPurchases.length > 0) {
      const pendingIds = userPurchases
        .filter(purchase => purchase.status === 'PENDING')
        .map(purchase => purchase.id);
      dispatch(setSelectedPurchaseIds(pendingIds));
    }
  }, [userPurchases, dispatch]);

  // Fetch purchases when filter changes
  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const fetchPurchases = async () => {
      // Only show filter loading if it's not the initial load
      if (!isInitialLoadRef.current) {
        setIsFilterLoading(true);
      }
      try {
        const status = getStatusForFilter(purchaseStatusFilter);
        console.log(
          `[HomeScreen] Fetching purchases/users/${user.id} with status: ${
            status || 'all'
          }`,
        );
        const purchasesResult = await dispatch(
          fetchPurchasesByUserId({userId: user.id, status}),
        );

        const purchasesList = Array.isArray(purchasesResult.payload)
          ? purchasesResult.payload
          : [];

        if (purchasesList.length > 0) {
          const purchaseIds = purchasesList.map(
            (purchase: {id: number}) => purchase.id,
          );
          console.log(
            '[HomeScreen] Fetch purchases success. Purchase IDs:',
            purchaseIds,
          );
          await dispatch(fetchPaymentsByPurchaseIds(purchaseIds));
        } else {
          console.log(
            '[HomeScreen] Fetch purchases success. No purchases returned.',
          );
        }
      } catch (error) {
        console.error(
          '[HomeScreen] Error fetching purchases/users/:userId:',
          error,
        );
      } finally {
        if (!isInitialLoadRef.current) {
          setIsFilterLoading(false);
        }
        isInitialLoadRef.current = false;
      }
    };

    fetchPurchases();
  }, [dispatch, user?.id, purchaseStatusFilter]);

  // Render loading state
  const renderLoading = () => (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#ffffff" />
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    </SafeAreaView>
  );

  // Render empty purchases state - Welcome screen
  const renderNoActivePurchases = () => {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar backgroundColor="#ffffff" />
        <View style={styles.root}>
          <View style={styles.welcomeTopSection}>
            <View style={styles.welcomeTopLogoContainer}>
              <IvooLogo width={140} height={140} />
            </View>
          </View>

          <View style={styles.welcomeImageContainer}>
            <Image
              source={MainIvooPhoto}
              style={styles.welcomeMainImage}
              resizeMode="cover"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  };

  // Render purchases screen
  const renderPurchases = () => {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.root}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
          <LinearGradient
            colors={['#FFFFFF', '#FFFFFF']}
            style={styles.heroContainer}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}>
            <View style={styles.heroHeader}>
              <IvooLogo width={140} height={140} />
            </View>
            <Text style={styles.heroTitle}>Mis compras</Text>
            <View style={styles.promoBanner}>
              <Image
                source={MainIvooPhoto}
                style={styles.promoImage}
                resizeMode="cover"
              />
            </View>
            <Card style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View>
                  <KittenText style={styles.summaryLabel}>
                    Total a pagar
                  </KittenText>
                  <KittenText style={styles.summaryAmount}>
                    {formatCurrency(summaryTotals.totalToPay)}
                  </KittenText>
                </View>
              </View>
              <View style={styles.summaryStatsRow}>
                <View style={styles.summaryStat}>
                  <Text style={styles.summaryStatLabel}>Pendiente</Text>
                  <Text style={styles.summaryStatValue}>
                    {formatCurrency(summaryTotals.pending)}
                  </Text>
                </View>
                <View style={styles.summaryStat}>
                  <Text style={styles.summaryStatLabel}>Pagado</Text>
                  <Text style={styles.summaryStatValue}>
                    {formatCurrency(summaryTotals.paid)}
                  </Text>
                </View>
                {purchaseStatusFilter !== 'COMPLETED' && (
                  <View style={styles.summaryStat}>
                    <Text style={styles.summaryStatLabel}>Cant. cuotas</Text>
                    <Text style={styles.summaryStatValue}>
                      {summaryTotals.completedInstallments}/
                      {summaryTotals.totalInstallments}
                    </Text>
                  </View>
                )}
              </View>
            </Card>
          </LinearGradient>

          <View style={styles.filterTabs}>
            {PURCHASE_STATUS_FILTERS.map(filter => {
              const isActive = purchaseStatusFilter === filter.key;
              return (
                <TouchableOpacity
                  key={filter.key}
                  style={[styles.filterTab, isActive && styles.filterTabActive]}
                  onPress={() => setPurchaseStatusFilter(filter.key)}>
                  <Text
                    style={[
                      styles.filterTabLabel,
                      isActive && styles.filterTabLabelActive,
                    ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {isFilterLoading && (
            <View style={styles.filterLoadingContainer}>
              <ActivityIndicator
                size="small"
                color={theme['color-primary-500']}
              />
            </View>
          )}

          <View style={styles.purchaseList}>
            {filteredPurchases.length === 0 && !isFilterLoading ? (
              <Text style={styles.emptyPurchasesText}>
                No hay compras en este estado.
              </Text>
            ) : (
              filteredPurchases.map(purchase => {
                const amountToPay =
                  purchase.nextPaymentAmount || purchase.pendingAmount;
                const statusLabel =
                  PURCHASE_STATUS_LABELS[purchase.statusCategory];
                const purchaseDate =
                  purchase.nextPaymentDate || purchase.raw.createdAt;
                return (
                  <Card key={purchase.id} style={styles.purchaseCard}>
                    <View style={styles.purchaseCardHeader}>
                      <View style={styles.purchaseCardHeaderLeft}>
                        <Text style={styles.purchaseDate}>
                          Día : {formatDate(purchaseDate)}
                        </Text>
                        <Text style={styles.purchaseTitle}>
                          {purchase.deviceName}
                        </Text>
                        <Text style={styles.purchaseProgress}>
                          {purchase.completedInstallments}/
                          {purchase.totalInstallments || 0} de pago
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          styles[`statusBadge${purchase.statusCategory}`],
                        ]}>
                        <Text style={styles.statusBadgeText}>
                          {statusLabel}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.purchaseCardBody}>
                      <View style={styles.purchaseCardBodyLeft}>
                        <Text style={styles.purchaseAmount}>
                          {formatCurrency(amountToPay)}
                        </Text>
                        <Text style={styles.purchaseAmountHint}>
                          {purchase.nextPaymentDate
                            ? 'Próximo pago'
                            : 'Total pendiente'}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.purchaseCardAction}
                        onPress={() => handleOpenPayments(purchase.id)}
                        activeOpacity={0.7}>
                        <Text style={styles.purchaseCardActionText}>
                          Ver detalles &gt;
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                );
              })
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };

  // Check if user has any purchases
  const hasPurchases = userPurchases.length > 0;

  // Conditional rendering based on state
  // Only show full screen loading on initial load
  if (purchasesLoading && isInitialLoadRef.current) {
    return renderLoading();
  }

  // Show welcome screen if user has no purchases yet
  if (!hasPurchases && !isInitialLoadRef.current) {
    return renderNoActivePurchases();
  }

  return renderPurchases();
};

// Styles
const createStyles = (theme: ThemeType) => {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme['color-primary-100'],
    },
    root: {
      flex: 1,
      backgroundColor: theme['background-basic-color-2'],
    },
    scrollContent: {
      paddingBottom: 40,
    },
    heroContainer: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 12,
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
      backgroundColor: theme['background-basic-color-1'],
    },
    heroHeader: {
      alignItems: 'center',
      marginBottom: 0,
    },
    heroTitle: {
      fontSize: 20,
      fontFamily: FONTS.urbanistBold,
      color: theme['text-basic-color'],
      marginTop: 1,
    },
    promoBanner: {
      marginTop: 16,
      marginBottom: 10,
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: theme['color-primary-100'],
    },
    promoImage: {
      width: '100%',
      height: 120,
    },
    summaryCard: {
      borderRadius: 16,
      padding: 20,
      marginTop: 0,
      borderWidth: 1,
      borderColor: theme['border-basic-color-3'],
      backgroundColor: theme['background-basic-color-1'],
    },
    summaryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    summaryLabel: {
      color: theme['text-hint-color'],
      marginBottom: 4,
      fontFamily: FONTS.urbanistRegular,
    },
    summaryAmount: {
      fontSize: 36,
      fontFamily: FONTS.urbanistBold,
      color: theme['text-basic-color'],
    },
    summaryStatsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    summaryStat: {
      flex: 1,
      marginHorizontal: 4,
    },
    summaryStatLabel: {
      fontSize: 12,
      color: theme['text-hint-color'],
      fontFamily: FONTS.urbanistRegular,
    },
    summaryStatValue: {
      fontSize: 16,
      fontFamily: FONTS.urbanistBold,
      color: theme['text-basic-color'],
      marginTop: 4,
    },
    filterTabs: {
      flexDirection: 'row',
      marginTop: 16,
      marginHorizontal: 20,
      backgroundColor: theme['background-basic-color-1'],
      borderRadius: 20,
      padding: 4,
      borderWidth: 1,
      borderColor: theme['border-basic-color-3'],
    },
    filterTab: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterTabActive: {
      backgroundColor: theme['color-basic-100'],
    },
    filterTabLabel: {
      fontFamily: FONTS.urbanistSemiBold,
      color: theme['text-hint-color'],
    },
    filterTabLabelActive: {
      color: theme['text-basic-color'],
    },
    filterLoadingContainer: {
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    purchaseList: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 24,
    },
    purchaseCard: {
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: theme['border-basic-color-3'],
      backgroundColor: theme['background-basic-color-1'],
      marginBottom: 16,
    },
    purchaseCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme['border-basic-color-3'],
    },
    purchaseCardHeaderLeft: {
      flex: 1,
      marginRight: 12,
    },
    purchaseDate: {
      fontSize: 12,
      color: theme['text-hint-color'],
      marginBottom: 6,
      fontFamily: FONTS.urbanistRegular,
    },
    purchaseTitle: {
      fontSize: 16,
      fontFamily: FONTS.urbanistBold,
      color: theme['text-basic-color'],
      marginBottom: 4,
      flexShrink: 1,
    },
    purchaseProgress: {
      fontSize: 13,
      color: theme['text-hint-color'],
      fontFamily: FONTS.urbanistRegular,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 14,
      alignSelf: 'flex-start',
      flexShrink: 0,
    },
    statusBadgeIN_PROGRESS: {
      backgroundColor: '#FFECC0',
    },
    statusBadgeOVERDUE: {
      backgroundColor: '#FFD6D6',
    },
    statusBadgeCOMPLETED: {
      backgroundColor: '#D8F5E7',
    },
    statusBadgeText: {
      fontSize: 12,
      fontFamily: FONTS.urbanistSemiBold,
      color: theme['text-basic-color'],
    },
    purchaseCardBody: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme['border-basic-color-3'],
    },
    purchaseCardBodyLeft: {
      flex: 1,
    },
    purchaseAmount: {
      fontSize: 24,
      fontFamily: FONTS.urbanistBold,
      color: theme['text-basic-color'],
      marginBottom: 6,
    },
    purchaseAmountHint: {
      fontSize: 12,
      fontFamily: FONTS.urbanistRegular,
      color: theme['text-hint-color'],
    },
    purchaseCardAction: {
      alignItems: 'flex-end',
      paddingVertical: 8,
    },
    purchaseCardActionText: {
      fontSize: 14,
      fontFamily: FONTS.urbanistSemiBold,
      color: theme['color-primary-500'],
    },
    emptyPurchasesText: {
      textAlign: 'center',
      color: theme['text-hint-color'],
      fontFamily: FONTS.urbanistRegular,
      paddingVertical: 40,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    welcomeTopSection: {
      backgroundColor: theme['background-basic-color-1'],
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: 5,
      paddingBottom: 0,
      marginBottom: -10,
      height: 130,
    },
    welcomeTopLogoContainer: {
      alignItems: 'center',
      justifyContent: 'flex-end',
      height: 120,
    },
    welcomeImageContainer: {
      flex: 1,
      marginHorizontal: 10,
      marginTop: 0,
      borderRadius: 30,
      overflow: 'hidden',
      marginBottom: 50,
    },
    welcomeMainImage: {
      width: '100%',
      height: '100%',
    },
  });
};

export default HomeScreen;
