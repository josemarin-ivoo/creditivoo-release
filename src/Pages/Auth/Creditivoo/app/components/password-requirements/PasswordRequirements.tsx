import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Icon} from '@ui-kitten/components';

interface PasswordRequirement {
  label: string;
  isValid: boolean | null; // null = no escrito, false = error, true = success
}

interface PasswordRequirementsProps {
  password: string;
}

const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({password}) => {
  const hasText = password.length > 0;

  const requirements: PasswordRequirement[] = [
    {
      label: 'Mínimo 8 caracteres',
      isValid: hasText ? password.length >= 8 : null,
    },
    {
      label: 'Al menos una letra mayúscula (A–Z)',
      isValid: hasText ? /[A-Z]/.test(password) : null,
    },
    {
      label: 'Al menos una letra minúscula (a–z)',
      isValid: hasText ? /[a-z]/.test(password) : null,
    },
    {
      label: 'Al menos un número (0–9)',
      isValid: hasText ? /[0-9]/.test(password) : null,
    },
    {
      label: 'Al menos un carácter especial (! @ # $ % ^ & * ( ) _ + { } [ ] : ; ?)',
      isValid: hasText ? /[!@#$%^&*()_+{}\[\]:;?]/.test(password) : null,
    },
  ];

  const renderIcon = (isValid: boolean | null) => {
    if (isValid === null) {
      return null; // No mostrar icono si no hay texto
    }
    return (
      <Icon
        name={isValid ? 'checkmark-circle-2' : 'close-circle'}
        fill={isValid ? '#4CAF50' : '#F44336'}
        style={styles.icon}
      />
    );
  };

  const getTextStyle = (isValid: boolean | null) => {
    if (isValid === null) {
      return styles.requirementText;
    }
    return [
      styles.requirementText,
      isValid ? styles.requirementTextSuccess : styles.requirementTextError,
    ];
  };

  return (
    <View style={styles.container}>
      {requirements.map((req, index) => (
        <View key={index} style={styles.requirementRow}>
          {renderIcon(req.isValid)}
          <Text style={getTextStyle(req.isValid)}>{req.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 8,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  requirementText: {
    fontSize: 12,
    color: '#8F9BB3',
    flex: 1,
  },
  requirementTextSuccess: {
    color: '#4CAF50',
  },
  requirementTextError: {
    color: '#F44336',
  },
});

export default PasswordRequirements;

