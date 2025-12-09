import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  Linking,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Button, Input, Checkbox} from '../../components';
import RegisterLayout from '../../components/layouts/RegisterLayout';
import {IVOO_COLORS, IVOO_SPACING, IVOO_TYPOGRAPHY} from '../../styles';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const EmailInputScreen: React.FC = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [acceptPolicy, setAcceptPolicy] = useState(false);

  const handleContinue = () => {
    console.log('handleContinue called', {email, acceptPolicy});
    if (!email.trim()) {
      console.log('Email is empty');
      // TODO: Show error message
      return;
    }
    if (!acceptPolicy) {
      console.log('Policy not accepted');
      // TODO: Show error message
      return;
    }
    // TODO: Send email verification code
    console.log('Navigating to EmailOTPVerification with email:', email);
    try {
      (navigation as any).navigate('EmailOTPVerification', {
        email: email.trim(),
      });
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handlePolicyPress = () => {
    // TODO: Open commercial policy
    Linking.openURL('https://ivoo.app/commercial-policy');
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
      <Text style={styles.title}>Ingresa tu correo</Text>

      <Text style={styles.subtitle}>
        Te enviaremos a tu correo electrónico con un código de 6 dígitos para
        validarlo 📩
      </Text>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.formArea}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <Input
          placeholder="ivitoo@gmail.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          containerStyle={styles.inputWrapper}
        />

        <View style={styles.policyContainer}>
          <Checkbox
            checked={acceptPolicy}
            onToggle={() => setAcceptPolicy(!acceptPolicy)}
            style={styles.checkbox}
            size={18}
          />
          <Text style={styles.policyText}>
            Autorizo el uso de mi correo electrónico según la politicas de{' '}
            <Text style={styles.policyLink} onPress={handlePolicyPress}>
              fines comerciales de IVOO APP.
            </Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
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
    fontSize: SCREEN_WIDTH * 0.063,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.01,
    width: SCREEN_WIDTH * 0.92,
  },
  subtitle: {
    fontSize: SCREEN_WIDTH * 0.042,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: '300',
    color: '#676464',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.03,
    width: SCREEN_WIDTH * 0.85,
  },
  formArea: {
    width: SCREEN_WIDTH * 0.75, // Same width as RegisterScreen
    alignItems: 'center',
    flexShrink: 1,
  },
  inputWrapper: {
    width: '100%',
  },
  policyContainer: {
    flexDirection: 'row',
    marginTop: SCREEN_HEIGHT * 0.03,
    width: SCREEN_WIDTH * 0.75, // Same width as formArea
    flexShrink: 1,
  },
  checkbox: {
    marginRight: SCREEN_WIDTH * 0.024,
    marginTop: 2,
  },
  policyText: {
    flex: 1,
    fontSize: SCREEN_WIDTH * 0.032,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: '#828282',
  },
  policyLink: {
    textDecorationLine: 'underline',
    color: '#828282',
  },
  continueButton: {},
});

export default EmailInputScreen;
