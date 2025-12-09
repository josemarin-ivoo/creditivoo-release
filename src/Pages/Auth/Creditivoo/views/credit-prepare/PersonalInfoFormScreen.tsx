import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';
import {Button, Input} from '../../components';
import RegisterLayout from '../../components/layouts/RegisterLayout';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const PersonalInfoFormScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Verificar si viene del ProfileScreen
  const fromProfile = (route.params as any)?.fromProfile || false;

  const [formData, setFormData] = useState({
    nombres: 'Gabriela',
    apellidos: 'Perez',
    fechaNacimiento: '08/10/1994',
    direccion: 'Caracas',
    genero: 'Femenino',
  });

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(1994, 9, 8));

  const handleDateConfirm = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    setFormData({
      ...formData,
      fechaNacimiento: `${day}/${month}/${year}`,
    });
    setSelectedDate(date);
    setIsDatePickerOpen(false);
  };

  const handleConfirm = () => {
    if (fromProfile) {
      // Si viene del ProfileScreen, volver atrás
      navigation.goBack();
    } else {
      // Navegar a la pantalla de código de referidos
      (navigation as any).navigate('ReferralCodeForm');
    }
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.formContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        {/* Nombres */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Nombres</Text>
          <Input
            value={formData.nombres}
            onChangeText={text => setFormData({...formData, nombres: text})}
            style={styles.input}
            containerStyle={styles.inputContainer}
          />
        </View>

        {/* Apellidos */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Apellidos</Text>
          <Input
            value={formData.apellidos}
            onChangeText={text => setFormData({...formData, apellidos: text})}
            style={styles.input}
            containerStyle={styles.inputContainer}
          />
        </View>

        {/* Fecha de nacimiento */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Fecha de nacimiento</Text>
          <TouchableOpacity
            onPress={() => setIsDatePickerOpen(true)}
            style={styles.dateInputContainer}>
            <Input
              value={formData.fechaNacimiento}
              editable={false}
              style={styles.input}
              containerStyle={styles.inputContainer}
            />
            <View style={styles.calendarIcon}>
              <Text style={styles.calendarIconText}>📅</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Dirección */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Dirección</Text>
          <Input
            value={formData.direccion}
            onChangeText={text => setFormData({...formData, direccion: text})}
            style={styles.input}
            containerStyle={styles.inputContainer}
          />
        </View>

        {/* Género */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Género</Text>
          <Input
            value={formData.genero}
            onChangeText={text => setFormData({...formData, genero: text})}
            style={styles.input}
            containerStyle={styles.inputContainer}
          />
        </View>
      </KeyboardAvoidingView>

      <DatePicker
        modal
        open={isDatePickerOpen}
        date={selectedDate}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setIsDatePickerOpen(false)}
        locale="es"
        title="Seleccionar fecha de nacimiento"
        confirmText="Confirmar"
        cancelText="Cancelar"
      />
    </>
  );

  const bottomAction = <Button onPress={handleConfirm} title="Confirmar" />;

  return (
    <>
      <RegisterLayout
        contentPaddingTop={SCREEN_HEIGHT * 0.06}
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
  fieldContainer: {
    width: '100%',
    marginBottom: SCREEN_HEIGHT * 0.015,
    alignItems: 'flex-start',
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
});

export default PersonalInfoFormScreen;
