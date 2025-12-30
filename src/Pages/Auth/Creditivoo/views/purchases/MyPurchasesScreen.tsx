import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import CurvedHeaderLayout from '../../components/layouts/CurvedHeaderLayout';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import {PurchaseCard, Purchase} from '../../components/purchases';
import {useIvoSelector} from '../../../../../redux/useIvo';
import {
  getPurchasesByUserId,
  getPurchaseById,
  PurchaseResponse,
} from '../../services/purchases';
import { Routes } from '../../../../../Utils/NavigationRoutes';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

type PurchaseStatus = 'pending' | 'completed' | 'cancelled';

// Helper function to format date in Spanish
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const days = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ];
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

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];

  return `${dayName} ${day} de ${month}`;
};

// Helper function to map API response to component Purchase format
const mapPurchaseResponseToPurchase = (
  purchaseResponse: PurchaseResponse,
): Purchase => {
  // Preservar el status original del API o mapearlo
  let status:
    | 'pending'
    | 'completed'
    | 'cancelled'
    | 'DRAFT'
    | 'IN_REVIEW_BY_CLIENT'
    | 'PENDING_INVOICE'
    | 'IN_PROGRESS' = 'pending';

  const apiStatus = purchaseResponse.status?.toUpperCase();

  if (apiStatus === 'COMPLETED') {
    status = 'completed';
  } else if (apiStatus === 'CANCELLED') {
    status = 'cancelled';
  } else if (apiStatus === 'DRAFT') {
    status = 'DRAFT';
  } else if (apiStatus === 'IN_REVIEW_BY_CLIENT') {
    status = 'IN_REVIEW_BY_CLIENT';
  } else if (apiStatus === 'PENDING_INVOICE') {
    status = 'PENDING_INVOICE';
  } else if (apiStatus === 'IN_PROGRESS') {
    status = 'IN_PROGRESS';
  } else {
    // Para cualquier otro status, mantenerlo como 'pending'
    status = 'pending';
  }

  // Obtener nombre de la tienda desde tenant
  const storeName = purchaseResponse.tenant?.name || 'IVOO';

  // Convertir totalAmount de string a number
  const amount = parseFloat(purchaseResponse.totalAmount || '0');

  return {
    id: purchaseResponse.id.toString(),
    storeName,
    date: purchaseResponse.createdAt,
    amount,
    status,
    formattedDate: formatDate(purchaseResponse.createdAt),
    // Pasar el tenant directamente desde la respuesta del API
    tenant: purchaseResponse.tenant || undefined,
  };
};

