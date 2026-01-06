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
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import {
  launchCamera,
  launchImageLibrary,
  CameraOptions,
  ImagePickerResponse,
} from 'react-native-image-picker';
import {useIvoDispatch, useIvoSelector} from '../../../../../redux/useIvo';
import {logout, fetchMe} from '../../store-creditivoo/slices/auth-slice';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import {SCREENS} from '@shared-constants';
import CurvedHeaderLayout from '../../components/layouts/CurvedHeaderLayout';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import CreditivooVerde from '../../svgs/CreditivooVerde';
import {uploadProfilePicture} from '../../services/profile';

import { Routes } from '../../../../../Utils/NavigationRoutes';

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
  const insets = useSafeAreaInsets();
  const {user} = useIvoSelector(state => state.creditivoo.auth);
  const [isUploading, setIsUploading] = useState(false);
  const [showPhotoOptionsModal, setShowPhotoOptionsModal] = useState(false);
  const [imageKey, setImageKey] = useState(0); // Para forzar re-render de la imagen
  const [tempProfilePictureUrl, setTempProfilePictureUrl] = useState<
    string | null
  >(null); // URL temporal después de subir

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
  const userDocument = user?.document || null;
  const profilePictureUrl = (user as any)?.profilePictureUrl || null;
  // Usar la URL temporal si existe (después de subir), sino usar la del usuario
  const displayProfilePictureUrl = tempProfilePictureUrl || profilePictureUrl;
  const hasAvatarImage = !!displayProfilePictureUrl;

  // Forzar re-render de la imagen cuando cambie la URL
  useEffect(() => {
    if (profilePictureUrl && !tempProfilePictureUrl) {
      // Solo actualizar si no hay una URL temporal activa
      console.log(
        '[ProfileScreen] profilePictureUrl cambió:',
        profilePictureUrl,
      );
      setImageKey(prev => prev + 1);
    }
  }, [profilePictureUrl, tempProfilePictureUrl]);

  // Solicitar permiso de cámara
  const requestCameraPermission = useCallback(async () => {
    try {
      const cameraPermission =
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.CAMERA
          : PERMISSIONS.IOS.CAMERA;

      const checkResult = await check(cameraPermission);

      if (checkResult === RESULTS.GRANTED) {
        return true;
      }

      if (
        checkResult === RESULTS.BLOCKED ||
        checkResult === RESULTS.UNAVAILABLE
      ) {
        Alert.alert(
          'Permiso de Cámara Requerido',
          'Para cambiar tu foto de perfil, necesitamos acceso a tu cámara. Por favor, otorga el permiso en la configuración de la app.',
          [
            {
              text: 'Cancelar',
              style: 'cancel',
            },
            {
              text: 'Abrir Configuración',
              onPress: () => {
                openSettings();
              },
            },
          ],
        );
        return false;
      }

      const requestResult = await request(cameraPermission);

      if (requestResult === RESULTS.GRANTED) {
        return true;
      } else {
        Alert.alert(
          'Permiso de Cámara Requerido',
          'Para cambiar tu foto de perfil, necesitamos acceso a tu cámara. Por favor, otorga el permiso en la configuración de la app.',
          [
            {
              text: 'Cancelar',
              style: 'cancel',
            },
            {
              text: 'Abrir Configuración',
              onPress: () => {
                openSettings();
              },
            },
          ],
        );
        return false;
      }
    } catch (err) {
      console.warn('[ProfileScreen] Error al solicitar permiso:', err);
      return false;
    }
  }, []);

  // Solicitar permiso de galería
  const requestPhotoLibraryPermission = useCallback(async () => {
    try {
      const photoPermission =
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
          : PERMISSIONS.IOS.PHOTO_LIBRARY;

      const checkResult = await check(photoPermission);

      if (checkResult === RESULTS.GRANTED) {
        return true;
      }

      if (
        checkResult === RESULTS.BLOCKED ||
        checkResult === RESULTS.UNAVAILABLE
      ) {
        Alert.alert(
          'Permiso de Galería Requerido',
          'Para seleccionar una foto de perfil, necesitamos acceso a tu galería. Por favor, otorga el permiso en la configuración de la app.',
          [
            {
              text: 'Cancelar',
              style: 'cancel',
            },
            {
              text: 'Abrir Configuración',
              onPress: () => {
                openSettings();
              },
            },
          ],
        );
        return false;
      }

      const requestResult = await request(photoPermission);

      if (requestResult === RESULTS.GRANTED) {
        return true;
      } else {
        Alert.alert(
          'Permiso de Galería Requerido',
          'Para seleccionar una foto de perfil, necesitamos acceso a tu galería. Por favor, otorga el permiso en la configuración de la app.',
          [
            {
              text: 'Cancelar',
              style: 'cancel',
            },
            {
              text: 'Abrir Configuración',
              onPress: () => {
                openSettings();
              },
            },
          ],
        );
        return false;
      }
    } catch (err) {
      console.warn('[ProfileScreen] Error al solicitar permiso de galería:', err);
      return false;
    }
  }, []);

  // Manejar subida de imagen
  const handleUploadImage = useCallback(
    async (imageUri: string) => {
      setIsUploading(true);
      try {
        const result = await uploadProfilePicture(imageUri);
        console.log('[ProfileScreen] Foto subida exitosamente:', result);
        console.log(
          '[ProfileScreen] URL devuelta por uploadProfilePicture:',
          result.url,
        );

        // Usar la URL que devuelve uploadProfilePicture directamente
        // Esto evita problemas cuando fetchMe() devuelve una URL que aún no existe
        setTempProfilePictureUrl(result.url);
        setImageKey(prev => prev + 1);

        // Esperar un momento para que el servidor procese la imagen en S3
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Actualizar datos del usuario después de subir
        const updatedUser = await dispatch(fetchMe()).unwrap();
        console.log('[ProfileScreen] Usuario actualizado:', updatedUser);
        console.log(
          '[ProfileScreen] URL devuelta por fetchMe:',
          updatedUser.user?.profilePictureUrl,
        );

        // Si fetchMe devuelve una URL válida, usarla y limpiar la temporal
        if (updatedUser.user?.profilePictureUrl) {
          setTempProfilePictureUrl(null);
          setImageKey(prev => prev + 1);
        }

        Alert.alert('Éxito', 'Foto de perfil actualizada correctamente');
      } catch (error: any) {
        console.error('[ProfileScreen] Error al subir imagen:', error);
        setTempProfilePictureUrl(null); // Limpiar URL temporal en caso de error
        Alert.alert('Error', error.message || 'Error al subir la imagen');
      } finally {
        setIsUploading(false);
      }
    },
    [dispatch],
  );

  // Manejar selección de imagen desde galería
  const handleSelectFromGallery = useCallback(async () => {
    // Solicitar permiso de galería antes de abrir
    const hasPermission = await requestPhotoLibraryPermission();
    if (!hasPermission) {
      return;
    }

    const options = {
      mediaType: 'photo' as const,
      quality: 0.8 as const,
      maxWidth: 1200,
      maxHeight: 1200,
    };

    launchImageLibrary(options, async (response: ImagePickerResponse) => {
      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        Alert.alert(
          'Error',
          'Error al seleccionar la imagen. Por favor, intenta de nuevo.',
        );
        return;
      }

      const uri = response.assets?.[0]?.uri;
      if (uri) {
        await handleUploadImage(uri);
      }
    });
  }, [handleUploadImage, requestPhotoLibraryPermission]);

  // Manejar toma de foto desde cámara
  const handleTakePhoto = useCallback(async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      return;
    }

    const options: CameraOptions = {
      mediaType: 'photo',
      cameraType: 'front',
      quality: 0.8,
      maxWidth: 1200,
      maxHeight: 1200,
      saveToPhotos: false,
    };

    try {
      const response = await launchCamera(options);

      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        Alert.alert(
          'Error',
          'Error al tomar la foto. Por favor, intenta de nuevo.',
        );
        return;
      }

      const uri = response.assets?.[0]?.uri;
      if (uri) {
        await handleUploadImage(uri);
      }
    } catch (error) {
      console.error('[ProfileScreen] Error al capturar foto:', error);
      Alert.alert(
        'Error',
        'Error al procesar la imagen. Por favor, intenta de nuevo.',
      );
    }
  }, [requestCameraPermission, handleUploadImage]);

  // Mostrar opciones de selección de imagen
  const handleAvatarPress = useCallback(() => {
    if (isUploading) {
      return;
    }
    setShowPhotoOptionsModal(true);
  }, [isUploading]);

  const handleClosePhotoOptionsModal = useCallback(() => {
    setShowPhotoOptionsModal(false);
  }, []);

  const handleSelectTakePhoto = useCallback(() => {
    setShowPhotoOptionsModal(false);
    handleTakePhoto();
  }, [handleTakePhoto]);

  const handleSelectGallery = useCallback(() => {
    setShowPhotoOptionsModal(false);
    handleSelectFromGallery();
  }, [handleSelectFromGallery]);

  const headerContent = (
    <View style={styles.profileHeader}>
      {/* Avatar */}
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={handleAvatarPress}
        activeOpacity={0.8}
        disabled={isUploading}>
        {hasAvatarImage && displayProfilePictureUrl ? (
          <Image
            source={{
              uri: displayProfilePictureUrl,
            }}
            style={styles.avatar}
            resizeMode="cover"
            key={`avatar-${displayProfilePictureUrl}-${imageKey}`} // Forzar re-render cuando cambie la URL o el key
            onError={error => {
              console.log('[ProfileScreen] Error loading avatar image');
              console.log('[ProfileScreen] Error details:', error.nativeEvent);
              console.log(
                '[ProfileScreen] Attempted URL:',
                displayProfilePictureUrl,
              );
              console.log(
                '[ProfileScreen] Is temp URL:',
                !!tempProfilePictureUrl,
              );
              console.log('[ProfileScreen] Image key:', imageKey);
              // Si falla la URL temporal, limpiarla y usar la del usuario
              if (tempProfilePictureUrl) {
                console.log(
                  '[ProfileScreen] Limpiando URL temporal y usando URL del usuario',
                );
                setTempProfilePictureUrl(null);
              }
            }}
            onLoad={() => {
              console.log('[ProfileScreen] Avatar image loaded successfully');
              console.log(
                '[ProfileScreen] Loaded URL:',
                displayProfilePictureUrl,
              );
              console.log(
                '[ProfileScreen] Is temp URL:',
                !!tempProfilePictureUrl,
              );
            }}
          />
        ) : (
          <Image
            source={require('../../images/profile/ivitoo-profile.png')}
            style={styles.avatarPlaceholder}
            resizeMode="contain"
          />
        )}
        {/* Indicador de que se puede tocar para cambiar */}
        <View style={styles.editIconContainer}>
          {isUploading ? (
            <ActivityIndicator size="small" color={IVOO_COLORS.white} />
          ) : (
            <Icon
              name="camera"
              type={IconType.Ionicons}
              size={SCREEN_WIDTH * 0.05}
              color={IVOO_COLORS.white}
            />
          )}
        </View>
      </TouchableOpacity>

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
      <View
        style={[
          styles.profileContent,
          {
            paddingBottom: Platform.select({
              ios: insets.bottom + SCREEN_WIDTH * 0.05,
              android: SCREEN_WIDTH * 0.05,
            }),
          },
        ]}>
        <View style={styles.menuContainer}>
          {/* Datos personales */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuPress('personalData')}>
            <View style={styles.menuLeft}>
              <Icon
                name="person-outline"
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
            {/* {userDocument && (
              <Text style={styles.documentText}>{userDocument}</Text>
            )} */}
          </View>
        </View>
      </View>

      {/* Modal de opciones de foto de perfil */}
      <Modal
        visible={showPhotoOptionsModal}
        transparent
        animationType="fade"
        onRequestClose={handleClosePhotoOptionsModal}>
        <View style={styles.photoOptionsOverlay}>
          <View style={styles.photoOptionsCard}>
            <Text style={styles.photoOptionsTitle}>Cambiar foto de perfil</Text>
            <Text style={styles.photoOptionsMessage}>
              Selecciona una opción para cambiar tu foto de perfil
            </Text>

            <View style={styles.photoOptionsButtons}>
              <TouchableOpacity
                style={styles.photoOptionButton}
                onPress={handleSelectTakePhoto}
                activeOpacity={0.7}>
                <View style={styles.photoOptionIconContainer}>
                  <Icon
                    name="camera"
                    type={IconType.Ionicons}
                    size={28}
                    color={IVOO_COLORS.primary}
                  />
                </View>
                <Text style={styles.photoOptionText}>Tomar foto</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.photoOptionButton}
                onPress={handleSelectGallery}
                activeOpacity={0.7}>
                <View style={styles.photoOptionIconContainer}>
                  <Icon
                    name="images"
                    type={IconType.Ionicons}
                    size={28}
                    color={IVOO_COLORS.primary}
                  />
                </View>
                <Text style={styles.photoOptionText}>Elegir de galería</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.photoOptionsCancelButton}
              onPress={handleClosePhotoOptionsModal}
              activeOpacity={0.7}>
              <Text style={styles.photoOptionsCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: IVOO_COLORS.grayLight,
    borderWidth: 3,
    borderColor: IVOO_COLORS.white,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: SCREEN_WIDTH * 0.1,
    height: SCREEN_WIDTH * 0.1,
    borderRadius: (SCREEN_WIDTH * 0.1) / 2,
    backgroundColor: IVOO_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: IVOO_COLORS.white,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: (SCREEN_WIDTH * 0.28) / 2,
    overflow: 'hidden',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: (SCREEN_WIDTH * 0.28) / 2,
    overflow: 'hidden',
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
    // paddingBottom will be set dynamically based on safe area insets
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
  documentText: {
    fontSize: SCREEN_WIDTH * 0.032,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.grayMedium,
    opacity: 0.6,
    marginTop: SCREEN_WIDTH * 0.03,
    textAlign: 'center',
  },
  photoOptionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.05,
  },
  photoOptionsCard: {
    width: Math.min(SCREEN_WIDTH * 0.85, 340),
    backgroundColor: IVOO_COLORS.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  photoOptionsTitle: {
    fontSize: SCREEN_WIDTH * 0.05,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  photoOptionsMessage: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.regular,
    color: IVOO_COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: SCREEN_WIDTH * 0.05,
  },
  photoOptionsButtons: {
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },
  photoOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  photoOptionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  photoOptionText: {
    fontSize: SCREEN_WIDTH * 0.042,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interSemiBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.textPrimary,
    flex: 1,
  },
  photoOptionsCancelButton: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  photoOptionsCancelText: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interSemiBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: '#F44336',
  },
});

export default ProfileScreen;
