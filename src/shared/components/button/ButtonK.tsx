import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Icon, Button as KittenButton, Spinner } from '@ui-kitten/components';
import { StatusK } from '@shared-components/input/InputK';


interface CustomButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  width?: string | number;
  height?: string | number;
  status?: StatusK;
  spinnerStatus?: StatusK;
  appearance?: 'filled' | 'outline' | 'ghost';
  size?: 'tiny' | 'small' | 'medium' | 'large' | 'giant';
  borderRadius?: number;
  paddingVertical?: number;
  style?: ViewStyle;
  iconNameLeft?: string;
  iconNameRight?: string;
}


const ButtonK: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  width,
  height,
  status = 'primary',
  spinnerStatus = 'control',
  appearance = 'filled',
  size = 'medium',
  borderRadius = 32,
  paddingVertical = 16,
  iconNameLeft,
  iconNameRight,
  style,
}) => {

    
  return (
    <KittenButton
      onPress={onPress}
      disabled={disabled || loading}
      status={status}
      appearance={appearance}
      size={size}
      accessoryLeft={loading ? <Spinner size="small" status={spinnerStatus}/> : iconNameLeft ? <Icon name={iconNameLeft} /> : undefined}
      accessoryRight={iconNameRight ? <Icon name={iconNameRight} /> : undefined}
      style={[styles.button, width !== undefined || height !== undefined ? { width: width as any, height: height as any } : {}, style, { borderRadius, paddingVertical }]}
    >
      {title}
    </KittenButton>
  );
};

const styles = StyleSheet.create({
  button: {
    marginVertical: 10,
  },
});

export default ButtonK;