const MyPurchasesScreen: React.FC = () => {
  const navigation = useNavigation();
  const {user} = useIvoSelector(state => state.creditivoo.auth);
  const [selectedTab, setSelectedTab] = useState<PurchaseStatus>('pending');
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingPurchaseId, setLoadingPurchaseId] = useState<string | null>(
    null,
  );

  const fetchPurchases = useCallback(
    async (showLoading = true) => {
      if (!user?.id) {
        setError('Usuario no encontrado');
        setIsLoading(false);
        return;
      }

      try {
        if (showLoading) {
          setIsLoading(true);
        }
        setError(null);
        console.log(
          '[MyPurchasesScreen] Obteniendo compras del usuario:',
          user.id,
        );

        const purchasesData = await getPurchasesByUserId(user.id);
        console.log('[MyPurchasesScreen] Compras obtenidas:', purchasesData);

        // Mapear las compras del API al formato del componente
        const mappedPurchases = purchasesData.map(
          mapPurchaseResponseToPurchase,
        );
        console.log('[MyPurchasesScreen] Compras mapeadas:', mappedPurchases);
        console.log(
          '[MyPurchasesScreen] Primer tenant:',
          mappedPurchases[0]?.tenant,
        );
        setPurchases(mappedPurchases);
      } catch (err: any) {
        console.error('[MyPurchasesScreen] Error al obtener compras:', err);
        setError(err.message || 'Error al cargar las compras');
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [user?.id],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPurchases(false);
    setRefreshing(false);
  }, [fetchPurchases]);

  useFocusEffect(
    useCallback(() => {
      fetchPurchases();
    }, [fetchPurchases]),
  );

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handlePurchasePress = async (purchase: Purchase) => {
    if (loadingPurchaseId) {
      return; // Evitar múltiples llamadas
    }

    try {
      setLoadingPurchaseId(purchase.id);
      console.log(
        '[MyPurchasesScreen] Obteniendo detalles de compra:',
        purchase.id,
      );
      const purchaseId = parseInt(purchase.id, 10);
      const purchaseDetails: PurchaseResponse = await getPurchaseById(
        purchaseId,
      );

      console.log(
        '[MyPurchasesScreen] Detalles de compra obtenidos:',
        purchaseDetails,
      );
      console.log(
        '[MyPurchasesScreen] Payments en la respuesta:',
        purchaseDetails.payments,
      );

      // Navigate to payment installments screen with full purchase data
      (navigation as any).navigate(Routes.NAVIGATION_PAYMENTSINSTALLS, {
        purchase: purchaseDetails,
      });
    } catch (err: any) {
      console.error(
        '[MyPurchasesScreen] Error al obtener detalles de compra:',
        err,
      );
      // Fallback: navigate with basic purchase data
      (navigation as any).navigate('PaymentInstallments', {
        purchase,
      });
    } finally {
      setLoadingPurchaseId(null);
    }
  };

  const handlePayPress = async (purchase: Purchase) => {
    if (loadingPurchaseId) {
      return; // Evitar múltiples llamadas
    }

    try {
      setLoadingPurchaseId(purchase.id);
      console.log(
        '[MyPurchasesScreen] Obteniendo detalles de compra para pagar:',
        purchase.id,
      );
      const purchaseId = parseInt(purchase.id, 10);
      const purchaseDetails: PurchaseResponse = await getPurchaseById(
        purchaseId,
      );

      console.log(
        '[MyPurchasesScreen] Detalles de compra obtenidos:',
        purchaseDetails,
      );
      console.log(
        '[MyPurchasesScreen] Payments en la respuesta:',
        purchaseDetails.payments,
      );

      // Navigate to payment installments screen with full purchase data
      (navigation as any).navigate(Routes.NAVIGATION_PAYMENTSINSTALLS, {
        purchase: purchaseDetails,
      });
    } catch (err: any) {
      console.error(
        '[MyPurchasesScreen] Error al obtener detalles de compra:',
        err,
      );
      // Fallback: navigate with basic purchase data
      (navigation as any).navigate(Routes.NAVIGATION_PAYMENTSINSTALLS, {
        purchase,
      });
    } finally {
      setLoadingPurchaseId(null);
    }
  };

  const filteredPurchases = purchases.filter(purchase => {
    if (selectedTab === 'pending') {
      // Incluir todos los estados pendientes
      return (
        purchase.status === 'pending' ||
        purchase.status === 'DRAFT' ||
        purchase.status === 'IN_REVIEW_BY_CLIENT' ||
        purchase.status === 'PENDING_INVOICE' ||
        purchase.status === 'IN_PROGRESS'
      );
    }
    return purchase.status === selectedTab;
  });

  const tabs: {key: PurchaseStatus; label: string}[] = [
    {key: 'pending', label: 'Pendientes'},
    {key: 'completed', label: 'Pagadas'},
    {key: 'cancelled', label: 'Canceladas'},
  ];

  const renderPurchaseCard = ({item}: {item: Purchase}) => {
    const isItemLoading = loadingPurchaseId === item.id;
    return (
      <PurchaseCard
        purchase={item}
        onPress={() => handlePurchasePress(item)}
        onPayPress={() => handlePayPress(item)}
        isLoading={isItemLoading}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        No tienes compras {selectedTab === 'pending' && 'pendientes'}
        {selectedTab === 'completed' && 'pagadas'}
        {selectedTab === 'cancelled' && 'canceladas'}
      </Text>
    </View>
  );

  return (
    <CurvedHeaderLayout
      title="Mis compras"
      showBackButton={true}
      onBackPress={handleBackPress}
      scroll={false}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, selectedTab === tab.key && styles.tabActive]}
            onPress={() => setSelectedTab(tab.key)}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.tabText,
                selectedTab === tab.key && styles.tabTextActive,
              ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Purchases List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={IVOO_COLORS.primary} />
          <Text style={styles.loadingText}>Cargando compras...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPurchases}
          renderItem={renderPurchaseCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          style={styles.list}
          showsVerticalScrollIndicator={false}
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
      )}
    </CurvedHeaderLayout>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: SCREEN_WIDTH * 0.04,
    backgroundColor: IVOO_COLORS.grayLight,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: SCREEN_WIDTH * 0.02,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: IVOO_COLORS.white,
  },
  tabText: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interSemiBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.semibold,
    color: IVOO_COLORS.grayMedium,
  },
  tabTextActive: {
    color: IVOO_COLORS.textPrimary,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: SCREEN_HEIGHT * 0.05,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.1,
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

export default MyPurchasesScreen;
