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

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const SubscriptionSuccessScreen: React.FC = () => {
  const navigation = useNavigation();
  const canNavigateRef = useRef(false);

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

  const handleContinue = () => {
    // Marcar que permitimos la navegación programática
    canNavigateRef.current = true;
    // Navegar a MainTabs limpiando el stack
    navigation.reset({
      index: 0,
      routes: [{name: 'MainTabs' as never}],
    });
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

      <Text style={styles.subtitle}>Ya eres miembro</Text>

      <Text style={styles.plusText}>PLUS</Text>

      <View style={styles.illustrationContainer}>
        <Image
          source={require('../../images/onboarding/ivitoo-success-plus.png')}
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
    />
  );

  return (
    <>
      <RegisterLayout
        contentPaddingTop={SCREEN_HEIGHT * 0.09}
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
    fontSize: SCREEN_WIDTH * 0.085,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    lineHeight: SCREEN_HEIGHT * 0.05,
    letterSpacing: SCREEN_WIDTH * 0.0016,
    color: IVOO_COLORS.black,
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.01,
    width: SCREEN_WIDTH * 0.92,
  },
  subtitle: {
    fontSize: SCREEN_WIDTH * 0.053,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.regular,
    lineHeight: SCREEN_HEIGHT * 0.028,
    letterSpacing: SCREEN_WIDTH * 0.0016,
    color: IVOO_COLORS.black,
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.01,
    width: SCREEN_WIDTH * 0.85,
  },
  plusText: {
    fontSize: SCREEN_WIDTH * 0.053,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    lineHeight: SCREEN_HEIGHT * 0.028,
    letterSpacing: SCREEN_WIDTH * 0.0016,
    color: IVOO_COLORS.black,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: SCREEN_HEIGHT * 0.03,
    width: SCREEN_WIDTH * 0.85,
  },
  illustrationContainer: {
    width: SCREEN_WIDTH * 0.75,
    height: SCREEN_WIDTH * 0.75 * 1.375,
    maxHeight: SCREEN_HEIGHT * 0.45,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SCREEN_HEIGHT * 0.022,
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  continueButton: {},
});

export default SubscriptionSuccessScreen;
