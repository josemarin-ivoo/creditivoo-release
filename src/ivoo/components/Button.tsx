import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  DimensionValue,
} from 'react-native';
import {
  IVOO_COLORS,
  IVOO_SPACING,
  IVOO_TEXT_STYLES,
} from '../styles';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  width?: DimensionValue;
  height?: number;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  style,
  textStyle,
  width = IVOO_SPACING.buttonWidth,
  height = 45,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {
          width,
          height,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
      activeOpacity={0.8}>
      <Text style={[styles.buttonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: IVOO_COLORS.primary,
    borderRadius: IVOO_SPACING.buttonBorderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  buttonText: {
    fontSize: IVOO_TEXT_STYLES.buttonText.fontSize,
    fontFamily: IVOO_TEXT_STYLES.buttonText.fontFamily,
    fontWeight: IVOO_TEXT_STYLES.buttonText.fontWeight,
    letterSpacing: IVOO_TEXT_STYLES.buttonText.letterSpacing,
    lineHeight: 21.657,
    color: IVOO_COLORS.textWhite,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default Button;
