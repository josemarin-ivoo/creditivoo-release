import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../styles';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  onClose: () => void;
  buttonText?: string;
  onButtonPress?: () => void; // Callback opcional para el botón
  showSecondaryButton?: boolean; // Mostrar botón secundario
  secondaryButtonText?: string;
  onSecondaryButtonPress?: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  title,
  message,
  type = 'error',
  onClose,
  buttonText = 'OK',
  onButtonPress,
  showSecondaryButton = false,
  secondaryButtonText = 'Cancelar',
  onSecondaryButtonPress,
}) => {
  const getIconConfig = () => {
    switch (type) {
      case 'error':
        return {
          name: 'close-circle',
          color: IVOO_COLORS.error,
          backgroundColor: '#FFEBEE',
        };
      case 'warning':
        return {
          name: 'alert-circle',
          color: IVOO_COLORS.warning,
          backgroundColor: '#FFF3E0',
        };
      case 'info':
        return {
          name: 'information-circle',
          color: IVOO_COLORS.info,
          backgroundColor: '#E3F2FD',
        };
      case 'success':
        return {
          name: 'checkmark-circle',
          color: IVOO_COLORS.success,
          backgroundColor: '#E8F5E9',
        };
      default:
        return {
          name: 'information-circle',
          color: IVOO_COLORS.info,
          backgroundColor: '#E3F2FD',
        };
    }
  };

  const iconConfig = getIconConfig();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View
            style={[
              styles.iconCircle,
              {backgroundColor: iconConfig.backgroundColor},
            ]}>
            <Icon
              name={iconConfig.name}
              type={IconType.Ionicons}
              size={48}
              color={iconConfig.color}
            />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonsContainer}>
            {showSecondaryButton && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={onSecondaryButtonPress || onClose}>
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                  {secondaryButtonText}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.button}
              onPress={onButtonPress || onClose}>
              <Text style={styles.buttonText}>{buttonText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: Math.min(SCREEN_WIDTH * 0.85, 340),
    backgroundColor: IVOO_COLORS.white,
    borderRadius: 10,
    alignItems: 'center',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.regular,
    color: IVOO_COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonsContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    backgroundColor: IVOO_COLORS.primary,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 40,
    flex: 1,
    alignItems: 'center',
    minWidth: 120,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: IVOO_COLORS.primary,
  },
  buttonText: {
    color: IVOO_COLORS.white,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    fontSize: 16,
  },
  secondaryButtonText: {
    color: IVOO_COLORS.primary,
  },
});

export default AlertModal;
