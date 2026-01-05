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
        'Es una opción para comprar hoy en tiendas IVOO y pagar después, sin intereses. Eliges Creditivoo al pagar, haces tu inicial y el resto en 4 cuotas cada 14 días.',
    },
    {
      id: '2',
      title: '¿Dónde puedo usar Creditivoo?',
      content:
        'Solo en tiendas IVOO, dentro de la app IVOO al momento del pago.',
    },
    {
      id: '3',
      title: '¿Qué es la inicial y cómo se calcula?',
      content:
        'Es el primer pago de tu compra. Corresponde a un porcentaje del total y baja el monto de tus cuotas siguientes.',
    },
    {
      id: '4',
      title: '¿Qué son las gemas y cómo las gano?',
      content:
        'Son puntos que ganas por pagar a tiempo o antes de la fecha. Cuanto más responsable seas, más gemas acumulas.',
    },
    {
      id: '5',
      title: '¿Qué es el Plan Plus y qué incluye?',
      content:
        'Es una membresía anual de $50 que te da más flexibilidad: eliges tu inicial (desde 0%), pagas en 4 cuotas y acumulas gemas. Se activa una vez y dura todo el año.',
    },
    {
      id: '6',
      title: '¿Cómo contacto a soporte?',
      content:
        'Escríbenos por WhatsApp al 0422-4866729 o al correo info@creditivoo.com. Estamos para ayudarte.',
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
