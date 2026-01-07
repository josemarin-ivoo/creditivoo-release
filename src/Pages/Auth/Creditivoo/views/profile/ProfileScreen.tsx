import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
  Modal,
  Switch,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';
import {
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import {useIvoDispatch, useIvoSelector} from '../../../../../redux/useIvo';
import {logout, fetchMe} from '../../store-creditivoo/slices/auth-slice';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import {SCREENS} from '@shared-constants';
import CurvedHeaderLayout from '../../components/layouts/CurvedHeaderLayout';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import CreditivooVerde from '../../svgs/CreditivooVerde';
import {uploadProfilePicture} from '../../services/profile';
import {Routes} from '../../../../../Utils/NavigationRoutes';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const getThemeColors = (isDark: boolean) => ({
  background: isDark ? '#000000' : IVOO_COLORS.white,
  card: isDark ? '#1C1C1E' : IVOO_COLORS.white,
  text: isDark ? '#FFFFFF' : IVOO_COLORS.textPrimary,
  subText: isDark ? '#8E8E93' : IVOO_COLORS.grayMedium,
  border: isDark ? '#38383A' : '#ECECEC',
  itemBg: isDark ? '#2C2C2E' : '#F5F5F5',
});

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useIvoDispatch();
  const insets = useSafeAreaInsets();
  const {user} = useIvoSelector(state => state.creditivoo.auth);
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const colors = getThemeColors(isDarkMode);

  const [isUploading, setIsUploading] = useState(false);
  const [showPhotoOptionsModal, setShowPhotoOptionsModal] = useState(false);
  const [imageKey, setImageKey] = useState(0);
  const [tempProfilePictureUrl, setTempProfilePictureUrl] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const handleBackPress = () => navigation.goBack();

  const handleMenuPress = (key: string) => {
    switch (key) {
      case 'terms': (navigation as any).navigate(Routes.NAVIGATION_TERMS, {fromProfile: true}); break;
      case 'help': (navigation as any).navigate(Routes.NAVIGATION_HELP); break;
      case 'settings': (navigation as any).navigate(Routes.NAVIGATION_SETTINGS); break;
      case 'personalData': (navigation as any).navigate('PersonalInfoForm', {fromProfile: true}); break;
    }
  };

  const handleLogout = async () => {
    await dispatch(logout());
    navigation.reset({index: 0, routes: [{name: SCREENS.LOGIN as never}]});
  };

  const displayName = user?.name ? `${user.name} ${user.lastname || ''}` : user?.email || 'Usuario';
  const displayProfilePictureUrl = tempProfilePictureUrl || (user as any)?.profilePictureUrl;

  const headerContent = (
    <View style={styles.profileHeader}>
      <TouchableOpacity
        style={[styles.avatarContainer, { borderColor: colors.background }]}
        onPress={() => !isUploading && setShowPhotoOptionsModal(true)}
        disabled={isUploading}>
        {displayProfilePictureUrl ? (
          <Image source={{uri: displayProfilePictureUrl}} style={styles.avatar} key={`avatar-${imageKey}`} />
        ) : (
          <Image source={require('../../images/profile/ivitoo-profile.png')} style={styles.avatarPlaceholder} resizeMode="contain" />
        )}
        <View style={styles.editIconContainer}>
          {isUploading ? <ActivityIndicator size="small" color="#FFF" /> : <Icon name="camera" type={IconType.Ionicons} size={20} color="#FFF" />}
        </View>
      </TouchableOpacity>

      <View style={styles.nameRow}>
        <Text style={[styles.nameText, { color: colors.text }]}>{displayName}</Text>
        <Icon name="verified" type={IconType.MaterialIcons} size={20} color={IVOO_COLORS.primary} style={styles.verifiedIcon} />
      </View>
      <Text style={[styles.emailText, { color: colors.subText }]}>{user?.email}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <CurvedHeaderLayout
        title="Perfil"
        showBackButton={true}
        onBackPress={handleBackPress}
        scroll={true}
        headerContent={headerContent}>
        
        {/* Usamos un View que se expande para llenar el layout y tapar el blanco */}
        <View style={[
          styles.mainContentContainer, 
          { backgroundColor: colors.background, minHeight: SCREEN_HEIGHT }
        ]}>
          <View style={[styles.profileContent, { paddingBottom: insets.bottom + 40 }]}>
            <View style={styles.menuContainer}>
              
              {/* Item Modo Oscuro */}
              <View style={[styles.menuItem, { borderBottomColor: colors.border }]}>
                <View style={styles.menuLeft}>
                  <Icon name={isDarkMode ? "moon" : "moon-outline"} type={IconType.Ionicons} size={24} color={IVOO_COLORS.primary} style={styles.menuIcon} />
                  <Text style={[styles.menuText, { color: colors.text }]}>Modo oscuro</Text>
                </View>
                <Switch
                  trackColor={{ false: "#767577", true: IVOO_COLORS.primary }}
                  thumbColor={Platform.OS === 'android' ? (isDarkMode ? '#FFF' : "#f4f3f4") : ''}
                  onValueChange={toggleTheme}
                  value={isDarkMode}
                />
              </View>

              {/* Otros Items */}
              {[
                { label: 'Datos personales', icon: 'person-outline', key: 'personalData' },
                { label: 'Configuración', icon: 'settings-outline', key: 'settings' },
                { label: 'Ayuda', icon: 'headset-outline', key: 'help' },
                { label: 'Términos y condiciones', icon: 'shield-checkmark-outline', key: 'terms' }
              ].map((item) => (
                <TouchableOpacity 
                  key={item.key}
                  style={[styles.menuItem, { borderBottomColor: colors.border }]} 
                  onPress={() => handleMenuPress(item.key)}>
                  <View style={styles.menuLeft}>
                    <Icon name={item.icon} type={IconType.Ionicons} size={24} color={IVOO_COLORS.primary} style={styles.menuIcon} />
                    <Text style={[styles.menuText, { color: colors.text }]}>{item.label}</Text>
                  </View>
                  <Icon name="chevron-forward" type={IconType.Ionicons} size={20} color={colors.subText} />
                </TouchableOpacity>
              ))}
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
        </View>
      </CurvedHeaderLayout>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContentContainer: {
    marginTop: -30, // Sube el contenido para solapar la curva blanca
    paddingTop: 30,
    borderTopLeftRadius: 30, // Mantenemos la estética curva pero con nuestro color
    borderTopRightRadius: 30,
  },
  profileHeader: { alignItems: 'center', marginTop: -(SCREEN_WIDTH * 0.15), marginBottom: 15 },
  avatarContainer: {
    width: SCREEN_WIDTH * 0.28, height: SCREEN_WIDTH * 0.28, borderRadius: 100,
    marginBottom: 10, backgroundColor: '#E5E5EA', borderWidth: 4,
    justifyContent: 'center', alignItems: 'center', position: 'relative'
  },
  editIconContainer: {
    position: 'absolute', bottom: 0, right: 0, width: 36, height: 36,
    borderRadius: 18, backgroundColor: IVOO_COLORS.primary,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF',
  },
  avatar: { width: '100%', height: '100%', borderRadius: 100 },
  avatarPlaceholder: { width: '100%', height: '100%', borderRadius: 100 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  nameText: { fontSize: 20, fontFamily: IVOO_TYPOGRAPHY.fonts.interBold },
  verifiedIcon: { marginLeft: 5 },
  emailText: { fontSize: 14, marginTop: 2 },
  profileContent: { flex: 1 },
  menuContainer: { paddingHorizontal: 20, marginTop: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, justifyContent: 'space-between' },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIcon: { marginRight: 15 },
  menuText: { fontSize: 16 },
  bottomSection: { marginTop: 40, alignItems: 'center' },
  logoutButton: { padding: 10 },
  logoutText: { fontSize: 14, fontFamily: IVOO_TYPOGRAPHY.fonts.interBold, color: IVOO_COLORS.primary },
  logoContainer: { marginVertical: 20 },
});

export default ProfileScreen;