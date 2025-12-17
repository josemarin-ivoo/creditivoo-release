import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import CurvedHeaderLayout from '../../components/layouts/CurvedHeaderLayout';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import {InstallmentItem, Installment} from '../../components/purchases';
import {Purchase} from '../../components/purchases';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

type RouteParams = {
  PaymentInstallments: {
    purchase: Purchase;
  };
};

type PaymentInstallmentsRouteProp = RouteProp<
  RouteParams,
  'PaymentInstallments'
>;

// Mock data - Replace with actual API call
const generateMockInstallments = (purchase: Purchase): Installment[] => {
  // This is mock data based on the image
  // In production, this should come from the API
  const installments: Installment[] = [
    {
      id: '1',
      date: '2024-10-24',
      type: 'initial',
      amount: 47.2,
      status: 'approved',
    },
    {
      id: '2',
      date: '2024-11-07',
      type: 'installment',
      installmentNumber: 1,
      amount: 23.6,
      status: 'approved',
    },
    {
      id: '3',
      date: '2024-11-21',
      type: 'installment',
      installmentNumber: 2,
      amount: 23.6,
      status: 'approved',
    },
    {
      id: '4',
      date: '2024-12-05',
      type: 'installment',
      installmentNumber: 3,
      amount: 23.6,
      status: 'pending',
      gemsReward: 47,
    },
    {
      id: '5',
      date: '2024-12-20',
      type: 'installment',
      installmentNumber: 4,
      amount: 23.6,
      status: 'pending',
      gemsReward: 47,
    },
  ];

  // If purchase is completed, mark all as approved
  if (purchase.status === 'completed') {
    return installments.map(inst => ({
      ...inst,
      status: 'approved' as const,
    }));
  }

  return installments;
};

const PaymentInstallmentsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<PaymentInstallmentsRouteProp>();
  const {purchase} = route.params;

  const [installments] = useState<Installment[]>(() =>
    generateMockInstallments(purchase),
  );

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleHelpPress = () => {
    // TODO: Navigate to help screen or show help modal
    console.log('[PaymentInstallmentsScreen] Help pressed');
  };

  const handlePayPress = () => {
    // TODO: Navigate to payment method selection screen
    console.log('[PaymentInstallmentsScreen] Pay pressed');
  };

  const getPlanName = (): string => {
    // This should come from the purchase data
    return 'PLAN BÁSICO';
  };

  const getPlanDescription = (): string => {
    const totalCount = installments.length - 1; // Excluding initial
    return `Inicial + ${totalCount} cuotas cada 14 días`;
  };

  return (
    <CurvedHeaderLayout
      title="Pagar cuotas"
      showBackButton={true}
      onBackPress={handleBackPress}
      scroll={true}>
      <View style={styles.container}>
        {/* Plan Details Card */}
        <View style={styles.planCard}>
          <Text style={styles.planTitle}>{getPlanName()}</Text>
          <Text style={styles.planDescription}>{getPlanDescription()}</Text>
        </View>

        {/* Installments List */}
        <View style={styles.installmentsContainer}>
          {installments.map(item => (
            <InstallmentItem key={item.id} installment={item} />
          ))}

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.helpButton}
              onPress={handleHelpPress}
              activeOpacity={0.7}>
              <Text style={styles.helpButtonText}>Necesito ayuda</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.payButton}
              onPress={handlePayPress}
              activeOpacity={0.7}>
              <Text style={styles.payButtonText}>Pagar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </CurvedHeaderLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  planCard: {
    backgroundColor: IVOO_COLORS.white,
    borderRadius: 12,
    paddingVertical: SCREEN_WIDTH * 0.03,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    marginBottom: SCREEN_WIDTH * 0.04,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  planTitle: {
    fontSize: SCREEN_WIDTH * 0.055,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.textPrimary,
    marginBottom: SCREEN_WIDTH * 0.008,
    textAlign: 'center',
  },
  planDescription: {
    fontSize: SCREEN_WIDTH * 0.037,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.grayMedium,
    textAlign: 'center',
  },
  installmentsContainer: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: SCREEN_WIDTH * 0.04,
    borderWidth: 1,
    borderColor: '#6E717C4F',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: SCREEN_WIDTH * 0.03,
    paddingTop: SCREEN_WIDTH * 0.03,
  },
  helpButton: {
    flex: 1,
    backgroundColor: IVOO_COLORS.white,
    borderWidth: 1,
    borderColor: IVOO_COLORS.grayLight,
    borderRadius: 12,
    paddingVertical: SCREEN_WIDTH * 0.025,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  helpButtonText: {
    fontSize: SCREEN_WIDTH * 0.035,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interSemiBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.semibold,
    color: IVOO_COLORS.textPrimary,
  },
  payButton: {
    flex: 1,
    backgroundColor: IVOO_COLORS.primary,
    borderRadius: 12,
    paddingVertical: SCREEN_WIDTH * 0.025,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  payButtonText: {
    fontSize: SCREEN_WIDTH * 0.035,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interSemiBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.semibold,
    color: IVOO_COLORS.white,
  },
});

export default PaymentInstallmentsScreen;
