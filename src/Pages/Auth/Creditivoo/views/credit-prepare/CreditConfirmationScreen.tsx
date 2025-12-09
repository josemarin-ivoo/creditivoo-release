import React from 'react';
import {View, StyleSheet, Text, Image, Dimensions} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Button} from '../../components';
import RegisterLayout from '../../components/layouts/RegisterLayout';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import {SCREENS} from '@shared-constants';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const CreditConfirmationScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleContinue = () => {
    (navigation as any).navigate(SCREENS.HOME);
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
        <Text style={styles.amountText}>USD $800</Text>
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
