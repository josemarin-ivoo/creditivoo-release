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
  staticMode?: boolean;
  showBubble?: boolean;
  imageOnLeft?: boolean;
}

const IvitooAdvisor: React.FC<IvitooAdvisorProps> = ({
  message = 'Hola! Soy Ivitoo,\n tu asesor virtual de Creditivoo.',
  containerStyle,
  staticMode = false,
  showBubble = false,
  imageOnLeft = false,
}) => {
  const pan = useRef(new Animated.ValueXY()).current;
  // Keep track of the current value to set offset correctly
  const val = useRef({x: 0, y: 0}).current;

  useEffect(() => {
    if (staticMode) {
      return;
    }
    const id = pan.addListener(value => {
      val.x = value.x;
      val.y = value.y;
    });
    return () => pan.removeListener(id);
  }, [pan, val, staticMode]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !staticMode,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (staticMode) {
          return false;
        }
        // Only activate if moved a bit to prevent accidental drags on tap
        return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
      },
      onPanResponderGrant: () => {
        if (staticMode) {
          return;
        }
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
        if (staticMode) {
          return;
        }
        pan.flattenOffset();
      },
    }),
  ).current;

  // Modo estático: diseño compacto
  if (staticMode) {
    const bubbleComponent = showBubble ? (
      <View
        style={[
          styles.staticSpeechBubble,
          imageOnLeft && styles.staticSpeechBubbleReversed,
        ]}>
              <Text style={styles.staticSpeechText}>{message}</Text>
            </View>
    ) : (
      <View
        style={[
          styles.staticTextContainer,
          imageOnLeft && styles.staticTextContainerReversed,
        ]}>
        <Text style={styles.staticText}>{message}</Text>
      </View>
    );

    const imageComponent = (
            <Image
              source={require('../images/profile/ivitoo-profile.png')}
              style={styles.staticCharacterImage}
              resizeMode="contain"
            />
    );

    return (
      <View style={[styles.staticContainer, containerStyle]}>
        {imageOnLeft ? (
          <>
            {imageComponent}
            {bubbleComponent}
          </>
        ) : (
          <>
            {bubbleComponent}
            {imageComponent}
          </>
        )}
      </View>
    );
  }

  // Modo flotante: diseño original con globo de diálogo
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
  // Estilos para modo flotante (original)
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
  // Estilos para modo estático (tarjeta de ayuda)
  staticContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 5,
    paddingVertical: 8,
    width: '100%',
    height: '100%',
    gap: 0,
  },
  staticTextContainer: {
    flex: 1,
    paddingRight: 8,
    justifyContent: 'center',
  },
  staticTextContainerReversed: {
    paddingRight: 0,
    paddingLeft: 8,
  },
  staticText: {
    fontSize: SCREEN_WIDTH * 0.028,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.textSecondary,
    textAlign: 'left',
    lineHeight: SCREEN_WIDTH * 0.04,
  },
  staticSpeechBubble: {
    width: SCREEN_WIDTH * 0.25,
    backgroundColor: IVOO_COLORS.white,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderBottomRightRadius: 2,
    marginRight: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  staticSpeechBubbleReversed: {
    marginRight: 0,
    marginLeft: 0,
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 2,
  },
  staticSpeechText: {
    fontSize: SCREEN_WIDTH * 0.028,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.textSecondary,
    textAlign: 'left',
    lineHeight: SCREEN_WIDTH * 0.038,
  },
  staticCharacterImage: {
    width: 70,
    height: 70,
    flexShrink: 0,
  },
});

export default IvitooAdvisor;
