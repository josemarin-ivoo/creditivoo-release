import React from 'react';
import {Text} from '@ui-kitten/components';
import {Controller, Control, FieldErrors, useWatch} from 'react-hook-form';
// import InputK from '@shared-components/input/InputK';
import InputK from '../../../../../shared/components/input/InputK';
// import ButtonK from '@shared-components/button/ButtonK';
import ButtonK from '../../../../../shared/components/button/ButtonK';
import {SignUpFormData} from '../../hooks/useSignUpForm';
// import {validateEmail} from '@app-services/validations/emailValidation';
import {validateEmail} from '../../../../services/validations/emailValidation';

interface EmailStepProps {
  control: Control<SignUpFormData>;
  errors: FieldErrors<SignUpFormData>;
  onSendOtp: () => void;
  isEmailValid: boolean;
  isLoading?: boolean;
  styles: any;
  onEmailValidationChange?: (isValid: boolean) => void;
}

const EmailStep: React.FC<EmailStepProps> = ({
  control,
  errors,
  onSendOtp,
  isEmailValid,
  isLoading = false,
  styles: screenStyles,
  onEmailValidationChange,
}) => {
  // Observar cambios en el email para validación en tiempo real
  const emailValue = useWatch({
    control,
    name: 'email',
  });

  // Validar email en tiempo real
  React.useEffect(() => {
    if (emailValue) {
      const validation = validateEmail(emailValue, true);
      onEmailValidationChange?.(validation.isValid);
    } else {
      onEmailValidationChange?.(false);
    }
  }, [emailValue, onEmailValidationChange]);

  return (
    <>
      <Text category="h2" style={screenStyles.title}>
        Valida tu correo electrónico
      </Text>
      <Text category="s1" style={screenStyles.subtitle}>
        Te enviaremos un código de verificación a tu dirección email para
        proteger tu cuenta.
      </Text>
      <Controller
        control={control}
        name="email"
        render={({field: {onChange, onBlur, value}}) => (
          <InputK
            containerStyle={screenStyles.input}
            value={value}
            onChangeText={(text) => {
              // Trim automático mientras escribe
              onChange(text.trim());
            }}
            onBlur={(e) => {
              // Trim final al perder el foco
              const trimmed = value?.trim() || '';
              if (trimmed !== value) {
                onChange(trimmed);
              }
              // onBlur(e);
            }}
            placeholder="Correo electrónico"
            status={errors.email ? 'danger' : 'basic'}
            caption={errors.email?.message}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        )}
      />
      <ButtonK
        style={screenStyles.button}
        onPress={() => {
          console.log('[EmailStep] Botón presionado, llamando onSendOtp');
          onSendOtp();
        }}
        disabled={isLoading || !isEmailValid}
        title={isLoading ? 'Enviando...' : 'Enviar código'}
      />
    </>
  );
};

export default EmailStep;

