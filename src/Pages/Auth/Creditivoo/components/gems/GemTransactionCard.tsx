import React from 'react';
import {View, StyleSheet, Text, Dimensions, Image} from 'react-native';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import GemIcon from '../../svgs/menus/gem.svg';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

export interface GemTransaction {
  id: string;
  amount: number;
  date: string;
  reason: string;
  iconType: 'clock' | 'card';
}

interface GemTransactionCardProps {
  transaction: GemTransaction;
}

const GemTransactionCard: React.FC<GemTransactionCardProps> = ({
  transaction,
}) => {
  const getIconSource = () => {
    if (transaction.iconType === 'clock') {
      return require('../../images/gems/clock.png');
    } else {
      return require('../../images/gems/card-up.png');
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.leftSection}>
        <View style={styles.amountContainer}>
          <Text style={styles.amountText} numberOfLines={1}>
            +{transaction.amount}
          </Text>
          <GemIcon
            width={SCREEN_WIDTH * 0.05}
            height={SCREEN_WIDTH * 0.05}
          />
        </View>
        <Text style={styles.dateText}>{transaction.date}</Text>
      </View>

      <View style={styles.rightSection}>
        <Image
          source={getIconSource()}
          style={styles.icon}
          resizeMode="contain"
        />
        <Text style={styles.reasonText}>{transaction.reason}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: IVOO_COLORS.white,
    borderRadius: 12,
    padding: SCREEN_WIDTH * 0.04,
    marginBottom: SCREEN_WIDTH * 0.03,
    marginHorizontal: SCREEN_WIDTH * 0.01,
    elevation: 2,
  },
  leftSection: {
    flex: 1,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SCREEN_WIDTH * 0.015,
  },
  amountText: {
    fontSize: SCREEN_WIDTH * 0.055,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: 'bold',
    color: IVOO_COLORS.primary,
    marginRight: SCREEN_WIDTH * 0.02,
  },
  dateText: {
    fontSize: SCREEN_WIDTH * 0.033,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: '#676464',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  icon: {
    width: SCREEN_WIDTH * 0.06,
    height: SCREEN_WIDTH * 0.06,
    marginRight: SCREEN_WIDTH * 0.025,
  },
  reasonText: {
    fontSize: SCREEN_WIDTH * 0.035,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.textPrimary,
    flex: 1,
  },
});

export default GemTransactionCard;


