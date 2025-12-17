import React from 'react';
import {View, TouchableOpacity, Text} from 'react-native';
import {Text as KittenText, useTheme} from '@ui-kitten/components';
import {OtpInput} from 'react-native-otp-entry';
import ButtonK from '../../../../../shared/components/button/ButtonK';

interface OtpStepProps {
  otp: string;
  registerEmail?: string;
  resendCooldown: number;
  onOtpChange: (otp: string) => void;
  onResend: () => void;
  onVerify: () => void;
  isLoading?: boolean;
  styles: any;
}

const OtpStep: React.FC<OtpStepProps> = ({
  otp,
  registerEmail,
  resendCooldown,
  onOtpChange,
  onResend,
  onVerify,
  isLoading = false,
  styles: screenStyles,
}) => {
  const theme = useTheme();
  const isOtpComplete = otp.length === 6;

  return (
    <>
      <KittenText category="h2" style={screenStyles.title}>
        Ingresa el código
      </KittenText>
      <KittenText category="s1" style={screenStyles.subtitle}>
        Te enviamos un código de 6 dígitos a: {registerEmail || ''}
      </KittenText>
      <View style={{marginBottom: 20}}>
        <OtpInput
          numberOfDigits={6}
          onTextChange={onOtpChange}
          focusColor={theme['color-primary-500']}
          focusStickBlinkingDuration={400}
          theme={{
            containerStyle: {
              justifyContent: 'space-between',
              width: '100%',
            },
            pinCodeContainerStyle: {
              width: 48,
              height: 48,
              borderBottomWidth: 2,
              borderColor: '#E0E0E0',
            },
            pinCodeTextStyle: {
              fontSize: 20,
              fontWeight: '500',
              color: theme['text-basic-color'] || '#000000',
            },
            focusedPinCodeContainerStyle: {
              borderColor: theme['color-primary-500'],
              borderBottomWidth: 2,
            },
          }}
          autoFocus
        />
      </View>
      <ButtonK
        style={screenStyles.button}
        onPress={onVerify}
        disabled={isLoading || !isOtpComplete}
        title={isLoading ? 'Verificando...' : 'Verificar'}
      />
      <View style={screenStyles.resendContainer}>
        <Text style={screenStyles.resendText}>¿No recibiste el código? </Text>
        <TouchableOpacity disabled={resendCooldown > 0} onPress={onResend}>
          <Text
            style={[
              screenStyles.resendLink,
              {opacity: resendCooldown > 0 ? 0.5 : 1},
            ]}>
            Reenviar {resendCooldown > 0 ? `(${resendCooldown}s)` : ''}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default OtpStep;
