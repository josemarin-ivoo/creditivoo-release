import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, Image } from 'react-native';
import { Portal } from 'react-native-portalize';
import imageResource from '../Utils/Image'; // Ajusta la ruta a tu archivo de imágenes

const { width } = Dimensions.get('window');

export const NewFeatureOverlay = ({ visible, onClose, appTheme }) => {
  if (!visible) return null;

  const totalTabs = 5;
  const tabIndex = 3; 
  const tabWidth = width / totalTabs;
  // El centro exacto del espacio del Tab
  const tabCenter = (tabWidth * tabIndex) + (tabWidth / 2);
  const circlePosition = tabCenter - 35;

  return (
    <Portal>
      <View style={StyleSheet.absoluteFillObject}>
        {/* Fondo oscuro */}
        <View style={styles.overlayBackground} />

        {/* Tooltip */}
        <View style={styles.tooltipContainer}>
          <View style={styles.bubble}>
            <Text style={[styles.tooltipText, styles.titleText]}>
              ¡Compra hoy y paga después!
            </Text>
            <Text style={styles.tooltipText}>Ya puedes usar <Text style={styles.boldText}>CREDITIVOO</Text> para pagar tus compras en cuotas desde la app.</Text>
            <TouchableOpacity onPress={onClose} style={styles.button}>
              <Text style={styles.buttonText}>¡ENTENDIDO!</Text>
            </TouchableOpacity>
          </View>
          {/* Flecha centrada con el círculo */}
          <View style={[styles.arrow, { left: tabCenter - 12 }]} />
        </View>

        {/* Círculo de Énfasis con el ícono "iluminado" adentro */}
        <View style={[styles.highlight, { left: circlePosition }]}>
          <Image
            source={
              appTheme?.type === 'dark'
                ? imageResource.ic_creditivodark
                : imageResource.ic_creditivo_green
            }
            style={styles.iconReplica}
            resizeMode="contain"
          />
        </View>
      </View>
    </Portal>
  );
};

const styles = StyleSheet.create({

  titleText: {
    fontWeight: 'bold',
    fontSize: 18,      // Un poco más grande para resaltar
    marginBottom: 8,   // Esto genera el "salto de línea" con espacio visual
  },
  
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Un poco más oscuro para resaltar más
  },
  highlight: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 35 : 10,
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#0add73',
    // ELIMINAMOS EL BACKGROUND WHITE
    backgroundColor: 'transparent', 
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    // Mantenemos la sombra para dar sensación de luz sobre el ícono
    shadowColor: '#0add73',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  iconReplica: {
    width: 35,
    height: 35,
    // Esto hace que el ícono ignore la opacidad del fondo oscuro
    opacity: 1, 
  },
  
  tooltipContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 125 : 100,
    width: '90%',
    alignSelf: 'center',
  },
  bubble: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  tooltipText: { color: '#333', fontSize: 16, textAlign: 'center' },
  boldText: { fontWeight: 'bold', color: '#0add73' },
  button: { marginTop: 15, backgroundColor: '#0add73', paddingVertical: 10, paddingHorizontal: 25, borderRadius: 25 },
  buttonText: { color: 'white', fontWeight: 'bold' },
  arrow: {
    position: 'absolute',
    bottom: -14,
    width: 0, height: 0,
    borderLeftWidth: 12, borderRightWidth: 12, borderTopWidth: 15,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: 'white',
  },
});