import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  FlatList,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import CurvedHeaderLayout from '../../components/layouts/CurvedHeaderLayout';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import {GemMethodCard, GemMethod} from '../../components/gems';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// Mock data - Replace with actual API call
const gemMethods: GemMethod[] = [
  {
    id: '1',
    title: 'Pago Puntual',
    description: 'Paga a tiempo. Suma gemas manteniendo tus cuotas al día.',
    iconType: 'clock',
  },
  {
    id: '2',
    title: 'Pago Anticipado',
    description: 'Adelanta tus cuotas. Obtén gemas extra por pagar antes.',
    iconType: 'card-up',
  },
  {
    id: '3',
    title: 'Mas inicial',
    description: 'Aporta más inicial. Gana más gemas con un aporte mayor.',
    iconType: 'card-plus',
  },
  {
    id: '4',
    title: 'Compra realizada',
    description: 'Completa tu compra. Finalizar tu compra también suma gemas',
    iconType: 'card-check',
  },
];

const HowToEarnGemsScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const renderMethod = ({item}: {item: GemMethod}) => (
    <GemMethodCard method={item} />
  );

  return (
    <CurvedHeaderLayout
      title="Gemas"
      showBackButton={true}
      onBackPress={handleBackPress}
      scroll={true}>
      <View style={styles.container}>
        <Text style={styles.title}>¿Cómo puedo ganar gemas?</Text>

        <FlatList
          data={gemMethods}
          renderItem={renderMethod}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </CurvedHeaderLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.052,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SCREEN_WIDTH * 0.06,
  },
  listContent: {
    paddingBottom: SCREEN_WIDTH * 0.05,
  },
});

export default HowToEarnGemsScreen;

