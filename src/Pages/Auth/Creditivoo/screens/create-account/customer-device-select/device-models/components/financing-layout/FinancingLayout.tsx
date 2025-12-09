import React, {useState, useRef, useMemo} from 'react';
import {useNavigation, useTheme} from '@react-navigation/native';
import {View, FlatList, Animated} from 'react-native';
import {TouchableOpacity} from '@gorhom/bottom-sheet';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import TextWrapper from '@shared-components/text-wrapper/TextWrapper';
import Button from '@shared-components/button/Button';
import {Separator} from '@shared-components/separator/Separator';
import createStyles from './FinancingLayout.style';
import PaymentsSublist from '../payments-sublist/PaymentsSublist';
import {SCREENS} from '@shared-constants';
import Brand from '@shared-components/brand/PurchaseItem';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from 'store/store';
import {setFinancingSelect} from 'store/slices/financing-slice';

interface ModalContentProps {
  handleClose: () => void;
}

const FinancingLayout: React.FC<ModalContentProps> = ({handleClose}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const {colors} = theme;
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const {selectedModel, selectedPrice} = useSelector(
    (state: RootState) => state.models,
  );
  const {financingOptions} = useSelector((state: RootState) => state.financing);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const arrowAnimations = useRef<{[key: number]: Animated.Value}>({});

  const handlePress = (index: number, financingSelectedId: number) => {
    dispatch(setFinancingSelect({financingSelectedId}));
    setExpandedIndex(expandedIndex === index ? null : index);
    if (!arrowAnimations.current[index]) {
      arrowAnimations.current[index] = new Animated.Value(0);
    }
    if (expandedIndex !== null && expandedIndex !== index) {
      Animated.timing(arrowAnimations.current[expandedIndex], {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    Animated.timing(arrowAnimations.current[index], {
      toValue: expandedIndex === index ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleContinue = () => {
    handleClose();
    navigation.navigate(SCREENS.SELLER.CUSTOMER_EMAIL as never);
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
      <View style={styles.totalAmountContainer}>
        <TextWrapper fontSize={21} semiBoldSora color={colors.primary}>
          ${selectedPrice?.amount ?? selectedModel?.price}
        </TextWrapper>
      </View>
      <FlatList
        data={financingOptions.filter(financing => financing.is_active)}
        keyExtractor={item => `${item.financing_type_id}`}
        contentContainerStyle={{marginTop: 12}}
        renderItem={({item, index}) => (
          <View>
            <TouchableOpacity
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
            {index < financingOptions.length - 1 && <Separator />}
          </View>
        )}
      />
      <View style={styles.button}>
        <Button
          title="Continuar"
          onPress={handleContinue}
          disabled={expandedIndex === 0 ? false : expandedIndex ? false : true}
        />
      </View>
    </View>
  );
};

export default FinancingLayout;
