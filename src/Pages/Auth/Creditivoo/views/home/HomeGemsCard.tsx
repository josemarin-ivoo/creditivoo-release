import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// Overlap visual SOLO Android (iOS NO usa negativos)
const INTERNAL_OVERLAP = Platform.OS === 'android' ? -35 : -20;

interface HomeGemsCardProps {
  gemsAmount?: number | string;
  subtitle?: string;
  onPress?: () => void;
  onAddPress?: () => void;
}

const HomeGemsCard: React.FC<HomeGemsCardProps> = ({
  gemsAmount = '0',
  subtitle,
  onPress,
  onAddPress,
}) => {
  return (
    <View style={styles.outerWrapper}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={styles.touchWrapper}>
        <LinearGradient
          colors={['#0ADD73', '#0ADD73']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.gradient}>
          {/* LEFT */}
          <View style={styles.leftContent}>
            <Text style={styles.title}>COMPRA HOY DESDE</Text>
            <Text style={styles.subtitle}>0% DE INICIAL</Text>
          </View>

          {/* RIGHT */}
          <View style={styles.gemsBadge}>
            <Text style={styles.gemsLabel}>GEMAS</Text>

            <View style={styles.amountRow}>
              <Text style={styles.gemsAmount}>{gemsAmount}</Text>

              <TouchableOpacity
                style={styles.addButton}
                onPress={onAddPress}
                activeOpacity={0.7}>
                <Icon
                  name="add-circle"
                  type={IconType.Ionicons}
                  size={22}
                  color="#00D66B"
                />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  /* 🔐 Wrapper que absorbe el overlap */
  outerWrapper: {
    marginTop: INTERNAL_OVERLAP,
    paddingTop: Platform.OS === 'android' ? 35 : 10,
  },

  touchWrapper: {
    borderRadius: 15,
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 7,
        overflow: 'hidden',
      },
    }),
  },

  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    borderRadius: 10,
  },

  leftContent: {
    flex: 1,
  },

  title: {
    color: '#000',
    fontSize:18,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: '900',
    textAlignVertical: 'center',
      ...Platform.select({
          android: { includeFontPadding: false,lineHeight: SCREEN_WIDTH * 0.05 * 2, },
          ios: {lineHeight: 22,}
      }),
  },

  subtitle: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: '900',
    includeFontPadding: false,
    textAlignVertical: 'center',
    ...Platform.select({
        android: { includeFontPadding: false,lineHeight: SCREEN_WIDTH * 0.05 * 2, },
        ios: {lineHeight: 22,}
    }),
  },

  gemsBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 23,
    marginTop: 10,
    marginBottom: 10,
  },

  gemsLabel: {
    fontSize: 12,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    color: '#000',
    marginBottom: 2,
  },

  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  gemsAmount: {
    fontSize: 18,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    color: '#000',
    marginRight: 4,
  },

  addButton: {
    padding: 2,
  },
});

export default HomeGemsCard;
