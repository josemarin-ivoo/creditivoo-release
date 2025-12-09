import React from 'react';
import {Modal, View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {COLORS, FONTS} from 'app/styles/global.style';

interface SuccessModalProps {
  visible: boolean;
  onCancel: () => void;
}

const PaymentSuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  onCancel,
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Icon
            name="checkmark"
            type={IconType.Ionicons}
            size={48}
            color="#fff"
          />
        </View>
        <Text style={styles.title}>Pago registrado exitosamente</Text>
        <Text style={styles.message}>
          Tu pago fue procesado exitosamente. Sera confirmado a la brevedad.
        </Text>
        <TouchableOpacity style={styles.viewButton} onPress={onCancel}>
          <Text style={styles.viewButtonText}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 32,
    alignItems: 'center',
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    backgroundColor: COLORS.primaryGreen || '#27ae60',
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontFamily: FONTS.urbanistBold,
    color: COLORS.primaryGreen || '#27ae60',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    fontFamily: FONTS.urbanistRegular,
    color: COLORS.greyDark,
    textAlign: 'center',
    marginBottom: 24,
  },
  viewButton: {
    backgroundColor: COLORS.primaryGreen || '#27ae60',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontFamily: FONTS.urbanistSemiBold,
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#eafaf1',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.primaryGreen || '#27ae60',
    fontFamily: FONTS.urbanistSemiBold,
    fontSize: 16,
  },
});

export default PaymentSuccessModal;
