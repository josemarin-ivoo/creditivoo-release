import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  Platform,
  Pressable,
  Animated,
} from 'react-native';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';

import PaymentsOneIcon from '../../svgs/menus/payments-one.svg';
import ExtractIcon from '../../svgs/menus/extract.svg';
import GemIcon from '../../svgs/menus/gem.svg';
import PaymentsTwoIcon from '../../svgs/menus/payments-two.svg';
import { Routes } from '../../../../../Utils/NavigationRoutes';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

interface QuickActionsProps {
  onActionPress: (action: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({onActionPress}) => {
  const actions = [
    {id: 'cuotas', label: 'Cuotas', Icon: PaymentsOneIcon},
    {id: 'movimientos', label: 'Movimientos', Icon: ExtractIcon},
    {id: 'puntos', label: 'Puntos', Icon: GemIcon},
    {id: 'compras', label: 'Compras', Icon: PaymentsTwoIcon},
  ];

  return (
    <View style={styles.container}>
      {actions.map(action => {
        const scale = new Animated.Value(1);
        const IconComponent = action.Icon;

        const onPressIn = () => {
          Animated.spring(scale, {
            toValue: 0.92,
            useNativeDriver: true,
          }).start();
        };

        const onPressOut = () => {
          Animated.spring(scale, {
            toValue: 1,
            friction: 3,
            tension: 80,
            useNativeDriver: true,
          }).start();
        };

        return (
          <Pressable
            key={action.id}
            onPress={() => onActionPress(action.id)}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            style={styles.item}>
            <Animated.View style={[styles.iconWrapper, {transform: [{scale}]}]}>
              <IconComponent
                width={SCREEN_WIDTH * 0.085}
                height={SCREEN_WIDTH * 0.085}
              />
            </Animated.View>

            <Text numberOfLines={1} style={styles.label}>
              {action.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: SCREEN_WIDTH * 0.88,
    alignSelf: 'center',
    paddingTop: SCREEN_HEIGHT * 0.01,
    paddingBottom: SCREEN_HEIGHT * 0.03,
  },

  item: {
    width: SCREEN_WIDTH * 0.18,
    alignItems: 'center',
  },

  iconWrapper: {
    width: SCREEN_WIDTH * 0.15,
    height: SCREEN_WIDTH * 0.15,
    borderRadius: SCREEN_WIDTH * 0.02,
    backgroundColor: IVOO_COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.01,

    ...Platform.select({
      ios: {
        shadowColor: '#00000025',
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.18,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  label: {
    fontSize: SCREEN_WIDTH * 0.033,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.medium,
    color: '#4A4A4A',
    textAlign: 'center',
  },
});

export default QuickActions;
