import {useNavigation} from '@react-navigation/native';
import Button from '@shared-components/button/Button';
import React, {useEffect, useMemo, useState} from 'react';
import {Alert, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import createStyles from './CustomerCamConfirmScreen.style';
import ConfirmLogo from './components/ConfirmLogo';
import TextWrapper from '@shared-components/text-wrapper/TextWrapper';
import {launchCamera} from 'react-native-image-picker';
import {SCREENS} from '@shared-constants';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from 'store/store';
import {SendUser} from '@services/api/users';
import {clearUser, createUser} from 'store/slices/users-slice';
import {submitPurchase} from 'store/slices/purchase-slice';

import {PurchaseStatus} from '@services/api/purchases';
import {submitDeviceUnit} from 'store/slices/deviceUnit-slice';
import {InventoryStatus, Status} from '@services/api/deviceUnit';
import {NativeModules} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import RNFS from 'react-native-fs';

const CustomerCamConfirmScreen: React.FC = () => {
  const styles = useMemo(() => createStyles(), []);
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const {user} = useSelector((state: RootState) => state.users);
  const {user: seller} = useSelector((state: RootState) => state.auth);
  const {selectedModel, selectedPrice} = useSelector(
    (state: RootState) => state.models,
  );
  const {financingSelectedId} = useSelector(
    (state: RootState) => state.financing,
  );
  const {deviceUnitSelected} = useSelector(
    (state: RootState) => state.deviceUnit,
  );
  const {NuovoModule} = NativeModules;
  const [loading, setLoading] = useState<boolean>(false);
  const [androidDeviceInfo, setAndroidDeviceInfo] = useState<any>({});

  useEffect(() => {
    const fetchNativeInfo = async () => {
      const androidInfo = await NuovoModule.getDeviceInformation();
      setAndroidDeviceInfo(androidInfo);
    };
    fetchNativeInfo();
  }, [NuovoModule]);

  const handleOpenCamera = async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.5,
      saveToPhotos: true,
    });
    if (result.assets && result.assets.length > 0) {
      const uploadedImage = result.assets[0];
      await processUserRegistration(uploadedImage);
    } else {
      Alert.alert('Error', 'No se pudo capturar la imagen.', [
        {
          text: 'OK',
          onPress: () => resetProcess(),
        },
      ]);
    }
  };

  const processUserRegistration = async (image: any) => {
    try {
      setLoading(true);

      const fileContentBase64 = await RNFS.readFile(image.uri, 'base64');

      const fileData = {
        base64Content: fileContentBase64,
        originalname: image.fileName,
        mimetype: image.type,
      };

      const createdUser = await handleCreateUser();
      await handleSubmitPurchase({
        userId: createdUser.user.id,
        file: fileData,
      });
      handleUpdateDeviceUnit(createdUser.user.id);
      navigation.navigate(SCREENS.SELLER.CUSTOMER_SIGNUP_SUCCESS as never);
    } catch (error: any) {
      Alert.alert('Error', error.message, [
        {
          text: 'OK',
          onPress: () => resetProcess(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    return dispatch(createUser(user as SendUser)).unwrap();
  };

  const handleUpdateDeviceUnit = (userId: number) => {
    if (deviceUnitSelected) {
      const updatedData = {
        userId,
        imei: androidDeviceInfo?.imeiNo,
        //imei: '1234569testingImeiiinew14',
        androidId: androidDeviceInfo?.deviceId,
        //androidId: '1234569testingAndroidnew14',
        serialNumber: androidDeviceInfo?.buildSerialNumber,
        //serialNumber: '1234569testingSerialnew14',
        status: InventoryStatus.RESERVED,
        availability: Status.PENDING,
        metadata: androidDeviceInfo,
      };
      dispatch(
        submitDeviceUnit({deviceUnitId: deviceUnitSelected, data: updatedData}),
      );
    }
  };

  const handleSubmitPurchase = async ({userId /*, file*/}: any) => {
    //const {base64Content, originalname, mimetype} = file;

    const purchaseData = {
      userId,
      deviceId: selectedModel?.id || null,
      devicePriceId: selectedPrice?.id || null,
      file: 'imageFile' /*{base64Content, originalname, mimetype}*/,
      deviceUnitId: deviceUnitSelected || null,
      financingTypeId: financingSelectedId,
      totalAmount: selectedPrice?.amount
        ? parseFloat(selectedPrice.amount)
        : parseFloat(selectedModel?.price || '0'),
      status: 'PENDING' as PurchaseStatus,
    };
    return dispatch(submitPurchase(purchaseData)).unwrap();
  };

  const resetProcess = () => {
    dispatch(clearUser());
    navigation.navigate(SCREENS.SELLER.CUSTOMER_EMAIL as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <ConfirmLogo />
        <View style={styles.textContainer}>
          <TextWrapper fontSize={16} center>
            Ten a la mano el documento de Identidad del cliente a registrar
          </TextWrapper>
        </View>
        <View style={styles.button}>
          <Button
            title="Validar documento"
            loading={loading}
            onPress={handleOpenCamera}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CustomerCamConfirmScreen;
