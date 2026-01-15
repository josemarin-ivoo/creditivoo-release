import TextWrapper from '@shared-components/text-wrapper/TextWrapper';
import React from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  GestureResponderEvent,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {TouchableOpacity} from '@gorhom/bottom-sheet';
import {COLORS} from 'app/styles/global.style';

interface CustomButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  width?: string | number;
  height?: string | number;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: number;
  fontSize?: number;
  accessibilityLabel?: string;
}

const Button: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  width = '100%',
  height = 45,
  backgroundColor = COLORS.primaryBlue,
  textColor = '#ffffff',
  borderRadius,
  fontSize = 14,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const {colors} = theme;
  return (
    <TouchableOpacity
      style={[
        styles.button,
        //@ts-expect-error ts-error
        {
          backgroundColor: backgroundColor,
          opacity: disabled ? 0.2 : 1,
          width,
          height,
          borderRadius,
        },
        disabled && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityLabel={accessibilityLabel}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <TextWrapper center color={textColor} fontSize={fontSize} semiBoldSora>
          {title}
        </TextWrapper>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.primaryBlue,
  },
  disabledButton: {
    //opacity: 1,
  },
});

export default Button;
