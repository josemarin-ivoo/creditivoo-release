import React from 'react';
import {TouchableOpacity, View, StyleSheet, ViewStyle} from 'react-native';
import IconDynamic from 'react-native-dynamic-vector-icons';
import {IVOO_COLORS} from '../styles';

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  style?: ViewStyle;
  size?: number;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onToggle,
  style,
  size = 13,
}) => {
  return (
    <TouchableOpacity
      onPress={onToggle}
      style={[styles.container, style]}
      activeOpacity={0.7}>
      <View
        style={[
          styles.checkbox,
          {
            width: size,
            height: size,
            backgroundColor: checked ? IVOO_COLORS.primary : 'transparent',
            borderColor: checked ? IVOO_COLORS.primary : IVOO_COLORS.border,
          },
        ]}>
        {checked && (
          <IconDynamic
            name="check"
            type="MaterialCommunityIcons"
            size={size - 2}
            color={IVOO_COLORS.white}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    borderRadius: 3,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Checkbox;
