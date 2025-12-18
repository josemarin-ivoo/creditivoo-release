import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useFocusEffect} from '@react-navigation/native';

import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';

import {Camera} from 'react-native-camera-kit';

type OnReadCodeData = {
  nativeEvent: {
    codeStringValue: string;
    codeFormat: string;
  };
};

import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import CurvedHeaderLayout from '../../components/layouts/CurvedHeaderLayout';
import {AlertModal} from '../../components';
import {revisionQr} from '../../services/credit';
import {useIvoSelector, useIvoDispatch} from '../../../../../redux/useIvo';
import {setCurrentPurchase} from '../../store-creditivoo/purchase-slice';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const QrScanner: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useIvoDispatch();
  const [hasPermission, setHasPermission] = useState(false);
  const [scannedContent, setScannedContent] = useState<string | null>(null);
  const [lastScannedTime, setLastScannedTime] = useState<number>(0);
  const [lastScannedValue, setLastScannedValue] = useState<string | null>(null);
  const [cameraKey, setCameraKey] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Usar refs para mantener valores actuales en el callback
  const lastScannedValueRef = useRef<string | null>(null);
  const lastScannedTimeRef = useRef<number>(0);
  const scannedContentRef = useRef<string | null>(null);

  // Sincronizar refs con estado
  useEffect(() => {
    lastScannedValueRef.current = lastScannedValue;
    lastScannedTimeRef.current = lastScannedTime;
    scannedContentRef.current = scannedContent;
  }, [lastScannedValue, lastScannedTime, scannedContent]);

  // Función para procesar el QR válido
  const processValidQr = useCallback(
    async (qrValue: string) => {
      try {
        setIsProcessing(true);
        console.log('[QrScanner] Llamando al endpoint de revisión');

        const response = await revisionQr();

        console.log('[QrScanner] Respuesta del endpoint:', response);

        // Verificar que el status sea IN_REVIEW
        if (response.status === 'IN_REVIEW') {
          console.log(
            '[QrScanner] Revisión exitosa, guardando purchase en store',
          );
          // Guardar la purchase en el store (sobrescribe la anterior)
          dispatch(setCurrentPurchase(response));
          console.log('[QrScanner] Purchase guardada en store:', response);
          setIsProcessing(false);
          (navigation as any).navigate('PlanGroupSelection', {
            qrContent: qrValue,
          });
        } else {
          console.log(
            '[QrScanner] Revisión no exitosa - Status:',
            response.status,
          );
          setIsProcessing(false);
          setAlertMessage(
            'La compra no está en estado de revisión. Por favor, verifica el estado de tu orden.',
          );
          setAlertVisible(true);
        }
      } catch (error: any) {
        console.error('[QrScanner] Error al procesar QR:', error);
        setIsProcessing(false);

        // Verificar si es error 404
        if (error.response?.status === 404) {
          setAlertMessage('La orden no fue encontrada');
          setAlertVisible(true);
        } else {
          setAlertMessage(
            error.message || 'Ocurrió un error al procesar el código QR',
          );
          setAlertVisible(true);
        }
      }
    },
    [navigation, dispatch],
  );

  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
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
          'Necesitamos acceso a tu cámara para escanear el código QR. Por favor, otorga el permiso en la configuración de la app.',
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
          'Necesitamos acceso a tu cámara para escanear el código QR. Por favor, otorga el permiso en la configuración de la app.',
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
      console.warn('[QrScanner] Error al solicitar permiso:', err);
      return false;
    }
  }, [navigation]);

  useEffect(() => {
    const init = async () => {
      const granted = await requestCameraPermission();
      setHasPermission(granted);
    };
    init();
  }, [requestCameraPermission]);

  // Resetear estado cuando la pantalla recibe foco (cuando vuelve de otra pantalla)
  useFocusEffect(
    useCallback(() => {
      // Resetear el estado para permitir escanear de nuevo
      console.log('[QrScanner] Reseteando estado al recibir foco');
      setScannedContent(null);
      setLastScannedTime(0);
      setLastScannedValue(null);
      // También resetear los refs inmediatamente
      lastScannedValueRef.current = null;
      lastScannedTimeRef.current = 0;
      scannedContentRef.current = null;
      // Forzar remount del componente Camera para reactivar el escaneo
      setCameraKey(prev => prev + 1);

      // Cleanup: no hacer nada al desmontar
      return () => {};
    }, []),
  );

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            Solicitando permiso de cámara...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <CurvedHeaderLayout
        title=""
        showBackButton
        onBackPress={() => navigation.goBack()}
        scroll={false}>
        <View style={styles.content}>
          <Image
            source={require('../../images/creditivo-logo-full.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.instruction} numberOfLines={1}>
            Coloca el código QR en el lector
          </Text>

          <View style={styles.qrContainer}>
            <View style={styles.scanArea}>
              <Camera
                key={cameraKey}
                scanBarcode
                onReadCode={(event: OnReadCodeData) => {
                  const currentTime = Date.now();
                  const qrValue = event.nativeEvent.codeStringValue;

                  // Validar que el QR sea exactamente https://www.ivoo.com/
                  const VALID_QR_URL = 'https://www.ivoo.com/';
                  const isValidQr = qrValue === VALID_QR_URL;

                  // Usar refs para obtener valores actuales
                  const currentLastScannedValue = lastScannedValueRef.current;
                  const currentLastScannedTime = lastScannedTimeRef.current;

                  console.log('[QrScanner] onReadCode llamado:', {
                    qrValue,
                    isValidQr,
                    currentLastScannedValue,
                    currentLastScannedTime,
                  });

                  // Si el QR no es válido, solo mostrar el contenido pero no navegar
                  if (!isValidQr) {
                    console.log(
                      '[QrScanner] QR no válido, solo mostrando contenido',
                    );
                    setScannedContent(qrValue);
                    scannedContentRef.current = qrValue;
                    return;
                  }

                  // Si el estado fue reseteado (lastScannedValue es null), siempre permitir escanear
                  if (currentLastScannedValue === null) {
                    console.log(
                      '[QrScanner] Estado reseteado, procesando escaneo',
                    );
                    setLastScannedTime(currentTime);
                    setLastScannedValue(qrValue);
                    setScannedContent(qrValue);
                    // Actualizar refs inmediatamente
                    lastScannedTimeRef.current = currentTime;
                    lastScannedValueRef.current = qrValue;
                    scannedContentRef.current = qrValue;
                    console.log('[QR]', qrValue);

                    // Procesar el QR válido llamando al endpoint
                    processValidQr(qrValue);
                    return;
                  }

                  // Debounce: solo bloquear si es el mismo QR y han pasado menos de 500ms
                  const isSameQr = qrValue === currentLastScannedValue;
                  const timeSinceLastScan =
                    currentTime - currentLastScannedTime;

                  console.log('[QrScanner] Verificando debounce:', {
                    isSameQr,
                    timeSinceLastScan,
                    shouldBlock: isSameQr && timeSinceLastScan < 500,
                  });

                  if (isSameQr && timeSinceLastScan < 500) {
                    console.log('[QrScanner] Bloqueado por debounce');
                    return;
                  }

                  // Procesar el escaneo
                  console.log('[QrScanner] Procesando escaneo');
                  setLastScannedTime(currentTime);
                  setLastScannedValue(qrValue);
                  setScannedContent(qrValue);
                  // Actualizar refs
                  lastScannedTimeRef.current = currentTime;
                  lastScannedValueRef.current = qrValue;
                  scannedContentRef.current = qrValue;

                  console.log('[QR]', qrValue);

                  // Procesar el QR válido llamando al endpoint
                  processValidQr(qrValue);
                }}
                showFrame={false}
                laserColor="transparent"
                frameColor="transparent"
                style={StyleSheet.absoluteFill}
              />

              {/* Esquinas del marco */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>

          {/* Overlay de loading */}
          {isProcessing && (
            <Modal
              transparent
              visible={isProcessing}
              animationType="fade"
              onRequestClose={() => {}}>
              <View style={styles.loadingOverlay}>
                <View style={styles.loadingContent}>
                  <ActivityIndicator size="large" color={IVOO_COLORS.primary} />
                  <Text style={styles.loadingOverlayText}>
                    Procesando código QR...
                  </Text>
                </View>
              </View>
            </Modal>
          )}
        </View>
      </CurvedHeaderLayout>

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
  safeArea: {flex: 1, backgroundColor: IVOO_COLORS.white},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: SCREEN_WIDTH * 0.042,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.textSecondary || '#6E717C',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SCREEN_HEIGHT * 0.02,
    paddingBottom: SCREEN_WIDTH * 0.18,
  },
  logo: {
    width: SCREEN_WIDTH * 0.5,
    height: SCREEN_WIDTH * 0.5 * 0.16,
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  instruction: {
    fontSize: SCREEN_WIDTH * 0.042,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.primary,
    marginBottom: SCREEN_HEIGHT * 0.04,
    textAlign: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.1,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  scanArea: {
    width: SCREEN_WIDTH * 0.75,
    height: SCREEN_WIDTH * 0.75,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    shadowColor: IVOO_COLORS.primary,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderWidth: 4,
    borderColor: IVOO_COLORS.primary,
    zIndex: 10,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 25,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 25,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 25,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 25,
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    backgroundColor: IVOO_COLORS.white,
    borderRadius: 16,
    padding: SCREEN_WIDTH * 0.08,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: SCREEN_WIDTH * 0.6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingOverlayText: {
    marginTop: SCREEN_HEIGHT * 0.02,
    fontSize: SCREEN_WIDTH * 0.04,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.textSecondary || '#6E717C',
    textAlign: 'center',
  },
});

export default QrScanner;
