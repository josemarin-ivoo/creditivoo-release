import React, {useCallback, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import {Button} from '../../components';
import RegisterLayout from '../../components/layouts/RegisterLayout';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const IdentityVerificator: React.FC = () => {
  const navigation = useNavigation();
  const [selectedItem, setSelectedItem] = useState<
    'front' | 'back' | 'selfie' | null
  >(null);

  const requestCameraPermission = useCallback(async () => {
    try {
      const cameraPermission =
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.CAMERA
          : PERMISSIONS.IOS.CAMERA;

      // Primero verificar el estado actual del permiso
      const checkResult = await check(cameraPermission);

      if (checkResult === RESULTS.GRANTED) {
        return true;
      }

      if (
        checkResult === RESULTS.BLOCKED ||
        checkResult === RESULTS.UNAVAILABLE
      ) {
        // El permiso está bloqueado o no disponible, abrir configuración
        Alert.alert(
          'Permiso de Cámara Requerido',
          'Para continuar con la verificación de identidad, necesitamos acceso a tu cámara. Por favor, otorga el permiso en la configuración de la app.',
          [
            {
              text: 'Cancelar',
              style: 'cancel',
              onPress: () => {
                navigation.goBack();
              },
            },
            {
              text: 'Abrir Configuración',
              onPress: () => {
                openSettings();
              },
            },
          ],
        );
        return false;
      }

      // Solicitar el permiso
      const requestResult = await request(cameraPermission);

      if (requestResult === RESULTS.GRANTED) {
        return true;
      } else {
        Alert.alert(
          'Permiso de Cámara Requerido',
          'Para continuar con la verificación de identidad, necesitamos acceso a tu cámara. Por favor, otorga el permiso en la configuración de la app.',
          [
            {
              text: 'Cancelar',
              style: 'cancel',
              onPress: () => {
                navigation.goBack();
              },
            },
            {
              text: 'Abrir Configuración',
              onPress: () => {
                openSettings();
              },
            },
          ],
        );
        return false;
      }
    } catch (err) {
      console.warn('[IdentityVerificator] Error al solicitar permiso:', err);
      return false;
    }
  }, [navigation]);

  const handlePhotoItemPress = (type: 'front' | 'back' | 'selfie') => {
    // Solo marcar el item como seleccionado, no navegar
    setSelectedItem(type);
  };

  const handleContinue = async () => {
    if (!selectedItem) {
      return;
    }

    const hasPermission = await requestCameraPermission();
    if (hasPermission) {
      // Navegar a la pantalla correspondiente según el item seleccionado
      if (selectedItem === 'front') {
        (navigation as any).navigate('IdFrontRequest');
      } else if (selectedItem === 'back') {
        (navigation as any).navigate('IdBackRequest');
      } else if (selectedItem === 'selfie') {
        (navigation as any).navigate('SelfieRequest');
      }
    } else {
      // Si no se otorga el permiso, deseleccionar el item
      setSelectedItem(null);
    }
  };

  const getIllustrationSource = () => {
    if (selectedItem === 'selfie') {
      return require('../../images/kyc/scan-face.png');
    } else if (selectedItem === 'back') {
      return require('../../images/kyc/scan-id-back.png');
    } else {
      // front o null
      return require('../../images/kyc/scan-id.png');
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
      <Text style={styles.title}>Validación de identidad</Text>
      <Text style={styles.subtitle}>
        Para validar tu identidad, necesitaremos que tomes unas fotos a tu
        cédula y una selfie
      </Text>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.formArea}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        {/* Frente de la cédula */}
        <TouchableOpacity
          style={[
            styles.photoItem,
            selectedItem === 'front' && styles.photoItemActive,
          ]}
          onPress={() => handlePhotoItemPress('front')}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.photoItemText,
              selectedItem === 'front' && styles.photoItemTextActive,
            ]}>
            Frente de la cédula
          </Text>
        </TouchableOpacity>

        {/* Reverso de la cédula */}
        <TouchableOpacity
          style={[
            styles.photoItem,
            selectedItem === 'back' && styles.photoItemActive,
          ]}
          onPress={() => handlePhotoItemPress('back')}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.photoItemText,
              selectedItem === 'back' && styles.photoItemTextActive,
            ]}>
            Reverso de la cédula
          </Text>
        </TouchableOpacity>

        {/* Selfie */}
        <TouchableOpacity
          style={[
            styles.photoItem,
            selectedItem === 'selfie' && styles.photoItemActive,
          ]}
          onPress={() => handlePhotoItemPress('selfie')}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.photoItemText,
              selectedItem === 'selfie' && styles.photoItemTextActive,
            ]}>
            Selfie
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>

      <View style={styles.illustrationContainer}>
        <Image
          source={getIllustrationSource()}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>
    </>
  );

  const bottomAction = (
    <Button
      onPress={handleContinue}
      title="Continuar"
      style={styles.continueButton}
      disabled={!selectedItem}
    />
  );

  return (
    <>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <RegisterLayout
        contentPaddingTop={SCREEN_HEIGHT * 0.04}
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
    fontSize: SCREEN_WIDTH * 0.064,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.015,
    width: SCREEN_WIDTH * 0.88,
  },
  subtitle: {
    fontSize: SCREEN_WIDTH * 0.041,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.regular,
    lineHeight: SCREEN_HEIGHT * 0.025,
    color: '#6E717C',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.06,
    width: SCREEN_WIDTH * 0.88,
    paddingHorizontal: SCREEN_WIDTH * 0.02,
  },
  formArea: {
    width: SCREEN_WIDTH * 0.75,
    alignItems: 'center',
    flexShrink: 1,
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  photoItem: {
    width: '100%',
    height: SCREEN_WIDTH * 0.14,
    backgroundColor: '#F9FAFC',
    borderWidth: 1,
    borderColor: 'rgba(110, 113, 124, 0.31)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    marginBottom: SCREEN_WIDTH * 0.04,
  },
  photoItemActive: {
    borderColor: IVOO_COLORS.primary,
    backgroundColor: '#F0F8FF',
  },
  photoItemText: {
    fontSize: SCREEN_WIDTH * 0.037,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.regular,
    color: 'rgba(110, 113, 124, 0.7)',
  },
  photoItemTextActive: {
    color: IVOO_COLORS.primary,
  },
  illustrationContainer: {
    width: SCREEN_WIDTH * 0.55,
    height: SCREEN_WIDTH * 0.55 * 0.8,
    maxHeight: SCREEN_HEIGHT * 0.2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SCREEN_HEIGHT * 0.02,
    flexShrink: 1,
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  continueButton: {},
});

export default IdentityVerificator;
