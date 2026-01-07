import React, {useState, useCallback, useMemo} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import CurvedHeaderLayout from '../../components/layouts/CurvedHeaderLayout';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import {GemTransactionCard, GemTransaction} from '../../components/gems';
import GemIcon from '../../svgs/menus/gem.svg';
import {
  getPointsInfo,
  PointsTransaction,
  PointsData,
} from '../../services/points';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// Helper function to format date from YYYY-MM-DD to DD/MM/YYYY
const formatDate = (dateString: string): string => {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

// Helper function to map API icon to component iconType
const mapIconToIconType = (icon: string): 'clock' | 'card' => {
  // hourglass, bills -> clock
  // gem, star -> card
  if (icon === 'hourglass' || icon === 'bills') {
    return 'clock';
  }
  return 'card';
};

const GemsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [pointsData, setPointsData] = useState<PointsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPointsData = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      console.log('[GemsScreen] Obteniendo información de gemas...');
      const data = await getPointsInfo();
      console.log('[GemsScreen] Información de gemas obtenida:', data);
      setPointsData(data);
    } catch (err: any) {
      console.error('[GemsScreen] Error al obtener información de gemas:', err);
      setError(err.message || 'Error al cargar la información de gemas');
    } finally {
      if (showRefreshing) {
        setRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  // Recargar cuando la pantalla recibe foco (incluye el montaje inicial)
  useFocusEffect(
    useCallback(() => {
      fetchPointsData();
    }, [fetchPointsData]),
  );

  const onRefresh = useCallback(() => {
    fetchPointsData(true);
  }, [fetchPointsData]);

  // Map API transactions to component format
  const transactions = useMemo((): GemTransaction[] => {
    if (!pointsData?.recentTransactions) {
      return [];
    }

    return pointsData.recentTransactions.map((tx: PointsTransaction) => ({
      id: tx.id.toString(),
      amount: tx.amount,
      date: formatDate(tx.date),
      reason: tx.reason,
      iconType: mapIconToIconType(tx.icon),
    }));
  }, [pointsData]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleHowToEarnPress = () => {
    (navigation as any).navigate('HowToEarnGems');
  };

  const renderTransaction = ({item}: {item: GemTransaction}) => (
    <GemTransactionCard transaction={item} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        No tienes transacciones de gemas aún
      </Text>
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <CurvedHeaderLayout
        title="Gemas"
        showBackButton={true}
        onBackPress={handleBackPress}
        scroll={true}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={IVOO_COLORS.primary} />
          <Text style={styles.loadingText}>
            Cargando información de gemas...
          </Text>
        </View>
      </CurvedHeaderLayout>
    );
  }

  if (error) {
    return (
      <CurvedHeaderLayout
        title="Gemas"
        showBackButton={true}
        onBackPress={handleBackPress}
        scroll={true}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchPointsData()}
            activeOpacity={0.7}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </CurvedHeaderLayout>
    );
  }

  return (
    <CurvedHeaderLayout
      title="Gemas"
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
      {/* Main Gems Card */}
      <View style={styles.mainCard}>
        {/* GEMAS Title with Gradient */}
        <LinearGradient
          colors={['#52e665', '#b1c0d8', '#fea9fe']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.titleGradient}>
          <Text style={styles.titleText}>GEMAS</Text>
        </LinearGradient>

        {/* Stats Section */}
        <LinearGradient
          colors={['#F0FDF4', '#F0F9FF', '#FDF2F8']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total ganadas:</Text>
            <View style={styles.statValueContainer}>
              <Text style={styles.statValue}>
                {pointsData?.totalPoints || 0}
              </Text>
              <GemIcon
                width={SCREEN_WIDTH * 0.07}
                height={SCREEN_WIDTH * 0.07}
              />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Pendientes:</Text>
            <View style={styles.statValueContainer}>
              <Text style={styles.statValue}>
                {pointsData?.currentPoints || 0}
              </Text>
              <GemIcon
                width={SCREEN_WIDTH * 0.07}
                height={SCREEN_WIDTH * 0.07}
              />
            </View>
          </View>
        </LinearGradient>

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Transacciones recientes:</Text>
          {transactions.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={transactions}
              renderItem={renderTransaction}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>

      {/* Info Text */}
      <Text style={styles.infoText}>
        Tus gemas crecen según tu comportamiento en Creditivoo. Se acreditan
        automáticamente cuando completas acciones que aportan a tu progreso.
      </Text>

      {/* How to Earn Link */}
      <TouchableOpacity
        style={styles.howToEarnButton}
        onPress={handleHowToEarnPress}
        activeOpacity={0.7}>
        <Text style={styles.howToEarnText}>¿Cómo puedo ganar gemas?</Text>
      </TouchableOpacity>
    </CurvedHeaderLayout>
  );
};

const styles = StyleSheet.create({
  mainCard: {
    backgroundColor: IVOO_COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: SCREEN_WIDTH * 0.05,
    marginHorizontal: SCREEN_WIDTH * 0.01,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  titleGradient: {
    paddingVertical: SCREEN_WIDTH * 0.04,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: SCREEN_WIDTH * 0.065,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
    letterSpacing: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingVertical: SCREEN_WIDTH * 0.05,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: '#D1D5DB',
    marginHorizontal: SCREEN_WIDTH * 0.04,
  },
  statLabel: {
    fontSize: SCREEN_WIDTH * 0.035,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: '#6B7280',
    marginBottom: SCREEN_WIDTH * 0.015,
    textAlign: 'center',
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: SCREEN_WIDTH * 0.08,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
    marginRight: SCREEN_WIDTH * 0.015,
  },
  transactionsSection: {
    marginTop: SCREEN_WIDTH * 0.04,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    paddingBottom: SCREEN_WIDTH * 0.04,
  },
  sectionTitle: {
    fontSize: SCREEN_WIDTH * 0.042,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.textPrimary,
    marginBottom: SCREEN_WIDTH * 0.03,
  },
  infoText: {
    fontSize: SCREEN_WIDTH * 0.037,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.textPrimary,
    lineHeight: SCREEN_WIDTH * 0.055,
    marginBottom: SCREEN_WIDTH * 0.04,
    textAlign: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.02,
  },
  howToEarnButton: {
    alignSelf: 'center',
    paddingVertical: SCREEN_WIDTH * 0.02,
  },
  howToEarnText: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SCREEN_WIDTH * 0.2,
  },
  loadingText: {
    marginTop: SCREEN_WIDTH * 0.04,
    fontSize: SCREEN_WIDTH * 0.04,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.textSecondary || '#6E717C',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SCREEN_WIDTH * 0.2,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
  },
  errorText: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: '#E74C3C',
    textAlign: 'center',
    marginBottom: SCREEN_WIDTH * 0.04,
  },
  retryButton: {
    backgroundColor: IVOO_COLORS.primary,
    paddingHorizontal: SCREEN_WIDTH * 0.06,
    paddingVertical: SCREEN_WIDTH * 0.03,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.white,
  },
  emptyState: {
    paddingVertical: SCREEN_WIDTH * 0.08,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: SCREEN_WIDTH * 0.037,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.grayMedium,
    textAlign: 'center',
  },
});

export default GemsScreen;
