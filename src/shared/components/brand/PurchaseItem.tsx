import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import TextWrapper from '@shared-components/text-wrapper/TextWrapper';
import CustomCheckbox from '@components/inputs/CustomCheckbox';
import { capitalizeFirstLetter, formatDate, truncateString } from 'utils';

interface PurchaseProps {
  id: number;
  phoneBrand: string;
  selectedModel: string;
  ram?: string;
  onBack?: boolean;
  date?: string | null;
  handleClose?: () => void;
  withDate?: boolean;
  isSelected: boolean; // Controlled by parent
  onToggleSelection: (id: number) => void; // Callback to parent
  isReadonly?: boolean;
}

const PurchaseItem: React.FC<PurchaseProps> = ({
  id,
  phoneBrand,
  selectedModel,
  isReadonly,
  ram,
  onBack,
  date = null,
  handleClose,
  withDate = false,
  isSelected,
  onToggleSelection,
}) => {
  const theme = useTheme();
  const { colors } = theme;

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, withDate && { marginLeft: 12 }]}>
        <View style={styles.purchaseContainer}>
          <CustomCheckbox
            isReadonly={isReadonly}
            checked={isSelected}
            onPress={() => onToggleSelection(id)}
          />
          <View>
            <TextWrapper fontSize={18}>{phoneBrand}</TextWrapper>
            <TextWrapper fontSize={14} color={colors.itemSubtitle}>
              {truncateString(selectedModel, 20)} {ram && ` - ${ram}`}
            </TextWrapper>
          </View>
        </View>
        {onBack ? (
          <TouchableOpacity onPress={handleClose} style={styles.goBackToggle}>
            <TextWrapper fontSize={14} semiBoldSora color={colors.dynamicText}>
              Volver
            </TextWrapper>
          </TouchableOpacity>
        ) : null}
        {date ? (
          <View style={styles.dateContainer}>
            <TextWrapper color="#86939F" fontSize={12}>
              {capitalizeFirstLetter(formatDate(date, 'MMM DD, YYYY'))}
            </TextWrapper>
          </View>
        ) : null}
      </View>
    </View>
  );
};

export default PurchaseItem;

const styles = StyleSheet.create({
  container: {},
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 8,
    marginTop: 8,
    marginBottom: 20,
    borderBottomColor: '#E5E5E5',
    borderBottomWidth: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  purchaseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  goBackToggle: {
    marginRight: 8,
  },
  dateContainer: {
    marginRight: 12,
  },
});
