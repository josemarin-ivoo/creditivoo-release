import { COLORS, FONTS } from 'app/styles/global.style';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AccountInfoComponent: React.FC = () => {
  return (
    <View style={styles.infoContainer}>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Pago:</Text>
        <Text style={styles.infoValue}>10/20/2024</Text>
      </View>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Pagado:</Text>
        <Text style={styles.infoValue}>35 USD</Text>
      </View>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Pendientes:</Text>
        <Text style={styles.infoValue}>2</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoItem: {
    flex: 1,

  },
  infoLabel: {
    fontFamily: FONTS.poppinsSemiBold,
    lineHeight: 20,
    fontSize: 15,
    color: COLORS.primaryBlue,
    fontWeight: '500',
    textAlign: 'center',

  },
  infoValue: {
    fontFamily: FONTS.poppinsRegular,
    fontSize: 16,
    color: '#000000',
    fontWeight: '400',
    textAlign: 'center',
  },
});

export default AccountInfoComponent;
