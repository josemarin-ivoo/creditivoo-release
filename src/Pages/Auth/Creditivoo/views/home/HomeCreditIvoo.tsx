import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Text,
  ScrollView,
  RefreshControl,
  Image,
  ImageBackground,
  Platform,
} from 'react-native';
import HomeHelpIvooAdvisor from './HomeHelpIvooAdvisor';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import LinearGradient from 'react-native-linear-gradient';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import {SCREENS} from '@shared-constants';
import HomeCreditCard from './HomeCreditCard';
import QuickActions from './QuickActions';
import {useIvoDispatch, useIvoSelector} from '../../../../../redux/useIvo';
import {fetchMe} from '../../store-creditivoo/slices/auth-slice';
import {getCreditInfo, CreditInfo} from '../../services/credit';
import {
  getPurchaseById,
  getPurchasesByUserId,
  PurchaseResponse,
} from '../../services/purchases';
import { Routes } from '../../../../../Utils/NavigationRoutes';
import Sales from '../../../../../Components/Sales';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const HomeCreditIvoo: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useIvoDispatch();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);

  // Obtener usuario del store
  const {user} = useIvoSelector(state => state.creditivoo.auth);

  // Obtener la URL de la foto de perfil
  const profilePictureUrl = (user as any)?.profilePictureUrl || null;

  // Obtener si el usuario es Plus
  const isPlusUser = user?.isPlusUser || false;

  // Obtener estado de purchases del store
  const {hasPurchasePendingInvoice, hasPurchaseInProgress} = useIvoSelector(
    state => state.creditivoo.purchase,
  );

  const hasNextPayment = !!creditInfo?.nextPayment;

  // Verificar si hay crédito activo
  const hasActiveCredit =
    !!creditInfo?.hasActiveCredit && (creditInfo.creditAvailable || 0) > 0;

  // Verificar si hay compras activas
  const hasActivePurchases = hasPurchasePendingInvoice || hasPurchaseInProgress;

  // Si no hay crédito ni compras activas, las quick actions deben estar más abajo
  const hasNoCreditOrPurchases = !hasActiveCredit && !hasActivePurchases;

  const fetchCreditInfo = useCallback(async () => {
    try {
      const data = await getCreditInfo();
      setCreditInfo(data);
    } catch (error) {
      console.error(
        '[HomeCreditIvoo] Error al obtener información de crédito:',
        error,
      );
      setCreditInfo(null);
    }
  }, []);

  // Fetch inicial al montar el componente (solo una vez)
  useEffect(() => {
    fetchCreditInfo();
    // Hacer fetchMe() al montar para asegurar datos actualizados al abrir la app
    // Esto solo se ejecuta una vez al montar, no en cada focus
    dispatch(fetchMe()).catch(error => {
      console.error(
        '[HomeCreditIvoo] Error al obtener datos del usuario:',
        error,
      );
    });
    // Solo se ejecuta una vez al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hacer fetch de crédito cuando la pantalla recibe foco (pero no fetchMe)
  useFocusEffect(
    useCallback(() => {
      fetchCreditInfo();
    }, [fetchCreditInfo]),
  );

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      // Actualizar tanto la información de crédito como del usuario en pull-to-refresh
      await Promise.all([fetchCreditInfo(), dispatch(fetchMe()).unwrap()]);
      console.log('[HomeCreditIvoo] Información refrescada');
    } catch (error: any) {
      console.error('[HomeCreditIvoo] Error al refrescar información:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, fetchCreditInfo]);

  const handleRequestCredit = () => {
    (navigation as any).navigate('IdentityVerificator');
  };

  const handlePayPress = async (purchaseId: number) => {
    try {
      console.log(
        '[HomeCreditIvoo] Obteniendo detalles de compra para pagar:',
        purchaseId,
      );
      const purchaseDetails: PurchaseResponse = await getPurchaseById(
        purchaseId,
      );

      console.log(
        '[HomeCreditIvoo] Detalles de compra obtenidos:',
        purchaseDetails,
      );

      // Navigate to payment installments screen with full purchase data
      (navigation as any).navigate(Routes.NAVIGATION_PAYMENTSINSTALLS, {
        purchase: purchaseDetails,
      });
    } catch (err: any) {
      console.error(
        '[HomeCreditIvoo] Error al obtener detalles de compra:',
        err,
      );
      // Podríamos mostrar un error al usuario aquí
    }
  };

  const handleQuickAction = async (action: string) => {
    switch (action) {
      case 'cuotas':
        // Obtener la primera compra disponible y navegar a installments
        try {
          if (!user?.id) {
            console.error(
              '[HomeCreditIvoo] No se puede obtener compras: usuario no encontrado',
            );
            return;
          }

          console.log(
            '[HomeCreditIvoo] Obteniendo compras para navegar a cuotas',
          );
          const purchases = await getPurchasesByUserId(user.id);

          // Filtrar compras que no estén completadas
          const availablePurchases = purchases.filter(
            purchase =>
              purchase.status !== 'COMPLETED' &&
              purchase.status !== 'completed',
          );

          if (availablePurchases.length === 0) {
            console.log(
              '[HomeCreditIvoo] No hay compras disponibles para pagar cuotas',
            );
            // Si no hay compras disponibles, navegar a MyPurchases
            (navigation as any).navigate(Routes.NAVIGATION_MYPURCHASES);
            return;
          }

          // Seleccionar la primera compra disponible
          const firstPurchase = availablePurchases[0];
          console.log(
            '[HomeCreditIvoo] Navegando a PaymentInstallments con compra:',
            firstPurchase.id,
          );

          // Obtener los detalles completos de la compra (incluyendo payments)
          const purchaseDetails = await getPurchaseById(
            typeof firstPurchase.id === 'string'
              ? parseInt(firstPurchase.id, 10)
              : firstPurchase.id,
          );

          // Navegar a PaymentInstallments con la compra seleccionada
          (navigation as any).navigate(Routes.NAVIGATION_PAYMENTSINSTALLS, {
            purchase: purchaseDetails,
          });
        } catch (error: any) {
          console.error(
            '[HomeCreditIvoo] Error al obtener compras para cuotas:',
            error,
          );
          // En caso de error, navegar a MyPurchases como fallback
          (navigation as any).navigate(Routes.NAVIGATION_MYPURCHASES);
        }
        break;
      case 'compras':
        (navigation as any).navigate(Routes.NAVIGATION_MYPURCHASES);
        break;
      case 'movimientos':
        (navigation as any).navigate(Routes.NAVIGATION_MOVEMENTS);
        break;
      case 'puntos':
        (navigation as any).navigate(Routes.NAVIGATION_GEMS);
        break;
      default:
        console.log('Quick Action', action);
        break;
    }
  };

  const handleProfilePress = () => {
    // Try to navigate to Profile tab first, if that doesn't work, use parent navigator
    try {
      (navigation as any).navigate(Routes.NAVIGATION_PROFILE);
    } catch (error) {
      // If navigation fails, try using parent navigator
      const parent = (navigation as any).getParent();
      if (parent) {
        parent.navigate(Routes.NAVIGATION_PROFILE);
      }
    }
  };

  const handleNotificationPress = () => {
    (navigation as any).navigate(Routes.NAVIGATION_NOTIFICATIONS);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor={IVOO_COLORS.primary}
        barStyle="light-content"
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleProfilePress}
          style={styles.profileLink}>
          <View style={styles.greetingContainer}>
            {profilePictureUrl ? (
              <View style={styles.profilePictureContainer}>
                {isPlusUser ? (
                  <LinearGradient
                    colors={['#52e665', '#b1c0d8', '#fea9fe']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={styles.profilePictureGradientBorder}>
                    <View style={styles.profilePictureInnerContainer}>
                      <Image
                        source={{
                          uri: profilePictureUrl,
                        }}
                        style={styles.profilePictureSmall}
                        resizeMode="cover"
                        key={profilePictureUrl}
                        onError={error => {
                          console.log(
                            '[HomeCreditIvoo] Error loading profile picture:',
                            error.nativeEvent,
                          );
                        }}
                      />
                    </View>
                  </LinearGradient>
                ) : (
                  <Image
                    source={{
                      uri: profilePictureUrl,
                    }}
                    style={styles.profilePictureSmallNoBorder}
                    resizeMode="cover"
                    key={profilePictureUrl}
                    onError={error => {
                      console.log(
                        '[HomeCreditIvoo] Error loading profile picture:',
                        error.nativeEvent,
                      );
                    }}
                  />
                )}
                {isPlusUser && (
                  <Image
                    source={require('../../images/home/crown.png')}
                    style={styles.crownIcon}
                    resizeMode="contain"
                  />
                )}
              </View>
            ) : (
              <View style={styles.profilePicturePlaceholder}>
                <Icon
                  name="person"
                  type={IconType.MaterialIcons}
                  size={SCREEN_WIDTH * 0.04}
                  color={IVOO_COLORS.white}
                />
              </View>
            )}
            <Text style={styles.greetingText}>
              Hola, {user?.name || 'Usuario'}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={handleNotificationPress}>
            <Icon name="bell" type={IconType.Feather} size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Icon
              name="help-circle"
              type={IconType.Feather}
              size={20}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </View>
      <HomeCreditCard
        style={[
          styles.mainCard,
          {
            top: Platform.select({
              ios:
                insets.top +
                SCREEN_HEIGHT * 0.01 + // header paddingTop (iOS)
                SCREEN_WIDTH * 0.08 + // altura aproximada del contenido del header
                SCREEN_HEIGHT * 0.05 - // header paddingBottom
                25, // overlap para que el card se superponga correctamente al header
              android: SCREEN_HEIGHT * 0.075,
            }),
          },
        ]}
        onRequestCredit={handleRequestCredit}
        onPayPress={handlePayPress}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        alwaysBounceVertical={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[IVOO_COLORS.primary]}
            tintColor={IVOO_COLORS.primary}
            progressViewOffset={SCREEN_HEIGHT * 0.055}
          />
        }
        showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.actionsWrapper,
            {
              marginTop: hasNoCreditOrPurchases
                ? SCREEN_HEIGHT * 0.28 // Más abajo cuando no hay crédito ni compras
                : hasNextPayment
                ? SCREEN_HEIGHT * 0.24
                : SCREEN_HEIGHT * 0.2,
            },
          ]}>
          <QuickActions onActionPress={handleQuickAction} />

          <View style={styles.sectionsContainer}>
            <Text style={styles.sectionTitle}>Novedades</Text>
            <ImageBackground
              source={require('../../images/home/placeholders/main-banner-placeholder.png')}
              style={styles.bannerContainer}
              imageStyle={styles.bannerImage}
              resizeMode="cover"
            />

            <View style={styles.bottomRow}>
              <View style={styles.halfColumn}>
                <Text style={styles.sectionTitle}>Descuentos</Text>
                <View style={styles.discountCard}>
                  <Image
                    source={require('../../images/home/placeholders/discuounts-placeholder.png')}
                    style={styles.discountImage}
                    resizeMode="cover"
                  />
                </View>
              </View>

              <View style={styles.halfColumn}>
                <Text style={styles.sectionTitle}>Ayuda</Text>
                <View style={styles.helpCard}>
                  <Text style={styles.helpCardTitle}>Necesitas ayuda:</Text>
                  <HomeHelpIvooAdvisor
                    message={
                      'Hola! Soy Ivitoo,\n tu asesor virtual \n de CreditIvoo.'
                    }
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
        {/* <View style={styles.debugContainer}>
          <Text style={styles.debugLabel}>
            hasPurchasePendingInvoice:{' '}
            {hasPurchasePendingInvoice ? 'true' : 'false'}
          </Text>
          <Text style={styles.debugLabel}>
            hasPurchaseInProgress: {hasPurchaseInProgress ? 'true' : 'false'}
          </Text>
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: IVOO_COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  header: {
    backgroundColor: IVOO_COLORS.primary,
    paddingTop: Platform.select({
      ios: SCREEN_HEIGHT * 0.01,
      android: SCREEN_HEIGHT * 0.02,
    }),
    paddingBottom: SCREEN_HEIGHT * 0.05, // Extra height to show the card overlap
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileLink: {
    padding: SCREEN_WIDTH * 0.01,
  },
  profileLinkText: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interSemiBold,
    color: 'white',
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SCREEN_WIDTH * 0.025,
  },
  profilePictureContainer: {
    position: 'relative',
    width: SCREEN_WIDTH * 0.08,
    height: SCREEN_WIDTH * 0.08,
  },
  profilePictureGradientBorder: {
    width: SCREEN_WIDTH * 0.08,
    height: SCREEN_WIDTH * 0.08,
    borderRadius: SCREEN_WIDTH * 0.04,
    padding: SCREEN_WIDTH * 0.004, // Grosor del borde
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePictureInnerContainer: {
    width: '100%',
    height: '100%',
    borderRadius: SCREEN_WIDTH * 0.036,
    overflow: 'hidden',
    backgroundColor: IVOO_COLORS.white,
  },
  profilePictureSmall: {
    width: '100%',
    height: '100%',
    borderRadius: SCREEN_WIDTH * 0.036,
  },
  profilePictureSmallNoBorder: {
    width: SCREEN_WIDTH * 0.08,
    height: SCREEN_WIDTH * 0.08,
    borderRadius: SCREEN_WIDTH * 0.04,
    backgroundColor: IVOO_COLORS.white,
  },
  crownIcon: {
    position: 'absolute',
    top: -SCREEN_WIDTH * 0.042,
    left: -SCREEN_WIDTH * 0.009,
    alignSelf: 'center',
    width: SCREEN_WIDTH * 0.06,
    height: SCREEN_WIDTH * 0.06,
    zIndex: -10,
  },
  profilePicturePlaceholder: {
    width: SCREEN_WIDTH * 0.08,
    height: SCREEN_WIDTH * 0.08,
    borderRadius: SCREEN_WIDTH * 0.04,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interSemiBold,
    color: 'white',
  },
  headerIcons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SCREEN_WIDTH * 0.05,
  },
  headerIcon: {
    padding: SCREEN_WIDTH * 0.01,
  },

  mainCard: {
    position: 'absolute',
    // top is calculated dynamically based on safe area insets
    left: SCREEN_WIDTH * 0.05,
    right: SCREEN_WIDTH * 0.05,
    zIndex: 20,
  },

  actionsWrapper: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingBottom: SCREEN_WIDTH * 0.18,
    alignItems: 'center',
  },
  sectionsContainer: {
    width: '100%',
    marginTop: SCREEN_HEIGHT * 0.01,
  },
  sectionTitle: {
    fontSize: SCREEN_WIDTH * 0.038,
    letterSpacing: IVOO_TYPOGRAPHY.letterSpacing.wide,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: '#000',
    marginBottom: SCREEN_HEIGHT * 0.01,
    marginTop: SCREEN_HEIGHT * 0.015,
  },
  bannerContainer: {
    width: SCREEN_WIDTH, // Full width de la pantalla
    height: SCREEN_HEIGHT * 0.18,
    marginLeft: -SCREEN_WIDTH * 0.05, // Compensar padding del actionsWrapper
    marginRight: -SCREEN_WIDTH * 0.05, // Compensar padding del actionsWrapper
    borderRadius: 0, // Sin border radius para full width
    overflow: 'hidden',
  },
  bannerImage: {
    borderRadius: 0, // Sin border radius para full width
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  halfColumn: {
    width: '48%',
  },
  discountCard: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.15,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  discountImage: {
    width: '100%',
    height: '100%',
  },
  helpCard: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.15,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    paddingTop: SCREEN_HEIGHT * 0.01,
    paddingRight: SCREEN_WIDTH * 0.02,
    justifyContent: 'space-between',
  },
  helpCardTitle: {
    fontSize: SCREEN_WIDTH * 0.027,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: '#000',
    textAlign: 'center',
    lineHeight: SCREEN_WIDTH * 0.036,
    marginBottom: SCREEN_HEIGHT * 0.005,
  },

  /* BOTTOM TABS */
  tabBar: {
    position: 'absolute',
    bottom: 0,
    height: SCREEN_HEIGHT * 0.11,
    width: '100%',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#00000050',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
    paddingBottom: SCREEN_HEIGHT * 0.02,
  },
  tabItemActive: {
    backgroundColor: IVOO_COLORS.primary,
    width: SCREEN_WIDTH * 0.14,
    height: SCREEN_WIDTH * 0.14,
    borderRadius: SCREEN_WIDTH * 0.07,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabItem: {
    width: SCREEN_WIDTH * 0.14,
    height: SCREEN_WIDTH * 0.14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabDots: {
    flexDirection: 'row',
    gap: SCREEN_WIDTH * 0.01,
  },
  tabDot: {
    width: SCREEN_WIDTH * 0.013,
    height: SCREEN_WIDTH * 0.013,
    borderRadius: SCREEN_WIDTH * 0.0065,
    backgroundColor: '#C4C4C4',
  },
  debugContainer: {
    color: 'black',
    backgroundColor: 'red',
    padding: SCREEN_WIDTH * 0.04,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
    borderStyle: 'dashed',
  },
  debugLabel: {
    fontSize: SCREEN_WIDTH * 0.032,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
});

export default HomeCreditIvoo;
