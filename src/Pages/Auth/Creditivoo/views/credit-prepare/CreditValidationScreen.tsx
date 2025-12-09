import React from 'react';
import {View, StyleSheet, Text, Image, Dimensions} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Button} from '../../components';
import RegisterLayout from '../../components/layouts/RegisterLayout';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const CreditValidationScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleContinue = () => {
    (navigation as any).navigate('CreditConfirmation');
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
      <Text style={styles.title}>¡Estamos validando tu{'\n'}información!</Text>

      <Text style={styles.subtitle}>
        Danos unos minutos, estamos corriendo para diseñar la línea de crédito
      </Text>

      <Text style={styles.subtitleBold}>
        ideal{'\u00A0'}para{'\u00A0'}ti ✨
      </Text>

      <View style={styles.illustrationContainer}>
        <Image
          source={require('../../images/credit-prepare/ivitoo-prepare.png')}
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
    fontSize: SCREEN_WIDTH * 0.068,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.03,
    width: SCREEN_WIDTH * 0.88,
  },
  subtitle: {
    fontSize: SCREEN_WIDTH * 0.044,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.regular,
    color: '#6E717C',
    textAlign: 'center',
    lineHeight: SCREEN_HEIGHT * 0.025,
    marginBottom: SCREEN_HEIGHT * 0.02,
    width: SCREEN_WIDTH * 0.8,
  },
  subtitleBold: {
    fontSize: SCREEN_WIDTH * 0.055,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: '#6E717C',
    textAlign: 'center',
    marginTop: SCREEN_HEIGHT * 0.002,
    marginBottom: SCREEN_HEIGHT * 0.02,
    width: SCREEN_WIDTH * 0.8,
  },
  illustrationContainer: {
    width: SCREEN_WIDTH * 0.56,
    height: SCREEN_WIDTH * 0.56 * 1.2,
    maxHeight: SCREEN_HEIGHT * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 1,
    marginTop: SCREEN_HEIGHT * 0.07,
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
});

export default CreditValidationScreen;
