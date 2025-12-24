import React, {useState, useCallback, useEffect} from 'react';
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
import LinearGradient from 'react-native-linear-gradient';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import CurvedHeaderLayout from '../../components/layouts/CurvedHeaderLayout';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import GemIcon from '../../svgs/menus/gem.svg';
import {getPlansByGroupId, Financing} from '../../services/plan';
import {useIvoSelector, useIvoDispatch} from '../../../../../redux/useIvo';
import {updatePurchase, simulatePurchase} from '../../services/credit';
import {setCurrentPurchase} from '../../store-creditivoo/purchase-slice';
import {getIsPlusUser} from '../../services/auth';
import {getSubscriptionAmount} from '../../services/megasoft';
import {createPurchase} from '../../services/purchases';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const PlanSelection: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const groupId = (route.params as any)?.groupId as number;
  const isPlusPlanParam = (route.params as any)?.isPlusPlan as
    | boolean
    | undefined;
  const dispatch = useIvoDispatch();

  const {currentPurchase} = useIvoSelector(state => state.creditivoo.purchase);
  const {user} = useIvoSelector(state => state.creditivoo.auth);

  const [plans, setPlans] = useState<Financing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isPlusPlan, setIsPlusPlan] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingPlanId, setUpdatingPlanId] = useState<number | null>(null);
  const [isInsufficientCredit, setIsInsufficientCredit] = useState(false);
  const [subscriptionAmount, setSubscriptionAmount] = useState<number | null>(
    null,
  );
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Verificar si el usuario es Plus cuando se recibe isPlusPlanParam
  useEffect(() => {
    const checkIsPlusUser = async () => {
      if (isPlusPlanParam) {
        try {
          const isPlusUser = await getIsPlusUser();
          // Si el usuario ya es Plus, no mostrar el card de suscripción
          setIsPlusPlan(!isPlusUser);
        } catch (err: any) {
          console.error(
            '[PlanSelection] Error al verificar si usuario es Plus:',
            err,
          );
          // En caso de error, no mostrar el card Plus
          setIsPlusPlan(false);
        }
      } else {
        setIsPlusPlan(false);
      }
    };

    checkIsPlusUser();
  }, [isPlusPlanParam]);

  // Obtener el monto de suscripción cuando se muestra el card de PLAN PLUS
  useEffect(() => {
    const fetchSubscriptionAmount = async () => {
      if (isPlusPlan) {
        try {
          console.log('[PlanSelection] Obteniendo monto de suscripción...');
          const amount = await getSubscriptionAmount();
          console.log('[PlanSelection] Monto obtenido:', amount);
          setSubscriptionAmount(amount);
        } catch (err: any) {
          console.error(
            '[PlanSelection] Error al obtener monto de suscripción:',
            err,
          );
          // En caso de error, mantener null para mostrar un valor por defecto o manejar el error
        }
      } else {
        setSubscriptionAmount(null);
      }
    };

    fetchSubscriptionAmount();
  }, [isPlusPlan]);

  const fetchPlans = useCallback(
    async (showRefreshing = false) => {
      // Si es PLAN PLUS, no hacer fetch de planes
      if (isPlusPlan) {
        setIsLoading(false);
        setRefreshing(false);
        return;
      }

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
        setIsInsufficientCredit(false);
        console.log('[PlanSelection] Obteniendo planes del grupo:', groupId);
        const purchaseId = currentPurchase?.id;
        const plansData = await getPlansByGroupId(groupId, purchaseId);
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
    [groupId, currentPurchase?.id, isPlusPlan],
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
    if (isUpdating) {
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
      setIsInsufficientCredit(false);
      console.log(
        '[PlanSelection] Actualizando purchase y obteniendo simulación:',
        {
          purchaseId: currentPurchase.id,
          financingTypeId: plan.id,
        },
      );

      const updatedPurchase = await updatePurchase(currentPurchase.id, {
        financingTypeId: plan.id,
      });

      // Actualizar el store con la purchase actualizada
      dispatch(setCurrentPurchase(updatedPurchase));

      // Obtener la simulación de la purchase
      const simulation = await simulatePurchase(updatedPurchase.id);

      // Navegar a la pantalla de confirmación con los datos de simulación
      (navigation as any).navigate('PurchaseConfirmation', {
        purchaseId: updatedPurchase.id,
        simulation: simulation,
      });
    } catch (err: any) {
      console.error('[PlanSelection] Error al seleccionar plan:', err);
      const errorMessage = err.message || 'Error al seleccionar el plan';

      // Detectar si es error de crédito insuficiente
      if (
        errorMessage.includes('Crédito insuficiente') ||
        errorMessage.includes('crédito insuficiente') ||
        errorMessage.includes('Crédito insuficiente para este plan')
      ) {
        setIsInsufficientCredit(true);
        setError(null);
      } else {
        setIsInsufficientCredit(false);
        setError(errorMessage);
      }
    } finally {
      setIsUpdating(false);
      setUpdatingPlanId(null);
    }
  };

  const handleCustomAmount = () => {
    console.log('[PlanSelection] Monto personalizado');
    // TODO: Navegar a pantalla de monto personalizado
  };

  const handleSubscribe = async () => {
    if (isSubscribing) {
      return; // Evitar múltiples llamadas
    }

    try {
      setIsSubscribing(true);
      setError(null);
      console.log('[PlanSelection] Suscribirse a PLAN PLUS');

      if (!user?.id) {
        console.error('[PlanSelection] No se encontró el ID del usuario');
        setError('No se encontró información del usuario');
        return;
      }

      if (subscriptionAmount === null) {
        console.warn('[PlanSelection] Monto de suscripción no disponible aún');
        setError(
          'El monto de suscripción no está disponible. Por favor, intenta nuevamente.',
        );
        return;
      }

      console.log('[PlanSelection] Creando purchase para suscripción...');
      const purchase = await createPurchase({
        userId: user.id,
        isForPlanSubscription: true,
      });

      console.log('[PlanSelection] Purchase creada exitosamente:', purchase);

      // Actualizar el store con la purchase creada
      dispatch(setCurrentPurchase(purchase as any));

      // Navegar a la pantalla de confirmación sin simulación (es un solo pago)
      (navigation as any).navigate('PurchaseConfirmation', {
        purchaseId: purchase.id,
        isPlanSubscription: true, // Indicar que es una suscripción, no necesita simulación
      });
    } catch (subscribeError: any) {
      console.error(
        '[PlanSelection] Error al procesar suscripción:',
        subscribeError,
      );
      setError(
        subscribeError.message ||
          'Error al procesar la suscripción. Por favor, intenta nuevamente.',
      );
    } finally {
      setIsSubscribing(false);
    }
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
        ) : isInsufficientCredit ? (
          <View style={styles.insufficientCreditContainer}>
            <Text style={styles.sorryText}>¡Lo sentimos!</Text>
            <Text style={styles.insufficientCreditMessage}>
              Crédito insuficiente para este plan
            </Text>
            <Image
              source={require('../../images/purchases/ivitoo-triste-1.png')}
              style={styles.ivitooSadImage}
              resizeMode="contain"
            />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : isPlusPlan ? (
          // Mostrar tarjeta PLAN PLUS cuando isPlusPlan es true
          <View style={styles.content}>
            <View style={styles.plusPlanCard}>
              {/* Header con gradiente */}
              <LinearGradient
                colors={['#52e665', '#b1c0d8', '#fea9fe']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.plusPlanHeader}>
                <View style={styles.plusPlanHeaderContent}>
                  <Text style={styles.plusPlanLabel}>PLAN</Text>
                  <Text style={styles.plusPlanTitle}>PLUS</Text>
                </View>
              </LinearGradient>

              {/* Contenido principal */}
              <View style={styles.plusPlanContent}>
                {/* Inicial desde 0% */}
                <View style={styles.plusPlanInitial}>
                  <Text style={styles.plusPlanInitialPercent}>Desde 0%</Text>
                  <Text style={styles.plusPlanInitialLabel}>de inicial</Text>
                </View>

                {/* Lista de beneficios */}
                <View style={styles.plusPlanBenefits}>
                  <View style={styles.benefitItem}>
                    <Icon
                      name="check-circle"
                      type={IconType.MaterialIcons}
                      size={24}
                      color={IVOO_COLORS.primary}
                      style={styles.benefitIcon}
                    />
                    <Text style={styles.benefitText}>Más cuotas</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Icon
                      name="check-circle"
                      type={IconType.MaterialIcons}
                      size={24}
                      color={IVOO_COLORS.primary}
                      style={styles.benefitIcon}
                    />
                    <Text style={styles.benefitText}>Desde $100</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Icon
                      name="check-circle"
                      type={IconType.MaterialIcons}
                      size={24}
                      color={IVOO_COLORS.primary}
                      style={styles.benefitIcon}
                    />
                    <Text style={styles.benefitText}>Acumula Gemas</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Icon
                      name="check-circle"
                      type={IconType.MaterialIcons}
                      size={24}
                      color={IVOO_COLORS.primary}
                      style={styles.benefitIcon}
                    />
                    <Text style={styles.benefitText}>Aumenta tu linea</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Icon
                      name="check-circle"
                      type={IconType.MaterialIcons}
                      size={20}
                      color="#B8E6B8"
                      style={styles.benefitIcon}
                    />
                    <Text style={styles.benefitTextFuture}>
                      Descubre proximamente mas beneficios
                    </Text>
                  </View>
                </View>

                {/* Caja de precio */}
                <View style={styles.plusPlanPricing}>
                  <Text style={styles.plusPlanPricingLabel}>Solo por</Text>
                  <View style={styles.plusPlanPricingAmount}>
                    <Text style={styles.plusPlanPrice}>
                      ${subscriptionAmount ?? '...'}
                    </Text>
                    <Text style={styles.plusPlanPricePeriod}>/año</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.plusPlanSubscribeButton,
                    isSubscribing && styles.plusPlanSubscribeButtonDisabled,
                  ]}
                  onPress={handleSubscribe}
                  activeOpacity={0.8}
                  disabled={isSubscribing}>
                  <LinearGradient
                    colors={['#52e665', '#b1c0d8', '#fea9fe']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={styles.plusPlanSubscribeButtonGradient}>
                    {isSubscribing ? (
                      <ActivityIndicator
                        size="small"
                        color={IVOO_COLORS.white}
                      />
                    ) : (
                      <Text style={styles.plusPlanSubscribeButtonText}>
                        Suscribirse
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
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
                        <View style={styles.optionRight}>
                          {plan.points != null && plan.points > 0 && (
                            <View style={styles.pointsContainer}>
                              <Text style={styles.pointsText}>
                                Gana {plan.points}
                              </Text>
                              <GemIcon
                                width={SCREEN_WIDTH * 0.04}
                                height={SCREEN_WIDTH * 0.04}
                              />
                            </View>
                          )}
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
                      </View>
                    </TouchableOpacity>
                  ))
                : null}

              {/* Opción personalizada */}
              {/* <TouchableOpacity
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
              </TouchableOpacity> */}
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
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SCREEN_WIDTH * 0.02,
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
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  pointsText: {
    fontSize: SCREEN_WIDTH * 0.037,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: '#6E717C',
    marginRight: 4,
  },
  pointsAdvanceText: {
    fontSize: SCREEN_WIDTH * 0.033,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.grayMedium,
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
  insufficientCreditContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.1,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
  },
  sorryText: {
    fontSize: SCREEN_WIDTH * 0.08,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  insufficientCreditMessage: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.textSecondary || '#6E717C',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.04,
  },
  ivitooSadImage: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    marginTop: SCREEN_HEIGHT * 0.02,
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
  // PLAN PLUS Card Styles
  plusPlanCard: {
    width: '100%',
    backgroundColor: IVOO_COLORS.white,
    borderRadius: 11,
    overflow: 'hidden',
    marginTop: SCREEN_HEIGHT * 0.01,
    borderWidth: 1,
    borderColor: 'rgba(110, 113, 124, 0.2)',
  },
  plusPlanHeader: {
    paddingTop: SCREEN_HEIGHT * 0.03,
    paddingBottom: SCREEN_HEIGHT * 0.015,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  plusPlanHeaderContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  plusPlanLabel: {
    fontSize: SCREEN_WIDTH * 0.055,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.white,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  plusPlanTitle: {
    fontSize: SCREEN_WIDTH * 0.11,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: '900',
    color: IVOO_COLORS.white,
    letterSpacing: 2,
  },

  plusPlanContent: {
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingTop: SCREEN_HEIGHT * 0.025,
    paddingBottom: SCREEN_HEIGHT * 0.03,
  },
  plusPlanInitial: {
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.03,
    fontSize: SCREEN_WIDTH * 0.055,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
  },
  plusPlanInitialPercent: {
    fontSize: SCREEN_WIDTH * 0.12,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
    marginBottom: 1,
  },
  plusPlanInitialLabel: {
    fontSize: SCREEN_WIDTH * 0.055,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.black,
  },
  plusPlanBenefits: {
    marginBottom: SCREEN_HEIGHT * 0.025,
    marginLeft: SCREEN_WIDTH * 0.07,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  benefitIcon: {
    marginRight: SCREEN_WIDTH * 0.03,
  },
  benefitText: {
    fontSize: SCREEN_WIDTH * 0.05,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
    flex: 1,
  },
  benefitTextFuture: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.primary,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    flex: 1,
  },
  plusPlanPricing: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: SCREEN_HEIGHT * 0.01,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.025,
  },
  plusPlanPricingLabel: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.primary,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
  },
  plusPlanPricingAmount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  plusPlanPrice: {
    fontSize: SCREEN_WIDTH * 0.18,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.primary,
    marginRight: SCREEN_WIDTH * 0.015,
  },
  plusPlanPricePeriod: {
    fontSize: SCREEN_WIDTH * 0.048,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.primary,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
  },
  plusPlanSubscribeButton: {
    width: '100%',
    borderRadius: 25,
    overflow: 'hidden',
  },
  plusPlanSubscribeButtonDisabled: {
    opacity: 0.6,
  },
  plusPlanSubscribeButtonGradient: {
    paddingVertical: SCREEN_HEIGHT * 0.018,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusPlanSubscribeButtonText: {
    fontSize: SCREEN_WIDTH * 0.055,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.white,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default PlanSelection;
