import React, {useState, useRef} from 'react';
import {
  StyleSheet,
  Text,
  Image,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Button} from '../../components';
import RegisterLayout from '../../components/layouts/RegisterLayout';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const TermScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Verificar si viene del ProfileScreen
  const fromProfile = (route.params as any)?.fromProfile || false;

  const handleSignContract = () => {
    if (fromProfile) {
      // Si viene del ProfileScreen, volver atrás
      navigation.goBack();
    } else {
      // Navegar a la pantalla de datos personales
      (navigation as any).navigate('PersonalInfoForm');
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
    const isAtBottom =
      contentOffset.y + layoutMeasurement.height >= contentSize.height - 10; // 10px de margen de error

    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    } else if (!isAtBottom && hasScrolledToBottom) {
      setHasScrolledToBottom(false);
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
      <Text style={styles.title}>
        Términos y Condiciones{'\n'}Financiamiento Creditivoo
      </Text>

      <ScrollView
        ref={scrollViewRef}
        style={styles.termsContainer}
        contentContainerStyle={styles.termsContent}
        showsVerticalScrollIndicator={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
        <Text style={styles.termsText}>
          Las condiciones y términos de financiamiento de Creditivoo regulan el acceso y uso de 
          los planes de financiamiento ofrecidos por las tiendas IVOO, permitiendo a los clientes 
          adquirir productos mediante pagos en cuotas bajo condiciones previamente establecidas. 
          Creditivoo es una plataforma tecnológica desarrollada por COMERCIALIZADORA 2014, C.A. 
          (IVOO), que facilita la adquisición de productos tecnológicos y de consumo a través de 
          una aplicación móvil disponible para sistemas IOS y Android, promoviendo el consumo 
          responsable y planificado por parte de sus usuarios.{'\n\n'}La aceptación de las 
          comunicaciones de Creditivoo es un requisito para el uso de la aplicación, 
          autorizando al usuario a recibir notificaciones, mensajes y llamadas relacionados con 
          recordatorios de pago, promociones y otras informaciones relevantes. Para hacer uso de 
          Creditivoo App, los clientes deben ser personas naturales, mayores de edad, con cédula de 
          identidad vigente y domicilio en Venezuela; el registro debe realizarse por la app o 
          personalmente en tiendas habilitadas, presentando la documentación requerida y completando 
          el proceso de validación y evaluación. El acceso a la línea de crédito está sujeto a la 
          aprobación de Creditivoo, que podrá negar o diferir la asignación sin que esto genere 
          derecho a reclamo por parte del usuario.{'\n\n'}En cuanto a garantías, cancelaciones, 
          sustituciones y reembolsos, el documento establece que cualquier gestión relacionada 
          con estos aspectos se realizará conforme a las políticas de la tienda habilitada y a la 
          normativa vigente, debiendo el cliente notificar y registrar los pagos a través de la 
          aplicación para su verificación. Las sanciones por incumplimiento, como el pago tardío 
          de cuotas, incluyen penalidades económicas, específicamente una indemnización de cuatro 
          dólares americanos o su equivalente en bolívares, según la tasa oficial del Banco 
          Central de Venezuela, aplicable tras el vencimiento del periodo de gracia de 24 horas.
          {'\n\n'}La protección de datos personales es prioritaria en Creditivoo, que solicita 
          autorización expresa para el tratamiento de datos durante el registro y garantiza su 
          uso exclusivo para fines relacionados con la aplicación y la evaluación crediticia. 
          Los datos no serán compartidos con terceros salvo requerimiento legal, y los clientes 
          pueden solicitar la modificación o eliminación de su información en cualquier momento. 
          Solo el personal autorizado y proveedores esenciales tendrán acceso a los datos, 
          implementando medidas de seguridad para prevenir pérdidas, usos indebidos o 
          divulgaciones no autorizadas.{'\n\n'}El uso aceptable de la aplicación implica que cada 
          cliente es responsable de su cuenta y no debe permitir el acceso a terceros, estando 
          prohibido el uso fraudulento o contrario a la ley. La ley aplicable para la interpretación 
          y cumplimiento de estos términos es la de la República Bolivariana de Venezuela, y cualquier 
          controversia será resuelta conforme a esta jurisdicción. Creditivoo se reserva el derecho 
          de modificar total o parcialmente los términos y condiciones, notificando a los usuarios a 
          través de los medios disponibles, siendo la continuidad en el uso de la aplicación una 
          aceptación tácita de los cambios.

        </Text>
      </ScrollView>
    </>
  );

  const bottomAction = (
    <Button
      onPress={handleSignContract}
      title={fromProfile ? 'Listo' : 'Acepto'}
      disabled={fromProfile ? false : !hasScrolledToBottom}
      style={{
        opacity: fromProfile ? 1 : hasScrolledToBottom ? 1 : 0.4,
      }}
    />
  );

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
    marginBottom: SCREEN_HEIGHT * 0.03,
    width: SCREEN_WIDTH * 0.88,
  },
  termsContainer: {
    width: SCREEN_WIDTH * 0.78,
    maxHeight: SCREEN_HEIGHT * 0.9,
    flex: 1,
    alignSelf: 'center',
  },
  termsContent: {
    paddingHorizontal: SCREEN_WIDTH * 0.02,
    paddingBottom: SCREEN_HEIGHT * 0.04,
  },
  termsText: {
    fontSize: SCREEN_WIDTH * 0.037,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.regular,
    color: '#6E717C',
    lineHeight: SCREEN_HEIGHT * 0.025,
    textAlign: 'left',
  },
});

export default TermScreen;
