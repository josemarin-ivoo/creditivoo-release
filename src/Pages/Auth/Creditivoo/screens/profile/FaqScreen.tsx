import React, {useMemo} from 'react';
import {ScrollView, View, TouchableOpacity} from 'react-native';
import {Divider, Icon, Layout, Text, useTheme} from '@ui-kitten/components';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StatusBar} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import createStyles from './FaqScreen.style';

const faqItems = [
  {
    question: '¿Cómo puedo realizar un pago?',
    answer:
      'Puedes realizar pagos desde la sección de compras activas. Selecciona la compra que deseas pagar y elige tu método de pago preferido.',
  },
  {
    question: '¿Cuáles son los métodos de pago disponibles?',
    answer:
      'Aceptamos pagos en efectivo, transferencias bancarias y pagos móviles. Puedes ver todos los métodos disponibles en la pantalla de selección de método de pago.',
  },
  {
    question: '¿Cómo puedo ver el estado de mis compras?',
    answer:
      'Puedes ver el estado de todas tus compras en la pantalla principal. Las compras pendientes aparecerán destacadas.',
  },
  {
    question: '¿Qué hago si tengo un problema con mi compra?',
    answer:
      'Puedes contactar a nuestro equipo de soporte desde la sección "Contactar a soporte" en tu perfil. Estaremos encantados de ayudarte.',
  },
  {
    question: '¿Cómo actualizo mi información personal?',
    answer:
      'Puedes ver tu información personal en la sección "Información personal" de tu perfil. Para realizar cambios, contacta a nuestro equipo de soporte.',
  },
  {
    question: '¿Puedo cancelar una compra?',
    answer:
      'Para cancelar una compra, por favor contacta a nuestro equipo de soporte. Te ayudaremos a resolver tu solicitud lo antes posible.',
  },
];

const FaqScreen: React.FC = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#ffffff" />
      <Layout style={styles.layout}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <View style={styles.backButtonCircle}>
              <Icon
                name="arrow-back"
                pack="eva"
                style={styles.backIcon}
                fill="#FFFFFF"
              />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Preguntas frecuentes</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.introText}>
            Encuentra respuestas a las preguntas más comunes sobre nuestra
            plataforma.
          </Text>

          <View style={styles.card}>
            {faqItems.map((item, index) => (
              <React.Fragment key={index}>
                <View style={styles.faqItem}>
                  <View style={styles.questionContainer}>
                    <Icon
                      name="question-mark-circle-outline"
                      pack="eva"
                      style={styles.questionIcon}
                      fill={theme['color-primary-500'] || '#4CAF50'}
                    />
                    <Text style={styles.questionText}>{item.question}</Text>
                  </View>
                  <Text style={styles.answerText}>{item.answer}</Text>
                </View>
                {index < faqItems.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </View>
        </ScrollView>
      </Layout>
    </SafeAreaView>
  );
};

export default FaqScreen;
