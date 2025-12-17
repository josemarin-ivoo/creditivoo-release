import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import {Text, useTheme} from '@ui-kitten/components';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import ButtonK from '../../../../../shared/components/button/ButtonK';
import {useToast} from 'react-native-toast-notifications';
// import {createKycSession, checkKycStatus} from '@services/api/kyc';
import {createKycSession, checkKycStatus} from '../../../../../services/api/kyc';
import {WebView} from 'react-native-webview';
import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';
import {
  PERMISSIONS,
  RESULTS,
  request,
  check,
  openSettings,
} from 'react-native-permissions';

interface KycVerificationStepProps {
  onNext: () => void;
  styles: any;
}

const KycVerificationStep: React.FC<KycVerificationStepProps> = ({
  onNext: _onNext,
  styles: screenStyles,
}) => {
  const theme = useTheme();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingStatus, setIsVerifyingStatus] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);

  const requestCameraPermission = useCallback(async () => {
    try {
      const cameraPermission =
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.CAMERA
          : PERMISSIONS.IOS.CAMERA;

      // Primero verificar el estado actual del permiso
      const checkResult = await check(cameraPermission);
      console.log('[KycVerificationStep] Estado del permiso:', checkResult);

      if (checkResult === RESULTS.GRANTED) {
        console.log('[KycVerificationStep] Permiso de cámara ya concedido');
        setHasCameraPermission(true);
        return;
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
            },
            {
              text: 'Abrir Configuración',
              onPress: () => {
                openSettings();
              },
            },
          ],
        );
        setHasCameraPermission(false);
        return;
      }

      // Solicitar el permiso
      const requestResult = await request(cameraPermission);
      console.log(
        '[KycVerificationStep] Resultado de solicitud:',
        requestResult,
      );

      if (requestResult === RESULTS.GRANTED) {
        console.log('[KycVerificationStep] Permiso de cámara concedido');
        setHasCameraPermission(true);
      } else if (requestResult === RESULTS.DENIED) {
        console.log('[KycVerificationStep] Permiso de cámara denegado');
        setHasCameraPermission(false);
        toast.show(
          'Se requiere permiso de cámara para continuar con la verificación',
          {
            type: 'warning',
            duration: 4000,
            placement: 'top',
          },
        );
      } else {
        // BLOCKED o UNAVAILABLE
        setHasCameraPermission(false);
        Alert.alert(
          'Permiso de Cámara Requerido',
          'Para continuar con la verificación de identidad, necesitamos acceso a tu cámara. Por favor, otorga el permiso en la configuración de la app.',
          [
            {
              text: 'Cancelar',
              style: 'cancel',
            },
            {
              text: 'Abrir Configuración',
              onPress: () => {
                openSettings();
              },
            },
          ],
        );
      }
    } catch (err) {
      console.warn('[KycVerificationStep] Error al solicitar permiso:', err);
      setHasCameraPermission(false);
    }
  }, [toast]);

  // Solicitar permisos de cámara al llegar a la pantalla
  useFocusEffect(
    useCallback(() => {
      requestCameraPermission();
    }, [requestCameraPermission]),
  );

  const handleVerifyIdentity = async () => {
    // Verificar permisos antes de continuar
    if (!hasCameraPermission) {
      const cameraPermission =
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.CAMERA
          : PERMISSIONS.IOS.CAMERA;

      const checkResult = await check(cameraPermission);
      if (checkResult !== RESULTS.GRANTED) {
        toast.show(
          'Se requiere permiso de cámara para continuar. Por favor, otorga el permiso.',
          {
            type: 'warning',
            duration: 4000,
            placement: 'top',
          },
        );
        await requestCameraPermission();
        return;
      }
      setHasCameraPermission(true);
    }

    try {
      setIsLoading(true);
      console.log('[KycVerificationStep] Creando sesión de verificación');

      const response = await createKycSession();
      console.log('[KycVerificationStep] Sesión creada:', response);

      if (response.verificationUrl) {
        // Mostrar WebView en un modal
        console.log(
          '[KycVerificationStep] URL de verificación:',
          response.verificationUrl,
        );
        setVerificationUrl(response.verificationUrl);
        setShowWebView(true);
      } else {
        throw new Error('No se recibió la URL de verificación');
      }
    } catch (error: any) {
      console.error('[KycVerificationStep] Error:', error);

      // Si el usuario ya está verificado, avanzar directamente sin mostrar error
      if (error.kyc_error_type === 'already_verified') {
        console.log(
          '[KycVerificationStep] Usuario ya verificado, avanzando al siguiente paso',
        );
        setIsLoading(false);
        _onNext();
        return;
      }

      toast.show(error.message || 'Error al iniciar la verificación', {
        type: 'danger',
        duration: 4000,
        placement: 'top',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebViewClose = async () => {
    setShowWebView(false);
    setVerificationUrl(null);

    // Iniciar verificación del estado con 3 intentos
    setIsVerifyingStatus(true);

    const maxAttempts = 3;
    const delayBetweenAttempts = 2000; // 2 segundos

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(
          `[KycVerificationStep] Intento ${attempt}/${maxAttempts} de verificación`,
        );

        const status = await checkKycStatus();

        console.log('[KycVerificationStep] Estado de la verificación:', status);

        if (status.isVerified) {
          console.log('[KycVerificationStep] Verificación exitosa:', status);
          toast.show('Verificación de identidad completada exitosamente', {
            type: 'success',
            duration: 4000,
            placement: 'top',
          });
          setIsVerifyingStatus(false);
          // Avanzar al siguiente paso
          _onNext();
          return;
        }

        // Si no está verificado pero hay un decision, podría ser rechazado
        if (status.decision && status.decision !== 'approved') {
          console.log('[KycVerificationStep] Verificación rechazada:', status);
          toast.show(
            status.decisionReason ||
              'La verificación de identidad no fue aprobada. Por favor, intenta nuevamente.',
            {
              type: 'warning',
              duration: 5000,
              placement: 'top',
            },
          );
          setIsVerifyingStatus(false);
          return;
        }

        // Si no es el último intento, esperar antes del siguiente
        if (attempt < maxAttempts) {
          console.log(
            `[KycVerificationStep] Esperando ${delayBetweenAttempts}ms antes del siguiente intento`,
          );
          await new Promise(resolve =>
            setTimeout(resolve, delayBetweenAttempts),
          );
        }
      } catch (error: any) {
        console.error(
          `[KycVerificationStep] Error en intento ${attempt}:`,
          error,
        );

        // Si es el último intento, mostrar error
        if (attempt === maxAttempts) {
          toast.show(
            error.message ||
              'No se pudo verificar el estado de la verificación. Por favor, intenta nuevamente.',
            {
              type: 'danger',
              duration: 5000,
              placement: 'top',
            },
          );
          setIsVerifyingStatus(false);
          return;
        }

        // Esperar antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
      }
    }

    // Si llegamos aquí, todos los intentos fallaron
    console.log('[KycVerificationStep] Todos los intentos fallaron');
    toast.show(
      'No se pudo verificar el estado de la verificación. Por favor, intenta nuevamente.',
      {
        type: 'warning',
        duration: 5000,
        placement: 'top',
      },
    );
    setIsVerifyingStatus(false);
  };

  const handleWebViewNavigationStateChange = (navState: any) => {
    // Solo logueamos los cambios de navegación para debugging
    console.log('[KycVerificationStep] Navigation state:', navState.url);
    // No avanzamos automáticamente, el usuario debe cerrar el WebView manualmente
  };

  return (
    <>
      <View style={styles.iconContainer}>
        <Icon
          name="shield-checkmark"
          type={IconType.Ionicons}
          size={80}
          color={theme['color-primary-500']}
        />
      </View>
      <Text category="h2" style={screenStyles.title}>
        Verifica tu identidad
      </Text>
      <Text category="s1" style={screenStyles.subtitle}>
        Para proteger tu cuenta y continuar con el proceso, necesitamos
        verificar tu identidad. Este proceso es rápido y seguro.
      </Text>
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Icon
            name="checkmark-circle"
            type={IconType.Ionicons}
            size={24}
            color={theme['color-primary-500']}
            style={styles.infoIcon}
          />
          <Text category="p2" style={styles.infoText}>
            Verificación segura y encriptada
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Icon
            name="time-outline"
            type={IconType.Ionicons}
            size={24}
            color={theme['color-primary-500']}
            style={styles.infoIcon}
          />
          <Text category="p2" style={styles.infoText}>
            Toma solo unos minutos
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Icon
            name="lock-closed-outline"
            type={IconType.Ionicons}
            size={24}
            color={theme['color-primary-500']}
            style={styles.infoIcon}
          />
          <Text category="p2" style={styles.infoText}>
            Tus datos están protegidos
          </Text>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <ButtonK
          style={screenStyles.button}
          onPress={handleVerifyIdentity}
          disabled={isLoading || isVerifyingStatus}
          title={
            isVerifyingStatus
              ? 'Verificando estado...'
              : isLoading
              ? 'Iniciando verificación...'
              : 'Verificar identidad'
          }
        />
      </View>

      <Modal
        visible={showWebView}
        animationType="slide"
        onRequestClose={handleWebViewClose}>
        <View style={styles.webViewContainer}>
          <View style={styles.webViewHeader}>
            <Text category="h6" style={styles.webViewTitle}>
              Verificación de identidad
            </Text>
            <TouchableOpacity
              onPress={handleWebViewClose}
              style={styles.closeButton}>
              <Icon
                name="close"
                type={IconType.Ionicons}
                size={24}
                color={theme['text-basic-color']}
              />
            </TouchableOpacity>
          </View>
          {verificationUrl && (
            <WebView
              source={{uri: verificationUrl}}
              style={styles.webView}
              onNavigationStateChange={handleWebViewNavigationStateChange}
              startInLoadingState
            />
          )}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  infoContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: 'auto',
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  webViewTitle: {
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  webView: {
    flex: 1,
  },
});

export default KycVerificationStep;
