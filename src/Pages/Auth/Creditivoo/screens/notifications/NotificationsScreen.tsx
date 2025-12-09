import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {COLORS, FONTS} from '../../app/styles/global.style';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {useNavigation} from '@react-navigation/native';
import {useStatusBar} from '../../utils/useStatusBar';

const {width: screenWidth} = Dimensions.get('window');

const NotificationsScreen = () => {
  const navigation = useNavigation();

  // Configurar status bar con el color de fondo de la pantalla
  useStatusBar({
    backgroundColor: COLORS.white,
  });

  return (
    <View style={styles.container}>
      {/* Custom Top Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon
            name="arrow-left"
            type={IconType.Feather}
            size={24}
            color={COLORS.greyDark}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
      </View>
      <View style={styles.body}>
        <Image
          source={require('../../assets/img/bell-3d.png')}
          style={styles.image}
          resizeMode="contain"
        />
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Nada por ahora</Text>
          <Text style={styles.subtitle}>
            No tienes notificaciones en este momento
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 8,
  },
  headerTitle: {
    fontFamily: FONTS.urbanistBold,
    fontSize: 22,
    color: COLORS.greyDark,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  image: {
    width: 220,
    height: 220,
    marginBottom: 40,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: screenWidth,
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: FONTS.urbanistBold,
    fontSize: 30,
    color: COLORS.primaryGreen,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: FONTS.urbanistRegular,
    fontSize: 16,
    color: COLORS.greyDark,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default NotificationsScreen;
