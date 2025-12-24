import React, {useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useIvoDispatch, useIvoSelector} from '../../../../../redux/useIvo'; // cambiar por useIvo
import {logout, fetchMe} from '../../store-creditivoo/slices/auth-slice';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import {SCREENS} from '@shared-constants';
import CurvedHeaderLayout from '../../components/layouts/CurvedHeaderLayout';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import CreditivooVerde from '../../svgs/CreditivooVerde';
import { IvitooAdvisor } from '../../components';
import { Routes } from '../../../../../Utils/NavigationRoutes'

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// Helper function to get display name
const getDisplayName = (
  name?: string,
  lastname?: string,
  email?: string,
): string => {
  if (name && lastname) {
    return `${name} ${lastname}`;
  }
  if (name) {
    return name;
  }
  if (email) {
    return email;
  }
  return 'Usuario';
};

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useIvoDispatch();
  const {user} = useIvoSelector(state => state.creditivoo.auth);

  // Fetch user data when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        await dispatch(fetchMe()).unwrap();
      } catch (error) {
        console.error(
          '[ProfileScreen] Error al cargar datos del usuario:',
          error,
        );
      }
    };

    loadUserData();
  }, [dispatch]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleMenuPress = (key: string) => {
    switch (key) {
      case 'terms':
        (navigation as any).navigate(Routes.NAVIGATION_TERMS, {fromProfile: true});
        break;
      case 'help':
        (navigation as any).navigate(Routes.NAVIGATION_HELP);
        break;
      case 'settings':
        (navigation as any).navigate(Routes.NAVIGATION_SETTINGS);
        break;
      case 'personalData':
        (navigation as any).navigate('PersonalInfoForm', {fromProfile: true});
        break;
      default:
        console.log('Pressed:', key);
    }
  };

  const handleLogout = async () => {
    try {
      // Despachar el logout que limpia el token y usuario del store y AuthStorage
      await dispatch(logout()).unwrap();

      // Redirigir a login después del logout
      navigation.reset({
        index: 0,
        routes: [{name: SCREENS.LOGIN as never}],
      });
    } catch (error) {
      console.error('[ProfileScreen] Error al cerrar sesión:', error);
      // Aún así redirigir a login aunque haya error
      navigation.reset({
        index: 0,
        routes: [{name: SCREENS.LOGIN as never}],
      });
    }
  };

  // Get user data with fallbacks
  const displayName = getDisplayName(user?.name, user?.lastname, user?.email);
  const userEmail = user?.email || '';
  const hasAvatarImage = false; // TODO: Add avatar image URL to User type when available
  const isEmailVerified = user?.isEmailVerified || false;

  const headerContent = (
    <View style={styles.profileHeader}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {hasAvatarImage ? (
          <Image
            source={{
              uri: '', // TODO: Add user.avatarUrl when available
            }}
            style={styles.avatar}
            resizeMode="cover"
            onError={() => {
              console.log('Error loading avatar image');
            }}
          />
        ) : (
          <Image
            source={require('../../images/profile/ivitoo-profile.png')}
            style={styles.avatarPlaceholder}
            resizeMode="contain"
          />
        )}
      </View>

      {/* Nombre + verificado */}
      <View style={styles.nameRow}>
        <Text style={styles.nameText} numberOfLines={1}>
          {displayName}
        </Text>
        <Icon
          name="verified"
          type={IconType.MaterialIcons}
          size={20}
          color={IVOO_COLORS.primary}
          style={styles.verifiedIcon}
        />
      </View>

      {/* Email */}
      {userEmail && (
        <Text style={styles.emailText} numberOfLines={1}>
          {userEmail}
        </Text>
      )}
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
                name="person"
                type={IconType.Ionicons}
                size={24}
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
                size={24}
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
                size={24}
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
                size={24}
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

        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>CERRAR SESIÓN</Text>
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <CreditivooVerde width={SCREEN_WIDTH * 0.9} />
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
  avatarPlaceholder: {
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
    paddingVertical: SCREEN_WIDTH * 0.04,
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
    marginRight: SCREEN_WIDTH * 0.035,
  },
  menuText: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.textPrimary,
    flexShrink: 1,
  },
  logoutButton: {
    alignItems: 'center',
    marginBottom: SCREEN_WIDTH * 0.1,
    marginTop: 0,
  },
  logoutText: {
    fontSize: SCREEN_WIDTH * 0.03,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SCREEN_WIDTH * 0.1,
  },
});

export default ProfileScreen;
