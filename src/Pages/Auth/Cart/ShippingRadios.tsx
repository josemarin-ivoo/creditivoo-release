import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Colors from '../../../Utils/Colors'; // ✅ Ruta corregida

interface Props {
  selected: 'delivery' | 'pickup';
  onSelect: (val: 'delivery' | 'pickup') => void;
}

export const ShippingRadios: React.FC<Props> = ({ selected, onSelect }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.option, selected === 'delivery' && styles.selected]} 
        onPress={() => onSelect('delivery')}
      >
        <Icon name="truck" size={20} color={selected === 'delivery' ? '#FFF' : '#333'} />
        <Text style={[styles.text, selected === 'delivery' && styles.textSelected]}>Delivery</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.option, selected === 'pickup' && styles.selected]} 
        onPress={() => onSelect('pickup')}
      >
        <Icon name="map-pin" size={20} color={selected === 'pickup' ? '#FFF' : '#333'} />
        <Text style={[styles.text, selected === 'pickup' && styles.textSelected]}>Pickup</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', backgroundColor: '#F0F0F0', borderRadius: 12, padding: 4 },
  option: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10, gap: 8 },
  selected: { backgroundColor: Colors.Green || '#2ECC71', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  text: { fontWeight: '600', color: '#333', marginLeft: 8 },
  textSelected: { color: '#FFF' }
