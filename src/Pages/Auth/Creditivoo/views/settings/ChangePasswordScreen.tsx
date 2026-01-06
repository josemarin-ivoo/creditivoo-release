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
import {Button, Input, AlertModal} from '../../components';
import RegisterLayout from '../../components/layouts/RegisterLayout';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {useIvoDispatch, useIvoSelector} from '../../store/hooks';
import {changeUserPassword} from '../../store-creditivoo/slices/auth-slice';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

interface PasswordRequirement {
  label: string;
  isValid: boolean;
}

const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useIvoDispatch();
  const {isLoading, error} = useIvoSelector((state: any) => state.creditivoo.auth);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'error' | 'warning' | 'info'>(
    'error',
  );

  // Validate new password requirements
  const requirements: PasswordRequirement[] = useMemo(() => {
    const hasLength = newPassword.length >= 6 && newPassword.length <= 25;
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[$./!@#]/.test(newPassword);

    return [
      {
        label: 'Entre 6 a 25 caracteres',
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
  }, [newPassword]);

  const isNewPasswordValid = useMemo(() => {
    return requirements.every(req => req.isValid);
  }, [requirements]);

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      setAlertTitle('Error');
      setAlertMessage('Por favor, ingresa tu contraseña actual.');
      setAlertType('error');
      setAlertVisible(true);
      return;
    }

    if (!isNewPasswordValid) {
      setAlertTitle('Error');
      setAlertMessage(
        'Por favor, completa todos los requisitos de la nueva contraseña.',
      );
      setAlertType('error');
      setAlertVisible(true);
      return;
    }

    if (currentPassword === newPassword) {
      setAlertTitle('Error');
      setAlertMessage(
        'La nueva contraseña debe ser diferente a la contraseña actual.',
      );
      setAlertType('error');
      setAlertVisible(true);
      return;
    }

    try {
      await dispatch(
        changeUserPassword({
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim(),
        }),
      ).unwrap();

      setAlertTitle('Éxito');
      setAlertMessage('Tu contraseña ha sido cambiada exitosamente.');
      setAlertType('info');
      setAlertVisible(true);

      // Limpiar campos después de un breve delay
      setTimeout(() => {
        setCurrentPassword('');
        setNewPassword('');
        navigation.goBack();
      }, 2000);
    } catch (err: any) {
      const errorMessage =
        typeof err === 'string'
          ? err
          : err?.message ||
            err?.toString() ||
            'Error al cambiar contraseña. Por favor, intenta de nuevo.';
      setAlertTitle('Error');
      setAlertMessage(errorMessage);
      setAlertType('error');
      setAlertVisible(true);
      console.error('Error al cambiar contraseña:', err);
    }
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
      <Text style={styles.title}>Cambiar contraseña</Text>

      <Text style={styles.subtitle}>
        Ingresa tu contraseña actual y crea una nueva contraseña segura 🔒
      </Text>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.formArea}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        {/* Current Password */}
        <View style={styles.passwordInputWrapper}>
          <Text style={styles.inputLabel}>Contraseña actual</Text>
          <Input
            placeholder="••••••••"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry={!showCurrentPassword}
            autoCapitalize="none"
            autoCorrect={false}
            containerStyle={styles.inputWrapper}
            style={styles.passwordInput}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            activeOpacity={0.7}>
            <Icon
              name={showCurrentPassword ? 'eye-off' : 'eye'}
              type={IconType.Feather}
              size={SCREEN_WIDTH * 0.053}
              color="#B4B4B4"
            />
          </TouchableOpacity>
        </View>

        {/* New Password */}
        <View style={styles.passwordInputWrapper}>
          <Text style={styles.inputLabel}>Nueva contraseña</Text>
          <Input
            placeholder="••••••••"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
            autoCapitalize="none"
            autoCorrect={false}
            containerStyle={styles.inputWrapper}
            style={styles.passwordInput}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowNewPassword(!showNewPassword)}
            activeOpacity={0.7}>
            <Icon
              name={showNewPassword ? 'eye-off' : 'eye'}
              type={IconType.Feather}
              size={SCREEN_WIDTH * 0.053}
              color="#B4B4B4"
            />
          </TouchableOpacity>
        </View>

        {/* Requirements */}
        {newPassword.length > 0 && (
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
                      borderColor: req.isValid
                        ? IVOO_COLORS.primary
                        : '#DADADA',
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
        )}
      </KeyboardAvoidingView>
    </>
  );

  const bottomAction = (
    <Button
      onPress={handleChangePassword}
      title={isLoading ? 'Cambiando...' : 'Cambiar contraseña'}
      disabled={!isNewPasswordValid || !currentPassword.trim() || isLoading}
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
      <AlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        onClose={() => {
          setAlertVisible(false);
          if (alertType === 'info') {
            navigation.goBack();
          }
        }}
      />
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
    width: SCREEN_WIDTH * 0.75,
    alignItems: 'center',
    flexShrink: 1,
  },
  passwordInputWrapper: {
    position: 'relative',
    width: '100%',
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  inputLabel: {
    fontSize: SCREEN_WIDTH * 0.037,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: '400',
    color: '#676464',
    marginBottom: SCREEN_HEIGHT * 0.01,
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
    top: SCREEN_HEIGHT * 0.03 + 26.5 - SCREEN_WIDTH * 0.0265, // Label space + input center (53/2) - icon center
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requirementsContainer: {
    marginTop: SCREEN_HEIGHT * 0.02,
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
  continueButton: {
    shadowColor: 'transparent',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
});

export default ChangePasswordScreen;
