import React, {useState} from 'react';
import {View, StyleSheet, Text, Image, Dimensions} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Button} from '../../components';
import RegisterLayout from '../../components/layouts/RegisterLayout';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import {confirmTransactionPayment} from '../../services/credit';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const PurchaseSuccessScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const purchaseId = (route.params as any)?.purchaseId as number;
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!purchaseId) {
      console.error('[PurchaseSuccess] No purchaseId provided');
      // Navegar de todas formas
      navigation.reset({
        index: 0,
        routes: [{name: 'MainTabs' as never}],
      });
      return;
    }

    try {
      setIsLoading(true);
      // Llamar al endpoint provisional para confirmar la transacción
      await confirmTransactionPayment(purchaseId);
      console.log('[PurchaseSuccess] Transacción confirmada exitosamente');
    } catch (error: any) {
      console.error('[PurchaseSuccess] Error al confirmar transacción:', error);
      // Continuar de todas formas, ya que esto es provisional
    } finally {
      setIsLoading(false);
      // Navegar a MainTabs
      navigation.reset({
        index: 0,
        routes: [{name: 'MainTabs' as never}],
      });
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
      <Text style={styles.title}>¡Felicitaciones!</Text>

      <Text style={styles.subtitle}>Tu compra ha sido exitosa</Text>

      <View style={styles.illustrationContainer}>
        <Image
          source={require('../../images/onboarding/ivitoo-success.png')}
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
      disabled={isLoading}
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
    marginBottom: SCREEN_HEIGHT * 0.03,
    width: SCREEN_WIDTH * 0.85,
  },
  illustrationContainer: {
    width: SCREEN_WIDTH * 0.56,
    height: SCREEN_WIDTH * 0.56 * 1.375,
    maxHeight: SCREEN_HEIGHT * 0.35,
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

export default PurchaseSuccessScreen;


