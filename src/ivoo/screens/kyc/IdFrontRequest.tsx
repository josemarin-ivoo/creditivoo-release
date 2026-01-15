import React, {useCallback, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  Dimensions,
  Alert,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import {launchCamera, CameraOptions} from 'react-native-image-picker';
import {Button} from '../../components';
import RegisterLayout from '../../components/layouts/RegisterLayout';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import {uploadDocumentFront, getUploadStatus} from '../../services/kyc';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const IdFrontRequest: React.FC = () => {
  const navigation = useNavigation();
  const [isUploading, setIsUploading] = useState(false);

  const requestCameraPermission = useCallback(async () => {
    try {
      const cameraPermission =
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.CAMERA
          : PERMISSIONS.IOS.CAMERA;

      const checkResult = await check(cameraPermission);

      if (checkResult === RESULTS.GRANTED) {
        return true;
      }

      if (
        checkResult === RESULTS.BLOCKED ||
        checkResult === RESULTS.UNAVAILABLE
      ) {
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
      console.warn('[IdFrontRequest] Error al solicitar permiso:', err);
      return false;
    }
  }, [navigation]);

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      return;
    }

    const options: CameraOptions = {
      mediaType: 'photo',
      cameraType: 'back',
      quality: 0.8,
      maxWidth: 1200,
      maxHeight: 1200,
      saveToPhotos: false,
    };

    try {
      const response = await launchCamera(options);

      if (response.didCancel) {
        // Usuario canceló, no hacer nada
        return;
      }

      if (response.errorCode) {
        Alert.alert(
          'Error',
          'Error al tomar la foto. Por favor, intenta de nuevo.',
        );
        return;
      }

      const uri = response.assets?.[0]?.uri;
      if (uri) {
        // Subir la imagen automáticamente
        await handleUploadImage(uri);
      }
    } catch (error) {
      console.error('[IdFrontRequest] Error al capturar foto:', error);
      Alert.alert(
        'Error',
        'Error al procesar la imagen. Por favor, intenta de nuevo.',
      );
    }
  };

  const handleUploadImage = async (imageUri: string) => {
    setIsUploading(true);
    try {
      // Obtener kycId del estado antes de subir
      const status = await getUploadStatus();
      const kycId = status.kycId;

      await uploadDocumentFront(imageUri, kycId);
      Alert.alert('Éxito', 'Documento frontal subido correctamente', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      console.error('[IdFrontRequest] Error al subir imagen:', error);
      Alert.alert('Error', error.message || 'Error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const content = (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="always"
      showsVerticalScrollIndicator={false}
      bounces={true}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../images/creditivo-logo-full.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {isUploading ? (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="large" color={IVOO_COLORS.primary} />
          <Text style={styles.uploadingText}>Subiendo imagen...</Text>
        </View>
      ) : (
        <>
          <Text style={styles.title}>Validación de identidad</Text>

          <Text style={styles.instruction}>
            Coloca de frente tu cédula o identificación dentro del cuadrante
          </Text>

          <View style={styles.idCardContainer}>
            <Image
              source={require('../../images/kyc/front-id-placeholder.png')}
              style={styles.idCardImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.lightInstruction}>
            Asegúrate de que haya buena luz.{'\n'}
            Evita reflejos y sombras
          </Text>
        </>
      )}

      {/* Button */}
      <View style={styles.buttonContainer}>
        <Button
          onPress={handleTakePhoto}
          title={isUploading ? 'Subiendo...' : 'Tomar foto'}
          disabled={isUploading}
        />
      </View>
    </ScrollView>
  );

  return (
    <>
      <RegisterLayout contentPaddingTop={0} logo={null} bottomAction={null}>
        {content}
      </RegisterLayout>
    </>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    marginTop: 0,
    marginBottom: SCREEN_HEIGHT * 0.04,
    alignItems: 'center',
  },
  logo: {
    width: SCREEN_WIDTH * 0.72,
    height: SCREEN_WIDTH * 0.72 * 0.154,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    width: '100%',
    paddingTop: 0,
  },

  title: {
    fontSize: SCREEN_WIDTH * 0.07,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
    textAlign: 'center',
    marginTop: SCREEN_HEIGHT * 0.015,
    marginBottom: SCREEN_HEIGHT * 0.01,
    width: SCREEN_WIDTH * 0.9,
  },

  instruction: {
    fontSize: SCREEN_WIDTH * 0.042,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.regular,
    color: '#6E717C',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.03,
    width: SCREEN_WIDTH * 0.75,
    alignSelf: 'center',
  },

  idCardContainer: {
    width: SCREEN_WIDTH * 0.68,
    height: SCREEN_WIDTH * 0.68 * 1.35,
    maxHeight: SCREEN_HEIGHT * 0.32,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: SCREEN_HEIGHT * 0.04,
  },
  idCardImage: {
    width: '100%',
    height: '100%',
  },

  lightInstruction: {
    fontSize: SCREEN_WIDTH * 0.042,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.regular,
    color: '#6E717C',
    lineHeight: SCREEN_HEIGHT * 0.03,
    textAlign: 'center',
    width: SCREEN_WIDTH * 0.75,
    alignSelf: 'center',
  },
  uploadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: SCREEN_HEIGHT * 0.2,
  },
  uploadingText: {
    marginTop: SCREEN_WIDTH * 0.04,
    fontSize: SCREEN_WIDTH * 0.042,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.textSecondary,
  },
  buttonContainer: {
    width: SCREEN_WIDTH * 0.75,
    maxWidth: 302,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: SCREEN_HEIGHT * 0.05,
  },
});

export default IdFrontRequest;
