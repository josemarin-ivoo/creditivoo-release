import React, {useState, useCallback, useMemo} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import CurvedHeaderLayout from '../../components/layouts/CurvedHeaderLayout';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import {
  getPurchaseById,
  RevisionResponse,
  PurchaseSimulationResponse,
  simulatePurchase,
} from '../../services/credit';
import {updatePurchase} from '../../services/purchases';
import {getFinancingById, FinancingTypeResponse} from '../../services/plan';
import {
  createPaymentOrder,
  createMultiplePaymentsOrder,
  verifyPaymentOrder,
} from '../../services/megasoft';
import {Payment, PaymentStatus} from '../../services/purchases';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import { Routes } from '../../../../../Utils/NavigationRoutes';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const PurchaseConfirmationScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const purchaseId = (route.params as any)?.purchaseId as number;
  const simulationFromRoute = (route.params as any)?.simulation as
    | PurchaseSimulationResponse
    | undefined;
  const isPlanSubscription = (route.params as any)?.isPlanSubscription as
    | boolean
    | undefined;
  const paymentsFromRoute = (route.params as any)?.payments as
    | Payment[]
    | undefined;

  const [purchase, setPurchase] = useState<RevisionResponse | null>(null);
  const [financing, setFinancing] = useState<FinancingTypeResponse | null>(
    null,
  );
  const [simulation, setSimulation] =
    useState<PurchaseSimulationResponse | null>(simulationFromRoute || null);
  const [isLoading, setIsLoading] = useState(!simulationFromRoute);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [paymentReferencia, setPaymentReferencia] = useState<string | null>(
    null,
  );
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  const fetchData = useCallback(async () => {
    if (!purchaseId) {
      setError('ID de compra no valido');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Obtener siempre la purchase y financing
      const purchaseData = await getPurchaseById(purchaseId);
      setPurchase(purchaseData);

      if (purchaseData.financingTypeId) {
        const financingData = await getFinancingById(
          purchaseData.financingTypeId,
        );
        setFinancing(financingData);
      }

      // Solo obtener la simulaci?n si:
      // - No tenemos simulaci?n de los params
      // - No hay payments seleccionados
      // - No es una suscripci?n
      if (
        !simulationFromRoute &&
        !(paymentsFromRoute && paymentsFromRoute.length > 0) &&
        !isPlanSubscription
      ) {
        // Obtener la simulaci?n
        const simulationData = await simulatePurchase(purchaseId);
        setSimulation(simulationData);
      }
    } catch (err: any) {
      console.error('[PurchaseConfirmation] Error al cargar datos:', err);
      setError(err.message || 'Error al cargar la informacion');
    } finally {
      setIsLoading(false);
    }
  }, [purchaseId, simulationFromRoute, isPlanSubscription, paymentsFromRoute]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  const formatCurrency = (amount: string | number) => {
    const numericAmount =
      typeof amount === 'string'
        ? parseFloat(amount.replace(/[^0-9.-]/g, ''))
        : amount;
    return `$${numericAmount.toFixed(2)}`;
  };

  // Formatear fecha para mostrar en payments
  const formatPaymentDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate();
    const months = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Obtener payments seleccionados ordenados por fecha
  const getSelectedPayments = useMemo(() => {
    if (!paymentsFromRoute || !purchase) {
      return [];
    }

    // Verificar si purchase tiene payments (aunque RevisionResponse no lo incluya en el tipo)
    if (
      purchase &&
      typeof purchase === 'object' &&
      'payments' in purchase &&
      Array.isArray(purchase.payments)
    ) {
      const purchasePayments = purchase.payments as Payment[];
      const selectedIds = new Set(paymentsFromRoute.map(p => p.id));

      // Filtrar y ordenar por fecha
      return purchasePayments
        .filter(p => selectedIds.has(p.id))
        .sort(
          (a, b) =>
            new Date(a.paymentDate).getTime() -
            new Date(b.paymentDate).getTime(),
        );
    }

    return [];
  }, [paymentsFromRoute, purchase]);

  // Calcular total de los payments seleccionados
  const getSelectedPaymentsTotal = useMemo(() => {
    return getSelectedPayments.reduce((sum, payment) => {
      return sum + parseFloat(payment.amount);
    }, 0);
  }, [getSelectedPayments]);

  // Calcular cuotas restantes despu?s de pagar las seleccionadas
  const getRemainingInstallmentsCount = useMemo(() => {
    if (!paymentsFromRoute || !purchase) {
      return 0;
    }

    // Verificar si purchase tiene payments
    if (
      purchase &&
      typeof purchase === 'object' &&
      'payments' in purchase &&
      Array.isArray(purchase.payments)
    ) {
      const allPayments = purchase.payments as Payment[];
      const selectedIds = new Set(paymentsFromRoute.map(p => p.id));

      // Contar cu?ntas cuotas (no iniciales) quedan pendientes, no seleccionadas y no completadas
      const remainingInstallments = allPayments.filter(
        payment =>
          !payment.isInitialPayment && // Solo cuotas, no el pago inicial
          !selectedIds.has(payment.id) && // No seleccionadas
          payment.status !== PaymentStatus.COMPLETED, // No completadas
      );

      return remainingInstallments.length;
    }

    return 0;
  }, [paymentsFromRoute, purchase]);

  // Usar datos de simulaci?n si est?n disponibles, sino calcular
  const getInitialPayment = () => {
    if (simulation) {
      return simulation.payToday;
    }
    if (!purchase || !financing) {
      return 0;
    }

    const totalAmount = parseFloat(purchase.totalAmount);
    if (financing.initialAmount) {
      return financing.initialAmount;
    }
    if (financing.initialPayment) {
      return totalAmount * financing.initialPayment;
    }
    return 0;
  };

  const getInstallmentAmount = () => {
    if (simulation) {
      return simulation.estimatedInstallment;
    }
    if (!purchase || !financing) return 0;

    const totalAmount = parseFloat(purchase.totalAmount);
    const initialPayment = getInitialPayment();
    const remaining = totalAmount - initialPayment;

    if (financing.paymentCount > 0) {
      return remaining / financing.paymentCount;
    }
    return 0;
  };

  const getInstallmentsCount = () => {
    if (simulation) {
      return simulation.installmentsCount;
    }
    if (financing) {
      return financing.paymentCount;
    }
    return 0;
  };

  const calculateInitialPaymentPercentage = () => {
    if (!purchase) {
      return 0;
    }

    const totalAmount = parseFloat(purchase.totalAmount);
    const initialPayment = getInitialPayment();

    if (totalAmount > 0) {
      return (initialPayment / totalAmount) * 100;
    }
    return 0;
  };

  const handleConfirm = async () => {
    console.log('[PurchaseConfirmation] Confirmando orden');

    if (!purchaseId) {
      Alert.alert('Error', 'ID de compra no valido');
      return;
    }

    try {
      setIsCreatingOrder(true);

      let response: any;

      // Si hay payments seleccionados, usar el endpoint de múltiples payments
      if (paymentsFromRoute && paymentsFromRoute.length > 0) {
        const paymentIds = paymentsFromRoute.map(p => p.id);
        console.log(
          '[PurchaseConfirmation] Creando orden de pago múltiple con paymentIds:',
          paymentIds,
        );

        response = await createMultiplePaymentsOrder({
          paymentIds: paymentIds,
        });
      } else {
        // Para compras normales o suscripciones, usar el endpoint estándar
        const paymentOrderRequest = {
          purchaseId: purchaseId,
        };

        console.log(
          '[PurchaseConfirmation] Creando orden de pago:',
          paymentOrderRequest,
        );

        response = await createPaymentOrder(paymentOrderRequest);
      }

      console.log('[PurchaseConfirmation] Orden creada');
      console.log('[PurchaseConfirmation] Payment URL:', response.paymentUrl);
      console.log('[PurchaseConfirmation] Referencia:', response.referencia);

      // Para m?ltiples payments, verificar autoCompleted directamente
      const isAutoCompleted =
        (response as any).autoCompleted ||
        (response.referencia?.includes('AUTO_COMPLETED') &&
          (!response.paymentUrl || response.paymentUrl === null));

      // Verificar si el pago fue auto-completado o no requiere pago
      if (isAutoCompleted || (response as any).isAlreadyVerified) {
        console.log(
          '[PurchaseConfirmation] Pago auto-completado, verificando estado...',
        );
        // Verificar el estado del pago directamente
        try {
          setIsVerifyingPayment(true);
          const verificationResult = await verifyPaymentOrder({
            control: response.referencia,
            purchaseId: purchaseId,
          });

          console.log(
            '[PurchaseConfirmation] Resultado de verificación:',
            verificationResult,
          );

          if (verificationResult.approved) {
            // Pago aprobado, navegar directamente a la pantalla de éxito
            if (isPlanSubscription) {
              console.log(
                '[PurchaseConfirmation] Pago aprobado, navegando a SubscriptionSuccess',
              );
              (navigation as any).navigate('SubscriptionSuccess', {
                purchaseId: purchaseId,
              });
            } else {
              console.log(
                '[PurchaseConfirmation] Pago aprobado, navegando a PurchaseSuccess',
              );
              (navigation as any).navigate('PurchaseSuccess', {
                purchaseId: purchaseId,
              });
            }
          } else {
            // Pago no aprobado
            Alert.alert(
              'Pago no verificado',
              'El pago no pudo ser verificado. Por favor, intenta nuevamente o verifica con tu banco.',
            );
          }
        } catch (verifyError: any) {
          console.error(
            '[PurchaseConfirmation] Error al verificar el pago:',
            verifyError,
          );
          Alert.alert(
            'Error',
            verifyError.message ||
              'No se pudo verificar el estado del pago. Por favor, intenta nuevamente.',
          );
        } finally {
          setIsVerifyingPayment(false);
        }
      } else {
        // Si no es AUTO_COMPLETED o hay paymentUrl, abrir WebView normalmente
        console.log('[PurchaseConfirmation] Abriendo WebView para pago');
        setPaymentUrl(response.paymentUrl);
        setPaymentReferencia(response.referencia);
        setIsProcessingPayment(true);
      }
    } catch (err: any) {
      console.error(
        '[PurchaseConfirmation] Error al crear orden de pago:',
        err,
      );
      Alert.alert('Error', err.message || 'No se pudo crear la orden de pago');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleWebViewClose = async () => {
    console.log('[PurchaseConfirmation] WebView cerrado por el usuario');
    console.log(
      '[PurchaseConfirmation] Referencia del pago:',
      paymentReferencia,
    );

    // Cerrar el modal del WebView
    setPaymentUrl(null);
    setIsProcessingPayment(false);

    // Si no hay referencia, no podemos verificar
    if (!paymentReferencia) {
      console.warn(
        '[PurchaseConfirmation] No hay referencia para verificar el pago',
      );
      Alert.alert(
        'Error',
        'No se pudo verificar el pago. Por favor, intenta nuevamente.',
      );
      return;
    }

    // Verificar el estado del pago
    try {
      setIsVerifyingPayment(true);
      console.log(
        '[PurchaseConfirmation] Verificando estado del pago con referencia:',
        paymentReferencia,
      );

      const verificationResult = await verifyPaymentOrder({
        control: paymentReferencia,
        purchaseId: purchaseId,
      });

      console.log(
        '[PurchaseConfirmation] Resultado de verificaci?n:',
        verificationResult,
      );

      if (verificationResult.approved) {
        // Pago aprobado, navegar a la pantalla de ?xito correspondiente
        if (isPlanSubscription) {
          console.log(
            '[PurchaseConfirmation] Pago aprobado, navegando a SubscriptionSuccess',
          );
          (navigation as any).navigate('SubscriptionSuccess', {
            purchaseId: purchaseId,
          });
        } else {
          console.log(
            '[PurchaseConfirmation] Pago aprobado, navegando a PurchaseSuccess',
          );
          (navigation as any).navigate(Routes.NAVIGATION_PURCHASESSUCCESS, {
            purchaseId: purchaseId,
          });
        }
      } else {
        // Pago no aprobado o pendiente
        console.log(
          '[PurchaseConfirmation] Pago no aprobado o pendiente. Estado:',
          verificationResult.status,
        );
        Alert.alert(
          'Pago no verificado',
          'El pago no pudo ser verificado. Por favor, intenta nuevamente o verifica con tu banco.',
        );
      }
    } catch (verifyError: any) {
      console.error(
        '[PurchaseConfirmation] Error al verificar el pago:',
        verifyError,
      );
      Alert.alert(
        'Error',
        verifyError.message ||
          'No se pudo verificar el estado del pago. Por favor, intenta nuevamente.',
      );
    } finally {
      setIsVerifyingPayment(false);
      // Limpiar la referencia despu?s de verificar
      setPaymentReferencia(null);
    }
  };

  // La verificaci?n ahora se hace directamente en handleWebViewClose
  // Mantenemos este useEffect solo para logging/debugging si es necesario

  const handleWebViewNavigationStateChange = (navState: any) => {
    console.log(
      '[PurchaseConfirmation] WebView navigation changed:',
      navState.url,
    );

    // Detectar cuando el pago se completa exitosamente
    // Esto puede variar seg?n c?mo MegaSoft redirija despu?s del pago
    // Por ahora, si el usuario cierra el WebView manualmente, asumimos que cancel?
    // En producci?n, MegaSoft deber?a redirigir a una URL de ?xito/error que podamos detectar
  };

  const handleStorePayment = async () => {
    console.log('[PurchaseConfirmation] Pago en tienda seleccionado');

    if (!purchaseId) {
      Alert.alert('Error', 'ID de compra no valido');
      return;
    }

    // Solo permitir pago en tienda para compras simples (no suscripción, sin payments seleccionados)
    if (isPlanSubscription) {
      Alert.alert(
        'Error',
        'El pago en tienda no está disponible para suscripciones',
      );
      return;
    }

    if (paymentsFromRoute && paymentsFromRoute.length > 0) {
      Alert.alert(
        'Error',
        'El pago en tienda no está disponible cuando hay payments seleccionados',
      );
      return;
    }

    try {
      setIsCreatingOrder(true);

      // Escenario 1: Compra simple - Actualizar el purchase a PENDING_INVOICE para pago en tienda
      console.log(
        '[PurchaseConfirmation] Escenario 1: Compra simple - Actualizando purchase a PENDING_INVOICE para pago en tienda',
      );
      await updatePurchase(purchaseId, {
        status: 'PENDING_INVOICE',
      });

      // Navegar a la pantalla de éxito
      (navigation as any).navigate('PurchaseSuccess', {
        purchaseId: purchaseId,
      });
    } catch (error: any) {
      console.error(
        '[PurchaseConfirmation] Error al procesar pago en tienda:',
        error,
      );
      Alert.alert(
        'Error',
        error.message || 'No se pudo procesar el pago en tienda',
      );
    } finally {
      setIsCreatingOrder(false);
    }
  };

  if (isLoading) {
    return (
      <CurvedHeaderLayout
        title="Confirma tu compra"
        showBackButton
        onBackPress={() => navigation.goBack()}
        scroll={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={IVOO_COLORS.primary} />
          <Text style={styles.loadingText}>Cargando información...</Text>
        </View>
      </CurvedHeaderLayout>
    );
  }

  if (error) {
    return (
      <CurvedHeaderLayout
        title="Confirma tu compra"
        showBackButton
        onBackPress={() => navigation.goBack()}
        scroll={false}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </CurvedHeaderLayout>
    );
  }

  if (!purchase) {
    return (
      <CurvedHeaderLayout
        title="Confirma tu compra"
        showBackButton
        onBackPress={() => navigation.goBack()}
        scroll={false}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No se pudo cargar la informaci?n</Text>
        </View>
      </CurvedHeaderLayout>
    );
  }

  const totalAmount = parseFloat(purchase.totalAmount);
  const initialPayment = getInitialPayment();
  const installmentAmount = getInstallmentAmount();
  const installmentsCount = getInstallmentsCount();
  const initialPaymentPercentage = calculateInitialPaymentPercentage();

  return (
    <CurvedHeaderLayout
      title="Confirma tu compra"
      showBackButton
      onBackPress={() => navigation.goBack()}
      scroll={false}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Purchase Summary Card */}
          <LinearGradient
            colors={['#52e665', '#b1c0d8', '#fea9fe']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(
                  paymentsFromRoute && paymentsFromRoute.length > 0
                    ? getSelectedPaymentsTotal
                    : totalAmount,
                )}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            {paymentsFromRoute && paymentsFromRoute.length > 0 ? (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  {getRemainingInstallmentsCount > 0
                    ? `Te quedan ${getRemainingInstallmentsCount} cuota${
                        getRemainingInstallmentsCount > 1 ? 's' : ''
                      } por pagar`
                    : 'Todas las cuotas seran pagadas'}
                </Text>
              </View>
            ) : (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Pagas el {initialPaymentPercentage.toFixed(0)}% hoy
                </Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(initialPayment)}
                </Text>
              </View>
            )}
          </LinearGradient>

          {/* Payment Plan Details */}
          <View style={styles.paymentPlanCard}>
            <Text style={styles.paymentPlanTitle}>Plan de pagos</Text>
            {paymentsFromRoute && paymentsFromRoute.length > 0 ? (
              // Si hay payments seleccionados, mostrar cada uno
              <>
                {getSelectedPayments.map((payment, index) => {
                  // Calcular el n?mero de cuota (solo para pagos que no son iniciales)
                  let installmentNumber = 0;
                  if (!payment.isInitialPayment) {
                    // Contar cu?ntas cuotas (no iniciales) hay antes de esta
                    const previousInstallments = getSelectedPayments
                      .slice(0, index)
                      .filter(p => !p.isInitialPayment).length;
                    installmentNumber = previousInstallments + 1;
                  }

                  return (
                    <React.Fragment key={payment.id}>
                      <View style={styles.paymentPlanRow}>
                        <Text style={styles.paymentPlanLabel}>
                          {payment.isInitialPayment
                            ? 'Pago inicial'
                            : `Cuota ${installmentNumber}`}{' '}
                          - {formatPaymentDate(payment.paymentDate)}
                        </Text>
                        <Text style={styles.paymentPlanValue}>
                          {formatCurrency(payment.amount)}
                        </Text>
                      </View>
                      {index < getSelectedPayments.length - 1 && (
                        <View style={styles.separator} />
                      )}
                    </React.Fragment>
                  );
                })}
                {/* Mostrar total */}
                <View style={styles.separator} />
                <View style={styles.paymentPlanRow}>
                  <Text style={styles.paymentPlanLabelBold}>Total a pagar</Text>
                  <Text style={styles.paymentPlanValue}>
                    {formatCurrency(getSelectedPaymentsTotal)}
                  </Text>
                </View>
              </>
            ) : isPlanSubscription ? (
              // Para suscripci?n: solo mostrar "Membresia PLUS" con el monto
              <View style={styles.paymentPlanRow}>
                <Text style={styles.paymentPlanLabelBold}>Membresia PLUS</Text>
                <Text style={styles.paymentPlanValue}>
                  {formatCurrency(totalAmount)}
                </Text>
              </View>
            ) : (
              // Para compras normales: mostrar inicial y cuotas
              <>
                <View style={styles.paymentPlanRow}>
                  <Text style={styles.paymentPlanLabelBold}>
                    Hoy la inicial
                  </Text>
                  <Text style={styles.paymentPlanValue}>
                    {formatCurrency(initialPayment)}
                  </Text>
                </View>
                {/* Separator */}
                <View style={styles.separator} />
                <View style={styles.paymentPlanRow}>
                  <Text style={styles.paymentPlanLabel}>
                    Después {installmentsCount} cuotas sin intereses de
                  </Text>
                  <Text style={styles.paymentPlanValue}>
                    {formatCurrency(installmentAmount)}
                  </Text>
                </View>
              </>
            )}
          </View>
        </ScrollView>

        {/* Confirm Button - Fixed at bottom */}
        <View style={styles.buttonContainer}>
          {/* Pago en tienda Button */}

          <TouchableOpacity
            style={[
              styles.confirmButton,
              (isCreatingOrder || isProcessingPayment || isVerifyingPayment) &&
                styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirm}
            activeOpacity={0.8}
            disabled={
              isCreatingOrder || isProcessingPayment || isVerifyingPayment
            }>
            {isCreatingOrder || isVerifyingPayment ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.confirmButtonText}>
                {isVerifyingPayment ? 'Verificando pago...' : 'Confirmar orden'}
              </Text>
            )}
          </TouchableOpacity>
          {/* Solo mostrar botón de pago en tienda si NO hay payments seleccionados */}
          {!(paymentsFromRoute && paymentsFromRoute.length > 0) && (
            <TouchableOpacity
              style={[
                styles.storePaymentButton,
                (isCreatingOrder ||
                  isProcessingPayment ||
                  isVerifyingPayment) &&
                  styles.storePaymentButtonDisabled,
              ]}
              onPress={handleStorePayment}
              activeOpacity={0.8}
              disabled={
                isCreatingOrder || isProcessingPayment || isVerifyingPayment
              }>
              {isCreatingOrder ? (
                <ActivityIndicator size="small" color={IVOO_COLORS.primary} />
              ) : (
                <Text style={styles.storePaymentButtonText}>
                  Pago en tienda
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* WebView Modal for MegaSoft Payment */}
      <Modal
        visible={isProcessingPayment && !!paymentUrl}
        animationType="slide"
        onRequestClose={handleWebViewClose}>
        <View style={styles.webViewContainer}>
          <View style={styles.webViewHeader}>
            <Text style={styles.webViewTitle}>Procesando pago</Text>
            <TouchableOpacity
              onPress={handleWebViewClose}
              style={styles.closeButton}>
              <Icon
                name="close"
                type={IconType.Ionicons}
                size={24}
                color={IVOO_COLORS.black}
              />
            </TouchableOpacity>
          </View>
          {paymentUrl && (
            <WebView
              source={{uri: paymentUrl}}
              style={styles.webView}
              onNavigationStateChange={handleWebViewNavigationStateChange}
              startInLoadingState={true}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          )}
        </View>
      </Modal>
    </CurvedHeaderLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: SCREEN_HEIGHT * 0.02,
    paddingBottom: SCREEN_HEIGHT * 0.02,
  },
  summaryCard: {
    borderRadius: 16,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingVertical: SCREEN_WIDTH * 0.03,
    marginBottom: SCREEN_WIDTH * 0.04,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.005,
  },
  summaryLabel: {
    fontSize: SCREEN_WIDTH * 0.042,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.black,
  },
  summaryValue: {
    fontSize: SCREEN_WIDTH * 0.048,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginVertical: SCREEN_HEIGHT * 0.01,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(110, 113, 124, 0.2)',
    marginVertical: SCREEN_HEIGHT * 0.01,
  },
  paymentPlanCard: {
    backgroundColor: '#F9FAFC',
    borderRadius: 16,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingVertical: SCREEN_WIDTH * 0.03,
    marginBottom: SCREEN_WIDTH * 0.04,
    borderWidth: 1,
    borderColor: 'rgba(110, 113, 124, 0.2)',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    paddingBottom: SCREEN_HEIGHT * 0.02,
    paddingTop: SCREEN_HEIGHT * 0.015,
    backgroundColor: IVOO_COLORS.white,
    gap: SCREEN_HEIGHT * 0.01,
  },
  storePaymentButton: {
    backgroundColor: 'transparent',
    borderRadius: 22,
    paddingVertical: SCREEN_HEIGHT * 0.018,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderWidth: 2,
    borderColor: IVOO_COLORS.primary,
  },
  storePaymentButtonDisabled: {
    opacity: 0.6,
  },
  storePaymentButtonText: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.primary,
  },
  paymentPlanTitle: {
    fontSize: SCREEN_WIDTH * 0.048,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  paymentPlanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.005,
  },
  paymentPlanLabel: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: '#6E717C',
    flex: 1,
    marginRight: SCREEN_WIDTH * 0.02,
  },
  paymentPlanLabelBold: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
    flex: 1,
    marginRight: SCREEN_WIDTH * 0.02,
  },
  paymentPlanValue: {
    fontSize: SCREEN_WIDTH * 0.042,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
  },
  confirmButton: {
    backgroundColor: IVOO_COLORS.primary,
    borderRadius: 22,
    paddingVertical: SCREEN_HEIGHT * 0.018,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: 'transparent',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  confirmButtonText: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.1,
  },
  loadingText: {
    marginTop: SCREEN_HEIGHT * 0.02,
    fontSize: SCREEN_WIDTH * 0.04,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.textSecondary || '#6E717C',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.1,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
  },
  errorText: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: '#E74C3C',
    textAlign: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: IVOO_COLORS.white,
  },
  webViewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingVertical: SCREEN_HEIGHT * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: IVOO_COLORS.white,
  },
  webViewTitle: {
    fontSize: SCREEN_WIDTH * 0.042,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
  },
  closeButton: {
    padding: SCREEN_WIDTH * 0.01,
  },
  webView: {
    flex: 1,
  },
});

export default PurchaseConfirmationScreen;
