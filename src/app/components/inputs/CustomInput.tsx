import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {COLORS, FONTS} from '../../styles/global.style';

interface CustomInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText?: (text: string) => void; // Optional for read-only mode
  isPassword?: boolean;
  error?: string;
  readOnly?: boolean; // New prop for read-only mode
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  placeholder = '',
  value,
  onChangeText,
  isPassword = false,
  error,
  readOnly = false, // Default is false (editable)
  autoCapitalize = 'none',
  keyboardType = 'default',
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View
        style={[
          styles.inputContainer,
          error ? styles.inputContainerError : undefined,
          readOnly ? styles.inputContainerReadOnly : undefined, // Add opacity if read-only
        ]}>
        <TextInput
          style={[styles.input, error ? styles.inputError : undefined]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textGrey}
          secureTextEntry={isPassword && !passwordVisible}
          value={value}
          onChangeText={readOnly ? undefined : onChangeText} // Disable onChangeText if read-only
          editable={!readOnly} // Make input non-editable in read-only mode
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
        />

        {isPassword &&
          !readOnly && ( // Disable password toggle in read-only mode
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setPasswordVisible(!passwordVisible)}>
              <Icon
                name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                type={IconType.Ionicons}
                size={20}
                color={COLORS.greyDark}
              />
            </TouchableOpacity>
          )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontFamily: FONTS.urbanistBold,
    fontSize: 18,
    color: COLORS.greyDark,
    marginBottom: 10,
  },
  inputContainer: {
    position: 'relative',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  inputContainerError: {
    borderColor: COLORS.error,
    borderWidth: 1,
  },
  inputContainerReadOnly: {
    opacity: 0.6,
  },
  input: {
    padding: 14,
    fontFamily: FONTS.urbanistRegular,
    color: COLORS.greyDark,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
    opacity: 0.5,
  },
  errorText: {
    fontFamily: FONTS.urbanistRegular,
    fontSize: 12,
    color: COLORS.error,
    marginTop: 5,
  },
});

export default CustomInput;
