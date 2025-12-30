import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import CurvedHeaderLayout from '../../components/layouts/CurvedHeaderLayout';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {IvitooAdvisor} from '../../components';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const HelpScreen: React.FC = () => {
  const navigation = useNavigation();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleTopicPress = (topicId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(prevId => (prevId === topicId ? null : topicId));
  };

  const faqs = [
    {
      id: '1',
      title: '¿Qué es Creditivoo y cómo funciona?',
      content:
        'Creditivoo es tu aliado financiero que te permite comprar productos en tiendas IVOO y pagarlos en cómodas cuotas. Funciona mediante una evaluación rápida de tu perfil, asignándote un límite de crédito para que disfrutes de lo que necesitas hoy y pagues después.',
    },
    {
      id: '2',
      title: '¿Dónde puedo usar Creditivoo?',
      content:
        'Puedes usar tu crédito en todas las tiendas IVOO a nivel nacional. Simplemente dirígete a la caja, indica que pagarás con Creditivoo y escanea el código QR desde tu aplicación.',
    },
    {
      id: '3',
      title: '¿Qué es la inicial y cómo se calcula?',
      content:
        'La inicial es un pago parcial que realizas al momento de la compra. Se calcula automáticamente basándose en tu historial crediticio y el valor del producto, permitiéndote financiar el resto en cuotas ajustadas a tu capacidad.',
    },
    {
      id: '4',
      title: '¿Qué son las gemas y cómo las gano?',
      content:
        'Las gemas son puntos de recompensa que obtienes por mantener un buen comportamiento de pago. Ganas gemas cada vez que pagas tus cuotas a tiempo. ¡Acumúlalas para desbloquear beneficios exclusivos y mejorar tu nivel en la app!',
    },
    {
      id: '5',
      title: '¿Qué es el Plan Plus y qué incluye?',
      content:
        'El Plan Plus es una suscripción premium que te ofrece ventajas adicionales, como tasas de interés preferenciales, acceso prioritario a promociones, mayor límite de crédito y atención personalizada.',
    },
    {
      id: '6',
      title: '¿Cómo contacto a soporte?',
      content:
        'Estamos aquí para ayudarte. Puedes contactarnos directamente desde esta aplicación usando el botón de chat con Ivitoo, o escribirnos a nuestro correo de soporte soporte@creditivoo.com. También puedes visitar el área de atención al cliente en cualquiera de nuestras tiendas.',
    },
  ];

  return (
    <CurvedHeaderLayout
      title="Ayuda"
      showBackButton={true}
      onBackPress={handleBackPress}
      scroll={true}
      floatingComponent={<IvitooAdvisor />}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Preguntas frecuentes</Text>

        <View style={styles.faqList}>
          {faqs.map(item => {
            const isExpanded = expandedId === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.faqItem, isExpanded && styles.faqItemExpanded]}
                onPress={() => handleTopicPress(item.id)}
                activeOpacity={0.7}>
                <View style={styles.faqHeader}>
                  <Text style={styles.faqText}>{item.title}</Text>
                  <Icon
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    type={IconType.Feather}
                    size={20}
                    color={IVOO_COLORS.textPrimary}
                  />
                </View>
                {isExpanded && (
                  <View style={styles.faqContent}>
                    <Text style={styles.faqContentText}>{item.content}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </CurvedHeaderLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: SCREEN_HEIGHT * 0.02,
    paddingBottom: SCREEN_HEIGHT * 0.03,
    paddingHorizontal: SCREEN_WIDTH * 0.01,
  },
  sectionTitle: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.grayMedium,
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  faqList: {
    marginBottom: SCREEN_HEIGHT * 0.04,
  },
  faqItem: {
    backgroundColor: '#F9FAFC',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  faqItemExpanded: {
    backgroundColor: '#F9FAFC',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqText: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interSemiBold,
    color: IVOO_COLORS.textPrimary,
    flex: 1,
    marginRight: 10,
  },
  faqContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  faqContentText: {
    fontSize: SCREEN_WIDTH * 0.035,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.grayMedium,
    lineHeight: 20,
  },
});

export default HelpScreen;
