import React, {useEffect, useMemo} from 'react';
import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useNavigation, useTheme} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import TextWrapper from '@shared-components/text-wrapper/TextWrapper';
import {Shadow} from 'react-native-shadow-2';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import createStyles from './DeviceBrandsScreen.style';
import {SCREENS} from '@shared-constants';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../../store/store';
import {getBrands} from '../../../../store/slices/brands-slice';
import placeholderImage from '../../../../assets/img/XiaomiLogo.png';
import LoaderSpinner from '@shared-components/loader-spinner/LoaderSpinner';

const DeviceBrandsScreen: React.FC = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const {colors} = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch<AppDispatch>();
  const {brands, isLoading, error} = useSelector(
    (state: RootState) => state.brands,
  );

  useEffect(() => {
    dispatch(getBrands());
  }, [dispatch]);

  if (isLoading) {
    return <LoaderSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.titleContainer}>
          <TextWrapper fontSize={32}>📱</TextWrapper>
          <TextWrapper fontSize={21} semiBoldSora>
            Selección de Equipo
          </TextWrapper>
        </View>
        <View style={styles.listContainer}>
          <FlatList
            scrollEnabled={false}
            contentContainerStyle={{padding: 20}}
            data={brands.filter(brand => brand.is_active)}
            keyExtractor={item => item.name}
            renderItem={({item}) => (
              <Shadow distance={2} offset={[0, 14]} startColor="#00000010">
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate(
                      //@ts-expect-error TODO: RootStackParamList
                      SCREENS.SELLER.CUSTOMER_DEVICE_SELECT.MODELS,
                      {brand: item},
                    )
                  }
                  style={styles.card}>
                  <View style={styles.brandContainer}>
                    {/* <Image source={placeholderImage} style={styles.logo} /> */}
                    <TextWrapper fontSize={18}>{item.name}</TextWrapper>
                  </View>
                  <Icon
                    name="chevron-thin-right"
                    type={IconType.Entypo}
                    size={20}
                    color={colors.borderColor}
                  />
                </TouchableOpacity>
              </Shadow>
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DeviceBrandsScreen;
