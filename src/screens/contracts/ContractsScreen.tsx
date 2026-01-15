import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {COLORS, FONTS} from '../../app/styles/global.style';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from 'store/store';
import {fetchTermsAndConditionsByID} from 'store/slices/termsAndConditions-slice';
import Button from '@shared-components/button/Button';
import {acceptTermsAndConditions} from 'store/slices/purchase-slice';
import {formatCurrency, useStatusBar} from '@utils';
import {getModelById} from 'store/slices/models-slice';

const {width: screenWidth} = Dimensions.get('window');

const ContractsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  // Configurar status bar con el color de fondo de la pantalla
  useStatusBar({
    backgroundColor: COLORS.white,
  });
  const [isAgreed, setIsAgreed] = useState(false);
  const {userPurchases, isLoading: isAcceptingTerms} = useSelector(
    (state: RootState) => state.purchases,
  );
  const {termsAndConditions, isLoading: isFetchingTerms} = useSelector(
    (state: RootState) => state.termsAndConditions,
  );
  const {user} = useSelector((state: RootState) => state.auth);
  const {payments} = useSelector((state: RootState) => state.payments);
  const {selectedModel} = useSelector((state: RootState) => state.models);

  const purchaseToAccept = userPurchases.find(
    purchase => purchase.termsAndConditionsId,
  );

  useEffect(() => {
    if (purchaseToAccept && purchaseToAccept.termsAndConditionsId) {
      dispatch(
        fetchTermsAndConditionsByID(purchaseToAccept.termsAndConditionsId),
      );
      dispatch(getModelById(purchaseToAccept.deviceId));
    }
  }, [purchaseToAccept, dispatch]);

  const processContractText = (text: string) => {
    if (!user || !payments || !purchaseToAccept) {
      return text;
    }

    const replacements: {[key: string]: string} = {
      '{nombreCliente}': user.name,
      '{apellidoCliente}': user.lastname,
      '{documentoCliente}': user.document,
      '{nroCuotas}': (payments.length - 1).toString(),
      '{montoTotal}': formatCurrency(purchaseToAccept.totalAmount),
      '{montoInicial}': formatCurrency(purchaseToAccept.initial_payment || 0),
      '{montoCuota}': formatCurrency(purchaseToAccept.installment_amount || 0),
      '{diasEntreCuotas}':
        purchaseToAccept.days_between_payments?.toString() || '0',
      '{imeiDispositivo}': purchaseToAccept.imei || '0',
      '{modeloDispositivo}': selectedModel?.name || '0',
      '{marcaDispositivo}': selectedModel?.brand?.name || '0',
      '{ramDispositivo}': selectedModel?.ram || '0',
    };

    let processedText = text;
    for (const key in replacements) {
      processedText = processedText.replace(
        new RegExp(key, 'g'),
        replacements[key],
      );
    }

    return processedText;
  };

  const handleAcceptTerms = () => {
    if (purchaseToAccept) {
      dispatch(acceptTermsAndConditions(purchaseToAccept.id));
    }
  };

  const handlePressCheckbox = () => {
    setIsAgreed(!isAgreed);
  };

  const renderContract = () => {
    if (isFetchingTerms) {
      return <ActivityIndicator size="large" color={COLORS.primaryGreen} />;
    }

    if (purchaseToAccept && termsAndConditions) {
      return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>{termsAndConditions.mainTitle}</Text>
          <Text style={styles.mainText}>
            {processContractText(termsAndConditions.mainText)}
          </Text>

          {!purchaseToAccept.termsAccepted && (
            <>
              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => handlePressCheckbox()}>
                  {isAgreed && (
                    <Icon
                      name="check"
                      type={IconType.Feather}
                      size={20}
                      color={COLORS.greyDark}
                    />
                  )}
                </TouchableOpacity>
                <Text style={styles.checkboxLabel} numberOfLines={2}>
                  {termsAndConditions.confirmText}
                </Text>
              </View>

              {isAgreed && (
                <View style={styles.confirmButton}>
                  <Button
                    title="Confirmar"
                    onPress={handleAcceptTerms}
                    loading={isAcceptingTerms}
                    borderRadius={4}
                  />
                </View>
              )}
            </>
          )}
        </ScrollView>
      );
    }

    return (
      <>
        <Image
          source={require('../../assets/img/look-3d.png')}
          style={styles.image}
          resizeMode="contain"
        />
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Sin contratos</Text>
          <Text style={styles.subtitle}>
            No tienes contratos activos. Porfavor, contacta a tu asesor para
            obtener mas informacion.
          </Text>
        </View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon
            name="arrow-left"
            type={IconType.Feather}
            size={24}
            color={COLORS.greyDark}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contratos</Text>
      </View>
      <View style={styles.body}>{renderContract()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 8,
  },
  headerTitle: {
    fontFamily: FONTS.urbanistBold,
    fontSize: 22,
    color: COLORS.greyDark,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  scrollContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: 40,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: screenWidth,
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: FONTS.urbanistBold,
    fontSize: 30,
    color: COLORS.primaryGreen,
    textAlign: 'center',
    marginBottom: 12,
  },
  mainText: {
    fontFamily: FONTS.urbanistRegular,
    fontSize: 16,
    color: COLORS.greyDark,
    textAlign: 'justify',
    lineHeight: 24,
    marginBottom: 20,
  },
  subtitle: {
    fontFamily: FONTS.urbanistRegular,
    fontSize: 16,
    color: COLORS.greyDark,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.primaryGreen,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: 'transparent',
  },
  checkboxLabel: {
    fontFamily: FONTS.urbanistRegular,
    fontSize: 16,
    color: COLORS.greyDark,
    flex: 1,
  },
  confirmButton: {
    width: '100%',
  },
});

export default ContractsScreen;
