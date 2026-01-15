import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Modal,
  TouchableOpacity,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation, useTheme} from '@react-navigation/native';
import ButtonK from '@shared-components/button/ButtonK';
import TextWrapper from '@shared-components/text-wrapper/TextWrapper';
import {AppDispatch, RootState} from 'store/store';
import {updatePayment} from 'store/slices/payment-slice';
import {SCREENS} from '@shared-constants';
import {getUserBalance} from 'store/slices/balance-slice';
import {fetchPurchasesByUserId} from 'store/slices/purchase-slice';
import {User} from '@services/api/auth';
import {COLORS, FONTS} from 'app/styles/global.style';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const CashMethodConfirmLayout: React.FC<Props> = ({visible, onClose}) => {
  const theme = useTheme();
  const {colors} = theme;
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const selectedPayments = useSelector(
    (state: RootState) => state.payments.selectedPayments,
  );
  const user = useSelector((state: RootState) => state.auth.user as User);

  const handleAcceptAndContinue = async () => {
    try {
      if (selectedPayments.length > 0) {
        const ids = selectedPayments.map(payment => payment.id);
        await dispatch(
          updatePayment({
            selectedPaymentsIds: ids,
            method: 'CASH',
            paymentStatus: 'PENDING_CONFIRMATION',
          }),
        );
        onClose();
        refreshUserData();
        navigation.navigate(SCREENS.HOME as never);
      }
    } catch (error) {
      console.log('Error al Actualizar', error);
    }
  };

  const refreshUserData = () => {
    dispatch(getUserBalance(user.id));
    dispatch(fetchPurchasesByUserId(user.id));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.contentContainer}>
            <Image
              source={require('assets/img/wallet-3d.png')}
              style={styles.image}
              resizeMode="contain"
            />
            <Text style={styles.title}>Efectivo en tienda</Text>
            <TextWrapper
              fontSize={16}
              color={colors.totalBlack}
              style={styles.description}>
              Estimado usuario, el efectivo deberá ser consignado en 48 horas
              hábiles a partir de este momento, en caso de no poder verificar su
              pago el dispositivo será bloqueado
            </TextWrapper>
          </View>

          <View style={styles.bottomContainer}>
            <View style={styles.buttonContainer}>
              <ButtonK
                onPress={handleAcceptAndContinue}
                title="Aceptar y continuar"
              />
            </View>

            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <TextWrapper
                semiBoldSora
                color={colors.dynamicText}
                fontSize={14}
                center>
                Cancelar
              </TextWrapper>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CashMethodConfirmLayout;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
  },
  image: {
    width: 230,
    height: 230,
    marginBottom: 40,
  },
  title: {
    fontFamily: FONTS.urbanistBold,
    fontSize: 33,
    color: COLORS.primaryGreen,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  description: {
    fontFamily: FONTS.urbanistRegular,
    fontSize: 16,
    color: COLORS.greyDark,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 12,
    lineHeight: 24,
  },
  // title: {
  //   fontSize: 24,
  //   fontFamily: FONTS.urbanistBold,
  //   color: COLORS.primaryBlue,
  //   textAlign: 'center',
  //   marginBottom: 16,
  // },
  // description: {
  //   textAlign: 'center',
  //   lineHeight: 24,
  //   fontSize: 16,
  //   fontFamily: FONTS.urbanistRegular,
  //   color: COLORS.greyDark,
  // },
  bottomContainer: {
    paddingBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 16,
  },
  cancelButton: {
    marginTop: 8,
  },
});
