import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Image, ActivityIndicator} from 'react-native';
import {Text, useTheme} from '@ui-kitten/components';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {useToast} from 'react-native-toast-notifications';
import Config from 'react-native-config';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from 'store/store';
import {completeRegistration} from 'store/slices/auth-slice';
import {useNavigation} from '@react-navigation/native';
import ButtonK from '@shared-components/button/ButtonK';

interface RegistrationSuccessStepProps {
  formData: {
    name: string;
    lastname: string;
    document: string;
    password: string;
    confirmPassword: string;
  };
  styles: any;
}

const RegistrationSuccessStep: React.FC<RegistrationSuccessStepProps> = ({
  formData,
  styles: screenStyles,
}) => {
  const theme = useTheme();
  const toast = useToast();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const {isLoading, isLoggedIn} = useSelector((state: RootState) => state.auth);
  const [logoError, setLogoError] = useState(false);
  const [hasCalledApi, setHasCalledApi] = useState(false);

  useEffect(() => {
    if (!hasCalledApi) {
      setHasCalledApi(true);
      const handleCompleteRegistration = async () => {
        try {
          console.log('[RegistrationSuccessStep] Completando registro...');

          await dispatch(
            completeRegistration({
              password: formData.password,
              confirmationPassword: formData.confirmPassword,
              name: formData.name,
              lastname: formData.lastname,
              document: formData.document,
            }),
          ).unwrap();

          console.log(
            '[RegistrationSuccessStep] Registro completado exitosamente',
          );

          toast.show('¡Registro completado exitosamente!', {
            type: 'success',
            duration: 4000,
            placement: 'top',
          });
        } catch (error: any) {
          console.error('[RegistrationSuccessStep] Error:', error);
          toast.show(error || 'Error al completar el registro', {
            type: 'danger',
            duration: 5000,
            placement: 'top',
          });
        }
      };

      handleCompleteRegistration();
    }
  }, [formData, dispatch, toast, hasCalledApi]);

  // Navegar a Home cuando el login sea exitoso (similar a SignInScreen)
  useEffect(() => {
    if (isLoggedIn) {
      // @ts-ignore
      navigation.replace('Home');
    }
  }, [isLoggedIn, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        {isLoading || !hasCalledApi ? (
          <>
            <View style={styles.logoContainer}>
              {!logoError && Config.LOGO_URL ? (
                <Image
                  source={{uri: Config.LOGO_URL}}
                  style={styles.logo}
                  onError={() => setLogoError(true)}
                  resizeMode="contain"
                />
              ) : (
                <Icon
                  name="dashboard"
                  type={IconType.MaterialIcons}
                  size={100}
                  color={theme['color-primary-500']}
                />
              )}
            </View>

            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={theme['color-primary-500']}
              />
              <Text
                category="s1"
                style={[screenStyles.subtitle, styles.loadingText]}>
                Completando tu registro...
              </Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.successCard}>
              <View style={styles.iconContainer}>
                <View style={styles.successIconWrapper}>
                  <View style={styles.successIconInner}>
                    <Icon
                      name="checkmark"
                      type={IconType.Ionicons}
                      size={60}
                      color="#FFFFFF"
                    />
                  </View>
                </View>
              </View>

              <Text category="h1" style={styles.title}>
                ¡Registro Exitoso!
              </Text>
              <Text category="s1" style={styles.subtitle}>
                Tu cuenta ha sido creada exitosamente.{'\n'}Ya puedes comenzar a
                usar la aplicación.
              </Text>

              <View style={styles.checkmarksContainer}>
                <View style={styles.checkmarkItem}>
                  <View style={styles.checkmarkIcon}>
                    <Icon
                      name="checkmark"
                      type={IconType.Ionicons}
                      size={20}
                      color={theme['color-success-500'] || '#4CAF50'}
                    />
                  </View>
                  <Text category="p2" style={styles.checkmarkText}>
                    Cuenta verificada
                  </Text>
                </View>
                <View style={styles.checkmarkItem}>
                  <View style={styles.checkmarkIcon}>
                    <Icon
                      name="checkmark"
                      type={IconType.Ionicons}
                      size={20}
                      color={theme['color-success-500'] || '#4CAF50'}
                    />
                  </View>
                  <Text category="p2" style={styles.checkmarkText}>
                    Identidad verificada
                  </Text>
                </View>
                <View style={styles.checkmarkItem}>
                  <View style={styles.checkmarkIcon}>
                    <Icon
                      name="checkmark"
                      type={IconType.Ionicons}
                      size={20}
                      color={theme['color-success-500'] || '#4CAF50'}
                    />
                  </View>
                  <Text category="p2" style={styles.checkmarkText}>
                    Listo para usar
                  </Text>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <ButtonK
                  style={styles.button}
                  onPress={() => {
                    // @ts-ignore
                    navigation.replace('Home');
                  }}
                  title="Continuar"
                />
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
  },
  contentWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
  successCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
    width: '100%',
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 8,
    width: '100%',
    fontSize: 16,
    lineHeight: 24,
    color: '#666666',
  },
  checkmarksContainer: {
    width: '100%',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  checkmarkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  checkmarkIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkmarkText: {
    flex: 1,
    fontSize: 15,
    color: '#333333',
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 8,
  },
  button: {
    width: '100%',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    width: '100%',
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 16,
    color: '#666666',
  },
});

export default RegistrationSuccessStep;
