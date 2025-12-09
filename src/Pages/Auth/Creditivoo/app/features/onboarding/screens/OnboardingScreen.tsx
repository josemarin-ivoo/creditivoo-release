import React, {useMemo, useEffect} from 'react';
import {View, StyleSheet, Image, Dimensions, Keyboard} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {Layout, Text as KittenText} from '@ui-kitten/components';
import AppIntroSlider from 'react-native-app-intro-slider';

// Components
import ButtonK from '@shared-components/button/ButtonK';
import createStyles from './OnboardingScreen.style';
import {SCREENS} from '@shared-constants';
import {useStatusBar} from '../../../../utils/useStatusBar';
import {COLORS} from '../../../styles/global.style';

const {width, height} = Dimensions.get('window');

const slides = [
  {
    key: 'one',
    title: 'ESTRENA',
    title2: 'SIN ESPERAR',
    text: 'Obtén lo que necesitas hoy y paga en cuotas cómodas, sin intereses ni complicaciones 💸',
    image: require('../../../../assets/onboarding/intro-ivoo-1.png'),
  },
  {
    key: 'two',
    title: 'COMPRA',
    title2: 'INTELIGENTE',
    text: 'Accede a los mejores precios del mercado y distribuye tus pagos de manera flexible 🛒',
    image: require('../../../../assets/onboarding/intro-ivoo-2.png'),
  },
  {
    key: 'three',
    title: 'ACTIVA',
    title2: 'TU CUENTA',
    text: 'Gestiona tus pagos desde cualquier lugar, de forma rápida, segura y transparente 🎉',
    image: require('../../../../assets/onboarding/intro-ivoo-3.png'),
  },
];

const OnboardingScreen: React.FC = () => {
  const styles = useMemo(() => createStyles(), []);
  const navigation = useNavigation();

  // Configurar status bar
  useStatusBar({
    backgroundColor: COLORS.white,
  });

  // Cerrar el teclado cuando se monta la pantalla
  useEffect(() => {
    Keyboard.dismiss();

    // También cerrar el teclado cuando se enfoca la pantalla
    const unsubscribe = navigation.addListener('focus', () => {
      Keyboard.dismiss();
    });

    return unsubscribe;
  }, [navigation]);

  const renderItem = ({
    item,
  }: {
    item: {
      key: string;
      title: string;
      title2: string;
      text: string;
      image: any;
    };
  }) => {
    return (
      <Layout style={customStyles.slide}>
        <View>
          <KittenText category="h1" style={customStyles.title}>
            {item.title}
          </KittenText>
          <KittenText category="h1" style={customStyles.title}>
            {item.title2}
          </KittenText>
        </View>
        <KittenText style={customStyles.text}>{item.text}</KittenText>
        <View style={customStyles.imageContainer}>
          <Image source={item.image} style={customStyles.image} />
        </View>
      </Layout>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Layout style={styles.container}>
        <View style={customStyles.sliderContainer}>
          <AppIntroSlider
            data={slides}
            renderItem={renderItem}
            showNextButton={false}
            showDoneButton={false}
            showSkipButton={false}
            dotStyle={customStyles.dotStyle}
            activeDotStyle={customStyles.activeDotStyle}
          />
        </View>
        <View style={customStyles.buttonContainer}>
          <ButtonK
            title="Inicia sesión"
            onPress={() => navigation.navigate(SCREENS.LOGIN as never)}
            appearance="outline"
            style={customStyles.buttonInit}
          />
          <ButtonK
            title="Crear cuenta"
            onPress={() => navigation.navigate(SCREENS.REGISTER as never)}
            appearance="filled"
            style={customStyles.buttonCreate}
          />
        </View>
      </Layout>
    </SafeAreaView>
  );
};

export default OnboardingScreen;

const customStyles = StyleSheet.create({
  sliderContainer: {
    flex: 1,
    paddingBottom: 160,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'transparent',
    paddingTop: 40,
    paddingBottom: 200,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 10,
    marginBottom: 20,
    width: '100%',
    height: height * 0.35,
  },
  image: {
    width: width * 0.9,
    height: height * 0.4,
    resizeMode: 'contain',
  },
  title: {
    textAlign: 'center',
    fontSize: 45,
    marginBottom: 0,
    letterSpacing: -1,
    lineHeight: 50,
  },
  textContainer: {
    marginTop: 20,
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    marginHorizontal: '15%',
    marginTop: 20,
    marginBottom: 10,
  },
  dotStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    color: '#0D7AF3',
    width: 10,
    height: 10,
    marginHorizontal: 5,
    borderRadius: 5,
  },
  activeDotStyle: {
    backgroundColor: '#32DD73',
    width: 10,
    height: 10,
    marginHorizontal: 5,
    borderRadius: 5,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 10,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  buttonInit: {
    backgroundColor: '#E9FBF0',
  },
  buttonCreate: {
    marginTop: 4,
  },
});
