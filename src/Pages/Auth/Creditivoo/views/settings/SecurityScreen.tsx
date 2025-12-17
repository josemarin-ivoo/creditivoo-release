import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import ReactNativeBiometrics from 'react-native-biometrics';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import CurvedHeaderLayout from '../../components/layouts/CurvedHeaderLayout';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {useIvoSelector, useIvoDispatch} from '../../../../../redux/useIvo';
import {updateUserProfile, fetchMe} from '../../store-creditivoo/slices/auth-slice';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface SecurityOption {
  id: string;
  title: string;
  type: 'toggle' | 'navigation';
}

const SecurityScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useIvoDispatch();
  const {user, isLoading} = useIvoSelector((state: any) => state.creditivoo.auth);

  const [faceIdEnabled, setFaceIdEnabled] = useState(false);
  const [biometricIdEnabled, setBiometricIdEnabled] = useState(false);

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
      // Solo establecer true si el valor está explícitamente definido como true
      setFaceIdEnabled(
        user.enableFaceIdCheck !== undefined && user.enableFaceIdCheck !== null
          ? user.enableFaceIdCheck
          : false,
      );
      setBiometricIdEnabled(
        user.enableBiometricCheck !== undefined &&
          user.enableBiometricCheck !== null
          ? user.enableBiometricCheck
          : false,
      );
    } else {
      // Si no hay usuario, establecer en false
      setFaceIdEnabled(false);
      setBiometricIdEnabled(false);
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
        const {available} = await rnBiometrics.isSensorAvailable();

        if (!available) {
          Alert.alert(
            'Biometría no disponible',
            'Este dispositivo no soporta huella o FaceID.',
          );
          return;
        }

        const {keysExist} = await rnBiometrics.biometricKeysExist();

        if (!keysExist) {
          Alert.alert(
            'Biometría no configurada',
            'Debes registrar una huella o FaceID en tu dispositivo para activar esta función.',
          );
          return;
        }

        const result = await rnBiometrics.simplePrompt({
          promptMessage: 'Confirma tu identidad',
        });

        if (!result.success) {
          console.log(
            '[Security] Autenticación fallida, no se activa la biometría.',
          );
          return;
        }

        if (optionId === 'faceId') {
          setFaceIdEnabled(true);
          await saveSecuritySetting('enableFaceIdCheck', true);
        } else if (optionId === 'biometricId') {
          setBiometricIdEnabled(true);
          await saveSecuritySetting('enableBiometricCheck', true);
        }

        console.log('[Security] Biometría activada exitosamente.');
        return;
      } catch (error) {
        console.error('[Security] Error activando biometría:', error);
        return;
      }
    }

    if (!value) {
      try {
        if (optionId === 'faceId') {
          setFaceIdEnabled(false);
          await saveSecuritySetting('enableFaceIdCheck', false);
        } else if (optionId === 'biometricId') {
          setBiometricIdEnabled(false);
          await saveSecuritySetting('enableBiometricCheck', false);
        }

        console.log('[Security] Biometría desactivada.');
      } catch (error) {
        console.error('[Security] Error desactivando biometría:', error);
      }
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
      if (field === 'enableFaceIdCheck') {
        setFaceIdEnabled(!value);
      } else {
        setBiometricIdEnabled(!value);
      }
      console.error(
        '[SecurityScreen] Error al actualizar configuración:',
        error,
      );
    }
  };

  const options: SecurityOption[] = [
    {id: 'faceId', title: 'Face ID', type: 'toggle'},
    {id: 'biometricId', title: 'Biometric ID', type: 'toggle'},
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
                  value={
                    option.id === 'faceId' ? faceIdEnabled : biometricIdEnabled
                  }
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
