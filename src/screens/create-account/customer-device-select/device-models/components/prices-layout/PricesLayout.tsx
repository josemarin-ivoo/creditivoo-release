import React, {useState, useRef, useMemo} from 'react';
import {useNavigation, useTheme} from '@react-navigation/native';
import {View, FlatList, Animated} from 'react-native';
import {TouchableOpacity} from '@gorhom/bottom-sheet';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import TextWrapper from '@shared-components/text-wrapper/TextWrapper';
import Button from '@shared-components/button/Button';
import {Separator} from '@shared-components/separator/Separator';
import createStyles from './PricesLayout.style';
import PaymentsSublist from '../payments-sublist/PaymentsSublist';
import {SCREENS} from '@shared-constants';
import Brand from '@shared-components/brand/PurchaseItem';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from 'store/store';
import {
  getFinancingOptions,
  getFinancingOptionsByPriceId,
  setFinancingSelect,
} from 'store/slices/financing-slice';
import {Price} from '@services/api/models';
import {
  setResetSeletedPrice,
  setSelectedPrice,
} from 'store/slices/models-slice';

interface ModalContentProps {
  handleClose: () => void;
  toggleLayout: () => void;
}

const PricesLayout: React.FC<ModalContentProps> = ({
  handleClose,
  toggleLayout,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const {colors} = theme;
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const {selectedModel, prices, selectedPrice} = useSelector(
    (state: RootState) => state.models,
  );
  const {financingOptions} = useSelector((state: RootState) => state.financing);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const arrowAnimations = useRef<{[key: number]: Animated.Value}>({});

  const handlePress = (index: number, price: Price) => {
    dispatch(setSelectedPrice(price));
    setSelectedIndex(/*expandedIndex === index ? null :*/ index);
    // if (!arrowAnimations.current[index]) {
    //   arrowAnimations.current[index] = new Animated.Value(0);
    // }S
    // if (expandedIndex !== null && expandedIndex !== index) {
    //   Animated.timing(arrowAnimations.current[expandedIndex], {
    //     toValue: 0,
    //     duration: 300,
    //     useNativeDriver: true,
    //   }).start();
    // }

    // Animated.timing(arrowAnimations.current[index], {
    //   toValue: expandedIndex === index ? 0 : 1,
    //   duration: 300,
    //   useNativeDriver: true,
    // }).start();
  };

  const handleDefaultPrice = () => {
    setSelectedIndex(-2);
    dispatch(setResetSeletedPrice());
  };

  const handleContinue = async () => {
    if (selectedIndex === -2 && selectedModel) {
      await dispatch(getFinancingOptions(selectedModel.id));
    } else if (selectedPrice) {
      await dispatch(getFinancingOptionsByPriceId(selectedPrice.id));
    }
    //handleClose();
    toggleLayout();
    //navigation.navigate(SCREENS.SELLER.CUSTOMER_EMAIL as never);
  };

  return (
    <View>
      <Brand
        phoneBrand={selectedModel?.brand.name || ' '}
        selectedModel={selectedModel?.name ?? ' '}
        ram={selectedModel?.ram}
        onBack
        handleClose={handleClose}
      />
      <TouchableOpacity onPress={() => handleDefaultPrice()}>
        <View
          style={[
            styles.totalAmountContainer,
            selectedIndex === -2 && {backgroundColor: colors.primary},
          ]}>
          <TextWrapper
            fontSize={16}
            semiBoldSora
            color={selectedIndex === -2 ? '#fff' : colors.primary}>
            ${selectedModel?.price} : Precio por defecto
          </TextWrapper>
        </View>
      </TouchableOpacity>
      <FlatList
        data={
          prices /*financingOptions.filter(financing => financing.is_active)*/
        }
        keyExtractor={item => `${item.id}`}
        // contentContainerStyle={{marginTop: 12}}
        renderItem={({item, index}) => (
          <View>
            <TouchableOpacity onPress={() => handlePress(index, item)}>
              <View
                style={[
                  styles.totalAmountContainer,
                  selectedIndex === index && {backgroundColor: colors.primary},
                ]}>
                <TextWrapper
                  fontSize={16}
                  semiBoldSora
                  color={selectedIndex === index ? '#fff' : colors.primary}>
                  ${item.amount} : {item.description}
                </TextWrapper>
              </View>
            </TouchableOpacity>
            {/* <TouchableOpacity
              onPress={() => handlePress(index, item.financing_type_id)}>
              <View style={styles.installmentsContainer}>
                <View style={styles.installmentLeftCont}>
                  <View
                    style={[
                      styles.installmentIcon,
                      expandedIndex === index && {
                        borderColor: colors.primary,
                      },
                    ]}>
                    <TextWrapper fontSize={12} boldSora color={colors.white}>
                      {parseInt(item.initial_percentage * 100)}%
                    </TextWrapper>
                  </View>
                  <View style={styles.installmentDescrip}>
                    <TextWrapper fontSize={12} semiBoldSora>
                      {`${parseInt(item.initial_percentage * 100)}% de inicial`}{' '}
                    </TextWrapper>
                    <TextWrapper
                      fontSize={12}
                      color={
                        colors.itemSubtitle
                      }>{`${item.payment_details.length - 1} Cuotas`}</TextWrapper>
                  </View>
                </View>
                <View style={styles.arrowContainer}>
                  <TextWrapper fontSize={12}>
                    ${item.initial_payment}
                  </TextWrapper>
                  <Animated.View
                    style={{
                      transform: [
                        {
                          rotate: arrowAnimations.current[index]
                            ? arrowAnimations.current[index].interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', '90deg'],
                              })
                            : '0deg',
                        },
                      ],
                    }}>
                    <Icon
                      name="chevron-thin-right"
                      type={IconType.Entypo}
                      size={12}
                      color={colors.arrowDark}
                      style={styles.arrowLogo}
                    />
                  </Animated.View>
                </View>
              </View>
            </TouchableOpacity>
            {expandedIndex === index && (
              <PaymentsSublist paymentCuts={item.payment_details} />
            )}
            {index < financingOptions.length - 1 && <Separator />} */}
          </View>
        )}
      />
      <View style={styles.button}>
        <Button
          title="Continuar"
          onPress={handleContinue}
          disabled={selectedIndex === 0 ? false : selectedIndex ? false : true}
        />
      </View>
    </View>
  );
};

export default PricesLayout;
