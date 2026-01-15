import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, TextInput} from 'react-native';
import {COLORS, FONTS} from 'app/styles/global.style';
import {PaymentMethodModel} from '@services/api/payments';
import BackTopBar from '../../../../../app/components/BackTopBar';

interface PaymentMethodField {
  id: number;
  name: string;
  hint: string;
  type: string;
  isRequired: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tenantId?: number;
  paymentMethodTenantId?: number;
}

interface PaymentMethodDetailProps {
  paymentMethod: PaymentMethodModel & {
    paymentOwnerFields?: PaymentMethodField[];
  };
}

const PaymentMethodDetail: React.FC<PaymentMethodDetailProps> = ({
  paymentMethod,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    console.log('Payment Method:', JSON.stringify(paymentMethod, null, 2));
    console.log(
      'Fields:',
      JSON.stringify(paymentMethod.paymentOwnerFields, null, 2),
    );
  }, [paymentMethod]);

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const renderField = (field: PaymentMethodField) => {
    if (!field.isActive) return null;

    return (
      <View key={field.id} style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          {field.name}
          {field.isRequired && <Text style={styles.requiredStar}> *</Text>}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={field.hint}
          value={formData[field.name] || ''}
          onChangeText={value => handleInputChange(field.name, value)}
          placeholderTextColor={COLORS.greyDark}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <BackTopBar middleText="Detalles del método de pago" />
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{paymentMethod.name}</Text>
          {paymentMethod.description && (
            <Text style={styles.description}>{paymentMethod.description}</Text>
          )}
        </View>

        {/* Debug Info */}
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            Payment Method ID: {paymentMethod.id}
          </Text>
          <Text style={styles.debugText}>
            Has Fields: {paymentMethod.paymentOwnerFields ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.debugText}>
            Fields Count: {paymentMethod.paymentOwnerFields?.length || 0}
          </Text>
        </View>

        <View style={styles.formContainer}>
          {paymentMethod.paymentOwnerFields?.map(field => renderField(field))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.urbanistBold,
    color: COLORS.greyDark,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    fontFamily: FONTS.urbanistRegular,
    color: COLORS.greyDark,
  },
  debugContainer: {
    backgroundColor: COLORS.greyLight,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  debugText: {
    fontSize: 14,
    fontFamily: FONTS.urbanistRegular,
    color: COLORS.greyDark,
    marginBottom: 4,
  },
  formContainer: {
    gap: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontFamily: FONTS.urbanistSemiBold,
    color: COLORS.greyDark,
    marginBottom: 8,
  },
  requiredStar: {
    color: 'red',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.greyLight,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: FONTS.urbanistRegular,
    color: COLORS.greyDark,
  },
});

export default PaymentMethodDetail;
