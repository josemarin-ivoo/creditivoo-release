import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import CurvedHeaderLayout from '../../components/layouts/CurvedHeaderLayout';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import {getPurchaseById, RevisionResponse} from '../../services/credit';
import {getFinancingById, FinancingTypeResponse} from '../../services/plan';
import { Routes } from '../../../../../Utils/NavigationRoutes';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const PurchaseConfirmationScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const purchaseId = (route.params as any)?.purchaseId as number;

  const [purchase, setPurchase] = useState<RevisionResponse | null>(null);
  const [financing, setFinancing] = useState<FinancingTypeResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!purchaseId) {
      setError('ID de compra no válido');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Primero obtener la purchase para tener el financingTypeId
      const purchaseData = await getPurchaseById(purchaseId);
      setPurchase(purchaseData);

      // Luego obtener el financing type si existe
      if (purchaseData.financingTypeId) {
        const financingData = await getFinancingById(
          purchaseData.financingTypeId,
        );
        setFinancing(financingData);
      }
    } catch (err: any) {
      console.error('[PurchaseConfirmation] Error al cargar datos:', err);
      setError(err.message || 'Error al cargar la información');
    } finally {
      setIsLoading(false);
    }
  }, [purchaseId]);

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

  const calculateInitialPayment = () => {
    if (!purchase || !financing) return 0;

    const totalAmount = parseFloat(purchase.totalAmount);
    if (financing.initialAmount) {
      return financing.initialAmount;
    }
    if (financing.initialPayment) {
      return totalAmount * financing.initialPayment;
    }
    return 0;
  };

  const calculateInstallmentAmount = () => {
    if (!purchase || !financing) return 0;

    const totalAmount = parseFloat(purchase.totalAmount);
    const initialPayment = calculateInitialPayment();
    const remaining = totalAmount - initialPayment;

    if (financing.paymentCount > 0) {
      return remaining / financing.paymentCount;
    }
    return 0;
  };

  const calculateInitialPaymentPercentage = () => {
    if (!purchase || !financing) return 0;

    const totalAmount = parseFloat(purchase.totalAmount);
    const initialPayment = calculateInitialPayment();

    if (totalAmount > 0) {
      return (initialPayment / totalAmount) * 100;
    }
    return 0;
  };

  const handleConfirm = () => {
    console.log('[PurchaseConfirmation] Confirmando orden');

    // TODO: Implementación futura - WebView de megasoft
    //
    // Flujo esperado:
    // 1. Abrir un WebView con el proveedor de pagos "megasoft"
    // 2. El proveedor checkeará el pago y retornará si todo está ok
    // 3. El proveedor enviará la confirmación a nuestro backend
    // 4. Nuestro backend confirmará la orden
    // 5. Navegar a la siguiente pantalla según el resultado
    //
    // Nota: Esta implementación será realizada por otro equipo
    // Aquí se debe:
    // - Crear/importar componente WebView para megasoft
    // - Pasar los datos necesarios de la purchase (purchaseId, totalAmount, etc.)
    // - Manejar la respuesta del WebView (success/error)
    // - Llamar al endpoint de confirmación en nuestro backend
    // - Navegar a la pantalla de éxito o error según corresponda

    // POR AHORA, solo navegamos a la pantalla de éxito
    (navigation as any).navigate(Routes.NAVIGATION_PURCHASESSUCCESS, {
      purchaseId: purchaseId,
    });
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

  if (!purchase || !financing) {
    return (
      <CurvedHeaderLayout
        title="Confirma tu compra"
        showBackButton
        onBackPress={() => navigation.goBack()}
        scroll={false}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No se pudo cargar la información</Text>
        </View>
      </CurvedHeaderLayout>
    );
  }

  const totalAmount = parseFloat(purchase.totalAmount);
  const initialPayment = calculateInitialPayment();
  const installmentAmount = calculateInstallmentAmount();
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
                {formatCurrency(totalAmount)}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Pagas el {initialPaymentPercentage.toFixed(0)}% hoy
              </Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(initialPayment)}
              </Text>
            </View>
          </LinearGradient>

          {/* Payment Plan Details */}
          <View style={styles.paymentPlanCard}>
            <Text style={styles.paymentPlanTitle}>Plan de pagos</Text>
            <View style={styles.paymentPlanRow}>
              <Text style={styles.paymentPlanLabelBold}>Hoy la inicial</Text>
              <Text style={styles.paymentPlanValue}>
                {formatCurrency(initialPayment)}
              </Text>
            </View>
            {/* Separator */}
            <View style={styles.separator} />
            <View style={styles.paymentPlanRow}>
              <Text style={styles.paymentPlanLabel}>
                Después {financing.paymentCount} cuotas sin intereses de
              </Text>
              <Text style={styles.paymentPlanValue}>
                {formatCurrency(installmentAmount)}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Confirm Button - Fixed at bottom */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
            activeOpacity={0.8}>
            <Text style={styles.confirmButtonText}>Confirmar orden</Text>
          </TouchableOpacity>
        </View>
      </View>
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
});

export default PurchaseConfirmationScreen;
