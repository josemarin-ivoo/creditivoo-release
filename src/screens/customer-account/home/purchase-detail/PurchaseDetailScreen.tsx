import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Card, useTheme, ThemeType, Layout, Icon} from '@ui-kitten/components';
import {RootState, AppDispatch} from 'store/store';
import {
  fetchPaymentsByPurchaseId,
  setSelectedPayments,
} from 'store/slices/payment-slice';
import {setSelectedPurchaseIds} from 'store/slices/purchase-slice';
import {FONTS} from 'app/styles/global.style';
import {SCREENS} from '@shared-constants';
import {PaymentStatus} from '@services/api/payments';
import IconDynamic, {IconType} from 'react-native-dynamic-vector-icons';
import ButtonK from '@shared-components/button/ButtonK';

type RouteParams = {
  PurchaseDetail: {
    purchaseId: number;
  };
};

const PurchaseDetailScreen: React.FC = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const route = useRoute<RouteProp<RouteParams, 'PurchaseDetail'>>();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const {purchaseId} = route.params;

  const {userPurchases} = useSelector((state: RootState) => state.purchases);
  const {payments, isLoading} = useSelector(
    (state: RootState) => state.payments,
  );
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<number[]>([]);

  // Initialize with PASS_DUE payments (mandatory selection)
  useEffect(() => {
    const passDuePaymentIds = payments
      .filter(
        payment =>
          payment.purchaseId === purchaseId &&
          payment.status === PaymentStatus.PASS_DUE,
      )
      .map(payment => payment.id);
    if (passDuePaymentIds.length > 0) {
      setSelectedPaymentIds(passDuePaymentIds);
    }
  }, [payments, purchaseId]);

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

  const purchase = useMemo(() => {
    return userPurchases.find(p => p.id === purchaseId);
  }, [userPurchases, purchaseId]);

  const purchasePayments = useMemo(() => {
    return payments
      .filter(payment => payment.purchaseId === purchaseId)
      .sort((a, b) => {
        const dateA = new Date(a.paymentDate).getTime();
        const dateB = new Date(b.paymentDate).getTime();
        return dateA - dateB;
      });
  }, [payments, purchaseId]);

  const selectedPayments = useMemo(() => {
    return purchasePayments.filter(payment =>
      selectedPaymentIds.includes(payment.id),
    );
  }, [purchasePayments, selectedPaymentIds]);

  const totalSelected = useMemo(() => {
    return selectedPayments.reduce(
      (sum, payment) => sum + parseAmount(payment.amount),
      0,
    );
  }, [selectedPayments]);

  useEffect(() => {
    if (purchaseId) {
      dispatch(fetchPaymentsByPurchaseId(purchaseId));
    }
  }, [dispatch, purchaseId]);

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
      month: 'short',
      year: 'numeric',
    });
  };

  const togglePaymentSelection = (
    paymentId: number,
    paymentStatus: PaymentStatus,
  ) => {
    // Don't allow deselecting PASS_DUE payments (mandatory)
    if (paymentStatus === PaymentStatus.PASS_DUE) {
      return;
    }
    setSelectedPaymentIds(prev => {
      if (prev.includes(paymentId)) {
        return prev.filter(id => id !== paymentId);
      } else {
        return [...prev, paymentId];
      }
    });
  };

  const handleGoToPay = () => {
    if (selectedPaymentIds.length > 0) {
      dispatch(setSelectedPurchaseIds([purchaseId]));
      // Set selected payments in store
      const paymentsToSelect = purchasePayments.filter(payment =>
        selectedPaymentIds.includes(payment.id),
      );
      dispatch(setSelectedPayments(paymentsToSelect) as any);
      (navigation as any).navigate(SCREENS.PAYMENT_SELECTION);
    }
  };

  const handleCancelSelection = () => {
    setSelectedPaymentIds([]);
  };

  if (!purchase) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
        <Layout style={styles.layout}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <View style={styles.backButtonCircle}>
                <Icon
                  name="arrow-back"
                  pack="eva"
                  style={styles.backIcon}
                  fill="#FFFFFF"
                />
              </View>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Detalles de compra</Text>
            <View style={styles.headerRight} />
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Compra no encontrada</Text>
          </View>
        </Layout>
      </SafeAreaView>
    );
  }

  const device = purchase.device;
  const deviceName = device?.name || `Compra #${purchase.id}`;
  const deviceDescription = device?.description || '';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      <Layout style={styles.layout}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <View style={styles.backButtonCircle}>
              <Icon
                name="arrow-back"
                pack="eva"
                style={styles.backIcon}
                fill="#FFFFFF"
              />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalles de compra</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={[
            styles.scrollContent,
            selectedPaymentIds.length > 0 && styles.scrollContentWithPanel,
          ]}>
          {/* Product Information Card */}
          <Card style={styles.productCard}>
            <View style={styles.productHeader}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{deviceName}</Text>
                {deviceDescription ? (
                  <Text style={styles.productDescription}>
                    {deviceDescription}
                  </Text>
                ) : null}
                <Text style={styles.purchaseDate}>
                  {formatDate(purchase.createdAt)}
                </Text>
              </View>
            </View>
          </Card>

          {/* Payment Calendar Card */}
          <Card style={styles.paymentCard}>
            <Text style={styles.paymentCardTitle}>Calendario de pagos</Text>
            <View style={styles.paymentList}>
              {purchasePayments.map((payment, index) => {
                const isSelected = selectedPaymentIds.includes(payment.id);
                const isCompleted = payment.status === PaymentStatus.COMPLETED;
                const isPassDue = payment.status === PaymentStatus.PASS_DUE;
                const isMandatory = isPassDue;
                const isSelectable = !isCompleted;
                const isLast = index === purchasePayments.length - 1;
                return (
                  <TouchableOpacity
                    key={payment.id}
                    style={styles.paymentItem}
                    onPress={() =>
                      isSelectable &&
                      togglePaymentSelection(payment.id, payment.status)
                    }
                    disabled={!isSelectable}
                    activeOpacity={isSelectable ? 0.7 : 1}>
                    <View style={styles.paymentItemContent}>
                      <View style={styles.paymentTimeline}>
                        {!isLast && <View style={styles.timelineLine} />}
                        <View
                          style={[
                            styles.paymentCheckbox,
                            isSelected && styles.paymentCheckboxSelected,
                            isCompleted && styles.paymentCheckboxCompleted,
                            isMandatory && styles.paymentCheckboxMandatory,
                          ]}>
                          {isSelected && (
                            <IconDynamic
                              name="checkmark"
                              type={IconType.Ionicons}
                              size={16}
                              color="#FFFFFF"
                            />
                          )}
                          {isCompleted && !isSelected && (
                            <IconDynamic
                              name="checkmark"
                              type={IconType.Ionicons}
                              size={16}
                              color={theme['color-primary-500']}
                            />
                          )}
                          {!isSelected && !isCompleted && (
                            <View style={styles.checkboxEmpty} />
                          )}
                        </View>
                      </View>
                      <View style={styles.paymentDetails}>
                        <View style={styles.paymentDateRow}>
                          <Text style={styles.paymentDate}>
                            {formatDate(payment.paymentDate)}
                          </Text>
                          {isMandatory && (
                            <View style={styles.mandatoryBadge}>
                              <Text style={styles.mandatoryBadgeText}>
                                Obligatorio
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <Text style={styles.paymentAmount}>
                        {formatCurrency(parseAmount(payment.amount))}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>
        </ScrollView>

        {/* Sticky Bottom Panel */}
        {selectedPaymentIds.length > 0 && (
          <View style={styles.stickyPanel}>
            <View style={styles.stickyPanelContent}>
              <View style={styles.stickyPanelLeft}>
                <Text style={styles.stickyPanelLabel}>Total seleccionado</Text>
                <Text style={styles.stickyPanelAmount}>
                  {formatCurrency(totalSelected)}
                </Text>
              </View>
              <View style={styles.stickyPanelActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelSelection}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <ButtonK
                  title="Ir a pagar"
                  onPress={handleGoToPay}
                  style={styles.payButtonSticky}
                />
              </View>
            </View>
          </View>
        )}
      </Layout>
    </SafeAreaView>
  );
};

const createStyles = (theme: ThemeType) => {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme['background-basic-color-1'],
    },
    layout: {
      flex: 1,
      backgroundColor: theme['background-basic-color-1'],
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme['background-basic-color-1'],
      borderBottomWidth: 1,
      borderBottomColor: theme['border-basic-color-2'],
    },
    backButton: {
      padding: 8,
    },
    backButtonCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme['color-primary-500'],
      alignItems: 'center',
      justifyContent: 'center',
    },
    backIcon: {
      width: 24,
      height: 24,
    },
    headerTitle: {
      fontFamily: FONTS.urbanistBold,
      fontSize: 22,
      color: theme['text-basic-color'],
      flex: 1,
      textAlign: 'center',
    },
    headerRight: {
      width: 40,
    },
    container: {
      flex: 1,
      backgroundColor: theme['background-basic-color-2'],
    },
    scrollContent: {
      paddingBottom: 40,
    },
    scrollContentWithPanel: {
      paddingBottom: 120,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorText: {
      fontSize: 16,
      fontFamily: FONTS.urbanistRegular,
      color: theme['text-hint-color'],
    },
    productCard: {
      marginHorizontal: 20,
      marginTop: 16,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: theme['border-basic-color-3'],
      backgroundColor: theme['background-basic-color-1'],
    },
    productHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    productInfo: {
      flex: 1,
    },
    productName: {
      fontSize: 20,
      fontFamily: FONTS.urbanistBold,
      color: theme['text-basic-color'],
      marginBottom: 8,
    },
    productDescription: {
      fontSize: 14,
      fontFamily: FONTS.urbanistRegular,
      color: theme['text-hint-color'],
      marginBottom: 8,
    },
    purchaseDate: {
      fontSize: 12,
      fontFamily: FONTS.urbanistRegular,
      color: theme['text-hint-color'],
    },
    paymentCard: {
      marginHorizontal: 20,
      marginTop: 16,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: theme['border-basic-color-3'],
      backgroundColor: theme['background-basic-color-1'],
    },
    paymentCardTitle: {
      fontSize: 18,
      fontFamily: FONTS.urbanistBold,
      color: theme['text-basic-color'],
      marginBottom: 20,
    },
    paymentList: {
      paddingLeft: 0,
    },
    paymentItem: {
      marginBottom: 20,
    },
    paymentItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    paymentTimeline: {
      width: 32,
      alignItems: 'center',
      position: 'relative',
    },
    timelineLine: {
      position: 'absolute',
      top: 28,
      left: 15,
      width: 2,
      height: 36,
      backgroundColor: theme['border-basic-color-3'],
    },
    paymentCheckbox: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: theme['border-basic-color-3'],
      backgroundColor: theme['background-basic-color-1'],
      justifyContent: 'center',
      alignItems: 'center',
    },
    paymentCheckboxSelected: {
      backgroundColor: theme['color-primary-500'],
      borderColor: theme['color-primary-500'],
    },
    paymentCheckboxCompleted: {
      backgroundColor: theme['color-primary-100'],
      borderColor: theme['color-primary-500'],
    },
    paymentCheckboxMandatory: {
      borderColor: '#F2994A',
      borderWidth: 2,
    },
    checkboxEmpty: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: 'transparent',
    },
    paymentDetails: {
      flex: 1,
      marginLeft: 12,
    },
    paymentDateRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    paymentDate: {
      fontSize: 14,
      fontFamily: FONTS.urbanistSemiBold,
      color: theme['text-basic-color'],
    },
    mandatoryBadge: {
      backgroundColor: '#FFF3E0',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      marginLeft: 8,
    },
    mandatoryBadgeText: {
      fontSize: 10,
      fontFamily: FONTS.urbanistSemiBold,
      color: '#F2994A',
    },
    paymentAmount: {
      fontSize: 16,
      fontFamily: FONTS.urbanistBold,
      color: theme['text-hint-color'],
    },
    buttonContainer: {
      marginHorizontal: 20,
      marginTop: 24,
      marginBottom: 20,
    },
    payButton: {
      borderRadius: 16,
    },
    stickyPanel: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme['background-basic-color-1'],
      borderTopWidth: 1,
      borderTopColor: theme['border-basic-color-3'],
      paddingTop: 16,
      paddingBottom: 20,
      paddingHorizontal: 20,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: -2},
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    },
    stickyPanelContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    stickyPanelLeft: {
      flex: 1,
    },
    stickyPanelLabel: {
      fontSize: 12,
      fontFamily: FONTS.urbanistRegular,
      color: theme['text-hint-color'],
      marginBottom: 4,
    },
    stickyPanelAmount: {
      fontSize: 20,
      fontFamily: FONTS.urbanistBold,
      color: theme['text-basic-color'],
    },
    stickyPanelActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cancelButton: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      marginRight: 12,
    },
    cancelButtonText: {
      fontSize: 14,
      fontFamily: FONTS.urbanistSemiBold,
      color: theme['text-hint-color'],
    },
    payButtonSticky: {
      borderRadius: 12,
      minWidth: 120,
    },
  });
};

export default PurchaseDetailScreen;
