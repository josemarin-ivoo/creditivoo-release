import React, {useState, useMemo, useEffect} from 'react';
import {
  View,
  Pressable,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {useToast} from 'react-native-toast-notifications';
import {useNavigation} from '@react-navigation/native';
import {Layout, useTheme} from '@ui-kitten/components';

import {
  verifyOtpUser,
  resendOtpUser,
  sendOtpUser,
} from 'store/slices/auth-slice';
import {AppDispatch, RootState} from 'store/store';
import createStyles from './SignUpScreen.style';
import SignUpHeader from '../components/SignUpHeader';
import PersonalDataStep from '../components/steps/PersonalDataStep';
import PasswordStep from '../components/steps/PasswordStep';
import EmailStep from '../components/steps/EmailStep';
import OtpStep from '../components/steps/OtpStep';
import KycVerificationStep from '../components/steps/KycVerificationStep';
import RegistrationSuccessStep from '../components/steps/RegistrationSuccessStep';
import {useSignUpForm} from '../hooks/useSignUpForm';

const TOTAL_STEPS = 6; // Paso 6 es la pantalla de éxito
const OTP_LENGTH = 6;

const SignUpScreen: React.FC = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState<string>('');
  const [resendCooldown, setResendCooldown] = useState(30);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [otpSent, setOtpSent] = useState(false); // Track si el OTP ya fue enviado
  const [isSendingOtp, setIsSendingOtp] = useState(false); // Track si se está enviando OTP

  const dispatch = useDispatch<AppDispatch>();
  const {isLoading} = useSelector((state: RootState) => state.auth);
  const navigation = useNavigation();
  const toast = useToast();

  const {
    control,
    trigger,
    watch,
    formState: {errors},
  } = useSignUpForm();

  useEffect(() => {
    if (step !== 4) {
      return;
    }
    const timer = setInterval(() => {
      setResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) {
      fieldsToValidate = ['name', 'lastname', 'document'];
    } else if (step === 2) {
      fieldsToValidate = ['password', 'confirmPassword'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid && step < TOTAL_STEPS) {
      const nextStepNumber = step + 1;

      // Limpiar OTP si se sale del paso 4 (OTP)
      if (step === 4) {
        setOtp('');
        setOtpSent(false);
      }

      // Reset email validation cuando se sale del paso 3
      if (step === 3) {
        setIsEmailValid(false);
      }

      setStep(nextStepNumber);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      const prevStepNumber = step - 1;

      // Limpiar OTP si se sale del paso 4 (OTP)
      if (step === 4) {
        setOtp('');
        setOtpSent(false);
        setResendCooldown(0); // Reset cooldown
      }

      // Reset email validation cuando se sale del paso 3
      if (step === 3) {
        setIsEmailValid(false);
      }

      setStep(prevStepNumber);
    } else {
      navigation.goBack();
    }
  };

  // Función para enviar OTP sin registrar (solo paso 3 - email)
  const handleSendOtp = async () => {
    // Deshabilitar botón inmediatamente
    setIsSendingOtp(true);

    try {
      // Evitar enviar OTP si ya fue enviado y hay cooldown activo
      if (otpSent && resendCooldown > 0) {
        toast.show(
          `Espera ${resendCooldown} segundos antes de solicitar otro código`,
          {
            type: 'warning',
            duration: 3000,
            placement: 'top',
          },
        );
        setIsSendingOtp(false);
        return;
      }

      const email = watch('email');
      if (!email) {
        toast.show('Por favor ingresa tu email', {type: 'danger'});
        setIsSendingOtp(false);
        return;
      }

      console.log('[SignUpScreen] Enviando OTP para email:', email);
      const otpResponse = await dispatch(sendOtpUser(email)).unwrap();
      console.log('[SignUpScreen] OTP enviado exitosamente:', otpResponse);

      // Configurar cooldown basado en la respuesta
      if (otpResponse.cooldownSeconds) {
        setResendCooldown(otpResponse.cooldownSeconds);
      } else {
        setResendCooldown(60); // Default 60 segundos
      }

      toast.show('¡Código Enviado!', {
        type: 'success',
        duration: 3000,
        placement: 'top',
      });
      setOtpSent(true); // Marcar que el OTP fue enviado
      setStep(4);
    } catch (err: any) {
      console.error('[SignUpScreen] Error al enviar OTP:', err);

      // Extraer mensaje de error
      let errorMessage = 'Error al enviar el código';
      let cooldownSeconds: number | undefined;

      // Intentar extraer el mensaje del error de diferentes formas
      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      // Extraer cooldown si existe
      if (err?.cooldownSeconds !== undefined) {
        cooldownSeconds = err.cooldownSeconds;
      } else if (err?.response?.data?.cooldownSeconds !== undefined) {
        cooldownSeconds = err.response.data.cooldownSeconds;
      }

      // Manejar cooldown activo
      if (cooldownSeconds !== undefined && cooldownSeconds > 0) {
        setResendCooldown(cooldownSeconds);
        toast.show(
          errorMessage ||
            `Espera ${cooldownSeconds} segundos antes de solicitar otro código`,
          {
            type: 'warning',
            duration: 4000,
            placement: 'top',
          },
        );
      } else {
        // Mostrar el mensaje de error real
        toast.show(errorMessage, {
          type: 'danger',
          duration: 4000,
          placement: 'top',
        });
      }
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== OTP_LENGTH) {
      toast.show('El código debe tener 6 dígitos', {type: 'danger'});
      return;
    }

    const email = watch('email');
    if (!email) {
      toast.show('Email no disponible', {type: 'danger'});
      return;
    }

    try {
      // Verificar el OTP - esto guardará el token en el store
      const result = await dispatch(verifyOtpUser({email, code: otp})).unwrap();

      if (result.verified && result.token) {
        // Token guardado en el store por verifyOtpUser.fulfilled
        toast.show('Código verificado correctamente', {
          type: 'success',
          duration: 2000,
          placement: 'top',
        });

        // Avanzar al paso de KYC verification (paso 5)
        // El token ya está guardado en el store por verifyOtpUser.fulfilled
        setStep(5);
      } else {
        toast.show(result.message || 'Código inválido', {
          type: 'danger',
          duration: 3000,
          placement: 'top',
        });
      }
    } catch (err: any) {
      // Manejar errores con información de expiración
      if (err.expiresAt) {
        toast.show(err.message || 'Código inválido', {
          type: 'danger',
          duration: 3000,
          placement: 'top',
        });
      } else {
        toast.show(err.message || 'Error en la verificación', {
          type: 'danger',
          duration: 3000,
          placement: 'top',
        });
      }
    }
  };

  const handleResend = async () => {
    try {
      const email = watch('email');
      if (!email) {
        toast.show('Email no disponible', {type: 'danger'});
        return;
      }

      const result = await dispatch(resendOtpUser(email)).unwrap();

      // Configurar cooldown basado en la respuesta
      if (result.cooldownSeconds) {
        setResendCooldown(result.cooldownSeconds);
      } else {
        setResendCooldown(60); // Default 60 segundos
      }

      setOtp('');
      toast.show('Código reenviado exitosamente', {
        type: 'success',
        duration: 3000,
        placement: 'top',
      });
    } catch (err: any) {
      // Manejar cooldown activo
      if (err.cooldownSeconds) {
        setResendCooldown(err.cooldownSeconds);
        toast.show(
          err.message ||
            `Espera ${err.cooldownSeconds} segundos antes de reenviar`,
          {
            type: 'warning',
            duration: 3000,
            placement: 'top',
          },
        );
      } else {
        toast.show(err.message || 'Error al reenviar el código', {
          type: 'danger',
          duration: 3000,
          placement: 'top',
        });
      }
    }
  };

  const handleOtpChange = (otpValue: string) => {
    // Solo permitir números y máximo 6 dígitos
    const numericValue = otpValue.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
    setOtp(numericValue);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <PersonalDataStep
            control={control}
            errors={errors}
            trigger={trigger}
            onNext={nextStep}
            isLoading={isLoading}
            styles={styles}
          />
        );
      case 2:
        return (
          <PasswordStep
            control={control}
            errors={errors}
            trigger={trigger}
            onNext={nextStep}
            isLoading={isLoading}
            styles={styles}
          />
        );
      case 3:
        return (
          <EmailStep
            control={control}
            errors={errors}
            onSendOtp={handleSendOtp}
            isEmailValid={isEmailValid}
            isLoading={isSendingOtp}
            styles={styles}
            onEmailValidationChange={setIsEmailValid}
          />
        );
      case 4:
        return (
          <OtpStep
            otp={otp}
            registerEmail={watch('email') || undefined}
            resendCooldown={resendCooldown}
            onOtpChange={handleOtpChange}
            onResend={handleResend}
            onVerify={handleVerifyOtp}
            isLoading={isLoading}
            styles={styles}
          />
        );
      case 5:
        return <KycVerificationStep onNext={nextStep} styles={styles} />;
      case 6:
        return (
          <RegistrationSuccessStep
            formData={{
              name: watch('name') || '',
              lastname: watch('lastname') || '',
              document: watch('document') || '',
              password: watch('password') || '',
              confirmPassword: watch('confirmPassword') || '',
            }}
            styles={styles}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled={Platform.OS === 'ios'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <Layout style={styles.layout}>
          {step !== 6 && (
            <SignUpHeader
              currentStep={step}
              totalSteps={TOTAL_STEPS}
              onBack={prevStep}
            />
          )}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag">
            <Pressable onPress={Keyboard.dismiss} style={styles.container}>
              <View key={step} style={styles.formContainer}>
                {renderStepContent()}
              </View>
            </Pressable>
          </ScrollView>
        </Layout>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUpScreen;
