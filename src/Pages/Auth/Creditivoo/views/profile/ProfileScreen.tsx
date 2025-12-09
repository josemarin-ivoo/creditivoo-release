import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {AppDispatch} from 'store/store';
import {logout} from 'store/slices/auth-slice';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import {SCREENS} from '@shared-constants';
import CurvedHeaderLayout from '../../components/layouts/CurvedHeaderLayout';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import CreditivooVerde from '../../svgs/CreditivooVerde';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleMenuPress = (key: string) => {
    switch (key) {
      case 'terms':
        (navigation as any).navigate(SCREENS.TERMS, {fromProfile: true});
        break;
      case 'help':
        (navigation as any).navigate(SCREENS.HELP);
        break;
      case 'settings':
        (navigation as any).navigate(SCREENS.SETTINGS);
        break;
      case 'personalData':
        (navigation as any).navigate('PersonalInfoForm', {fromProfile: true});
        break;
      default:
        console.log('Pressed:', key);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    (navigation as any).navigate(SCREENS.HOME);
  };

  const headerContent = (
    <View style={styles.profileHeader}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Image
          source={{
            uri: 'https://i.pravatar.cc/200?img=12',
          }}
          style={styles.avatar}
          resizeMode="cover"
          onError={() => {
            console.log('Error loading avatar image');
          }}
        />
      </View>

      {/* Nombre + verificado */}
      <View style={styles.nameRow}>
        <Text style={styles.nameText}>Gabriela Pérez</Text>
        <Icon
          name="checkmark-circle"
          type={IconType.Ionicons}
          size={18}
          color={IVOO_COLORS.primary}
          style={styles.verifiedIcon}
        />
      </View>

      {/* Email */}
      <Text style={styles.emailText}>gabiperez@gmail.com</Text>
    </View>
  );

  return (
    <CurvedHeaderLayout
      title="Perfil"
      showBackButton={true}
      onBackPress={handleBackPress}
      scroll={true}
      headerContent={headerContent}>
      <View style={styles.profileContent}>
        <View style={styles.menuContainer}>
          {/* Datos personales */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuPress('personalData')}>
            <View style={styles.menuLeft}>
              <Icon
                name="person-outline"
                type={IconType.Ionicons}
                size={22}
                color={IVOO_COLORS.primary}
                style={styles.menuIcon}
              />
              <Text style={styles.menuText}>Datos personales</Text>
            </View>
            <Icon
              name="chevron-forward"
              type={IconType.Ionicons}
              size={20}
              color={IVOO_COLORS.grayLight}
            />
          </TouchableOpacity>

          {/* Configuración */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuPress('settings')}>
            <View style={styles.menuLeft}>
              <Icon
                name="settings-outline"
                type={IconType.Ionicons}
                size={22}
                color={IVOO_COLORS.primary}
                style={styles.menuIcon}
              />
              <Text style={styles.menuText}>Configuración</Text>
            </View>
            <Icon
              name="chevron-forward"
              type={IconType.Ionicons}
              size={20}
              color={IVOO_COLORS.grayLight}
            />
          </TouchableOpacity>

          {/* Ayuda */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuPress('help')}>
            <View style={styles.menuLeft}>
              <Icon
                name="headset-outline"
                type={IconType.Ionicons}
                size={22}
                color={IVOO_COLORS.primary}
                style={styles.menuIcon}
              />
              <Text style={styles.menuText}>Ayuda</Text>
            </View>
            <Icon
              name="chevron-forward"
              type={IconType.Ionicons}
              size={20}
              color={IVOO_COLORS.grayLight}
            />
          </TouchableOpacity>

          {/* Términos y condiciones */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuPress('terms')}>
            <View style={styles.menuLeft}>
              <Icon
                name="shield-checkmark-outline"
                type={IconType.Ionicons}
                size={22}
                color={IVOO_COLORS.primary}
                style={styles.menuIcon}
              />
              <Text style={styles.menuText}>
                Consulta términos y condiciones
              </Text>
            </View>
            <Icon
              name="chevron-forward"
              type={IconType.Ionicons}
              size={20}
              color={IVOO_COLORS.grayLight}
            />
          </TouchableOpacity>
        </View>

        {/* Bottom section - fixed at bottom */}
        <View style={styles.bottomSection}>
          {/* Cerrar sesión */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>CERRAR SESIÓN</Text>
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <CreditivooVerde width={SCREEN_WIDTH * 0.5} height={28} />
          </View>
        </View>
      </View>
    </CurvedHeaderLayout>
  );
};

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    marginTop: -(SCREEN_WIDTH * 0.18),
    marginBottom: SCREEN_WIDTH * 0.04,
  },
  avatarContainer: {
    width: SCREEN_WIDTH * 0.28,
    height: SCREEN_WIDTH * 0.28,
    borderRadius: (SCREEN_WIDTH * 0.28) / 2,
    marginBottom: SCREEN_WIDTH * 0.04,
    overflow: 'hidden',
    backgroundColor: IVOO_COLORS.grayLight,
    borderWidth: 3,
    borderColor: IVOO_COLORS.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SCREEN_WIDTH * 0.02,
  },
  nameText: {
    fontSize: SCREEN_WIDTH * 0.055,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.primary,
  },
  verifiedIcon: {
    marginLeft: 6,
  },
  profileContent: {
    minHeight: '100%',
    justifyContent: 'space-between',
  },
  emailText: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.grayMedium,
    textAlign: 'center',
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  bottomSection: {
    width: '100%',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
    justifyContent: 'space-between',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    fontSize: SCREEN_WIDTH * 0.042,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.textPrimary,
    flexShrink: 1,
  },
  logoutButton: {
    alignItems: 'center',
    marginBottom: SCREEN_WIDTH * 0.06,
    marginTop: 0,
  },
  logoutText: {
    fontSize: SCREEN_WIDTH * 0.029,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SCREEN_WIDTH * 0.05,
  },
});

export default ProfileScreen;
