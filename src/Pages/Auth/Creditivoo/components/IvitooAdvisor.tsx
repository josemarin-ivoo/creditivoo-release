import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  StyleProp,
  ViewStyle,
  Animated,
  PanResponder,
} from 'react-native';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../styles';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface IvitooAdvisorProps {
  message?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

const IvitooAdvisor: React.FC<IvitooAdvisorProps> = ({
  message = 'Hola! Soy Ivitoo,\ntu asesor virtual de Creditivoo.',
  containerStyle,
}) => {
  const pan = useRef(new Animated.ValueXY()).current;
  // Keep track of the current value to set offset correctly
  const val = useRef({x: 0, y: 0}).current;

  useEffect(() => {
    const id = pan.addListener(value => {
      val.x = value.x;
      val.y = value.y;
    });
    return () => pan.removeListener(id);
  }, [pan, val]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only activate if moved a bit to prevent accidental drags on tap
        return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: val.x,
          y: val.y,
        });
        pan.setValue({x: 0, y: 0});
      },
      onPanResponderMove: Animated.event([null, {dx: pan.x, dy: pan.y}], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    }),
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.characterContainer,
        containerStyle,
        {
          transform: pan.getTranslateTransform(),
        },
      ]}>
      <View style={styles.speechBubble}>
        <Text style={styles.speechText}>{message}</Text>
      </View>
      <Image
        source={require('../images/profile/ivitoo-profile.png')}
        style={styles.characterImage}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  characterContainer: {
    position: 'absolute',
    bottom: 20,
    right: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingRight: 10,
    zIndex: 1000,
    elevation: 10, // Ensure it sits on top on Android
  },
  speechBubble: {
    backgroundColor: IVOO_COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderBottomRightRadius: 2, // Pico del globo
    marginRight: 10,
    marginBottom: 40, // Ajustar para alinear con la cabeza/boca
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: SCREEN_WIDTH * 0.5,
  },
  speechText: {
    fontSize: SCREEN_WIDTH * 0.032,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.textSecondary,
    textAlign: 'center',
  },
  characterImage: {
    width: 80,
    height: 80,
  },
});

export default IvitooAdvisor;
