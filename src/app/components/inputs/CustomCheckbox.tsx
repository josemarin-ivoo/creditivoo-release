import { COLORS } from 'app/styles/global.style';
import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Icon, { IconType } from 'react-native-dynamic-vector-icons';

interface CustomCheckboxProps {
  checked: boolean;
  isReadonly?: boolean; // Add isReadonly prop
  onPress: () => void;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ checked, isReadonly = false, onPress }) => {
  const handlePress = () => {
    if (!isReadonly) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isReadonly} // Disable touch if readonly
      style={[
        styles.checkboxContainer,
        checked && styles.checkedBackground, // Apply blue background if checked
        isReadonly && styles.readonlyBorder, // Apply readonly styling
      ]}
    >
      {checked && (
        <Icon
          name="check"
          type={IconType.AntDesign}
          size={18}
          color={COLORS.white}
          style={styles.icon}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkboxContainer: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.greyLight,
    borderRadius: 4,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBackground: {
    backgroundColor: COLORS.primaryBlue,
    borderColor: COLORS.primaryBlue,
  },
  readonlyBorder: {
    borderColor: COLORS.greyDark, // Grey border for readonly state
    opacity: 0.5, // Dim the checkbox to indicate readonly
  },
  icon: {
    alignSelf: 'center',
  },
});

export default CustomCheckbox;
