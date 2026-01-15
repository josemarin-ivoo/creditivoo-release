import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import ReactNativeBiometrics from 'react-native-biometrics';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import CurvedHeaderLayout from '../../components/layouts/CurvedHeaderLayout';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {useIvoSelector, useIvoDispatch} from '../../store/hooks';
import {updateUserProfile, fetchMe} from '../../store/slices/auth-slice';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface SecurityOption {
  id: string;
  title: string;
  type: 'toggle' | 'navigation';
}

const SecurityScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useIvoDispatch();
  const {user, isLoading} = useIvoSelector((state: any) => state.auth);

  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const loadUserData = async () => {
      try {
        await dispatch(fetchMe()).unwrap();
      } catch (error) {
        console.error(
          '[SecurityScreen] Error al cargar datos del usuario:',
          error,
        );
      }
    };

    loadUserData();
  }, [dispatch]);

  // Actualizar los valores locales cuando cambie el usuario del store
  useEffect(() => {
    if (user) {
      // En iOS usar enableFaceIdCheck, en Android usar enableBiometricCheck
      const field =
        Platform.OS === 'ios' ? 'enableFaceIdCheck' : 'enableBiometricCheck';
      const value = user[field];
      setBiometricEnabled(
        value !== undefined && value !== null ? value : false,
      );
    } else {
      setBiometricEnabled(false);
    }
  }, [user]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleOptionPress = (optionId: string) => {
    if (optionId === 'googleAuthenticator') {
      // TODO: navegación a Google Authenticator
      console.log('Google Authenticator pressed');
    }
  };

  const handleToggleChange = async (optionId: string, value: boolean) => {
    console.log(`[SecurityScreen] toggle → ${optionId}: ${value}`);

    const rnBiometrics = new ReactNativeBiometrics();

    if (value) {
      try {
        const {available, biometryType} =
          await rnBiometrics.isSensorAvailable();

        if (!available) {
          Alert.alert(
            'Biometría no disponible',
            'Este dispositivo no soporta huella o FaceID.',
          );
          return;
        }

        // Log para debug
        console.log('[Security] Tipo de biometría detectado:', {
          biometryType,
          platform: Platform.OS,
          available,
        });

        // La librería react-native-biometrics usa automáticamente el método disponible
        // No podemos forzar Face ID vs Touch ID, la librería decide según el dispositivo
        // Solo logueamos para debug
        console.log(
          `[Security] Tipo de biometría disponible: ${biometryType}, Plataforma: ${Platform.OS}`,
        );

        await proceedWithBiometricAuth(rnBiometrics);
      } catch (error) {
        console.error('[Security] Error activando biometría:', error);
        return;
      }
    }

    if (!value) {
      try {
        const field =
          Platform.OS === 'ios' ? 'enableFaceIdCheck' : 'enableBiometricCheck';
        setBiometricEnabled(false);
        await saveSecuritySetting(field, false);
        console.log('[Security] Biometría desactivada.');
      } catch (error) {
        console.error('[Security] Error desactivando biometría:', error);
      }
    }
  };

  const proceedWithBiometricAuth = async (
    rnBiometrics: ReactNativeBiometrics,
  ) => {
    try {
      // Verificar si existen las claves criptográficas, si no, crearlas
      const {keysExist} = await rnBiometrics.biometricKeysExist();

      if (!keysExist) {
        try {
          // Crear las claves criptográficas automáticamente
          const {publicKey} = await rnBiometrics.createKeys();
          console.log('[Security] Claves criptográficas creadas:', publicKey);
        } catch (createError) {
          console.error(
            '[Security] Error al crear claves criptográficas:',
            createError,
          );
          Alert.alert(
            'Error',
            'No se pudieron crear las claves de seguridad. Por favor, intenta nuevamente.',
          );
          return;
        }
      }

      // Personalizar el mensaje según la plataforma
      const promptMessage =
        Platform.OS === 'ios'
          ? 'Confirma tu identidad con Face ID'
          : 'Confirma tu identidad con tu huella';

      const result = await rnBiometrics.simplePrompt({
        promptMessage,
      });

      if (!result.success) {
        console.log(
          '[Security] Autenticación fallida, no se activa la biometría.',
        );
        return;
      }

      const field =
        Platform.OS === 'ios' ? 'enableFaceIdCheck' : 'enableBiometricCheck';
      setBiometricEnabled(true);
      await saveSecuritySetting(field, true);

      console.log('[Security] Biometría activada exitosamente.');
    } catch (error) {
      console.error('[Security] Error en proceedWithBiometricAuth:', error);
      Alert.alert(
        'Error',
        'Ocurrió un error al activar la biometría. Por favor, intenta nuevamente.',
      );
    }
  };

  const saveSecuritySetting = async (
    field: 'enableFaceIdCheck' | 'enableBiometricCheck',
    value: boolean,
  ) => {
    try {
      await dispatch(
        updateUserProfile({
          [field]: value,
        }),
      ).unwrap();
    } catch (error: any) {
      setBiometricEnabled(!value);
      console.error(
        '[SecurityScreen] Error al actualizar configuración:',
        error,
      );
    }
  };

  const options: SecurityOption[] = [
    {
      id: 'biometric',
      title: Platform.OS === 'ios' ? 'Face ID' : 'Biométrica',
      type: 'toggle',
    },
    {
      id: 'googleAuthenticator',
      title: 'Google Authenticator',
      type: 'navigation',
    },
  ];

  return (
    <CurvedHeaderLayout
      title="Seguridad"
      showBackButton={true}
      onBackPress={handleBackPress}
      scroll={true}>
      <View style={styles.content}>
        <View style={styles.optionsList}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionItem,
                index === options.length - 1 && styles.optionItemLast,
              ]}
              onPress={() => handleOptionPress(option.id)}
              disabled={option.type === 'toggle'}>
              <View style={styles.optionLeft}>
                <Text style={styles.optionText}>{option.title}</Text>
              </View>
              {option.type === 'toggle' ? (
                <Switch
                  value={biometricEnabled}
                  onValueChange={value => handleToggleChange(option.id, value)}
                  disabled={isLoading}
                  trackColor={{
                    false: '#E0E0E0',
                    true: IVOO_COLORS.primary,
                  }}
                  thumbColor={IVOO_COLORS.white}
                  ios_backgroundColor="#E0E0E0"
                />
              ) : (
                <Icon
                  name="chevron-forward"
                  type={IconType.Ionicons}
                  size={20}
                  color={IVOO_COLORS.grayLight}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </CurvedHeaderLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: SCREEN_WIDTH * 0.02,
    paddingBottom: SCREEN_WIDTH * 0.03,
  },
  optionsList: {
    backgroundColor: IVOO_COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
    justifyContent: 'space-between',
  },
  optionItemLast: {
    borderBottomWidth: 0,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  optionText: {
    fontSize: SCREEN_WIDTH * 0.042,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.textPrimary,
    flexShrink: 1,
  },
});

export default SecurityScreen;
