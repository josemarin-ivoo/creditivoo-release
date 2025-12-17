import React from 'react';
import {Text} from '@ui-kitten/components';
import {
  Controller,
  Control,
  FieldErrors,
  UseFormTrigger,
} from 'react-hook-form';
import InputK from '../../../../../shared/components/input/InputK';
import ButtonK from '../../../../../shared/components/button/ButtonK';
import {SignUpFormData} from '../../hooks/useSignUpForm';

interface PersonalDataStepProps {
  control: Control<SignUpFormData>;
  errors: FieldErrors<SignUpFormData>;
  trigger: UseFormTrigger<SignUpFormData>;
  onNext: () => void;
  isLoading?: boolean;
  styles: any;
}

const PersonalDataStep: React.FC<PersonalDataStepProps> = ({
  control,
  errors,
  trigger,
  onNext,
  isLoading = false,
  styles: screenStyles,
}) => {
  const handleNext = async () => {
    const isValid = await trigger(['name', 'lastname', 'document']);
    if (isValid) {
      onNext();
    }
  };

  return (
    <>
      <Text category="h2" style={screenStyles.title}>
        Primero, tus datos
      </Text>
      <Text category="s1" style={screenStyles.subtitle}>
        Completa los campos para crear tu perfil de usuario.
      </Text>
      <Controller
        control={control}
        name="name"
        render={({field: {onChange, onBlur, value}}) => (
          <InputK
            containerStyle={screenStyles.input}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Nombre"
            status={errors.name ? 'danger' : 'basic'}
            caption={errors.name?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="lastname"
        render={({field: {onChange, onBlur, value}}) => (
          <InputK
            containerStyle={screenStyles.input}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Apellido"
            status={errors.lastname ? 'danger' : 'basic'}
            caption={errors.lastname?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="document"
        render={({field: {onChange, onBlur, value}}) => (
          <InputK
            containerStyle={screenStyles.input}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Cédula de identidad"
            status={errors.document ? 'danger' : 'basic'}
            caption={errors.document?.message}
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

export default PersonalDataStep;
