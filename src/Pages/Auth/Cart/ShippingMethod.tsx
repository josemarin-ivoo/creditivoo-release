import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { DeliveryForm } from './DeliveryForm';
import { PickupForm } from './PickupForm';
import Colors from '../../../Utils/Colors';
import Helper from '../../../Utils/Helper';
import { AppContext } from '../../AppContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  onShippingChange: (details: any) => void;
  pickupStores: any[];
  cartData: any; // Recibimos todo el objeto del carrito
}

// export const ShippingMethod: React.FC<Props> = ({ onShippingChange, pickupStores, cartData }) => {
//   const [method, setMethod] = useState<'delivery' | 'pickup'>('delivery');
//   const volumenProducto = useRef(0);
//   // Extraer totales y items para pasar al DeliveryForm
//   const cartTotal = cartData?.customerCart?.prices?.subtotal_excluding_tax?.value || 0;
//   const cartItems = cartData?.customerCart?.items || [];

//   //add Frodriguez
//   const { appTheme, themeName } = useContext(AppContext);
//   const isDark = themeName === 'dark';

//   const bg = appTheme.background;
//   const surface = appTheme.InputBoxBGColor;
//   const text = appTheme.text;
//   //end Frodriguez


//   cartData.customerCart.items.forEach((item, index) => {
//     const attrs = item.product.additional_attributes || [];

//     // 1. Extraemos específicamente las dimensiones
//     const dimAttr = attrs.find(a => a.code === 'dimensiones_deliver');
//     const varDimensiones = dimAttr ? dimAttr.value : 'No tiene';

//     // 2. Extraemos específicamente el peso
//     const pesoAttr = attrs.find(a => a.code === 'weightdelivery');
//     const varPeso = pesoAttr ? pesoAttr.value : 'No tiene';

//     const partes = varDimensiones.replace(/cm/gi, '').split('x');

//     // 2. Convertimos a números (usando trim para quitar espacios)
//     const largo = parseFloat(partes[0]?.trim()) || 0;
//     const ancho = parseFloat(partes[1]?.trim()) || 0;
//     const alto = parseFloat(partes[2]?.trim()) || 0;

//     volumenProducto.current = largo * ancho * alto;

//   });

export const ShippingMethod: React.FC<Props> = ({ onShippingChange, pickupStores, cartData }) => {
  const [method, setMethod] = useState<'delivery' | 'pickup'>('delivery');
  const volumenProducto = useRef(0);

  const cartTotal = cartData?.customerCart?.prices?.subtotal_excluding_tax?.value || 0;
  const cartItems = cartData?.customerCart?.items || [];

  //add Frodriguez
  const { appTheme, themeName } = useContext(AppContext);
  const isDark = themeName === 'dark';

  const bg = appTheme.background;
  const surface = appTheme.InputBoxBGColor;
  const text = appTheme.text;
  //end Frodriguez

  cartItems.forEach((item, index) => {
    const attrs = item?.product?.additional_attributes || [];

    // add Frodriguez
    const dimAttr =
      attrs.find(a => a.code === 'dimensiones_deliver') ||
      attrs.find(a => a.code === 'dimensiones');
    const varDimensiones = dimAttr ? dimAttr.value : 'No tiene';

    const pesoAttr =
      attrs.find(a => a.code === 'weightdelivery') ||
      attrs.find(a => a.code === 'peso');
    const varPeso = pesoAttr ? pesoAttr.value : 'No tiene';
    // end Frodriguez

    const partes = String(varDimensiones).replace(/cm/gi, '').split('x');

    const largo = parseFloat(partes[0]?.trim()) || 0;
    const ancho = parseFloat(partes[1]?.trim()) || 0;
    const alto = parseFloat(partes[2]?.trim()) || 0;

    volumenProducto.current = largo * ancho * alto;
  });


  const handleTabChange = (newMethod: 'delivery' | 'pickup') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMethod(newMethod);
    onShippingChange({ method: newMethod, cost: 0, store: null });
  };

  return (
    <View style={styles.container}>
      {/* Selector Principal Moderno */}
      <View
        style={[
          styles.tabContainer,
          {
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : surface,
            borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)',
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.tab,
            method === 'delivery' && [
              styles.activeTab,
              { backgroundColor: Colors.Green },
            ],
          ]}
          onPress={() => handleTabChange('delivery')}
          activeOpacity={0.85}
        >
          <Icon
            name="truck"
            size={18}
            color={method === 'delivery' ? '#FFF' : (isDark ? 'rgba(255,255,255,0.65)' : '#6B7280')}
          />
          <Text
            style={[
              styles.tabText,
              {
                color: method === 'delivery'
                  ? '#FFFFFF'
                  : (isDark ? 'rgba(255,255,255,0.65)' : '#6B7280'),
              },
              method === 'delivery' && styles.activeTabText,
            ]}
          >
            Delivery
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            method === 'pickup' && [
              styles.activeTab,
              { backgroundColor: Colors.Green },
            ],
          ]}
          onPress={() => handleTabChange('pickup')}
          activeOpacity={0.85}
        >
          <Icon
            name="map-pin"
            size={18}
            color={method === 'pickup' ? '#FFF' : (isDark ? 'rgba(255,255,255,0.65)' : '#6B7280')}
          />
          <Text
            style={[
              styles.tabText,
              {
                color: method === 'pickup'
                  ? '#FFFFFF'
                  : (isDark ? 'rgba(255,255,255,0.65)' : '#6B7280'),
              },
              method === 'pickup' && styles.activeTabText,
            ]}
          >
            Pickup
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {method === 'delivery' ? (
          <DeliveryForm
            cartId={cartData?.customerCart?.id}
            cartTotal={cartTotal}
            dimensiones={volumenProducto.current}
            cartItems={cartItems}
            stores={pickupStores} // Usamos las mismas tiendas para calcular origen cercano
            onChange={(data) => onShippingChange({ method: 'delivery', ...data })}
          />
        ) : (
          <PickupForm
            cartId={cartData?.customerCart?.id}
            stores={pickupStores}
            onChange={(data) => onShippingChange({ method: 'pickup', ...data })}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 10 },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 5,
    height: 55,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 8,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  tabText: {
    fontWeight: '700',
    fontSize: 14,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  content: {
    marginTop: 20,
  }
});