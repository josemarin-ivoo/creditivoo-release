import { BottomSheetTextInput, TouchableOpacity } from '@gorhom/bottom-sheet';
import { useTheme } from '@react-navigation/native';
import TextWrapper from '@shared-components/text-wrapper/TextWrapper';
import React, { useMemo } from 'react';
import { ColorValue, TextInput, TextInputProps, View } from 'react-native';
import Icon, { IconType } from 'react-native-dynamic-vector-icons';
import createStyles from './Input.style';
import { COLORS } from 'app/styles/global.style';
interface ReusableInputProps extends TextInputProps {
  placeholder: string;
  value: string;
  onChangeText?: (text: string) => void;
  labelText?: string;
  borderColor?: ColorValue;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  isPassword?: boolean;
  toggleSecureEntry?: () => void;
  isBottomSheetInput?: boolean;
}

const Input: React.FC<ReusableInputProps> = ({
  placeholder,
  value,
  onChangeText,
  borderColor = '#E1E3ED',
  labelText,
  secureTextEntry = false,
  keyboardType = 'default',
  toggleSecureEntry,
  isPassword = false,
  isBottomSheetInput = false,
  ...rest
}) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.inputContainer}>
      {labelText && (
        <View style={styles.label}>
          <TextWrapper fontSize={14} semiBoldSora color={COLORS.textGrey}>
            {labelText}
          </TextWrapper>
        </View>
      )}
      <View style={[styles.inputWrapper, { borderColor }]}>
        {isBottomSheetInput ? (
          <BottomSheetTextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={colors.placeholder}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            {...rest}
          />
        ) : (
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={colors.placeholder}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            {...rest}
          />
        )}
        {isPassword && (
          <TouchableOpacity
            onPress={toggleSecureEntry}
            style={styles.iconContainer}
          >
            <Icon
              name={secureTextEntry ? 'eye-slash' : 'eye'}
              type={IconType.FontAwesome5}
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default Input;
