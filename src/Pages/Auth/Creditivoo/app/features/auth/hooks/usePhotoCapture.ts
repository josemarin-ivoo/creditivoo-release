import {useState} from 'react';
import {Platform} from 'react-native';
import {useDispatch} from 'react-redux';
import {useToast} from 'react-native-toast-notifications';
import {
  launchCamera,
  CameraOptions,
  CameraType,
} from 'react-native-image-picker';
import mime from 'mime';
import {updateUserDocument, updateUserSelfie} from 'store/slices/users-slice';
import {waitForFile} from 'utils/waitForFile';
import {AppDispatch} from 'store/store';

export const usePhotoCapture = (registerUserId?: number) => {
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();
  const [loadingUserSelfie, setLoadingUserSelfie] = useState(false);
  const [loadingUserDocument, setLoadingUserDocument] = useState(false);

  const handleTakePhoto = async (type: 'USER' | 'USER_DOCUMENT') => {
    const options: CameraOptions = {
      mediaType: 'photo',
      cameraType: type === 'USER' ? 'front' : ('back' as CameraType),
      quality: 0.5,
      maxWidth: 800,
      maxHeight: 800,
    };

    const setLoading = (loading: boolean) => {
      if (type === 'USER') {
        setLoadingUserSelfie(loading);
      } else {
        setLoadingUserDocument(loading);
      }
    };

    try {
      setLoading(true);
      const response = await launchCamera(options);

      if (response.didCancel) {
        setLoading(false);
        return false;
      }
      if (response.errorCode) {
        toast.show('Error al tomar la foto', {type: 'danger'});
        setLoading(false);
        return false;
      }

      const uri = response.assets?.[0]?.uri;
      if (!uri) {
        toast.show('Error al tomar la foto. not URI', {type: 'danger'});
        setLoading(false);
        return false;
      }

      const mimeType = mime.getType(uri) || 'image/jpeg';
      const formattedUri =
        Platform.OS === 'android' ? uri : uri.replace('file://', '');

      const fileReady = await waitForFile(formattedUri, 5000, 300);
      if (!fileReady) {
        toast.show('Archivo no disponible después de capturar', {
          type: 'danger',
        });
        setLoading(false);
        return false;
      }

      // Subir a backend
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        type: mimeType,
        name: `photo_${Date.now()}.jpg`,
      });

      formData.append('resourceType', type);
      formData.append('resourceId', registerUserId?.toString() || '');

      const action = type === 'USER' ? updateUserSelfie : updateUserDocument;
      const resultAction = await dispatch(action(formData));

      if (action.fulfilled.match(resultAction)) {
        toast.show(
          `¡${type === 'USER' ? 'Selfie' : 'Documento'} subido correctamente!`,
          {type: 'success'},
        );
        setLoading(false);
        return true;
      }
      setLoading(false);
      return false;
    } catch (error) {
      toast.show('Error al procesar la imagen', {type: 'danger'});
      setLoading(false);
      return false;
    }
  };

  return {
    handleTakePhoto,
    loadingUserSelfie,
    loadingUserDocument,
  };
};

