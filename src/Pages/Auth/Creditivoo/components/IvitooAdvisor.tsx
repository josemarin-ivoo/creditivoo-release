import React, {useRef, useEffect, useState} from 'react';
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
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../styles';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface IvitooAdvisorProps {
  message?: string;
  containerStyle?: StyleProp<ViewStyle>;
  staticMode?: boolean;
  showBubble?: boolean;
  imageOnLeft?: boolean;
  onPress?: () => void; // Propiedad añadida para manejar la navegación externa
}

const IvitooAdvisor: React.FC<IvitooAdvisorProps> = ({
  message = 'Hola! Soy Ivitoo,\n tu asesor virtual de Creditivoo.',
  containerStyle,
  staticMode = false,
  showBubble = false,
  imageOnLeft = false,
  onPress,
}) => {
  const [isBubbleVisible, setIsBubbleVisible] = useState(showBubble || !staticMode);
  const pan = useRef(new Animated.ValueXY()).current;
  const val = useRef({x: 0, y: 0}).current;

  useEffect(() => {
    if (staticMode) return;
    const id = pan.addListener(value => {
      val.x = value.x;
      val.y = value.y;
    });
    return () => pan.removeListener(id);
  }, [pan, val, staticMode]);

  // Manejador centralizado: Si hay un onPress externo (navegación), lo ejecuta.
  // Si no, mantiene el comportamiento original de alternar el globo.
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      setIsBubbleVisible(prev => !prev);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !staticMode,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (staticMode) return false;
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        if (staticMode) return;
        pan.setOffset({x: val.x, y: val.y});
        pan.setValue({x: 0, y: 0});
      },
      onPanResponderMove: Animated.event([null, {dx: pan.x, dy: pan.y}], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        if (staticMode) return;
        pan.flattenOffset();
        
        // Si es un toque (no arrastre), ejecutamos handlePress
        if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
          handlePress();
        }
      },
    }),
  ).current;

  const imageComponent = (
    <Image
      source={require('../images/profile/ivitoo-profile.png')}
      style={staticMode ? styles.staticCharacterImage : styles.characterImage}
      resizeMode="contain"
    />
  );

  const bubbleComponent = isBubbleVisible ? (
    <View
      style={[
        staticMode ? styles.staticSpeechBubble : styles.speechBubble,
        staticMode && imageOnLeft && styles.staticSpeechBubbleReversed,
      ]}>
      <Text style={staticMode ? styles.staticSpeechText : styles.speechText}>
        {message}
      </Text>
    </View>
  ) : null;

  // --- MODO ESTÁTICO ---
  if (staticMode) {
    return (
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={handlePress} 
        style={[styles.staticContainer, containerStyle]}>
        {imageOnLeft ? (
          <>{imageComponent}{bubbleComponent}</>
        ) : (
          <>{bubbleComponent}{imageComponent}</>
        )}
      </TouchableOpacity>
    );
  }

  // --- MODO FLOTANTE ---
  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.characterContainer,
        containerStyle,
        {transform: pan.getTranslateTransform()},
      ]}>
      {bubbleComponent}
      <TouchableWithoutFeedback onPress={handlePress}>
        <View>
          {imageComponent}
        </View>
      </TouchableWithoutFeedback>
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
    elevation: 10,
  },
  speechBubble: {
    backgroundColor: IVOO_COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderBottomRightRadius: 2,
    marginRight: 10,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
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
  staticContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 5,
    paddingVertical: 8,
    width: '100%',
  },
  staticSpeechBubble: {
    flex: 1,
    backgroundColor: IVOO_COLORS.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderBottomRightRadius: 2,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  staticSpeechBubbleReversed: {
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 2,
  },
  staticSpeechText: {
    fontSize: SCREEN_WIDTH * 0.028,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.textSecondary,
    textAlign: 'left',
    lineHeight: SCREEN_WIDTH * 0.04,
  },
  staticCharacterImage: {
    width: 70,
    height: 70,
    flexShrink: 0,
  },
});

export default IvitooAdvisor;