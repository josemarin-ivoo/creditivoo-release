import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

export interface Installment {
  id: string;
  date: string;
  type: 'initial' | 'installment';
  installmentNumber?: number;
  amount: number;
  status: 'approved' | 'pending' | 'pass_due';
  gemsReward?: number; // Gems earned by paying in advance
}

interface InstallmentItemProps {
  installment: Installment;
  onPress?: () => void;
  onCheckboxPress?: (selected: boolean) => void;
  isSelected?: boolean;
  isDisabled?: boolean; // When true, the payment cannot be selected (future payments)
}

const InstallmentItem: React.FC<InstallmentItemProps> = ({
  installment,
  onPress,
  onCheckboxPress,
  isSelected = false,
  isDisabled = false,
}) => {
  const [selected, setSelected] = useState(isSelected);

  // Sync internal state with prop
  useEffect(() => {
    setSelected(isSelected);
  }, [isSelected]);

  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  const getInstallmentLabel = (): string => {
    if (installment.type === 'initial') {
      return 'Inicial';
    }
    return `Cuota ${installment.installmentNumber || ''}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate();
    const months = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];
    const month = months[date.getMonth()];
    return `${day} ${month}`;
  };

  const isApproved = installment.status === 'approved';
  const isPassDue = installment.status === 'pass_due';
  const isCheckboxSelected = selected || isApproved;
  // Disabled if explicitly disabled and not approved (approved payments should not be grayed out)
  const isDisabledState = isDisabled && !isApproved;

  const handleCardPress = () => {
    // If there's a custom onPress handler, call it first
    if (onPress) {
      onPress();
    }

    // Always handle checkbox press when card is tapped
    if (isApproved || isDisabledState) {
      // Don't allow selection of approved payments or disabled payments
      return;
    }
    if (onCheckboxPress) {
      // Let parent handle the selection logic
      onCheckboxPress(!selected);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, isDisabledState && styles.cardDisabled]}
      onPress={handleCardPress}
      activeOpacity={isDisabledState ? 1 : 0.7}
      disabled={isDisabledState}>
      <View style={styles.leftSection}>
        <View style={styles.checkboxContainer}>
          {isCheckboxSelected ? (
            <View style={styles.checkboxApproved}>
              <Icon
                name="checkmark"
                type={IconType.Ionicons}
                size={SCREEN_WIDTH * 0.035}
                color={IVOO_COLORS.white}
              />
            </View>
          ) : (
            <View style={styles.checkboxPending} />
          )}
        </View>
        <View style={styles.textContainer}>
          <Text
            style={[styles.dateText, isDisabledState && styles.textDisabled]}>
            {formatDate(installment.date)}
          </Text>
          <Text
            style={[styles.typeText, isDisabledState && styles.textDisabled]}>
            {getInstallmentLabel()}
          </Text>
        </View>
      </View>

      <View style={styles.middleSection}>
        {isApproved ? (
          <Text style={styles.approvedText}>Aprobado</Text>
        ) : isPassDue ? (
          <Text style={styles.passDueText}>Vencido</Text>
        ) : (
          <View style={styles.gemsContainer}>
            {/* <Text
              style={[styles.gemsText, isDisabledState && styles.textDisabled]}>
              Gana {installment.gemsReward || 0}
            </Text>
            <GemIcon
              width={SCREEN_WIDTH * 0.04}
              height={SCREEN_WIDTH * 0.04}
              opacity={isDisabledState ? 0.7 : 1}
            />
            <Text
              style={[
                styles.advanceText,
                isDisabledState && styles.textDisabled,
              ]}>
              {' '}
              por adelantar
            </Text> */}
          </View>
        )}
      </View>

      <View style={styles.rightSection}>
        <Text
          style={[styles.amountText, isDisabledState && styles.textDisabled]}>
          {formatCurrency(installment.amount)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: IVOO_COLORS.white,
    borderRadius: 12,
    paddingVertical: SCREEN_WIDTH * 0.025,
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    marginBottom: SCREEN_WIDTH * 0.025,
    marginHorizontal: SCREEN_WIDTH * 0.01,
    borderWidth: 1,
    borderColor: '#6E717C4F',
  },
  cardDisabled: {
    opacity: 0.85,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkboxContainer: {
    marginRight: SCREEN_WIDTH * 0.025,
  },
  checkboxApproved: {
    width: SCREEN_WIDTH * 0.055,
    height: SCREEN_WIDTH * 0.055,
    borderRadius: SCREEN_WIDTH * 0.0275,
    backgroundColor: IVOO_COLORS.success || '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxPending: {
    width: SCREEN_WIDTH * 0.055,
    height: SCREEN_WIDTH * 0.055,
    borderRadius: SCREEN_WIDTH * 0.0275,
    borderWidth: 2,
    borderColor: IVOO_COLORS.primary,
  },
  textContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: '#676464',
    marginBottom: 2,
  },
  typeText: {
    fontSize: SCREEN_WIDTH * 0.035,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.textPrimary,
  },
  middleSection: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SCREEN_WIDTH * 0.02,
  },
  approvedText: {
    fontSize: SCREEN_WIDTH * 0.037,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.success || '#4CAF50',
  },
  passDueText: {
    fontSize: SCREEN_WIDTH * 0.037,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: '#E74C3C',
  },
  gemsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  gemsText: {
    fontSize: SCREEN_WIDTH * 0.037,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.primary,
    marginRight: 4,
  },
  advanceText: {
    fontSize: SCREEN_WIDTH * 0.033,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.grayMedium,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: SCREEN_WIDTH * 0.042,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: '#676464',
  },
  textDisabled: {
    opacity: 0.7,
  },
});

export default InstallmentItem;
