import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../styles';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

export type Currency = 'USD' | 'BS';

interface CurrencySelectorProps {
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  disabled?: boolean;
  style?: any;
  variant?: 'default' | 'standalone';
}

/**
 * Componente reutilizable para seleccionar entre USD y BS.
 * Muestra dos botones con estilo toggle.
 */
const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  selectedCurrency,
  onCurrencyChange,
  disabled = false,
  style,
  variant = 'default',
}) => {
  return (
    <View
      style={[
        variant === 'standalone'
          ? styles.currencySelectorStandalone
          : styles.currencySelector,
        style,
      ]}>
      <TouchableOpacity
        style={[
          styles.currencyButton,
          selectedCurrency === 'USD' && styles.currencyButtonActive,
          disabled && styles.currencyButtonDisabled,
        ]}
        onPress={() => onCurrencyChange('USD')}
        disabled={disabled}>
        <Text
          style={[
            styles.currencyButtonText,
            selectedCurrency === 'USD' && styles.currencyButtonTextActive,
            disabled && styles.currencyButtonTextDisabled,
          ]}>
          USD
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.currencyButton,
          selectedCurrency === 'BS' && styles.currencyButtonActive,
          disabled && styles.currencyButtonDisabled,
        ]}
        onPress={() => onCurrencyChange('BS')}
        disabled={disabled}>
        <Text
          style={[
            styles.currencyButtonText,
            selectedCurrency === 'BS' && styles.currencyButtonTextActive,
            disabled && styles.currencyButtonTextDisabled,
          ]}>
          BS
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  currencySelector: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 2,
  },
  currencySelectorStandalone: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 2,
    alignSelf: 'flex-end',
  },
  currencyButton: {
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    paddingVertical: SCREEN_HEIGHT * 0.008,
    borderRadius: 6,
    minWidth: SCREEN_WIDTH * 0.12,
    alignItems: 'center',
  },
  currencyButtonActive: {
    backgroundColor: IVOO_COLORS.primary,
  },
  currencyButtonDisabled: {
    opacity: 0.5,
  },
  currencyButtonText: {
    fontSize: SCREEN_WIDTH * 0.033,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interSemiBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.semibold,
    color: IVOO_COLORS.grayMedium,
  },
  currencyButtonTextActive: {
    color: IVOO_COLORS.white,
  },
  currencyButtonTextDisabled: {
    opacity: 0.5,
  },
});

export default CurrencySelector;
