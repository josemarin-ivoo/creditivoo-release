import React from 'react';
import {View, StyleSheet, Text, Dimensions, Image} from 'react-native';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

export interface GemMethod {
  id: string;
  title: string;
  description: string;
  iconType: 'clock' | 'card-up' | 'card-plus' | 'card-check';
}

interface GemMethodCardProps {
  method: GemMethod;
}

const GemMethodCard: React.FC<GemMethodCardProps> = ({method}) => {
  const getIconSource = () => {
    switch (method.iconType) {
      case 'clock':
        return require('../../images/gems/clock.png');
      case 'card-up':
        return require('../../images/gems/card-up.png');
      case 'card-plus':
        return require('../../images/gems/card-plus.png');
      case 'card-check':
        return require('../../images/gems/card-check.png');
      default:
        return require('../../images/gems/clock.png');
    }
  };

  return (
    <View style={styles.card}>
      <Image source={getIconSource()} style={styles.icon} resizeMode="contain" />
      <Text style={styles.title}>{method.title}</Text>
      <Text style={styles.description}>{method.description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F9FAFC',
    borderRadius: 12,
    padding: SCREEN_WIDTH * 0.05,
    marginBottom: SCREEN_WIDTH * 0.04,
    borderWidth: 1,
    borderColor: '#6E717C4F',
    alignItems: 'center',
    elevation: 0,
  },
  icon: {
    width: SCREEN_WIDTH * 0.12,
    height: SCREEN_WIDTH * 0.12,
    marginBottom: SCREEN_WIDTH * 0.04,
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.textPrimary,
    marginBottom: SCREEN_WIDTH * 0.02,
    textAlign: 'center',
  },
  description: {
    fontSize: SCREEN_WIDTH * 0.037,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: SCREEN_WIDTH * 0.052,
  },
});

export default GemMethodCard;


