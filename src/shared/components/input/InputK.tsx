import React, {useState, useCallback, useEffect, useMemo} from 'react';
import {ViewStyle, TextStyle, TouchableWithoutFeedback} from 'react-native';
import {
  Input as KittenInput,
  Icon as KittenIcon,
  InputProps as KittenInputProps,
  useTheme,
} from '@ui-kitten/components';

export interface InputKProps extends Omit<KittenInputProps, 'status'> {
  labelText?: string;
  status?: StatusK;
  leftIconName?: string; // Eva icon name
  size?: 'small' | 'medium' | 'large';
  leftIconColor?: string;
  rightIconName?: string;
  rightIconColor?: string;
  containerStyle?: ViewStyle;
  inputBorderRadius?: number;
  textStyle?: TextStyle;
  /** Muestra un icono para alternar visibilidad de contraseña */
  isPassword?: boolean;
}

export type StatusK =
  | 'primary'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
  | 'basic'
  | 'control';

const InputK: React.FC<InputKProps> = ({
  labelText,
  status = 'primary',
  size = 'medium',
  leftIconName,
  leftIconColor,
  rightIconName,
  rightIconColor,
  containerStyle,
  inputBorderRadius = 16,
  textStyle,
  isPassword = false,
  secureTextEntry,
  ...rest
}) => {
  /**
   * Estado interno para manejar la visibilidad de la contraseña.
   * Si es un campo de contraseña (isPassword === true) comenzamos ocultando el texto.
   * Para campos normales delegamos el control al prop secureTextEntry (por compatibilidad).
   */
  const [secure, setSecure] = useState<boolean>(
    isPassword ? true : !!secureTextEntry,
  );

  // Mantener sincronizado el estado interno si secureTextEntry cambia externamente y no es un campo de contraseña
  useEffect(() => {
    if (!isPassword) {
      setSecure(!!secureTextEntry);
    }
  }, [secureTextEntry, isPassword]);

  const theme = useTheme();

  /**
   * Determinar color final del icono basándonos en el status y en los colores recibidos como prop
   */
  const resolvedLeftColor = useMemo(() => {
    if (leftIconColor) {
      return leftIconColor;
    }
    if (status === 'danger') {
      return theme['color-danger-500'];
    }
    if (status === 'success') {
      return theme['color-success-500'];
    }
    if (status === 'warning') {
      return theme['color-warning-500'];
    }
    if (status === 'info') {
      return theme['color-info-500'];
    }
    if (status === 'primary') {
      return theme['color-primary-500'];
    }
    return undefined;
  }, [leftIconColor, status, theme]);

  const resolvedRightColor = useMemo(() => {
    if (rightIconColor) {
      return rightIconColor;
    }
    if (status === 'danger') {
      return theme['color-danger-500'];
    }
    if (status === 'success') {
      return theme['color-success-500'];
    }
    if (status === 'warning') {
      return theme['color-warning-500'];
    }
    if (status === 'info') {
      return theme['color-info-500'];
    }
    if (status === 'primary') {
      return theme['color-primary-500'];
    }
    return undefined;
  }, [rightIconColor, status, theme]);

  const renderLeft = useCallback(
    (props: any) => (
      <KittenIcon {...props} name={leftIconName!} fill={resolvedLeftColor} />
    ),
    [leftIconName, resolvedLeftColor],
  );

  const renderRight = useCallback(
    (props: any) => {
      if (isPassword) {
        return (
          <TouchableWithoutFeedback onPress={() => setSecure(s => !s)}>
            <KittenIcon
              {...props}
              name={secure ? 'eye-off' : 'eye'}
              fill={resolvedRightColor}
            />
          </TouchableWithoutFeedback>
        );
      }
      if (rightIconName) {
        return (
          <KittenIcon
            {...props}
            name={rightIconName}
            fill={resolvedRightColor}
          />
        );
      }
      return <></>;
    },
    [isPassword, rightIconName, secure, resolvedRightColor],
  );

  // Asegurar que el texto tenga un tamaño consistente cuando se muestra la contraseña
  // UI Kitten puede reducir el tamaño del texto cuando secureTextEntry cambia
  // Según la documentación: https://akveo.github.io/react-native-ui-kitten/docs/components/input/overview#input
  // El problema es que React Native reduce el tamaño del texto cuando secureTextEntry es false
  const inputTextStyle = useMemo(() => {
    // Para campos de contraseña, siempre forzar un tamaño de fuente consistente
    // independientemente del estado de secureTextEntry (oculto o visible)
    if (isPassword) {
      const passwordStyle: TextStyle = {
        fontSize: 16,
        lineHeight: 22,
        includeFontPadding: false,
        // Forzar el tamaño mínimo para evitar que se reduzca
        minHeight: 22,
      };
      return textStyle ? [passwordStyle, textStyle] : passwordStyle;
    }

    // Para campos normales, usar el textStyle proporcionado o valores por defecto
    const baseStyle: TextStyle = {
      fontSize: 16,
      lineHeight: 22,
    };
    return textStyle ? [baseStyle, textStyle] : baseStyle;
  }, [textStyle, isPassword]);

  return (
    <KittenInput
      textStyle={inputTextStyle}
      placeholder={labelText}
      secureTextEntry={secure}
      status={status}
      size={size}
      accessoryLeft={leftIconName ? renderLeft : undefined}
      accessoryRight={isPassword || rightIconName ? renderRight : undefined}
      style={[containerStyle, {borderRadius: inputBorderRadius}]}
      {...rest}
    />
  );
};

export default InputK;
