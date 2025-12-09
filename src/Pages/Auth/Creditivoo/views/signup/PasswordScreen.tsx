import React, {useState, useMemo} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Button, Input} from '../../components';
import RegisterLayout from '../../components/layouts/RegisterLayout';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

interface PasswordRequirement {
  label: string;
  isValid: boolean;
}

const PasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Validate password requirements
  const requirements: PasswordRequirement[] = useMemo(() => {
    const hasLength = password.length >= 8 && password.length <= 20;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[$./!@#]/.test(password);

    return [
      {
        label: 'Entre 8 a 20 caracteres',
        isValid: hasLength,
      },
      {
        label: 'Al menos 1 mayuscula',
        isValid: hasUppercase,
      },
      {
        label: 'Al menos 1 número',
        isValid: hasNumber,
      },
      {
        label: 'Al menos 1 caracter especial ($./!@#)',
        isValid: hasSpecialChar,
      },
    ];
  }, [password]);

  const isPasswordValid = useMemo(() => {
    return requirements.every(req => req.isValid);
  }, [requirements]);

  const handleContinue = () => {
    if (!isPasswordValid) {
      // TODO: Show error message
      return;
    }
    // TODO: Save password and complete registration
    console.log('Password set:', password);
    // Navigate to registration success screen
    (navigation as any).navigate('RegistrationSuccess');
  };

  const logo = (
    <Image
      source={require('../../images/creditivo-logo-full.png')}
      style={styles.logo}
      resizeMode="contain"
    />
  );

  const content = (
    <>
      <Text style={styles.title}>Escribe tu contraseña</Text>

      <Text style={styles.subtitle}>
        Tu contraseña es muy importante, no utilices secuencia numericas o tu
        fecha de cumpleaños 🤓
      </Text>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.formArea}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <View style={styles.passwordInputWrapper}>
          <Input
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            containerStyle={styles.inputWrapper}
            style={styles.passwordInput}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}>
            <Icon
              name={showPassword ? 'eye-off' : 'eye'}
              type={IconType.Feather}
              size={SCREEN_WIDTH * 0.053}
              color="#676464"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.requirementsContainer}>
          {requirements.map((req, index) => (
            <View key={index} style={styles.requirementRow}>
              <View
                style={[
                  styles.requirementCheckbox,
                  {
                    backgroundColor: req.isValid
                      ? IVOO_COLORS.primary
                      : '#DADADA',
                    borderColor: req.isValid ? IVOO_COLORS.primary : '#DADADA',
                  },
                ]}>
                {req.isValid && (
                  <Icon
                    name="check"
                    type={IconType.MaterialCommunityIcons}
                    size={SCREEN_WIDTH * 0.027}
                    color={IVOO_COLORS.white}
                  />
                )}
              </View>
              <Text style={styles.requirementText}>{req.label}</Text>
            </View>
          ))}
        </View>
      </KeyboardAvoidingView>
    </>
  );

  const bottomAction = (
    <Button
      onPress={handleContinue}
      title="Continuar"
      style={styles.continueButton}
    />
  );

  return (
    <>
      <RegisterLayout
        contentPaddingTop={SCREEN_HEIGHT * 0.09}
        logo={logo}
        bottomAction={bottomAction}>
        {content}
      </RegisterLayout>
    </>
  );
};

const styles = StyleSheet.create({
  logo: {
    width: SCREEN_WIDTH * 0.72,
    height: SCREEN_WIDTH * 0.72 * 0.154,
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.063,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.01,
    width: SCREEN_WIDTH * 0.92,
  },
  subtitle: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: '300',
    color: '#676464',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.06,
    width: SCREEN_WIDTH * 0.85,
  },
  formArea: {
    width: SCREEN_WIDTH * 0.75, // Same width as RegisterScreen
    alignItems: 'center',
    flexShrink: 1,
  },
  passwordInputWrapper: {
    position: 'relative',
    width: '100%',
  },
  inputWrapper: {
    width: '100%',
  },
  passwordInput: {
    fontSize: SCREEN_WIDTH * 0.05342343,
  },
  eyeIcon: {
    position: 'absolute',
    right: SCREEN_WIDTH * 0.042,
    top: SCREEN_HEIGHT * 0.02,
    zIndex: 1,
  },

  requirementsContainer: {
    marginTop: SCREEN_HEIGHT * 0.03,
    width: '100%',
    alignItems: 'flex-start',
    flexShrink: 1,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.004,
  },
  requirementCheckbox: {
    width: SCREEN_WIDTH * 0.037,
    height: SCREEN_WIDTH * 0.037,
    borderRadius: SCREEN_WIDTH * 0.008,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SCREEN_WIDTH * 0.024,
  },
  requirementText: {
    fontSize: SCREEN_WIDTH * 0.037,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: '300',
    lineHeight: SCREEN_HEIGHT * 0.028,
    letterSpacing: SCREEN_WIDTH * 0.0016,
    color: '#676464',
    flex: 1,
  },
  continueButton: {},
});

export default PasswordScreen;
