import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import CurvedHeaderLayout from '../../components/layouts/CurvedHeaderLayout';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import {GemTransactionCard, GemTransaction} from '../../components/gems';
import GemIcon from '../../svgs/menus/gem.svg';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// Mock data - Replace with actual API call
const mockTransactions: GemTransaction[] = [
  {
    id: '1',
    amount: 15,
    date: '9/12/2025',
    reason: 'Por pagar tus cuotas a tiempo',
    iconType: 'clock',
  },
  {
    id: '2',
    amount: 15,
    date: '19/11/2025',
    reason: 'Por pagar tus cuotas a tiempo',
    iconType: 'clock',
  },
  {
    id: '3',
    amount: 48,
    date: '8/11/2025',
    reason: 'Por pagar tus cuotas a tiempo',
    iconType: 'card',
  },
  {
    id: '4',
    amount: 80,
    date: '28/10/2025',
    reason: 'Por pagar tus cuotas a tiempo',
    iconType: 'card',
  },
];

const GemsScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleHowToEarnPress = () => {
    (navigation as any).navigate('HowToEarnGems');
  };

  const renderTransaction = ({item}: {item: GemTransaction}) => (
    <GemTransactionCard transaction={item} />
  );

  return (
    <CurvedHeaderLayout
      title="Gemas"
      showBackButton={true}
      onBackPress={handleBackPress}
      scroll={true}>
      {/* Main Gems Card */}
      <View style={styles.mainCard}>
        {/* GEMAS Title with Gradient */}
        <LinearGradient
          colors={['#E8F5E9', '#FCE4EC']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.titleGradient}>
          <Text style={styles.titleText}>GEMAS</Text>
        </LinearGradient>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total ganadas:</Text>
            <View style={styles.statValueContainer}>
              <Text style={styles.statValue}>240</Text>
              <GemIcon
                width={SCREEN_WIDTH * 0.055}
                height={SCREEN_WIDTH * 0.055}
              />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Pendientes hoy:</Text>
            <View style={styles.statValueContainer}>
              <Text style={styles.statValue}>94</Text>
              <GemIcon
                width={SCREEN_WIDTH * 0.055}
                height={SCREEN_WIDTH * 0.055}
              />
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Transacciones recientes:</Text>
          <FlatList
            data={mockTransactions}
            renderItem={renderTransaction}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
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
    padding: SCREEN_WIDTH * 0.04,
    marginBottom: SCREEN_WIDTH * 0.05,
    marginHorizontal: SCREEN_WIDTH * 0.01,
    elevation: 3,
  },
  titleGradient: {
    borderRadius: 8,
    paddingVertical: SCREEN_WIDTH * 0.03,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    marginBottom: SCREEN_WIDTH * 0.04,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: SCREEN_WIDTH * 0.055,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.textPrimary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingVertical: SCREEN_WIDTH * 0.04,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: IVOO_COLORS.grayLight,
  },
  statItem: {
    flex: 1,
  },
  divider: {
    width: 1,
    backgroundColor: IVOO_COLORS.grayLight,
    marginHorizontal: SCREEN_WIDTH * 0.04,
  },
  statLabel: {
    fontSize: SCREEN_WIDTH * 0.035,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.grayMedium,
    marginBottom: SCREEN_WIDTH * 0.02,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    fontSize: SCREEN_WIDTH * 0.065,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.textPrimary,
    marginRight: SCREEN_WIDTH * 0.02,
  },
  transactionsSection: {
    marginTop: SCREEN_WIDTH * 0.04,
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
});

export default GemsScreen;
