import React, {useMemo, useState} from 'react';
import {
  ScrollView,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {Icon, Layout, Text, useTheme, Button} from '@ui-kitten/components';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StatusBar} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import createStyles from './ContactSupportScreen.style';

const ContactSupportScreen: React.FC = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    // Mock submission
    Alert.alert(
      'Mensaje enviado',
      'Tu mensaje ha sido enviado exitosamente. Nos pondremos en contacto contigo pronto.',
      [
        {
          text: 'OK',
          onPress: () => {
            setSubject('');
            setMessage('');
            navigation.goBack();
          },
        },
      ],
    );
  };

  const contactMethods = [
    {
      icon: 'phone-outline',
      label: 'Teléfono',
      value: '+1 234 567 8900',
      action: () => {
        // Mock phone call
        Alert.alert('Llamar', 'Funcionalidad de llamada en desarrollo');
      },
    },
    {
      icon: 'email-outline',
      label: 'Email',
      value: 'soporte@ivoo.com',
      action: () => {
        // Mock email
        Alert.alert('Email', 'Funcionalidad de email en desarrollo');
      },
    },
    {
      icon: 'clock-outline',
      label: 'Horario de atención',
      value: 'Lunes a Viernes: 9:00 AM - 6:00 PM',
      action: null,
    },
  ];

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
          <Text style={styles.headerTitle}>Contactar a soporte</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.introText}>
            Estamos aquí para ayudarte. Contáctanos a través de cualquiera de
            estos métodos o envíanos un mensaje.
          </Text>

          {/* Contact Methods */}
          <View style={styles.card}>
            {contactMethods.map((method, index) => (
              <TouchableOpacity
                key={index}
                style={styles.contactMethod}
                onPress={method.action || undefined}
                disabled={!method.action}>
                <Icon
                  name={method.icon}
                  pack="eva"
                  style={styles.contactIcon}
                  fill={theme['color-primary-500'] || '#4CAF50'}
                />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>{method.label}</Text>
                  <Text style={styles.contactValue}>{method.value}</Text>
                </View>
                {method.action && (
                  <Icon
                    name="chevron-right-outline"
                    pack="eva"
                    style={styles.chevronIcon}
                    fill={theme['text-hint-color'] || '#999999'}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Contact Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Envíanos un mensaje</Text>
            <Text style={styles.formLabel}>Asunto</Text>
            <TextInput
              style={styles.input}
              value={subject}
              onChangeText={setSubject}
              placeholder="Ej: Problema con mi compra"
              placeholderTextColor={theme['text-hint-color'] || '#999999'}
            />
            <Text style={[styles.formLabel, {marginTop: 16}]}>Mensaje</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={message}
              onChangeText={setMessage}
              placeholder="Describe tu consulta o problema..."
              placeholderTextColor={theme['text-hint-color'] || '#999999'}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <Button
              style={styles.submitButton}
              onPress={handleSubmit}
              status="primary">
              Enviar mensaje
            </Button>
          </View>
        </ScrollView>
      </Layout>
    </SafeAreaView>
  );
};

export default ContactSupportScreen;
