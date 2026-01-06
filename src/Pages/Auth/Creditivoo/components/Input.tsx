import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../styles';

interface InputProps extends TextInputProps {
  containerStyle?: ViewStyle;
  error?: boolean;
  borderRadius?: number | 'full';
}

const Input: React.FC<InputProps> = ({
  containerStyle,
  error,
  style,
  borderRadius = 10,
  ...props
}) => {
  // Obtener la altura del contenedor para calcular el borderRadius 'full'
  const containerHeight =
    (containerStyle as any)?.height || styles.container.height || 53;

  const getBorderRadius = () => {
    if (borderRadius === 'full') {
      // Usar la mitad de la altura para hacer completamente redondeado
      return containerHeight / 2;
    }
    return borderRadius;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          {borderRadius: getBorderRadius()},
          style,
        ]}
        placeholderTextColor="#B4B4B4"
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 302,
    height: 53,
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFC',
    borderWidth: 1,
    borderColor: 'rgba(110, 113, 124, 0.31)',
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.regular,
    color: IVOO_COLORS.textPrimary,
  },
  inputError: {
    borderColor: IVOO_COLORS.error,
  },
});

export default Input;
