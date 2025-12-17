import React from 'react';
import {Text} from '@ui-kitten/components';
import {Controller, Control, FieldErrors, UseFormTrigger} from 'react-hook-form';
import InputK from '../../../../../shared/components/input/InputK';
import ButtonK from '../../../../../shared/components/button/ButtonK';
import PasswordRequirements from '@components/password-requirements/PasswordRequirements';
import {SignUpFormData} from '../../hooks/useSignUpForm';

interface PasswordStepProps {
  control: Control<SignUpFormData>;
  errors: FieldErrors<SignUpFormData>;
  trigger: UseFormTrigger<SignUpFormData>;
  onNext: () => void;
  isLoading?: boolean;
  styles: any;
}

const PasswordStep: React.FC<PasswordStepProps> = ({
  control,
  errors,
  trigger,
  onNext,
  isLoading = false,
  styles: screenStyles,
}) => {
  const handleNext = async () => {
    const isValid = await trigger(['password', 'confirmPassword']);
    if (isValid) {
      onNext();
    }
  };

  return (
    <>
      <Text category="h2" style={screenStyles.title}>
        Crea tu contraseña
      </Text>
      <Text category="s1" style={screenStyles.subtitle}>
        Crea una contraseña segura siguiendo los requisitos a continuación.
      </Text>
      <Controller
        control={control}
        name="password"
        render={({field: {onChange, onBlur, value}}) => (
          <>
            <InputK
              key="password-input"
              containerStyle={screenStyles.input}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Contraseña"
              isPassword
              status={errors.password ? 'danger' : 'basic'}
              caption={errors.password?.message}
            />
            <PasswordRequirements password={value || ''} />
          </>
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        render={({field: {onChange, onBlur, value}}) => (
          <InputK
            key="confirm-password-input"
            containerStyle={screenStyles.input}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Confirmar contraseña"
            isPassword
            status={errors.confirmPassword ? 'danger' : 'basic'}
            caption={errors.confirmPassword?.message}
          />
        )}
      />
      <ButtonK
        style={screenStyles.button}
        onPress={handleNext}
        disabled={isLoading}
        title={isLoading ? 'Cargando...' : 'Siguiente'}
      />
    </>
  );
};

export default PasswordStep;

