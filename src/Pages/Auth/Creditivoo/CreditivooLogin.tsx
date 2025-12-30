import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {SCREENS} from '@shared-constants';
import {Button, Input, AlertModal} from './components';
import {
  IVOO_COLORS,
  IVOO_SPACING,
  IVOO_TEXT_STYLES,
  IVOO_TYPOGRAPHY,
} from './styles';
import {useIvoSelector, useIvoDispatch} from '../../../redux/useIvo';
import {login} from './store-creditivoo/slices/auth-slice';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import ReactNativeBiometrics from 'react-native-biometrics';
import {AuthStorage} from './app/services/AuthStorage';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useIvoDispatch();
  const {isLoggedIn, isLoading} = useIvoSelector(state => state.creditivoo.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [hasBiometricEnabled, setHasBiometricEnabled] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);

  // Carga persistente de credenciales
  const loadStoredData = React.useCallback(async () => {
    try {
      const credentials = await AuthStorage.getCredentials();
      if (credentials?.email) {
        setEmail(credentials.email);
      }
      const rnBiometrics = new ReactNativeBiometrics();
      const {available} = await rnBiometrics.isSensorAvailable();
      setHasBiometricEnabled(!!credentials && available);
    } catch (error) {
      console.error('[LoginScreen] Error loading data:', error);
    }
  }, []);

  useEffect(() => { loadStoredData(); }, [loadStoredData]);
  useFocusEffect(React.useCallback(() => { loadStoredData(); }, [loadStoredData]));

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setAlertMessage('Por favor, completa todos los campos');
      setAlertVisible(true);
      return;
    }
    try {
      await dispatch(login({email: email.trim(), password})).unwrap();
      setPassword(''); 
      navigation.reset({ index: 0, routes: [{name: 'MainTabs' as never}] });
    } catch (err: any) {
      setAlertMessage(err?.message || 'Error al iniciar sesión');
      setAlertVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          
          <Text style={styles.welcomeText}>Bienvenido a</Text>

          {/* LOGO - Asegurando visibilidad con dimensiones controladas */}
          <View style={styles.logoContainer}>
            <Image
              source={require('./images/creditivo-logo-full.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* ILUSTRACIÓN - Reincorporada para mantener la identidad visual */}
          <View style={styles.illustrationContainer}>
            <Image
              source={require('./images/onboarding/ivitoo-register.png')}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          {/* FORMULARIO DIRECTO */}
          <View style={styles.formContainer}>
            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              containerStyle={styles.inputField}
              editable={!isLoading}
            />

            <View style={styles.passwordWrapper}>
              <Input
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                containerStyle={styles.inputField}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}>
                <Icon
                  name={showPassword ? 'eye-off' : 'eye'}
                  type={IconType.Feather}
                  size={20}
                  color="#676464"
                />
              </TouchableOpacity>
            </View>

            <Button
              title={isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
              onPress={handleLogin}
              disabled={isLoading}
              style={styles.loginButton}
            />

            {hasBiometricEnabled && (
              <TouchableOpacity
                onPress={() => {/* handleBiometricLogin */}}
                style={styles.biometricButton}>
                <Icon name="fingerprint" type={IconType.MaterialIcons} size={28} color={IVOO_COLORS.primary} />
                <Text style={styles.biometricText}>Ingresar con huella</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              onPress={() => (navigation as any).navigate(SCREENS.REGISTER)} 
              style={styles.registerLink}>
              <Text style={styles.registerText}>¿No tienes cuenta? <Text style={{fontWeight: 'bold'}}>Regístrate</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: IVOO_COLORS.white },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
  },
  welcomeText: {
    fontSize: 16,
    color: IVOO_COLORS.primary,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interMedium,
    marginBottom: 5,
  },
  logoContainer: {
    width: SCREEN_WIDTH * 0.6,
    height: 50,
    marginBottom: 20,
    justifyContent: 'center',
  },
  logo: { width: '100%', height: '100%' },
  illustrationContainer: {
    width: SCREEN_WIDTH * 0.5,
    height: SCREEN_WIDTH * 0.5,
    marginBottom: 30,
  },
  illustration: { width: '100%', height: '100%' },
  formContainer: { width: '100%' },
  inputField: { marginBottom: 15, width: '100%' },
  passwordWrapper: { width: '100%', position: 'relative' },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 5,
  },
  loginButton: { marginTop: 10 },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  biometricText: {
    marginLeft: 10,
    color: IVOO_COLORS.primary,
    fontWeight: '600',
  },
  registerLink: { marginTop: 25, alignItems: 'center' },
  registerText: { color: IVOO_COLORS.primary },
});

export default LoginScreen;