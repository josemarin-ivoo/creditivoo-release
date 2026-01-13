import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  Button,
  Input,
  AlertModal,
  GooglePlacesAutocomplete,
  ProfessionSelector,
} from '../../components';
import RegisterLayout from '../../components/layouts/RegisterLayout';
import type {GooglePlaceAddress} from '../../components/GooglePlacesAutocomplete';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import {useIvoSelector, useIvoDispatch} from '../../../../../redux/useIvo';
import {updateUserProfile, fetchMe} from '../../store-creditivoo/slices/auth-slice';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Helper function to convert ISO date string to DD/MM/YYYY
const formatDateToDDMMYYYY = (
  dateString: string | null | undefined,
): string => {
  if (!dateString) {
    return '';
  }
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '';
    }
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '';
  }
};

// Helper function to parse DD/MM/YYYY to Date object (no longer used but kept for potential future use)
// const parseDateFromDDMMYYYY = (dateString: string): Date | null => {
//   if (!dateString || dateString.length !== 10) {
//     return null;
//   }
//   try {
//     const [day, month, year] = dateString.split('/');
//     return new Date(
//       parseInt(year, 10),
//       parseInt(month, 10) - 1,
//       parseInt(day, 10),
//     );
//   } catch {
//     return null;
//   }
// };

// Helper function to convert backend gender (male/female) to display format (Masculino/Femenino)
const formatGenderForDisplay = (gender: string | null | undefined): string => {
  if (!gender) {
    return '';
  }
  const lowerGender = gender.toLowerCase();
  if (lowerGender === 'male' || lowerGender === 'masculino') {
    return 'Masculino';
  }
  if (lowerGender === 'female' || lowerGender === 'femenino') {
    return 'Femenino';
  }
  return gender; // Return as is if not recognized
};

const PersonalInfoFormScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useIvoDispatch();
  const {user, isLoading} = useIvoSelector((state: any) => state.creditivoo.auth);

  // Verificar si viene del ProfileScreen
  const fromProfile = (route.params as any)?.fromProfile || false;

  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    fechaNacimiento: '',
    direccion: '',
    genero: '',
    profesion: '',
  });

  const Ocupaciones = [
  { label: 'Profesional independiente', value: 'Profesional independiente' },
  { label: 'Negocio Propio', value: 'Negocio Propio' },
  { label: 'Emprendedor', value: 'Emprendedor' },
  { label: 'Estudiante', value: 'estudiante' },
  { label: 'Freelance', value: 'Freelance' },
  { label: 'Jubilado', value: 'Jubilado' },
  { label: 'Pensionado', value: 'Pensionado' },
  { label: 'Ama de Casa', value: 'Ama de Casa' },
  { label: 'Desempleado', value: 'Desempleado' },

];

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Pre-fill form data from Redux store
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Si no viene del profile, obtener datos del endpoint /auth/me
        if (!fromProfile) {
          await dispatch(fetchMe()).unwrap();
        }
      } catch (error) {
        console.error('[PersonalInfoFormScreen] Error al cargar datos:', error);
      }
    };

    loadUserData();
  }, [dispatch, fromProfile]);

  // Pre-fill form data from Redux store
  useEffect(() => {
    if (user) {
      const dobFormatted = formatDateToDDMMYYYY(user.dob || null);

      setFormData({
        nombres: user.name || '',
        apellidos: user.lastname || '',
        fechaNacimiento: dobFormatted,
        direccion: user.address || '',
        genero: formatGenderForDisplay(user.gender),
        profesion: user.profession || '',
      });
    }
  }, [user]);

  const handleConfirm = async () => {
    // Actualizar dirección y profesión
    try {
      await dispatch(
        updateUserProfile({
          address: formData.direccion.trim() || undefined,
          profession: formData.profesion.trim() || undefined,
        }),
      ).unwrap();

      if (fromProfile) {
        // Volver atrás después de actualizar si viene del profile
        navigation.goBack();
      } else {
        // Navegar a la pantalla de código de referidos si viene del flujo de KYC
        (navigation as any).navigate('ReferralCodeForm');
      }
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        'Error al guardar los datos. Por favor, intenta de nuevo.';
      setAlertMessage(errorMessage);
      setAlertVisible(true);
    }
  };

  // Validar que los campos requeridos estén llenos
  const isFormValid = () => {
    // Dirección y profesión son requeridas
    return formData.direccion.trim() !== '' && formData.profesion.trim() !== '';
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
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Datos personales</Text>
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>
            Verifica y confirma tus datos personales 😉
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}>
          {/* Nombres */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Nombres</Text>
            <View style={styles.disabledContainer}>
              <Input
                value={formData.nombres}
                onChangeText={text => setFormData({...formData, nombres: text})}
                placeholder="Ingresa tus nombres"
                style={styles.input}
                containerStyle={styles.inputContainer}
                editable={false}
              />
            </View>
          </View>

          {/* Apellidos */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Apellidos</Text>
            <View style={styles.disabledContainer}>
              <Input
                value={formData.apellidos}
                onChangeText={text =>
                  setFormData({...formData, apellidos: text})
                }
                placeholder="Ingresa tus apellidos"
                style={styles.input}
                containerStyle={styles.inputContainer}
                editable={false}
              />
            </View>
          </View>

          {/* Fecha de nacimiento */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Fecha de nacimiento</Text>
            <View style={[styles.dateInputContainer, styles.disabledContainer]}>
              <Input
                value={formData.fechaNacimiento}
                editable={false}
                placeholder="DD/MM/YYYY"
                style={styles.input}
                containerStyle={styles.inputContainer}
              />
            </View>
          </View>

          {/* Dirección */}
          <View style={[styles.fieldContainer, styles.addressFieldContainer]}>
            <Text style={styles.label}>Dirección *</Text>
            <GooglePlacesAutocomplete
              value={formData.direccion}
              onChangeText={text => setFormData({...formData, direccion: text})}
              onSelectAddress={(address: GooglePlaceAddress) => {
                setFormData({...formData, direccion: address.description});
              }}
              placeholder="Buscar dirección..."
            />
          </View>

          {/* Género */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Género</Text>
            <View
              style={[styles.genderInputContainer, styles.disabledContainer]}>
              <Input
                value={formData.genero}
                editable={false}
                placeholder="Género"
                style={styles.input}
                containerStyle={styles.inputContainer}
              />
            </View>
          </View>

          {/* Profesión */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Ocupacion * </Text>
            <ProfessionSelector
              value={formData.profesion} 
              data={Ocupaciones}        
              onSelect={profession =>
                setFormData({...formData, profesion: profession})
              }
              placeholder="Selecciona tu profesión"
              containerStyle={styles.inputContainer}
              error={!formData.profesion && formData.direccion !== ''}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );

  const bottomAction = (
    <Button
      onPress={handleConfirm}
      title={isLoading ? 'Guardando...' : 'Confirmar'}
      disabled={isLoading || !isFormValid()}
      style={styles.confirmButton}
    />
  );

  return (
    <>
      <RegisterLayout
        contentPaddingTop={SCREEN_HEIGHT * 0.06}
        logo={logo}
        bottomAction={bottomAction}>
        {content}
      </RegisterLayout>

      {/* Alert Modal */}
      <AlertModal
        visible={alertVisible}
        title="Error"
        message={alertMessage}
        type="error"
        onClose={() => setAlertVisible(false)}
        buttonText="OK"
      />
    </>
  );
};

const styles = StyleSheet.create({
  logo: {
    width: SCREEN_WIDTH * 0.72,
    height: SCREEN_WIDTH * 0.72 * 0.154,
  },
  headerContainer: {
    width: SCREEN_WIDTH * 0.88,
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.064,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.regular,
    color: '#6E717C',
    textAlign: 'center',
  },
  editIcon: {
    marginLeft: SCREEN_WIDTH * 0.02,
  },
  editIconText: {
    fontSize: SCREEN_WIDTH * 0.04,
  },
  formContainer: {
    width: SCREEN_WIDTH * 0.79,
    alignItems: 'center',
    marginTop: SCREEN_HEIGHT * 0.02,
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
    justifyContent: 'flex-start',
  },
  scrollView: {
    width: '100%',
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SCREEN_HEIGHT * 0.02,
  },
  fieldContainer: {
    width: '100%',
    marginBottom: SCREEN_HEIGHT * 0.015,
    alignItems: 'flex-start',
  },
  addressFieldContainer: {
    zIndex: 1500,
    elevation: 1500,
  },
  label: {
    fontSize: SCREEN_WIDTH * 0.037,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.regular,
    color: '#6E717C',
    marginBottom: SCREEN_HEIGHT * 0.008,
  },
  inputContainer: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.065,
  },
  input: {
    fontSize: SCREEN_WIDTH * 0.04,
    paddingRight: SCREEN_WIDTH * 0.12,
  },
  dateInputContainer: {
    width: '100%',
    position: 'relative',
  },
  calendarIcon: {
    position: 'absolute',
    right: SCREEN_WIDTH * 0.04,
    top: SCREEN_HEIGHT * 0.02,
    zIndex: 1,
  },
  calendarIconText: {
    fontSize: SCREEN_WIDTH * 0.045,
  },
  genderInputContainer: {
    width: '100%',
    position: 'relative',
  },
  chevronIcon: {
    position: 'absolute',
    right: SCREEN_WIDTH * 0.04,
    top: SCREEN_HEIGHT * 0.02,
    zIndex: 1,
  },
  bottomSheetContent: {
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingTop: SCREEN_HEIGHT * 0.02,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.02,
    paddingBottom: SCREEN_HEIGHT * 0.015,
    borderBottomWidth: 1,
    borderBottomColor: IVOO_COLORS.grayLight,
  },
  modalTitle: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    paddingVertical: SCREEN_HEIGHT * 0.01,
  },
  genderOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.02,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    marginBottom: SCREEN_HEIGHT * 0.01,
    borderRadius: 8,
    backgroundColor: IVOO_COLORS.grayLight,
  },
  genderOptionSelected: {
    backgroundColor: IVOO_COLORS.primary + '15',
    borderWidth: 1,
    borderColor: IVOO_COLORS.primary,
  },
  genderOptionText: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.textPrimary,
  },
  genderOptionTextSelected: {
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.primary,
  },
  confirmButton: {
    shadowColor: 'transparent',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  disabledContainer: {
    opacity: 0.6,
    width: '100%',
  },
});

export default PersonalInfoFormScreen;
