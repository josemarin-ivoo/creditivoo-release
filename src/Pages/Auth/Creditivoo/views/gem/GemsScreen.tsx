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
  Keyboard,
  TouchableWithoutFeedback,
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

const formatDate = (dateString: string): string => {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

const mapIconToIconType = (icon: string): 'clock' | 'card' => {
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
      const data = await getPointsInfo();
      setPointsData(data);
    } catch (err: any) {
      console.error('[GemsScreen] Error:', err);
      setError(err.message || 'Error al cargar gemas');
    } finally {
      if (showRefreshing) setRefreshing(false);
      else setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPointsData();
    }, [fetchPointsData]),
  );

  const onRefresh = useCallback(() => {
    fetchPointsData(true);
  }, [fetchPointsData]);

  const transactions = useMemo((): GemTransaction[] => {
    if (!pointsData?.recentTransactions) return [];
    return pointsData.recentTransactions.map((tx: PointsTransaction) => ({
      id: tx.id.toString(),
      amount: tx.amount,
      date: formatDate(tx.date),
      reason: tx.reason,
      iconType: mapIconToIconType(tx.icon),
    }));
  }, [pointsData]);

  const handleBackPress = () => navigation.goBack();
  const handleHowToEarnPress = () => (navigation as any).navigate('HowToEarnGems');
  const renderTransaction = ({item}: {item: GemTransaction}) => (
    <GemTransactionCard transaction={item} />
  );

  if (isLoading && !refreshing) {
    return (
      <CurvedHeaderLayout title="Gemas" showBackButton onBackPress={handleBackPress}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={IVOO_COLORS.primary} />
        </View>
      </CurvedHeaderLayout>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{flex: 1}}>
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
            />
          }>
          
          <View style={styles.parentCard}>
            
            {/* Card Interno Superior que contiene el gradiente */}
            <View style={styles.statsBalanceCard}>
              <LinearGradient
                colors={['#A9FD45', '#D1B4F4', '#F4AFF4']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.fullGradientContainer}>
                
                {/* Header: Título GEMAS */}
                <View style={styles.headerTitleContainer}>
                  <Text style={styles.titleText}>GEMAS</Text>
                </View>

                {/* BODY TIPO VIDRIO (Glassmorphism) */}
                <View style={styles.glassContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Total ganadas:</Text>
                    <View style={styles.statValueContainer}>
                      <Text style={styles.statValue}>{pointsData?.totalPoints || 0}</Text>
                      <GemIcon width={24} height={24} />
                    </View>
                  </View>

                  <View style={styles.glassDivider} />

                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Pendientes:</Text>
                    <View style={styles.statValueContainer}>
                      <Text style={styles.statValue}>{pointsData?.currentPoints || 0}</Text>
                      <GemIcon width={24} height={24} />
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Sección de Historial */}
            <View style={styles.transactionsSection}>
              <Text style={styles.sectionTitle}>Transacciones recientes:</Text>
              <FlatList
                data={transactions}
                renderItem={renderTransaction}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyStateText}>No hay transacciones aún</Text>
                  </View>
                }
              />
            </View>
          </View>

          {/* TEXTO INFORMATIVO */}
          <View style={styles.footerContainer}>
            <Text style={styles.infoText}>
              Tus gemas crecen según tu comportamiento en Creditivoo. Se acreditan
              automáticamente cuando completas acciones que aportan a tu progreso.
            </Text>

            <TouchableOpacity
              style={styles.howToEarnButton}
              onPress={handleHowToEarnPress}
              activeOpacity={0.7}>
              <Text style={styles.howToEarnText}>¿Cómo puedo ganar gemas?</Text>
            </TouchableOpacity>
          </View>
        </CurvedHeaderLayout>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  parentCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 16,
    marginHorizontal: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  statsBalanceCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 25,
  },
  fullGradientContainer: {
    width: '100%',
    paddingBottom: 5,
    paddingTop: 5,
  },
  headerTitleContainer: {
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },

  mainCard: {
    backgroundColor: IVOO_COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#EFEFEF', // Borde muy suave en lugar de sombra
  },
  titleGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 22,
    fontWeight: '900',
    color: 'black',
    letterSpacing: 2,
  },

  glassContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 0,
    // marginTop: '-5',
    paddingVertical: 18,
    paddingHorizontal: 10,
    width:'100%',
    borderRadius: 10,
    // Fondo blanco con transparencia para efecto cristal
    backgroundColor: 'rgba(255, 255, 255, 0.45)', 
    // Borde muy fino y claro para simular el canto del vidrio
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    // Sombra muy suave para despegarlo del fondo
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  statItem: {
    flex: 1,
    paddingLeft: 10,
  },
  glassDivider: {
    width: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    height: '70%',
  },
  divider: {
    width: 1.5,
    backgroundColor: 'rgba(0,0,0,0.15)', // Divisor semi-transparente para que combine con el fondo
    height: '80%',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.5)',
    marginBottom: 2,
    // textTransform: 'uppercase',
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 30,
    fontWeight: '800',
    color: 'black',
    marginRight: 5,
  },
  transactionsSection: {
    marginTop: 5,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
  },
  footerContainer: {
    paddingHorizontal: 30,
    marginTop: 25,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: '#444',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 25,
  },
  howToEarnButton: {
    paddingVertical: 10,
  },
  howToEarnText: {
    fontSize: 18,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    color: '#00D37F', // Color verde de la imagen
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    color: '#999',
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
  },
});

export default GemsScreen;