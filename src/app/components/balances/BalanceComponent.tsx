import {COLORS, FONTS} from 'app/styles/global.style';
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {formatCurrency} from 'utils';

const BalanceComponent = ({balance}: any) => {
  const formattedBalance = formatCurrency(balance || 0);

  return (
    <View style={styles.balanceContainer}>
      <View style={styles.balanceRow}>
        <Text style={styles.balanceAmount}>{formattedBalance}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  balanceContainer: {
    alignItems: 'center',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  balanceTitle: {
    fontSize: 20,
    color: '#7D7D7D',
    fontWeight: '400',
    fontFamily: FONTS.urbanistSemiBold,
    marginRight: 10,
  },
  balanceAmount: {
    fontFamily: FONTS.urbanistBold,
    fontSize: 42,
    color: COLORS.white,
    fontWeight: '600',
    letterSpacing: 1,
  },
});

export default BalanceComponent;
