import React, {useCallback, useState, useEffect} from 'react';
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
  ActivityIndicator,
  Modal,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
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
import {
  getUploadStatus,
  verifyDocuments,
  resetKyc,
  UploadStatusResponse,
} from '../../services/kyc';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const IdentityVerificator: React.FC = () => {
  const navigation = useNavigation();
  const [selectedItem, setSelectedItem] = useState<
    'front' | 'back' | 'selfie' | null
  >(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatusResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Cargar estado de KYC al montar y cuando la pantalla recibe foco
  const loadUploadStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const status = await getUploadStatus();
      setUploadStatus(status);
    } catch (error: any) {
      console.error('[IdentityVerificator] Error al cargar estado:', error);
      Alert.alert('Error', error.message || 'Error al cargar el estado de KYC');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUploadStatus();
  }, [loadUploadStatus]);

  // Recargar estado cuando la pantalla recibe foco (después de volver de cámara)
  useFocusEffect(
    useCallback(() => {
      loadUploadStatus();
    }, [loadUploadStatus]),
  );

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
    // Si ya está verificado, no permitir seleccionar nada
    if (uploadStatus?.isVerified === true) {
      return;
    }
    // Solo marcar el item como seleccionado, no navegar
    setSelectedItem(type);
  };

  const handleContinue = async () => {
    // Si ya está verificado, navegar directamente a PersonalInfoForm
    if (uploadStatus?.isVerified === true) {
      (navigation as any).navigate('PersonalInfoForm');
      return;
    }

    // Si hay error (verificación fallida), ejecutar reset
    if (shouldShowError()) {
      await handleReset();
      return;
    }

    // Si puede verificar, ejecutar verificación
    if (uploadStatus?.canVerify && !uploadStatus?.isVerified) {
      await handleVerify();
      return;
    }

    // Si no hay item seleccionado, no hacer nada
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

  const handleVerify = async () => {
    if (!uploadStatus?.canVerify) {
      return;
    }

    setIsVerifying(true);
    try {
      const kycId = uploadStatus?.kycId;
      const result = await verifyDocuments(kycId);

      // Siempre recargar el estado después de la verificación para obtener información actualizada
      await loadUploadStatus();

      if (result.isVerified && result.status === 'APPROVED') {
        Alert.alert('Éxito', 'Tu identidad ha sido verificada exitosamente', [
          {
            text: 'OK',
            onPress: () => {
              // Navegar a PersonalInfoForm después de verificación exitosa
              (navigation as any).navigate('PersonalInfoForm');
            },
          },
        ]);
      } else {
        // Verificación fallida - el estado ya se recargó con la información de error
        Alert.alert(
          'Verificación fallida',
          result.message ||
            'La verificación no fue exitosa. Por favor, intenta de nuevo.',
          [
            {
              text: 'OK',
              onPress: () => {
                // El estado ya se recargó, solo cerrar el alert
                // Los errores ya deberían estar visibles en rojo
              },
            },
          ],
        );
      }
    } catch (error: any) {
      console.error('[IdentityVerificator] Error al verificar:', error);
      // Recargar estado incluso si hay error para obtener información actualizada
      await loadUploadStatus();
      Alert.alert('Error', error.message || 'Error al verificar documentos');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReset = async () => {
    Alert.alert(
      'Reintentar proceso',
      '¿Estás seguro de que deseas reiniciar el proceso de verificación?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Reintentar',
          onPress: async () => {
            setIsResetting(true);
            try {
              console.log('[IdentityVerificator] Reseteando KYC...');
              await resetKyc(false); // No eliminar archivos de S3
              console.log('[IdentityVerificator] KYC reseteado exitosamente');
              // Recargar estado después del reset
              await loadUploadStatus();
              Alert.alert(
                'Éxito',
                'El proceso ha sido reiniciado. Por favor, sube nuevamente tus documentos.',
              );
            } catch (error: any) {
              console.error(
                '[IdentityVerificator] Error al resetear KYC:',
                error,
              );
              Alert.alert(
                'Error',
                error.message ||
                  'Error al reiniciar el proceso de verificación',
              );
            } finally {
              setIsResetting(false);
            }
          },
        },
      ],
    );
  };

  /**
   * Determina si debe mostrarse el estado de error basado en la lógica de validación
   * Mostrar error solo cuando:
   * 1. Ya fue enviado a Didit (hasBeenSentToDidit === true)
   * 2. No está verificado (isVerified === false)
   * 3. La verificación realmente falló (DECLINED/REJECTED/FAILED)
   */
  const shouldShowError = (): boolean => {
    if (!uploadStatus) {
      return false;
    }

    const verificationResults = uploadStatus.verificationResults;

    // 1. Debe haber sido enviado a Didit
    if (!verificationResults?.hasBeenSentToDidit) {
      return false; // No mostrar error si aún no fue enviado
    }

    // 2. No debe estar verificado
    if (uploadStatus.isVerified === true) {
      return false; // No mostrar error si está verificado
    }

    // 3. Verificar que realmente falló (no está pendiente)
    const verificationStatus = uploadStatus.verificationStatus?.toUpperCase();
    const isDeclined =
      verificationStatus === 'DECLINED' ||
      verificationStatus === 'REJECTED' ||
      verificationStatus === 'FAILED';

    // 4. Verificar resultados específicos de Didit
    const idVerification = verificationResults.idVerification;
    const faceMatch = verificationResults.faceMatch;

    // Si tiene resultados completos de Didit, verificar esos
    if (idVerification?.completed || faceMatch?.completed) {
      const idStatus = idVerification?.status?.toUpperCase();
      const faceStatus = faceMatch?.status?.toUpperCase();

      // Error si ID verification falló
      const idFailed = idVerification?.completed && idStatus === 'DECLINED';

      // Error si Face Match falló (declined o score bajo)
      const faceFailed =
        faceMatch?.completed &&
        (faceStatus === 'DECLINED' ||
          (faceMatch.score !== null && faceMatch.score < 70));

      // Mostrar error si alguna verificación falló
      if (idFailed || faceFailed) {
        return true;
      }
    }

    // Si no hay resultados detallados pero el status general es DECLINED
    if (isDeclined) {
      return true;
    }

    return false;
  };

  const isItemInError = () => {
    return shouldShowError();
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
            selectedItem === 'front' &&
              !uploadStatus?.isVerified &&
              styles.photoItemActive,
            uploadStatus?.steps['document-front'].completed &&
              !isItemInError() &&
              styles.photoItemCompleted,
            isItemInError() && styles.photoItemError,
            uploadStatus?.isVerified === true && styles.photoItemCompleted,
          ]}
          onPress={() => handlePhotoItemPress('front')}
          activeOpacity={0.7}
          disabled={
            uploadStatus?.isVerified === true ||
            (uploadStatus?.steps['document-front'].completed &&
              !isItemInError())
          }>
          <View style={styles.photoItemContent}>
            <Text
              style={[
                styles.photoItemText,
                selectedItem === 'front' &&
                  !uploadStatus?.isVerified &&
                  styles.photoItemTextActive,
                uploadStatus?.steps['document-front'].completed &&
                  !isItemInError() &&
                  styles.photoItemTextCompleted,
                isItemInError() && styles.photoItemTextError,
                uploadStatus?.isVerified === true &&
                  styles.photoItemTextCompleted,
              ]}>
              Frente de la cédula
            </Text>
            {((uploadStatus?.steps['document-front'].completed &&
              !isItemInError()) ||
              uploadStatus?.isVerified === true) && (
              <Icon
                name="checkmark-circle"
                type={IconType.Ionicons}
                size={24}
                color={IVOO_COLORS.success || '#4CAF50'}
              />
            )}
            {isItemInError() && (
              <Icon
                name="close-circle"
                type={IconType.Ionicons}
                size={24}
                color="#F44336"
              />
            )}
          </View>
        </TouchableOpacity>

        {/* Reverso de la cédula */}
        <TouchableOpacity
          style={[
            styles.photoItem,
            selectedItem === 'back' &&
              !uploadStatus?.isVerified &&
              styles.photoItemActive,
            uploadStatus?.steps['document-back'].completed &&
              !isItemInError() &&
              styles.photoItemCompleted,
            isItemInError() && styles.photoItemError,
            uploadStatus?.isVerified === true && styles.photoItemCompleted,
          ]}
          onPress={() => handlePhotoItemPress('back')}
          activeOpacity={0.7}
          disabled={
            uploadStatus?.isVerified === true ||
            (uploadStatus?.steps['document-back'].completed && !isItemInError())
          }>
          <View style={styles.photoItemContent}>
            <Text
              style={[
                styles.photoItemText,
                selectedItem === 'back' &&
                  !uploadStatus?.isVerified &&
                  styles.photoItemTextActive,
                uploadStatus?.steps['document-back'].completed &&
                  !isItemInError() &&
                  styles.photoItemTextCompleted,
                isItemInError() && styles.photoItemTextError,
                uploadStatus?.isVerified === true &&
                  styles.photoItemTextCompleted,
              ]}>
              Reverso de la cédula
            </Text>
            {((uploadStatus?.steps['document-back'].completed &&
              !isItemInError()) ||
              uploadStatus?.isVerified === true) && (
              <Icon
                name="checkmark-circle"
                type={IconType.Ionicons}
                size={24}
                color={IVOO_COLORS.success || '#4CAF50'}
              />
            )}
            {isItemInError() && (
              <Icon
                name="close-circle"
                type={IconType.Ionicons}
                size={24}
                color="#F44336"
              />
            )}
          </View>
        </TouchableOpacity>

        {/* Selfie */}
        <TouchableOpacity
          style={[
            styles.photoItem,
            selectedItem === 'selfie' &&
              !uploadStatus?.isVerified &&
              styles.photoItemActive,
            uploadStatus?.steps.selfie.completed &&
              !isItemInError() &&
              styles.photoItemCompleted,
            isItemInError() && styles.photoItemError,
            uploadStatus?.isVerified === true && styles.photoItemCompleted,
          ]}
          onPress={() => handlePhotoItemPress('selfie')}
          activeOpacity={0.7}
          disabled={
            uploadStatus?.isVerified === true ||
            (uploadStatus?.steps.selfie.completed && !isItemInError())
          }>
          <View style={styles.photoItemContent}>
            <Text
              style={[
                styles.photoItemText,
                selectedItem === 'selfie' &&
                  !uploadStatus?.isVerified &&
                  styles.photoItemTextActive,
                uploadStatus?.steps.selfie.completed &&
                  !isItemInError() &&
                  styles.photoItemTextCompleted,
                isItemInError() && styles.photoItemTextError,
                uploadStatus?.isVerified === true &&
                  styles.photoItemTextCompleted,
              ]}>
              Selfie
            </Text>
            {((uploadStatus?.steps.selfie.completed && !isItemInError()) ||
              uploadStatus?.isVerified === true) && (
              <Icon
                name="checkmark-circle"
                type={IconType.Ionicons}
                size={24}
                color={IVOO_COLORS.success || '#4CAF50'}
              />
            )}
            {isItemInError() && (
              <Icon
                name="close-circle"
                type={IconType.Ionicons}
                size={24}
                color="#F44336"
              />
            )}
          </View>
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

  const getButtonTitle = () => {
    // Si ya está verificado, mostrar continuar
    if (uploadStatus?.isVerified === true) {
      return 'Continuar';
    }
    // Si hay error (verificación fallida), mostrar botón de reintentar
    if (shouldShowError()) {
      return 'Reintentar proceso';
    }
    // Si puede verificar, mostrar botón de verificar
    if (uploadStatus?.canVerify && !uploadStatus?.isVerified) {
      return 'Verificar';
    }
    return 'Continuar';
  };

  const isButtonDisabled = () => {
    // Si está reseteando, deshabilitar
    if (isResetting) {
      return true;
    }
    // Si ya está verificado, siempre habilitado para continuar
    if (uploadStatus?.isVerified === true) {
      return false;
    }
    // Si hay error, siempre habilitado para reintentar
    if (shouldShowError()) {
      return false;
    }
    // Si puede verificar, siempre habilitado para verificar
    if (uploadStatus?.canVerify && !uploadStatus?.isVerified) {
      return false;
    }
    return !selectedItem;
  };

  const bottomAction = (
    <Button
      onPress={handleContinue}
      title={isResetting ? 'Reiniciando...' : getButtonTitle()}
      style={StyleSheet.flatten([styles.continueButton])}
      disabled={isButtonDisabled() || isLoading || isResetting}
    />
  );

  return (
    <>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <RegisterLayout
        contentPaddingTop={SCREEN_HEIGHT * 0.04}
        logo={logo}
        bottomAction={bottomAction}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={IVOO_COLORS.primary} />
          </View>
        ) : (
          content
        )}
      </RegisterLayout>

      {/* Modal de verificación */}
      <Modal
        visible={isVerifying}
        transparent
        animationType="fade"
        onRequestClose={() => {}}>
        <View style={styles.verificationModal}>
          <View style={styles.verificationModalContent}>
            <ActivityIndicator size="large" color={IVOO_COLORS.primary} />
            <Text style={styles.verificationModalText}>
              Verificando documentos...
            </Text>
            <Text style={styles.verificationModalSubtext}>
              Esto puede tardar entre 30 y 60 segundos
            </Text>
          </View>
        </View>
      </Modal>
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
  continueButton: {
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#000000',
          shadowOffset: {width: 0, height: 0},
          shadowOpacity: 0,
          shadowRadius: 0,
        }
      : {
          elevation: 0,
        }),
  },
  photoItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  photoItemCompleted: {
    backgroundColor: '#E8F5E9',
    borderColor: IVOO_COLORS.success || '#4CAF50',
  },
  photoItemTextCompleted: {
    color: IVOO_COLORS.success || '#4CAF50',
  },
  photoItemError: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
  },
  photoItemTextError: {
    color: '#F44336',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: SCREEN_HEIGHT * 0.4,
  },
  loadingText: {
    marginTop: SCREEN_WIDTH * 0.04,
    fontSize: SCREEN_WIDTH * 0.042,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.textSecondary,
  },
  verificationModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verificationModalContent: {
    backgroundColor: IVOO_COLORS.white,
    borderRadius: 12,
    padding: SCREEN_WIDTH * 0.08,
    alignItems: 'center',
    width: SCREEN_WIDTH * 0.8,
    maxWidth: 400,
  },
  verificationModalText: {
    marginTop: SCREEN_WIDTH * 0.05,
    fontSize: SCREEN_WIDTH * 0.048,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.textPrimary,
    textAlign: 'center',
  },
  verificationModalSubtext: {
    marginTop: SCREEN_WIDTH * 0.03,
    fontSize: SCREEN_WIDTH * 0.037,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default IdentityVerificator;
