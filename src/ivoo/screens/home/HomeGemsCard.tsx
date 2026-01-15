import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon, { IconType } from 'react-native-dynamic-vector-icons';
import { IVOO_COLORS, IVOO_TYPOGRAPHY } from '../../styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HomeGemsCardProps {
  gemsAmount?: number | string;
  onPress?: () => void;
  onAddPress?: () => void;
}

const HomeGemsCard: React.FC<HomeGemsCardProps> = ({
  gemsAmount = '0',
  onPress,
  onAddPress,
}) => {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.container}>
      <LinearGradient
        colors={['#0ADD73', '#0ADD73']} // Degradado verde de la marca
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {/* Lado Izquierdo: Texto informativo */}
        <View style={styles.leftContent}>
          <Text style={styles.title}>COMPRA HOY DESDE</Text>
          <Text style={styles.subtitle}>0% DE INICIAL</Text>
        </View>

        {/* Lado Derecho: Cuadro de Gemas */}
        <View style={styles.gemsBadge}>
          <View style={styles.gemsInfo}>
            <Text style={styles.gemsLabel}>GEMAS:</Text>
            <View style={styles.amountRow}>
              <Text style={styles.gemsAmount}>{gemsAmount}</Text>
              {/* <Image 
                source={require('../../images/gems/gem-icon.png')} // Asegúrate de tener este icono
                style={styles.gemIcon}
                resizeMode="contain"
              /> */}
              {/* Botón de añadir (+) */}
                <TouchableOpacity 
                    style={styles.addButton} 
                    onPress={onAddPress}
                >
                    <Icon 
                    name="add-circle" 
                    type={IconType.Ionicons} 
                    size={22} 
                    color="#00D66B" 
                    />
                </TouchableOpacity>
            </View>
          </View>
          
          
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    marginVertical: 10,
    
    
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  leftContent: {
    flex: 1,
  },
  title: {
    color: '#000',
    fontSize: SCREEN_WIDTH * 0.050,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: '900',
  },
  subtitle: {
    color: '#FFF',
    fontSize: SCREEN_WIDTH * 0.050,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: '900',
  },
  gemsBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 100,
    // Centra el contenedor interno si el badge tiene un tamaño fijo
    justifyContent: 'center',
    alignItems: 'center',
  },
  gemsInfo: {
   alignItems: 'center', 
    justifyContent: 'center',
  },
  gemsLabel: {
    fontSize: 12,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    color: '#000',
    textAlign: 'center', // Centra el texto dentro de su propia caja
    marginBottom: 2,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', 
  },
  gemsAmount: {
    fontSize: 18,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    color: '#000',
    marginRight: 4,
  },
  gemIcon: {
    width: 16,
    height: 16,
  },
  addButton: {
    padding: 2,
  }
});

export default HomeGemsCard;