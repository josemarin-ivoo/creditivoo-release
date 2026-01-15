import React, {useMemo} from 'react';
import {View, TouchableOpacity} from 'react-native';
import TextWrapper from '@shared-components/text-wrapper/TextWrapper';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {useNavigation, useTheme} from '@react-navigation/native';
import {palette} from '@theme/themes';
import {Separator} from '@shared-components/separator/Separator';
import createStyles from './PaymentItemLayout.style';
import {Payment} from '@services/api/payments';
import {
  addDays,
  capitalizeFirstLetter,
  formatDate,
  truncateNumber,
} from 'utils';
import {SCREENS} from '@shared-constants';
import {useDispatch} from 'react-redux';
import {AppDispatch} from 'store/store';
import {setSelectedPaymentId} from 'store/slices/payment-slice';

interface PaymentItemLayoutProps {
  payment: Payment;
}

const PaymentItemLayout: React.FC<PaymentItemLayoutProps> = ({payment}) => {
  const theme = useTheme();
  const {colors}: {colors: typeof palette} = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const {iconName, iconColor, itemTitle, iconType, itemAvailableToPay} =
    useMemo(() => {
      let iconName;
      let iconColor;
      let iconType = IconType.AntDesign;
      let itemTitle;
      let itemAvailableToPay = false;

      switch (payment.status) {
        case 'COMPLETED':
          iconName = 'check';
          iconColor = '#00B612';
          itemTitle = 'Pago Recibido';
          break;
        case 'SCHEDULED':
          iconName = 'calendar';
          iconColor = colors.primary;
          itemTitle = 'Pago agendado';
          itemAvailableToPay = true;
          break;
        case 'PENDING':
          iconName = 'clockcircleo';
          iconColor = '#09A1AB';
          itemTitle = 'Fecha de pago';
          itemAvailableToPay = true;
          break;
        case 'PASS_DUE':
          iconName = 'alert-triangle';
          iconColor = '#D72031';
          itemTitle = 'Pago retrasado';
          itemAvailableToPay = true;
          iconType = IconType.Feather;
          break;
        case 'PENDING_CONFIRMATION':
          iconName = 'progress-clock';
          iconColor = '#D72031';
          itemTitle = 'Verificación pendiente';
          iconType = IconType.MaterialCommunityIcons;
          break;

        case 'FAILED':
          iconName = 'error-outline';
          iconColor = '#D72031';
          itemTitle = 'Pago fallido';
          iconType = IconType.MaterialIcons;
          itemAvailableToPay = true;
          break;

        default:
          iconName = 'question-circle';
          iconColor = colors.iconBlack;
      }

      return {iconName, iconColor, itemTitle, iconType, itemAvailableToPay};
    }, [payment.status, colors]);

  const handlePressItem = (paymentId: number) => {
    if (itemAvailableToPay) {
      dispatch(setSelectedPaymentId(paymentId));
      navigation.navigate(SCREENS.PAYMENT_SELECTION as never);
    }
  };

  return (
    <TouchableOpacity onPress={() => handlePressItem(payment.id)}>
      <View style={styles.paymentItemContainer}>
        <View
          style={[
            styles.paymentIconContainer,
            iconName === 'progress-clock' && {
              transform: [{rotateY: '180deg'}],
            },
          ]}>
          <Icon
            type={iconType}
            name={iconName}
            size={24}
            color={iconColor}
            style={styles.paymentIcon}
          />
        </View>
        <View style={styles.paymentDetails}>
          <TextWrapper fontSize={14} boldSora>
            {itemTitle}
          </TextWrapper>
          <View style={styles.subDetails}>
            <TextWrapper fontSize={11} color={colors.itemSubtitle}>
              {capitalizeFirstLetter(
                formatDate(payment.paymentDate, 'MMM DD, YYYY'),
              )}
            </TextWrapper>
            {payment.status === 'PENDING_CONFIRMATION' && (
              <TextWrapper fontSize={11} color={'#C01F1F'}>
                {`Max ${capitalizeFirstLetter(addDays(payment.paymentDate, 2, 'MMM DD'))}`}
              </TextWrapper>
            )}
          </View>
        </View>
        <View
          style={[
            styles.amountContainer,
            itemAvailableToPay && {position: 'relative', left: 14},
          ]}>
          <TextWrapper fontSize={12} semiBoldSora color={colors.totalBlack}>
            {truncateNumber(Number(payment.amount), 2)}$
          </TextWrapper>
          {itemAvailableToPay && (
            <View style={styles.goToPay}>
              <TextWrapper
                semiBoldSora
                fontSize={10}
                color={colors.itemSubtitle}>
                {payment.status === 'FAILED' ? 'Reintentar ' : 'Ir a pagar'}
              </TextWrapper>
              <Icon
                name="chevron-thin-right"
                type={IconType.Entypo}
                size={6}
                color={colors.itemSubtitle}
                style={styles.arrowIcon}
              />
            </View>
          )}
        </View>
      </View>
      <Separator />
    </TouchableOpacity>
  );
};

export default PaymentItemLayout;
