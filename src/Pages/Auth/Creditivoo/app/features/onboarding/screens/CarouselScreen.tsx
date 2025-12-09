import React, {useRef, useState} from 'react';
import {View, Text, StyleSheet, Image, Dimensions} from 'react-native';
import Carousel from 'react-native-snap-carousel';
import ButtonK from '@shared-components/button/ButtonK';
import {COLORS, FONTS} from '../../../styles/global.style';

const {width: screenWidth} = Dimensions.get('window');

interface Slide {
  key: string;
  image: any;
  title: string;
  subtitle: string;
  button: string;
}

const slides: Slide[] = [
  {
    key: 'slide1',
    image: require('../../../../assets/img/medal-3d.png'), // Replace with your asset
    title: 'Tu equipo, con cuotas justas',
    subtitle:
      'Revisa tus compras y págalas en cuotas. Recibe notificaciones y avisos de tus pagos.',
    button: 'Siguiente',
  },
  {
    key: 'slide2',
    image: require('../../../../assets/img/wallet-3d.png'), // Replace with your asset
    title: 'Consulta cuánto has pagado y lo que falta',
    subtitle:
      'Accede a tu cuenta y consulta el resumen de tus pagos y el saldo pendiente.',
    button: 'Siguiente',
  },
  {
    key: 'slide3',
    image: require('../../../../assets/img/compass-3d.png'), // Replace with your asset
    title: 'Administra tu financiamiento desde tu celular',
    subtitle:
      'No necesitas ir a ninguna oficina. Consulta, paga, y desbloquea desde cualquier lugar.',
    button: 'Iniciar mi gestión',
  },
];

const CarouselScreen = ({navigation}: any) => {
  const carouselRef = useRef<Carousel<Slide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleButtonPress = () => {
    if (activeIndex < slides.length - 1) {
      // Go to next slide
      if (carouselRef.current) {
        carouselRef.current.snapToNext();
      }
    } else {
      // Last slide: navigate to home or main app
      navigation.replace('Home'); // Change 'Home' to your main screen name
    }
  };

  const renderItem = ({item}: {item: Slide}) => (
    <View style={styles.slide}>
      <Image source={item.image} style={styles.image} resizeMode="contain" />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
        <View style={styles.buttonContainer}>
          <ButtonK onPress={handleButtonPress} title={item.button} />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Carousel
        ref={carouselRef}
        data={slides}
        renderItem={renderItem}
        sliderWidth={screenWidth}
        itemWidth={screenWidth}
        onSnapToItem={setActiveIndex}
        useScrollView
        vertical={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  slide: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    width: '100%',
    height: '100%',
  },
  image: {
    width: 240,
    height: 240,
    marginBottom: 60,
    position: 'absolute',
    top: '15%',
    alignSelf: 'center',
  },
  contentContainer: {
    backgroundColor: COLORS.white,
    elevation: 3,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontFamily: FONTS.urbanistBold,
    fontSize: 33,
    color: COLORS.primaryGreen,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  subtitle: {
    fontFamily: FONTS.urbanistRegular,
    fontSize: 16,
    color: COLORS.greyDark,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 24,
    lineHeight: 24,
  },
  buttonContainer: {
    paddingHorizontal: 24,
  },
});

export default CarouselScreen;
