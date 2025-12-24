import React, {useState, useCallback, useMemo} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import CurvedHeaderLayout from '../../components/layouts/CurvedHeaderLayout';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import {
  getCreditMovements,
  CreditMovement,
  getCreditInfo,
  CreditInfo,
} from '../../services/credit';
import {getPurchaseById, PurchaseResponse} from '../../services/purchases';
import HomeCreditCard from '../home/HomeCreditCard';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {useIvoSelector} from '../../../../../redux/useIvo';
import { Routes } from '../../../../../Utils/NavigationRoutes';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

interface GroupedMovement {
  dateKey: string;
  movements: CreditMovement[];
}

// Helper function to format date for grouping
const getDateKey = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Hoy';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Ayer';
  } else {
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} de ${month} de ${year}`;
  }
};

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return `$${Math.abs(amount).toFixed(2)}`;
};

// Helper function to get icon for movement type
const getMovementIcon = (type: string): string => {
  switch (type) {
    case 'purchase':
      return 'arrow-up-circle';
    case 'payment':
      return 'arrow-down-circle';
    case 'refund':
      return 'refresh-circle';
    case 'credit_granted':
      return 'add-circle';
    default:
      return 'ellipse';
  }
};

// Helper function to get color for movement type
const getMovementColor = (type: string): string => {
  switch (type) {
    case 'purchase':
      return '#6C63FF'; // Purple for purchases
    case 'payment':
    case 'refund':
    case 'credit_granted':
      return '#4CAF50'; // Green for credits
    default:
      return IVOO_COLORS.grayMedium;
  }
};

const MovementsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [movements, setMovements] = useState<CreditMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);

  // Obtener estado de purchases del store
  const {hasPurchasePendingInvoice, hasPurchaseInProgress} = useIvoSelector(
    state => state.creditivoo.purchase,
  );

  // Obtener usuario del store
  const {user} = useIvoSelector(state => state.creditivoo.auth);

  const hasNextPayment = !!creditInfo?.nextPayment;

  // Verificar si hay crédito activo
  const hasActiveCredit =
    user?.hasActiveCredit ||
    (!!creditInfo?.hasActiveCredit && (creditInfo.creditAvailable || 0) > 0);

  // Verificar si hay compras activas
  const hasActivePurchases = hasPurchasePendingInvoice || hasPurchaseInProgress;

  // Si no hay crédito ni compras, no mostrar la tarjeta
  const shouldShowCreditCard = hasActiveCredit || hasActivePurchases;

  const fetchMovements = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      console.log('[MovementsScreen] Obteniendo movimientos de crédito');
      const data = await getCreditMovements(100, 0);
      console.log('[MovementsScreen] Movimientos obtenidos:', data.length);
      setMovements(data);
    } catch (err: any) {
      console.error('[MovementsScreen] Error al obtener movimientos:', err);
      setError(err.message || 'Error al cargar los movimientos');
    } finally {
      if (showRefreshing) {
        setRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  const onRefresh = useCallback(() => {
    fetchMovements(true);
  }, [fetchMovements]);

  useFocusEffect(
    useCallback(() => {
      fetchMovements();
    }, [fetchMovements]),
  );

  const handleBackPress = () => {
    navigation.goBack();
  };

  const fetchCreditInfo = useCallback(async () => {
    try {
      const data = await getCreditInfo();
      setCreditInfo(data);
    } catch (err) {
      console.error(
        '[MovementsScreen] Error al obtener información de crédito:',
        err,
      );
      setCreditInfo(null);
    }
  }, []);

  // Fetch credit info when screen focuses
  useFocusEffect(
    useCallback(() => {
      fetchCreditInfo();
    }, [fetchCreditInfo]),
  );

  const handleRequestCredit = () => {
    (navigation as any).navigate('IdentityVerificator');
  };

  const handlePayPress = async (purchaseId: number) => {
    try {
      const purchaseDetails: PurchaseResponse = await getPurchaseById(
        purchaseId,
      );

      // Navigate to payment installments screen with full purchase data
      (navigation as any).navigate(Routes.NAVIGATION_PAYMENTSINSTALLS, {
        purchase: purchaseDetails,
      });
    } catch (err: any) {
      console.error(
        '[MovementsScreen] Error al obtener detalles de compra:',
        err,
      );
      // Podríamos mostrar un error al usuario aquí
    }
  };

  // Group movements by date
  const groupedMovements = useMemo((): GroupedMovement[] => {
    const grouped: Record<string, CreditMovement[]> = {};

    movements.forEach(movement => {
      const dateKey = getDateKey(movement.date);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(movement);
    });

    return Object.entries(grouped).map(([dateKey, movementsList]) => ({
      dateKey,
      movements: movementsList,
    }));
  }, [movements]);

  const renderMovementItem = ({
    item,
    isLast,
  }: {
    item: CreditMovement;
    isLast: boolean;
  }) => {
    const iconName = getMovementIcon(item.type);
    const iconColor = getMovementColor(item.type);
    const isDebit = item.amount < 0;

    return (
      <View>
        <View style={styles.movementItem}>
          <View style={styles.movementLeft}>
            <View style={[styles.iconContainer]}>
              <Icon
                name={iconName}
                type={IconType.Ionicons}
                size={20}
                color={iconColor}
              />
            </View>
            <View style={styles.movementInfo}>
              <Text style={styles.movementDescription} numberOfLines={1}>
                {item.description}
              </Text>
              <Text style={styles.movementStatus} numberOfLines={1}>
                {item.status}
              </Text>
            </View>
          </View>
          <View style={styles.movementRight}>
            <Text style={styles.movementAmount}>
              {isDebit ? '-' : ''} USD {formatCurrency(item.amount)}
            </Text>
          </View>
        </View>
        {!isLast && <View style={styles.separator} />}
      </View>
    );
  };

  const renderGroup = ({
    item,
    index: groupIndex,
  }: {
    item: GroupedMovement;
    index: number;
  }) => {
    const isLastGroup = groupIndex === flatListData.length - 1;
    return (
      <View style={styles.groupContainer}>
        <Text style={styles.dateHeader}>{item.dateKey}</Text>
        {item.movements.map((movement, movementIndex) => {
          const isLastMovement =
            movementIndex === item.movements.length - 1 && isLastGroup;
          return (
            <View key={movement.id}>
              {renderMovementItem({
                item: movement,
                isLast: isLastMovement,
              })}
            </View>
          );
        })}
      </View>
    );
  };

  const renderEmptyState = () => {
    // Si no hay crédito ni compras, mostrar solo el texto gris sin contenedor
    if (!shouldShowCreditCard) {
      return (
        <View style={styles.emptyStateSimple}>
          <Text style={styles.emptyStateText}>No tienes movimientos</Text>
        </View>
      );
    }

    // Si hay crédito o compras, mostrar el empty state normal
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>
          No tienes movimientos registrados
        </Text>
      </View>
    );
  };

  // Flatten grouped movements for FlatList
  const flatListData = useMemo(() => {
    return groupedMovements;
  }, [groupedMovements]);

  return (
    <CurvedHeaderLayout
      title="Movimientos"
      showBackButton={true}
      onBackPress={handleBackPress}
      scroll={false}
      noRoundedCorners={movements.length > 0}
      increaseHeaderHeight={movements.length > 0}
      floatingComponent={
        shouldShowCreditCard ? (
          <HomeCreditCard
            style={styles.creditCard}
            onRequestCredit={handleRequestCredit}
            onPayPress={handlePayPress}
            hideLogo={true}
            hideEyeIcon={true}
          />
        ) : null
      }>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={IVOO_COLORS.primary} />
          <Text style={styles.loadingText}>Cargando movimientos...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : !shouldShowCreditCard && movements.length === 0 ? (
        // Si no hay crédito ni compras ni movimientos, mostrar solo el texto gris
        <View style={styles.emptyStateSimpleContainer}>
          {renderEmptyState()}
        </View>
      ) : (
        <View
          style={[
            styles.contentWrapper,
            {
              paddingTop: shouldShowCreditCard
                ? hasNextPayment
                  ? SCREEN_HEIGHT * 0.2
                  : SCREEN_HEIGHT * 0.16
                : SCREEN_HEIGHT * 0.1, // Menos padding cuando no hay card
            },
          ]}>
          {shouldShowCreditCard && (
            <Text style={styles.movementsTitle}>Movimientos</Text>
          )}
          <View style={styles.movementsParentContainer}>
            <FlatList
              data={flatListData}
              renderItem={renderGroup}
              keyExtractor={(item, index) => `${item.dateKey}-${index}`}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={true}
              scrollEnabled={true}
              nestedScrollEnabled={true}
              ListEmptyComponent={renderEmptyState}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[IVOO_COLORS.primary]}
                  tintColor={IVOO_COLORS.primary}
                />
              }
            />
          </View>
        </View>
      )}
    </CurvedHeaderLayout>
  );
};

const styles = StyleSheet.create({
  creditCard: {
    position: 'absolute',
    top:
      SCREEN_HEIGHT * 0.055 -
      (SCREEN_HEIGHT * 0.16 - 35) +
      SCREEN_HEIGHT * 0.025, // Position relative to bodyWrapper, moved down a bit more
    left: SCREEN_WIDTH * 0.05,
    right: SCREEN_WIDTH * 0.05,
    zIndex: 20,
  },
  listContent: {
    paddingBottom: SCREEN_HEIGHT * 0.05,
  },
  groupContainer: {
    marginBottom: 0,
  },
  contentWrapper: {
    flex: 1,
  },
  movementsParentContainer: {
    backgroundColor: IVOO_COLORS.white,
    borderRadius: 12,
    width: SCREEN_WIDTH * 0.9, // 100% - 5% left - 5% right = 90%
    alignSelf: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    overflow: 'hidden',
    flex: 1,
    maxHeight: SCREEN_HEIGHT * 0.7, // Limitar altura máxima para permitir scroll
  },
  movementsTitle: {
    fontSize: SCREEN_WIDTH * 0.037,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.textPrimary,
    paddingHorizontal: SCREEN_WIDTH * 0.01,
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  dateHeader: {
    fontSize: SCREEN_WIDTH * 0.035,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: '#979797',
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    marginTop: SCREEN_HEIGHT * 0.01,
  },
  movementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SCREEN_HEIGHT * 0.018,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5E5',
    width: '100%',
  },
  movementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SCREEN_WIDTH * 0.04,
  },
  iconContainer: {
    width: SCREEN_WIDTH * 0.1,
    height: SCREEN_WIDTH * 0.1,
    borderRadius: SCREEN_WIDTH * 0.025,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SCREEN_WIDTH * 0.04,
    backgroundColor: '#F5F5F5',
  },
  movementInfo: {
    flex: 1,
  },
  movementDescription: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interSemiBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.semibold,
    color: IVOO_COLORS.textPrimary,
    marginBottom: SCREEN_HEIGHT * 0.005,
  },
  movementStatus: {
    fontSize: SCREEN_WIDTH * 0.033,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.grayMedium,
  },
  movementRight: {
    alignItems: 'flex-end',
  },
  movementAmount: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.textPrimary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.1,
  },
  emptyStateSimple: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateSimpleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SCREEN_HEIGHT * 0.05,
  },
  emptyStateText: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.grayMedium,
    textAlign: 'center',
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

export default MovementsScreen;
