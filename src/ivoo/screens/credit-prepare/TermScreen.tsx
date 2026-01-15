import React, {useState, useRef, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  Image,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
  View,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import {Button} from '../../components';
import RegisterLayout from '../../components/layouts/RegisterLayout';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import {getActiveTermsAndConditions} from '../../services/terms';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const TermScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [termsText, setTermsText] = useState<string>('');
  const [termsTitle, setTermsTitle] = useState<string>(
    'Términos y Condiciones\ncontrato con Creditivoo',
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar si viene del ProfileScreen
  const fromProfile = (route.params as any)?.fromProfile || false;

  const fetchTerms = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('[TermScreen] Obteniendo términos y condiciones activos');
      const data = await getActiveTermsAndConditions();
      console.log('[TermScreen] Términos y condiciones obtenidos:', data);
      setTermsText(data.mainText || '');
      if (data.mainTitle) {
        setTermsTitle(data.mainTitle);
      }
    } catch (err: any) {
      console.error(
        '[TermScreen] Error al obtener términos y condiciones:',
        err,
      );
      setError(err.message || 'Error al cargar los términos y condiciones');
      // Mantener el texto por defecto en caso de error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTerms();
    }, [fetchTerms]),
  );

  const handleSignContract = () => {
    if (fromProfile) {
      // Si viene del ProfileScreen, volver atrás
      navigation.goBack();
    } else {
      // Navegar a la pantalla de datos personales
      (navigation as any).navigate('PersonalInfoForm');
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
    const isAtBottom =
      contentOffset.y + layoutMeasurement.height >= contentSize.height - 10; // 10px de margen de error

    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    } else if (!isAtBottom && hasScrolledToBottom) {
      setHasScrolledToBottom(false);
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
      <Text style={styles.title}>{termsTitle}</Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={IVOO_COLORS.primary} />
          <Text style={styles.loadingText}>
            Cargando términos y condiciones...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          style={styles.termsContainer}
          contentContainerStyle={styles.termsContent}
          showsVerticalScrollIndicator={true}
          onScroll={handleScroll}
          scrollEventThrottle={16}>
          <Text style={styles.termsText}>{termsText}</Text>
        </ScrollView>
      )}
    </>
  );

  const bottomAction = (
    <Button
      onPress={handleSignContract}
      title={fromProfile ? 'Listo' : 'Firmar contrato'}
      disabled={fromProfile ? false : !hasScrolledToBottom}
      style={{
        opacity: fromProfile ? 1 : hasScrolledToBottom ? 1 : 0.4,
      }}
    />
  );

  return (
    <>
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
    marginBottom: SCREEN_HEIGHT * 0.03,
    width: SCREEN_WIDTH * 0.88,
  },
  termsContainer: {
    width: SCREEN_WIDTH * 0.78,
    maxHeight: SCREEN_HEIGHT * 0.9,
    flex: 1,
    alignSelf: 'center',
  },
  termsContent: {
    paddingHorizontal: SCREEN_WIDTH * 0.02,
    paddingBottom: SCREEN_HEIGHT * 0.04,
  },
  termsText: {
    fontSize: SCREEN_WIDTH * 0.037,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.regular,
    color: '#6E717C',
    lineHeight: SCREEN_HEIGHT * 0.025,
    textAlign: 'left',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.1,
  },
  loadingText: {
    marginTop: SCREEN_HEIGHT * 0.02,
    fontSize: SCREEN_WIDTH * 0.04,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.grayMedium,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.1,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
  },
  errorText: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: '#E74C3C',
    textAlign: 'center',
  },
});

export default TermScreen;
