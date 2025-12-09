import React, {useEffect, useMemo, useState} from 'react';
import {View, Image, FlatList, TouchableOpacity, Alert} from 'react-native';
import {useRoute, useTheme} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import TextWrapper from '@shared-components/text-wrapper/TextWrapper';
import createStyles from './DeviceModelsScreen.style';
import CustomBottomSheetModal from '@shared-components/bottom-sheet/CustomBottomSheetModal';
import FinancingLayout from './components/financing-layout/FinancingLayout';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../../store/store';
import {
  getModelsByBrand,
  getPricesByModelId,
  setSelectedModel,
} from '../../../../store/slices/models-slice';
import {getFinancingOptions} from '../../../../store/slices/financing-slice';
import LoaderSpinner from '@shared-components/loader-spinner/LoaderSpinner';
import placeholderImage from '../../../../assets/img/XiaomiLogo.png';
import {DeviceModel, DeviceStatus} from '@services/api/models';
import {setDeviceUnitSelected} from 'store/slices/deviceUnit-slice';
import {truncateString} from 'utils';
import PricesLayout from './components/prices-layout/PricesLayout';

const DeviceModelsScreen: React.FC = () => {
  const route = useRoute();
  const {brand}: any = route.params;
  const {id: brandId, name: phoneBrand} = brand;
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch<AppDispatch>();

  const {models, isLoading, error} = useSelector(
    (state: RootState) => state.models,
  );

  const [isModalVisible, setModalVisible] = useState(false);
  const [priceLayout, setPriceLayout] = useState(true);

  useEffect(() => {
    dispatch(getModelsByBrand(brandId));
  }, [dispatch, brandId]);

  const handleModelPress = async (item: DeviceModel) => {
    // Verifica si no hay unidades disponibles
    if (item?._count?.deviceUnits === 0) {
      Alert.alert(
        'Sin unidades',
        'Este dispositivo no tiene unidades disponibles.',
        [{text: 'OK'}],
      );
      return; // Detener el flujo si no hay unidades disponibles
    }

    // Si hay unidades disponibles, continúa con el flujo normal
    dispatch(setDeviceUnitSelected(item.deviceUnits[0].id));
    dispatch(setSelectedModel(item));
    setModalVisible(true);
    setPriceLayout(true);
    await dispatch(getPricesByModelId(item.id));
    //await dispatch(getFinancingOptions(item.id));
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const changeLayoutModal = () => {
    setPriceLayout(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <LoaderSpinner />
      ) : (
        <>
          <FlatList
            ListHeaderComponent={
              <>
                <View style={styles.titleContainer}>
                  <TextWrapper fontSize={32}>📱</TextWrapper>
                  <TextWrapper fontSize={21} semiBoldSora>
                    Selección de Equipo
                  </TextWrapper>
                </View>
                <View style={styles.brandInfoContainer}>
                  {/* <Image source={placeholderImage} style={styles.logo} /> */}
                  <TextWrapper fontSize={18}>{phoneBrand}</TextWrapper>
                </View>
              </>
            }
            data={models.filter(
              device => device.status === DeviceStatus.AVAILABLE,
            )}
            keyExtractor={item => item.id.toString()}
            renderItem={({item}) => (
              <TouchableOpacity onPress={() => handleModelPress(item)}>
                <View style={styles.modelItem}>
                  <TextWrapper fontSize={18}>
                    {truncateString(item.name, 20)}
                  </TextWrapper>
                  <TextWrapper fontSize={14} style={{opacity: 0.5}}>
                    {item?._count?.deviceUnits} disponibles
                  </TextWrapper>
                </View>
              </TouchableOpacity>
            )}
          />
          <CustomBottomSheetModal
            isVisible={isModalVisible}
            onClose={handleCloseModal}
            accessibilityLabel="Bottom Sheet Modal"
            bottomSheetScrollView>
            {priceLayout ? (
              <PricesLayout
                handleClose={handleCloseModal}
                toggleLayout={changeLayoutModal}
              />
            ) : (
              <FinancingLayout handleClose={handleCloseModal} />
            )}
          </CustomBottomSheetModal>
        </>
      )}
    </SafeAreaView>
  );
};

export default DeviceModelsScreen;
