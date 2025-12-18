import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import CurvedHeaderLayout from '../../components/layouts/CurvedHeaderLayout';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {getPlansByGroupId, Financing} from '../../services/plan';
import {useIvoSelector, useIvoDispatch} from '../../../../../redux/useIvo';
import {updatePurchase} from '../../services/credit';
// import {setCurrentPurchase} from '../../store-creditivoo/slices/purchase-slice';
import {setCurrentPurchase} from '../../store-creditivoo/purchase-slice';
import { Routes } from '../../../../../Utils/NavigationRoutes';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const PlanSelection: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const groupId = (route.params as any)?.groupId as number;
  const dispatch = useIvoDispatch();

  const {currentPurchase} = useIvoSelector(state => state.creditivoo.purchase);

  const [plans, setPlans] = useState<Financing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingPlanId, setUpdatingPlanId] = useState<number | null>(null);

  const fetchPlans = useCallback(
    async (showRefreshing = false) => {
      if (!groupId) {
        setError('ID de grupo no válido');
        setIsLoading(false);
        return;
      }

      try {
        if (showRefreshing) {
          setRefreshing(true);
        } else {
          setIsLoading(true);
        }
        setError(null);
        console.log('[PlanSelection] Obteniendo planes del grupo:', groupId);
        const plansData = await getPlansByGroupId(groupId);
        console.log('[PlanSelection] Planes obtenidos:', plansData);
        // Filtrar solo planes activos y no eliminados
        const activePlans = (plansData || []).filter(
          plan => plan.isActive && !plan.isDeleted,
        );
        console.log('[PlanSelection] Planes activos:', activePlans);
        setPlans(activePlans);
      } catch (err: any) {
        console.error('[PlanSelection] Error al obtener planes:', err);
        setError(err.message || 'Error al cargar los planes');
      } finally {
        if (showRefreshing) {
          setRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [groupId],
  );

  // Hacer fetch cuando la pantalla recibe foco
  useFocusEffect(
    useCallback(() => {
      fetchPlans();
    }, [fetchPlans]),
  );

  const onRefresh = useCallback(() => {
    fetchPlans(true);
  }, [fetchPlans]);

  const handlePaymentSelect = async (plan: Financing) => {
    // Evitar múltiples llamadas mientras se está actualizando
    if (isUpdating) {
      console.log('[PlanSelection] Ya se está actualizando, ignorando click');
      return;
    }

    if (!currentPurchase?.id) {
      console.error('[PlanSelection] No hay purchase en el store');
      setError('No se encontró la información de la compra');
      return;
    }

    try {
      setIsUpdating(true);
      setUpdatingPlanId(plan.id);
      setError(null);
      console.log('[PlanSelection] Actualizando purchase:', {
        purchaseId: currentPurchase.id,
        financingTypeId: plan.id,
      });

      const updatedPurchase = await updatePurchase(currentPurchase.id, {
        financingTypeId: plan.id,
      });

      console.log(
        '[PlanSelection] Purchase actualizada exitosamente:',
        updatedPurchase,
      );

      // Actualizar el store con la purchase actualizada
      dispatch(setCurrentPurchase(updatedPurchase));

      // Navegar a la pantalla de confirmación
      (navigation as any).navigate(Routes.NAVIGATION_PURCHASESCONFIRM, {
        purchaseId: updatedPurchase.id,
      });
    } catch (err: any) {
      console.error('[PlanSelection] Error al actualizar purchase:', err);
      setError(err.message || 'Error al seleccionar el plan');
    } finally {
      setIsUpdating(false);
      setUpdatingPlanId(null);
    }
  };

  const handleCustomAmount = () => {
    console.log('[PlanSelection] Monto personalizado');
    // TODO: Navegar a pantalla de monto personalizado
  };

  const formatPercentage = (rate: number) => {
    return `${rate.toFixed(2)}%`;
  };

  const formatUsdAmount = (amount: string | number) => {
    const numericAmount =
      typeof amount === 'string'
        ? parseFloat(amount.replace(/[^0-9.-]/g, ''))
        : amount;
    return `$${numericAmount.toFixed(2)} USD`;
  };

  return (
    <CurvedHeaderLayout
      title="Elige tu inicial"
      showBackButton
      onBackPress={() => navigation.goBack()}
      scroll={false}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[IVOO_COLORS.primary]}
            tintColor={IVOO_COLORS.primary}
          />
        }>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={IVOO_COLORS.primary} />
            <Text style={styles.loadingText}>Cargando planes...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : plans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image
              source={require('../../images/plans/empty-box.png')}
              style={styles.emptyBoxIcon}
              resizeMode="contain"
            />
            <Text style={styles.emptyText}>No hay planes disponibles</Text>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.optionsContainer}>
              {plans.length > 0
                ? plans.map(plan => (
                    <TouchableOpacity
                      key={plan.id}
                      style={[
                        styles.optionCard,
                        isUpdating && styles.optionCardDisabled,
                      ]}
                      onPress={() => handlePaymentSelect(plan)}
                      activeOpacity={0.7}
                      disabled={isUpdating}>
                      <View style={styles.optionContent}>
                        <View style={styles.optionTextContainer}>
                          <Text style={styles.optionAmount}>
                            {/* {plan.initialAmount
                              ? formatCurrency(Number(plan.initialAmount))
                              : plan.initialPayment
                              ? `${(Number(plan.initialPayment) * 100).toFixed(
                                  0,
                                )}%`
                              : '0%'} */}
                            {currentPurchase?.totalAmount &&
                              plan.initialPayment && (
                                <>
                                  {formatUsdAmount(
                                    Number(currentPurchase.totalAmount) *
                                      Number(plan.initialPayment),
                                  )}
                                </>
                              )}
                          </Text>
                          <View style={styles.optionDetails}>
                            <Text style={styles.optionDetailsText}>
                              {formatPercentage(
                                Number(plan.initialPayment) * 100,
                              )}{' '}
                              + {plan.paymentCount} cuotas
                            </Text>
                          </View>
                        </View>
                        {isUpdating && updatingPlanId === plan.id ? (
                          <ActivityIndicator
                            size="small"
                            color={IVOO_COLORS.primary}
                          />
                        ) : (
                        <Icon
                          name="chevron-forward"
                          type={IconType.Ionicons}
                          size={24}
                          color={IVOO_COLORS.black}
                        />
                        )}
                      </View>
                    </TouchableOpacity>
                  ))
                : null}

              {/* Opción personalizada */}
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  isUpdating && styles.optionCardDisabled,
                ]}
                onPress={handleCustomAmount}
                activeOpacity={0.7}
                disabled={isUpdating}>
                <View style={styles.optionContent}>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.customOptionTitle}>
                      Elegir un monto personalizado
                    </Text>
                    <Text style={styles.customOptionDescription}>
                      Ingresar manualmente
                    </Text>
                  </View>
                  <Icon
                    name="chevron-forward"
                    type={IconType.Ionicons}
                    size={24}
                    color={IVOO_COLORS.black}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </CurvedHeaderLayout>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingTop: SCREEN_HEIGHT * 0.02,
  },
  optionsContainer: {
    width: '100%',
  },
  optionCard: {
    width: '100%',
    backgroundColor: '#F9FAFC',
    borderRadius: 12,
    paddingVertical: SCREEN_HEIGHT * 0.015,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    marginBottom: SCREEN_WIDTH * 0.03,
    borderWidth: 1,
    borderColor: 'rgba(110, 113, 124, 0.2)',
  },
  optionCardDisabled: {
    opacity: 0.5,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionAmount: {
    fontSize: SCREEN_WIDTH * 0.048,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
    marginBottom: 2,
  },
  optionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  optionDetailsText: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: '#6E717C',
    marginRight: SCREEN_WIDTH * 0.02,
  },
  gemsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gemsText: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.primary,
    marginRight: 4,
  },
  customOptionTitle: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
    marginBottom: 2,
  },
  customOptionDescription: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: '#6E717C',
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: SCREEN_WIDTH * 0.06,
    paddingTop: SCREEN_HEIGHT * 0.15,
  },
  emptyBoxIcon: {
    width: SCREEN_WIDTH * 0.3,
    height: SCREEN_WIDTH * 0.3,
    marginBottom: SCREEN_HEIGHT * 0.04,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: SCREEN_WIDTH * 0.042,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.grayMedium || IVOO_COLORS.textSecondary || '#6E717C',
    textAlign: 'center',
  },
});

export default PlanSelection;
