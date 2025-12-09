import React, {useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {PaymentMethodModel} from '@services/api/payments';
import {COLORS, FONTS} from 'app/styles/global.style';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from 'store/store';
import {fetchPaymentMethods} from 'store/slices/payment-methods-slice';

interface PaymentMethodItemProps {
  selectedMethodId: number | null;
  onPress: (id: number) => void;
}

const PaymentMethodItem: React.FC<PaymentMethodItemProps> = ({
  selectedMethodId,
  onPress,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {methods, isLoading} = useSelector(
    (state: RootState) => state.paymentMethods,
  );

  useEffect(() => {
    dispatch(fetchPaymentMethods());
  }, [dispatch]);

  const getPaymentMethodIcon = (method: PaymentMethodModel) => {
    switch (method.name.toUpperCase()) {
      case 'CASH':
        return (
          <Icon
            name="cash"
            size={24}
            color={selectedMethodId === method.id ? COLORS.primaryBlue : '#333'}
          />
        );
      case 'MOBILE_PAYMENT':
        return (
          <Icon
            name="cellphone"
            size={24}
            color={selectedMethodId === method.id ? COLORS.primaryBlue : '#333'}
          />
        );
      case 'BANK_TRANSFER':
        return (
          <Icon
            name="bank-transfer"
            size={24}
            color={selectedMethodId === method.id ? COLORS.primaryBlue : '#333'}
          />
        );
      default:
        return (
          <Icon
            name="credit-card"
            size={24}
            color={selectedMethodId === method.id ? COLORS.primaryBlue : '#333'}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando métodos de pago...</Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={true} style={{height: 200}}>
      {methods.map(method => (
        <TouchableOpacity
          key={method.id}
          onPress={() => onPress(method.id)}
          style={[
            styles.card,
            {
              borderColor:
                selectedMethodId === method.id ? COLORS.primaryBlue : '#E4E4E4',
            },
          ]}>
          <View style={styles.leftSide}>
            <View style={styles.iconContainer}>
              {getPaymentMethodIcon(method)}
            </View>
            <View>
              <Text
                style={[
                  styles.title,
                  {color: selectedMethodId === method.id ? '#000' : '#333'},
                ]}>
                {method.name}
              </Text>
              <Text style={styles.subtitle}>{method.description || ''}</Text>
            </View>
          </View>
          <View
            style={[
              styles.button,
              {
                backgroundColor:
                  selectedMethodId === method.id
                    ? COLORS.primaryBlue
                    : '#E4E4E4',
              },
            ]}>
            <View
              style={[
                styles.buttonInner,
                {
                  backgroundColor:
                    selectedMethodId === method.id ? '#FFFFFF' : '#E4E4E4',
                },
              ]}
            />
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  leftSide: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    marginBottom: 4,
    fontFamily: FONTS.urbanistBold,
  },
  subtitle: {
    fontSize: 12,
    color: '#868686',
    fontFamily: FONTS.urbanistRegular,
  },
  button: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default PaymentMethodItem;
