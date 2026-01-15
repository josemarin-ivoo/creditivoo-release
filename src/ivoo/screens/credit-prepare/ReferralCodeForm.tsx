import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Button, Input} from '../../components';
import RegisterLayout from '../../components/layouts/RegisterLayout';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const ReferralCodeForm: React.FC = () => {
  const navigation = useNavigation();
  const [friendCode, setFriendCode] = useState('');
  const [advisorCode, setAdvisorCode] = useState('');

  const handleContinue = () => {
    // Navegar a la pantalla de validación de crédito
    (navigation as any).navigate('CreditValidation');
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
      <Text style={styles.title}>Código de referidos</Text>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.formContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        {/* Código de amigo/familiar */}
        <View style={styles.codeSection}>
          <Text style={styles.instruction}>
            Ingresa el código si algún amigo o familiar te contó de nosotros:
          </Text>
          <Input
            value={friendCode}
            onChangeText={setFriendCode}
            placeholder="IV00123456"
            style={styles.input}
            containerStyle={styles.inputContainer}
          />
        </View>

        {/* Código de asesor */}
        <View style={styles.codeSection}>
          <Text style={styles.instruction}>
            Ingresa el código si uno de nuestros asesores te ayudo en tu
            solicitud:
          </Text>
          <Input
            value={advisorCode}
            onChangeText={setAdvisorCode}
            placeholder="ASESORIVOOPRINCIPAL"
            style={styles.input}
            containerStyle={styles.inputContainer}
          />
        </View>
      </KeyboardAvoidingView>
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
    fontSize: SCREEN_WIDTH * 0.064,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.04,
    width: SCREEN_WIDTH * 0.88,
  },
  formContainer: {
    width: SCREEN_WIDTH * 0.75,
    alignItems: 'center',
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
    justifyContent: 'flex-start',
  },
  codeSection: {
    width: '100%',
    marginBottom: SCREEN_HEIGHT * 0.04,
    alignItems: 'center',
  },
  instruction: {
    fontSize: SCREEN_WIDTH * 0.039,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.regular,
    color: '#6E717C',
    marginBottom: SCREEN_HEIGHT * 0.03,
    lineHeight: SCREEN_HEIGHT * 0.025,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.065,
  },
  input: {
    fontSize: SCREEN_WIDTH * 0.04,
  },
});

export default ReferralCodeForm;
