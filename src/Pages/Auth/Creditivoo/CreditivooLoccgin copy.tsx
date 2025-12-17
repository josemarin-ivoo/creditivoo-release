import React, { useState, useEffect } from 'react';
import { 
  View,
  StyleSheet,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {SCREENS} from '@shared-constants';
import {Button, Input, AlertModal} from '@creditivo-components';
import {IVOO_COLORS, IVOO_SPACING, IVOO_TEXT_STYLES, IVOO_TYPOGRAPHY} from '@creditivo-style';

import {Routes} from '../../../Utils/NavigationRoutes';

import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import {login} from '../../store/slices/auth-slice';
import {login} from './store-creditivoo/slices/auth-slice';
import {useIvoSelector, useIvoDispatch} from '../../../redux/useIvo';
import CustomBottomSheetModal from './shared/components/bottom-sheet/CustomBottomSheetModal';
// import Icon, {IconType} from 'react-native-dynamic-vector-icons';
const USER_SESSION_KEY = '@CreditivooUserSession';
const BIOMETRIC_SERVICE = 'creditivoo_biometric_service';
const LAST_EMAIL_KEY = '@CreditivooLastEmail';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useIvoDispatch();
  // const {isLoggedIn, isLoading} = useIvoSelector(state => state.auth);
  const authState = useIvoSelector(state => state.creditivoo.auth || {isLoggedIn: false, isLoading: false}); 
  const {isLoggedIn, isLoading} = authState; // Desestructuramos del estado seguro
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [focusedInputs, setFocusedInputs] = useState<Set<string>>(new Set());

  // captura si o no de la biometria
  const [showBiometricButton, setShowBiometricButton] = useState(false);
  //guarda el correo
  // const [email, setEmail] = useState('');
  // check recuerdame
  const [rememberMe, setRememberMe] = useState(false);

  //const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);


  const navigateToHome = () => {
    
    
    (navigation as any).navigate(Routes.NAVIGATION_TABCREDITIVOO);
  };

  //logica para cargar el correo persistente
  const loadRememberMePreference = async () => {
    try {
        const lastEmail = await AsyncStorage.getItem(LAST_EMAIL_KEY);
        if (lastEmail) {
            setEmail(lastEmail);
            setRememberMe(true); // Si hay email guardado, el switch estaba en ON
        } else {
            // Si no hay email guardado, intentamos cargar de la sesión activa
            const sessionDataString = await AsyncStorage.getItem(USER_SESSION_KEY);
            if (sessionDataString) {
                const sessionData = JSON.parse(sessionDataString);
                if (sessionData.username) {
                    setEmail(sessionData.username);
                }
            }
        }
    } catch (error) {
        console.error('Error al cargar la preferencia "Recuérdame":', error);
    }
  };

  const saveRememberMePreference = async (currentEmail) => {
      try {
          if (rememberMe && currentEmail) {
              await AsyncStorage.setItem(LAST_EMAIL_KEY, currentEmail);
          } else {
              // Si el usuario desactiva el check, limpiamos el email guardado
              await AsyncStorage.removeItem(LAST_EMAIL_KEY);
          }
      } catch (error) {
          console.error('Error al guardar la preferencia "Recuérdame":', error);
      }
  };

  const setSessionAndSaveCredentials = async (username, sessionToken) => {
    
    await AsyncStorage.setItem(USER_SESSION_KEY, JSON.stringify({ token: sessionToken, username: username }));
    
    
    await Keychain.setGenericPassword(username, sessionToken, {
      service: BIOMETRIC_SERVICE,
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
    });
    
    console.log(`Sesión biométrica guardada. Token: ${sessionToken}`);
    navigateToHome();
  };


  const loadAndAuthenticate = async () => {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: BIOMETRIC_SERVICE,
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,

        // Mensaje de solicitud (iOS/Android)
        authenticationPrompt: {
            title: 'Autenticación Biométrica Creditivoo',
            subtitle: 'Usa tu biometría para un acceso rápido.',
            cancel: 'Cancelar',
        },
      });

      if (credentials && credentials.username && credentials.password) {
        const recoveredToken = credentials.password;
        await AsyncStorage.setItem(USER_SESSION_KEY, JSON.stringify({ 
            token: credentials.password, 
            username: credentials.username 
        }));
        console.log('✅ RESPUESTA BIOMÉTRICA EXITOSA (Credenciales Recuperadas):', {
          username: credentials.username,
          
          tokenSnippet: recoveredToken.substring(0, 10) + '...',
        });

        Alert.alert("Acceso Biomètrico", `Bienvenido de nuevo, ${credentials.username}.`);
        navigateToHome();

      } else {

        console.log('No hay credenciales guardadas con biometría.');

      }
    } catch (error) {

      // Maneja la cancelación del usuario o error biométrico
      console.warn('Fallo al recuperar credenciales biométricas:', error.message);

      Alert.alert(
        "Acceso Manual", 
        "La autenticación biométrica falló o fue cancelada. Por favor, inicia sesión con tu contraseña."
      );
    }
  };

  const checkBiometricSupportAndCredentials = async () => {
     try {
     // Corregido: Obtenemos el tipo
     const supported = await Keychain.getSupportedBiometryType(); 

     const hasCredentials = await Keychain.hasGenericPassword({ service: BIOMETRIC_SERVICE }    );
     // Corregido: Comparamos con la constante BIOMETRY_NONE
        if (supported && (supported as string) !== 'None' && hasCredentials) { 
          setShowBiometricButton(true);
        } else {
          setShowBiometricButton(false);
        }
     } catch (e) {
      console.error('Error al verificar soporte biométrico:', e);
      setShowBiometricButton(false);
     }
  };

  // para dejar el correo precargado
  const loadLastUsedEmail = async () => {
    try {
      // Intentar cargar el último email usado (guardado como username)
      const sessionDataString = await AsyncStorage.getItem(USER_SESSION_KEY);
      if (sessionDataString) {
      const sessionData = JSON.parse(sessionDataString);
      if (sessionData.username) {
        setEmail(sessionData.username);
      }
      }
    } catch (error) {
      console.error('Error al cargar el último email usado:', error);
    }
  };



  useEffect(() => {
    loadRememberMePreference();
    // loadLastUsedEmail();
    checkBiometricSupportAndCredentials();
  }, []);

  const handleContinue = async () => {
    // codigo Lionel
    if (isLoggedIn) {
      navigation.reset({
        index: 0,
        routes: [{name: 'MainTabs' as never}],
      });
    } else {
      // Mostrar modal de login
      await setShowLoginModal(true);
    }

    if (!email || !email.includes('@')) {
        Alert.alert("Error", "Por favor, introduce un correo electrónico válido.");
        return;
    }

    
    await saveRememberMePreference(email); 

    setShowPasswordInput(true); 

  };


  const handleLogin = async () => {

    if (!email.trim() || !password.trim()) {
      setAlertMessage('Por favor, completa todos los campos');
      setAlertVisible(true);
      return;
    }

    if (!password) {
        Alert.alert("Error", "Por favor, introduce tu clave de acceso.");
        return;
    }
    

    try {
      const result = await dispatch(
        login({email: email.trim(), password}),
      ).unwrap();

      if (result.token && result.user) {
        // Login exitoso, cerrar modal y navegar
        setShowLoginModal(false);
        setEmail('');
        setPassword('');
        navigation.reset({
          index: 0,
          routes: [{name: 'MainTabs' as never}],
        });
        setSessionAndSaveCredentials(result.token, result.user);
      }
    } catch (err: any) {
      const errorMessage =
        err?.message || 'Error al iniciar sesión. Por favor, intenta de nuevo.';
      setAlertMessage(errorMessage);
      setAlertVisible(true);
    }
    // Aquí iría la llamada a la API con (email, password)
    // SIMULACIÓN: Asumiendo que el login es exitoso
    // const DUMMY_USERNAME = email;
    // const DUMMY_TOKEN = 'jwt_token_for_' + email + '_and_password'; 
    
    // // Guarda las credenciales biométricas y la sesión, luego navega
    // setSessionAndSaveCredentials(DUMMY_USERNAME, DUMMY_TOKEN);
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
    setEmail('');
    setPassword('');
    setFocusedInputs(new Set());
  };

  const handleRegister = () => {
    (navigation as any).navigate("Register");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        overScrollMode="always"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}>
        {/* Welcome Text */}
        <Text style={styles.welcomeText}>Bienvenido a</Text>

        {/* Creditivoo Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('./images/creditivo-logo-full.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Ivitoo Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require('./images/onboarding/ivitoo-register.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>
        {/* email */}
        <TextInput
           style={styles.input}
           placeholder="Correo Electrónico"
           placeholderTextColor={IVOO_COLORS.textSecondary}
           keyboardType="email-address"
           autoCapitalize="none"
           autoCorrect={false}
           
           editable={!isLoading}
           onFocus={() => {
                  if (!isLoading) {
                    setFocusedInputs(prev => new Set(prev).add('email'));
                  }
                }}
            onBlur={() => {
                  setFocusedInputs(prev => {
                    const newSet = new Set(prev);
                    newSet.delete('email');
                    return newSet;
                  });
                }}
           value={email} // Precargado si existe una sesión anterior
           onChangeText={setEmail}
         />
         {showPasswordInput && (
             <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Clave de Acceso"
                placeholderTextColor={IVOO_COLORS.textSecondary}
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                  autoCorrect={false}
                  // containerStyle={styles.inputWrapper}
                  //style={styles.passwordInput}
                  editable={!isLoading}
                  onFocus={() => {
                    if (!isLoading) {
                      setFocusedInputs(prev => new Set(prev).add('password'));
                    }
                  }}
                  onBlur={() => {
                    setFocusedInputs(prev => {
                      const newSet = new Set(prev);
                      newSet.delete('password');
                      return newSet;
                    });
                  }}
             />
             
        )}
        <View style={styles.buttonRowContainer}>
            
            {/* Botón de Continuar / Iniciar Sesión (Cambia el título y la acción) */}
            <Button
                onPress={showPasswordInput ? handleLogin : handleContinue} // CAMBIA LA ACCIÓN
                title={showPasswordInput ? "INICIAR SESIÓN" : "CONTINUAR"} // CAMBIA EL TÍTULO
                style={styles.continueButton}
            />
            
            {/* Botón de Huella Digital (Pequeño, solo ícono) */}
            {/* {showBiometricButton && !showPasswordInput && (  */}
                <TouchableOpacity
                    onPress={loadAndAuthenticate} 
                    style={styles.smallBiometricButton}>
                    <Text style={styles.biometricIconTextSmall}>
                        {/* Ícono de Apple para iOS (TouchID/FaceID) o Candado Cerrado para Android (Huella) */}
                        {Platform.OS === 'ios' ? '' : '\u{1F512}'}
                        {/* {Platform.OS === 'ios' ? '' : '\u2328'} */}
                    </Text>
                </TouchableOpacity>
            {/* )} */}

            
         
        </View>

          {/* {showBiometricButton && ( 
            <TouchableOpacity
              onPress={loadAndAuthenticate} 
              style={styles.biometricButton}>
              <Text style={styles.biometricIconText}>
              {Platform.OS === 'ios' ? 'FaceID / TouchID' : 'Huella Digital'}
              </Text>
              <Text style={styles.biometricLabel}>
                Acceso Rápido con Biometría
            </Text>
            </TouchableOpacity>
          )}
          
        {/* Continue Button */}
        {/* <Button
          onPress={handleContinue}
          title="Continuar"
          style={styles.continueButton}
        /> */}

        {/* Register Link */}
        <TouchableOpacity onPress={handleRegister} style={styles.registerLink}>
          <Text style={styles.registerText}>Registrarse</Text>
        </TouchableOpacity>

        {/* Home Indicator */}
        <View style={styles.homeIndicator} />
      </ScrollView>
      {/* Alert Modal */}
      <AlertModal
        visible={alertVisible}
        title="Error"
        message={alertMessage}
        type="error"
        onClose={() => setAlertVisible(false)}
        buttonText="OK"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({

  buttonRowContainer: {
    width: '85%',
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginTop: 50, 
  },
    
  continueButton: {
    
    width: '75%', 
    
  },
  inputWrapper: {
    width: '100%',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 0,
  },
   buttonContainer: {
    position: 'relative',
    width: '100%',
    marginTop: 8,
  },
    
  smallBiometricButton: {
    width: '20%', 
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: IVOO_COLORS.primary,
    marginLeft: 10,
  },
    
  biometricIconTextSmall: {
    fontSize: 30, 
    color: IVOO_COLORS.primary,
  },
    
  passwordInput: {
    marginTop: 20, 
  },
  input: {
    width: '85%',
    height: 50,
    borderColor: IVOO_COLORS.border || '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginTop: 40, 
    fontSize: 16,
    color: IVOO_COLORS.textPrimary || '#000',
  },

  biometricButton: {
    marginTop: 50, 
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: IVOO_COLORS.primary,
    alignItems: 'center',
    width: '80%', 
  },
  biometricIconText: {
    fontSize: 16,
    color: IVOO_COLORS.primary,
    fontWeight: 'bold',
  },
  biometricLabel: {
    fontSize: 12,
    color: IVOO_COLORS.primary,
    marginTop: 5,
  },
  safeArea: {
    flex: 1,
    backgroundColor: IVOO_COLORS.white,
  },
  scrollView: {
    flex: 1,
    backgroundColor: IVOO_COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 10,
  },
  welcomeText: {
    fontSize: IVOO_TEXT_STYLES.welcomeText.fontSize,
    fontFamily: IVOO_TEXT_STYLES.welcomeText.fontFamily,
    fontWeight: IVOO_TEXT_STYLES.welcomeText.fontWeight,
    lineHeight: IVOO_TEXT_STYLES.welcomeText.lineHeight,
    color: IVOO_COLORS.primary,
    textAlign: 'center',
    marginTop: 197,
  },
  logoContainer: {
    width: IVOO_SPACING.logoWidth,
    height: IVOO_SPACING.logoHeight,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  illustrationContainer: {
    width: IVOO_SPACING.illustrationWidth,
    height: IVOO_SPACING.illustrationHeight,
    marginTop: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  // continueButton: {
  //   marginTop: 50,
  // },
  registerLink: {
    marginTop: 25,
    paddingVertical: 8,
  },
  registerText: {
    fontSize: IVOO_TEXT_STYLES.linkText.fontSize,
    fontFamily: IVOO_TEXT_STYLES.linkText.fontFamily,
    fontWeight: IVOO_TEXT_STYLES.linkText.fontWeight,
    lineHeight: IVOO_TEXT_STYLES.linkText.lineHeight,
    color: IVOO_COLORS.primary,
    textAlign: 'center',
    includeFontPadding: false,
  },
  homeIndicator: {
    position: 'absolute',
    bottom: IVOO_SPACING.homeIndicatorBottom,
    left: '50%',
    marginLeft: IVOO_SPACING.homeIndicatorMargin,
    width: IVOO_SPACING.homeIndicatorWidth,
    height: IVOO_SPACING.homeIndicatorHeight,
    backgroundColor: IVOO_COLORS.black,
    borderRadius: IVOO_SPACING.homeIndicatorBorderRadius,
  },
});

export default LoginScreen;