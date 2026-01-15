import React, {useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  Dimensions,
  BackHandler,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Button} from '../../components';
import RegisterLayout from '../../components/layouts/RegisterLayout';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import {useIvoDispatch, useIvoSelector} from '../../store/hooks';
import {fetchMe} from '../../store/slices/auth-slice';
import {navigationRef} from 'react-navigation-helpers';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const CreditConfirmationScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useIvoDispatch();
  const {isLoggedIn} = useIvoSelector(state => state.auth);
  const {data: creditData} = useIvoSelector(state => state.credit);
  const canNavigateRef = useRef(false);

  const assignedAmount = creditData?.creditAssigned ?? 0;
  const formattedAmount = `USD $${assignedAmount}`;

  // Prevenir navegación hacia atrás desde esta pantalla
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        // Prevenir que el usuario vuelva atrás
        return true;
      },
    );

    // También prevenir navegación con el listener de React Navigation
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      // Si ya se permitió la navegación programática, no prevenir
      if (canNavigateRef.current) {
        return;
      }

      // Verificar si la acción es un "back"
      const action = e.data?.action as any;
      const actionType = action?.type;

      // Solo prevenir acciones de "back" (POP, GO_BACK)
      // Permitir acciones de RESET o NAVIGATE que vienen de navegación programática
      if (actionType === 'POP' || actionType === 'GO_BACK') {
        e.preventDefault();
      }
    });

    return () => {
      backHandler.remove();
      unsubscribe();
    };
  }, [navigation]);

  const handleContinue = async () => {
    console.log('[CreditConfirmationScreen] handleContinue llamado');
    console.log('[CreditConfirmationScreen] isLoggedIn:', isLoggedIn);

    // Permitir navegación programática
    canNavigateRef.current = true;

    // Actualizar la información del usuario (hasActiveCredit, creditLimit, etc.)
    try {
      await dispatch(fetchMe()).unwrap();
      console.log('[CreditConfirmationScreen] fetchMe completado');
    } catch (error) {
      console.error(
        '[CreditConfirmationScreen] Error al refrescar datos del usuario:',
        error,
      );
    }

    // Navegar a MainTabs usando navigationRef
    try {
      if (navigationRef.isReady()) {
        console.log(
          '[CreditConfirmationScreen] Navegando a MainTabs usando navigationRef',
        );
        navigationRef.reset({
          index: 0,
          routes: [{name: 'MainTabs' as never}],
        });
      } else {
        console.warn(
          '[CreditConfirmationScreen] navigationRef no está listo, usando navigation',
        );
        // Fallback: usar navigation normal
        navigation.reset({
          index: 0,
          routes: [{name: 'MainTabs' as never}],
        });
      }
    } catch (navError) {
      console.error('[CreditConfirmationScreen] Error al navegar:', navError);
      // Intentar con navigation normal como último recurso
      try {
        navigation.reset({
          index: 0,
          routes: [{name: 'MainTabs' as never}],
        });
      } catch (fallbackError) {
        console.error(
          '[CreditConfirmationScreen] Error en fallback de navegación:',
          fallbackError,
        );
      }
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
      <Text style={styles.title}>¡Felicidades!</Text>

      <Text style={styles.subtitle}>
        te presentamos tu línea de crédito aprobada por:
      </Text>

      <View style={styles.amountContainer}>
        <Text style={styles.amountText}>{formattedAmount}</Text>
      </View>

      <View style={styles.illustrationContainer}>
        <Image
          source={require('../../images/onboarding/ivitoo-success.png')}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>
    </>
  );

  const bottomAction = <Button onPress={handleContinue} title="Continuar" />;

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
    fontSize: SCREEN_WIDTH * 0.098,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.02,
    width: SCREEN_WIDTH * 0.88,
  },
  subtitle: {
    fontSize: SCREEN_WIDTH * 0.068,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: '#000000',
    textAlign: 'center',
    lineHeight: SCREEN_HEIGHT * 0.035,
    marginBottom: SCREEN_HEIGHT * 0.04,
    width: SCREEN_WIDTH * 0.85,
  },
  amountContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: SCREEN_HEIGHT * 0.01,
    paddingHorizontal: SCREEN_WIDTH * 0.1,
    marginBottom: SCREEN_HEIGHT * 0.04,
    width: SCREEN_WIDTH * 0.75,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d3d3d3',
    justifyContent: 'center',
  },
  amountText: {
    fontSize: SCREEN_WIDTH * 0.08,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
    textAlign: 'center',
  },
  illustrationContainer: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7 * 1.2,
    maxHeight: SCREEN_HEIGHT * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 1,
    marginTop: SCREEN_HEIGHT * 0.02,
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
});

export default CreditConfirmationScreen;
