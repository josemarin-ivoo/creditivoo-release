import React, {useState, useEffect, useCallback} from 'react';
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
import { IVOO_COLORS, IVOO_TYPOGRAPHY } from './styles';
import {useIvoSelector, useIvoDispatch} from '../../../redux/useIvo';
import {login} from './store-creditivoo/slices/auth-slice';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import {AuthStorage} from './app/services/AuthStorage';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useIvoDispatch();
  const {isLoading} = useIvoSelector(state => state.creditivoo.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
  // Estados para biometría
  const [isSensorAvailable, setIsSensorAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState<string | undefined>(undefined);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);

  // 1. CARGA DE CREDENCIALES Y SENSOR
  const checkSensor = useCallback(async () => {
    try {
      // Intentamos recuperar credenciales guardadas para la persistencia del input
      const credentials = await AuthStorage.getCredentials();
      if (credentials?.email) {
        setEmail(credentials.email);
      }
      
      const rnBiometrics = new ReactNativeBiometrics();
      const {available, biometryType} = await rnBiometrics.isSensorAvailable();
      
      setIsSensorAvailable(available);
      setBiometryType(biometryType); 
    } catch (error) {
      console.log('[Login] Error al cargar sensor/credenciales:', error);
      setIsSensorAvailable(false);
    }
  }, []);

  useEffect(() => { checkSensor(); }, [checkSensor]);
  useFocusEffect(useCallback(() => { checkSensor(); }, [checkSensor]));

  // 2. LÓGICA DE ICONO BIOMÉTRICO (CORREGIDO IOS)
  const getBiometricIcon = () => {
    if (Platform.OS === 'ios') {
      if (biometryType === BiometryTypes.FaceID) {
        return { name: 'face-recognition', type: IconType.MaterialCommunityIcons };
      }
      return { name: 'fingerprint', type: IconType.MaterialIcons };
    }
    return { name: 'fingerprint', type: IconType.MaterialIcons };
  };

  const biometricIcon = getBiometricIcon();

  // 3. LOGIN BIOMÉTRICO
  const handleBiometricLogin = async () => {
    try {
      const credentials = await AuthStorage.getCredentials();
      if (!credentials) {
        setAlertMessage('Inicia sesión manualmente una vez para activar el acceso biométrico.');
        setAlertVisible(true);
        return;
      }

      setIsBiometricLoading(true);
      const rnBiometrics = new ReactNativeBiometrics();
      const result = await rnBiometrics.simplePrompt({
        promptMessage: Platform.OS === 'ios' && biometryType === BiometryTypes.FaceID 
          ? 'Confirma tu FaceID' 
          : 'Confirma tu huella',
        cancelButtonText: 'Cancelar'
      });

      if (result.success) {
        await dispatch(login({email: credentials.email, password: credentials.password})).unwrap();
        navigation.reset({ index: 0, routes: [{name: 'MainTabs' as never}] });
      }
    } catch (err) {
      setAlertMessage('Error en la autenticación biométrica');
      setAlertVisible(true);
    } finally {
      setIsBiometricLoading(false);
    }
  };

  // 4. LOGIN MANUAL (CON PERSISTENCIA CORREGIDA)
  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password.trim()) {
      setAlertMessage('Por favor, completa todos los campos');
      setAlertVisible(true);
      return;
    }
    try {
      // Realizar el login en el servidor
      await dispatch(login({email: trimmedEmail, password})).unwrap();
      
      // SI EL LOGIN ES EXITOSO, GUARDAMOS LAS CREDENCIALES PARA LA PRÓXIMA VEZ
      await AuthStorage.saveCredentials(trimmedEmail, password);
      
      navigation.reset({ index: 0, routes: [{name: 'MainTabs' as never}] });
    } catch (err: any) {
      setAlertMessage(err?.message || 'Error al iniciar sesión');
      setAlertVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <Text style={styles.welcomeText}>Bienvenido a</Text>
          <View style={styles.logoContainer}>
            <Image source={require('./images/creditivo-logo-full.png')} style={styles.logo} resizeMode="contain" />
          </View>

          <View style={styles.illustrationContainer}>
            <Image source={require('./images/onboarding/ivitoo-register.png')} style={styles.illustration} resizeMode="contain" />
          </View>

          <View style={styles.formContainer}>
            
            {/* CAMPO USUARIO / EMAIL */}
            <View style={styles.inputWrapper}>
              <Input
                placeholder="Usuario"
                value={email}
                onChangeText={setEmail}
                containerStyle={styles.inputBody}
                inputStyle={styles.inputText}
                placeholderTextColor="#A0A0A0"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {isSensorAvailable && (
                <TouchableOpacity 
                  activeOpacity={0.7}
                  style={styles.iconInside} 
                  onPress={handleBiometricLogin}>
                  {isBiometricLoading ? (
                    <ActivityIndicator size="small" color={IVOO_COLORS.primary} />
                  ) : (
                    <Icon 
                      name={biometricIcon.name} 
                      type={biometricIcon.type} 
                      size={28} 
                      color={IVOO_COLORS.primary} 
                    />
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* CAMPO CONTRASEÑA */}
            <View style={styles.inputWrapper}>
              <Input
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                containerStyle={styles.inputBody}
                inputStyle={styles.inputText}
                placeholderTextColor="#A0A0A0"
              />
              <TouchableOpacity 
                style={styles.iconInside} 
                onPress={() => setShowPassword(!showPassword)}>
                <Icon name={showPassword ? 'eye-off' : 'eye'} type={IconType.Feather} size={22} color="#888" />
              </TouchableOpacity>
            </View>

            <Button
              title={isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
              onPress={handleLogin}
              disabled={isLoading || isBiometricLoading}
              style={styles.loginButton}
            />

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Olvidé mi contraseña</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => (navigation as any).navigate(SCREENS.REGISTER)} 
              style={styles.regContainer}>
              <Text style={styles.regText}>
                ¿No tienes cuenta? <Text style={{fontWeight: 'bold'}}>Regístrate</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AlertModal 
        visible={alertVisible} 
        title="Atención" 
        message={alertMessage} 
        onClose={() => setAlertVisible(false)} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  scrollContent: { 
    flexGrow: 1, 
    paddingHorizontal: 30, 
    alignItems: 'center', 
    paddingTop: 20,
    paddingBottom: 40 
  },
  welcomeText: { 
    fontSize: 28, 
    color: IVOO_COLORS.primary, 
    marginBottom: 25, 
    marginTop: 40,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interSemiBold 
  },
  logoContainer: { width: SCREEN_WIDTH * 0.6, height: 45, marginBottom: 15 },
  logo: { width: '100%', height: '100%' },
  illustrationContainer: { 
    width: SCREEN_WIDTH * 0.45, 
    height: SCREEN_WIDTH * 0.45, 
    marginBottom: -15 
  },
  illustration: { width: '100%', height: '100%' },
  formContainer: { width: '100%' },
  inputWrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  inputBody: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  inputText: { 
    color: '#1C1C1E', 
    fontSize: 16, 
    paddingRight: 55 // Espacio suficiente para que el texto no toque el icono de la derecha
  }, 
  iconInside: {
    position: 'absolute',
    right: 0,
    zIndex: 99,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 45,
  },
  loginButton: { 
    marginTop: 15, 
    borderRadius: 12, 
    height: 50, 
    backgroundColor: IVOO_COLORS.primary 
  },
  forgotBtn: { marginTop: 15, alignItems: 'center' },
  forgotText: { color: IVOO_COLORS.primary, fontSize: 14 },
  regContainer: { marginTop: 40, alignItems: 'center' },
  regText: { color: IVOO_COLORS.primary, fontSize: 15 },
});

export default LoginScreen;