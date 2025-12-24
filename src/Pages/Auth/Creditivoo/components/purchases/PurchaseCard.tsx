import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

export interface Purchase {
  id: string;
  storeName: string;
  date: string;
  amount: number;
  status:
    | 'pending'
    | 'completed'
    | 'cancelled'
    | 'DRAFT'
    | 'IN_REVIEW_BY_CLIENT'
    | 'PENDING_INVOICE'
    | 'IN_PROGRESS';
  formattedDate?: string;
}

interface PurchaseCardProps {
  purchase: Purchase;
  onPress?: () => void;
  onPayPress?: () => void;
  isLoading?: boolean;
}

const PurchaseCard: React.FC<PurchaseCardProps> = ({
  purchase,
  onPress,
  onPayPress,
  isLoading = false,
}) => {
  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  const getStatusConfig = () => {
    switch (purchase.status) {
      case 'completed':
      case 'COMPLETED':
        return {
          label: 'Finalizada',
          color: IVOO_COLORS.success || '#4CAF50',
          icon: 'checkmark-circle',
        };
      case 'cancelled':
      case 'CANCELLED':
        return {
          label: 'Cancelada',
          color: '#F44336',
          icon: 'close-circle',
        };
      case 'DRAFT':
        return {
          label: 'A espera de escanear QR',
          color: '#FF9800',
          icon: 'disc',
        };
      case 'IN_REVIEW_BY_CLIENT':
        return {
          label: 'En revisión',
          color: '#FF9800',
          icon: 'disc',
        };
      case 'PENDING_INVOICE':
        return {
          label: 'Pendiente de factura',
          color: '#FF9800',
          icon: 'disc',
        };
      case 'IN_PROGRESS':
        return {
          label: 'En progreso',
          color: '#FF9800',
          icon: 'disc',
        };
      case 'pending':
      default:
        return {
          label: 'Pendiente',
          color: '#FF9800',
          icon: 'disc',
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.cardLeft}>
          <Text style={styles.storeName} numberOfLines={1}>
            {purchase.storeName}
          </Text>
          <Text style={styles.date}>
            {purchase.formattedDate || purchase.date}
          </Text>
        </View>

        <View style={styles.cardRight}>
          <Text style={styles.amount}>{formatCurrency(purchase.amount)}</Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.buttonsContainer}>
          {purchase.status !== 'pending' &&
            purchase.status !== 'DRAFT' &&
            purchase.status !== 'IN_REVIEW_BY_CLIENT' &&
            purchase.status !== 'PENDING_INVOICE' &&
            purchase.status !== 'IN_PROGRESS' && (
              <TouchableOpacity
                style={[
                  styles.detailsButton,
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={onPress}
                activeOpacity={0.7}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator size="small" color={IVOO_COLORS.primary} />
                ) : (
                  <Text style={styles.detailsButtonText}>Ver detalles</Text>
                )}
              </TouchableOpacity>
            )}

          {(purchase.status === 'pending' ||
            purchase.status === 'DRAFT' ||
            purchase.status === 'IN_REVIEW_BY_CLIENT' ||
            purchase.status === 'PENDING_INVOICE' ||
            purchase.status === 'IN_PROGRESS') && (
            <TouchableOpacity
              style={[styles.payButton, isLoading && styles.buttonDisabled]}
              onPress={onPayPress}
              activeOpacity={0.7}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color={IVOO_COLORS.white} />
              ) : (
                <Text style={styles.payButtonText}>Pagar ahora</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{statusConfig.label}</Text>
          {purchase.status === 'pending' ||
          purchase.status === 'DRAFT' ||
          purchase.status === 'IN_REVIEW_BY_CLIENT' ||
          purchase.status === 'PENDING_INVOICE' ||
          purchase.status === 'IN_PROGRESS' ? (
            <View
              style={[
                styles.pendingCircle,
                {backgroundColor: statusConfig.color},
              ]}
            />
          ) : (
            <Icon
              name={statusConfig.icon}
              type={IconType.Ionicons}
              size={16}
              color={statusConfig.color}
              style={styles.statusIcon}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: IVOO_COLORS.white,
    borderRadius: 12,
    padding: SCREEN_WIDTH * 0.03,
    marginBottom: SCREEN_WIDTH * 0.04,
    marginHorizontal: SCREEN_WIDTH * 0.01,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SCREEN_WIDTH * 0.015,
  },
  cardLeft: {
    flex: 1,
    marginRight: SCREEN_WIDTH * 0.04,
  },
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  storeName: {
    fontSize: SCREEN_WIDTH * 0.042,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.textPrimary,
    marginBottom: SCREEN_WIDTH * 0.01,
  },
  date: {
    fontSize: SCREEN_WIDTH * 0.035,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.grayMedium,
  },
  amount: {
    fontSize: SCREEN_WIDTH * 0.055,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.textPrimary,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SCREEN_WIDTH * 0.025,
    flex: 1,
    marginRight: SCREEN_WIDTH * 0.04,
  },
  detailsButton: {
    paddingVertical: SCREEN_WIDTH * 0.008,
    paddingHorizontal: SCREEN_WIDTH * 0.025,
    borderWidth: 1,
    borderColor: IVOO_COLORS.primary,
    borderRadius: 8,
  },
  payButton: {
    paddingVertical: SCREEN_WIDTH * 0.008,
    paddingHorizontal: SCREEN_WIDTH * 0.025,
    backgroundColor: IVOO_COLORS.primary,
    borderRadius: 8,
    elevation: 2,
  },
  payButtonText: {
    fontSize: SCREEN_WIDTH * 0.033,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interSemiBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.white,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: SCREEN_WIDTH * 0.035,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.grayMedium,
  },
  statusIcon: {
    marginLeft: 4,
  },
  pendingCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: 4,
  },
  detailsButtonText: {
    fontSize: SCREEN_WIDTH * 0.033,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interSemiBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default PurchaseCard;
