import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import DropdownPicker from 'react-native-dropdown-picker';
import {COLORS, FONTS} from '../../styles/global.style';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from 'store/store';
import {getBankOptions} from 'store/slices/banksSlice';
import {AppDispatch} from 'store/store';

interface BankSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  isRequired?: boolean;
}

const BankSelector: React.FC<BankSelectorProps> = ({
  label,
  value,
  onChange,
  error,
  isRequired = false,
}) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<{label: string; value: string}[]>([]);
  const [selectedValue, setSelectedValue] = useState(value);
  const dispatch = useDispatch<AppDispatch>();
  const {bankOptions, loading} = useSelector((state: RootState) => state.banks);

  useEffect(() => {
    dispatch(getBankOptions());
  }, [dispatch]);

  useEffect(() => {
    if (bankOptions.length > 0) {
      setItems(bankOptions);
    }
  }, [bankOptions]);

  useEffect(() => {
    if (selectedValue !== value) {
      onChange(selectedValue);
    }
  }, [selectedValue, onChange, value]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {isRequired && <Text style={styles.requiredStar}> *</Text>}
      </Text>
      <View style={styles.dropdownWrapper}>
        <DropdownPicker
          open={open}
          value={selectedValue}
          items={items}
          setOpen={setOpen}
          setValue={setSelectedValue}
          style={styles.dropdown}
          textStyle={styles.dropdownText}
          placeholder="Selecciona un banco"
          placeholderStyle={styles.placeholder}
          dropDownContainerStyle={styles.dropdownList}
          listItemLabelStyle={styles.listItemLabel}
          loading={loading}
          listMode="MODAL"
          modalProps={{
            animationType: 'slide',
          }}
          modalTitle="Selecciona un banco"
          searchable={true}
          searchPlaceholder="Buscar banco..."
          searchContainerStyle={styles.searchContainer}
          searchTextInputStyle={styles.searchInput}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  dropdownWrapper: {
    position: 'relative',
    zIndex: 1,
  },
  label: {
    fontFamily: FONTS.urbanistBold,
    fontSize: 18,
    color: COLORS.greyDark,
    marginBottom: 10,
  },
  requiredStar: {
    color: COLORS.error,
  },
  dropdown: {
    backgroundColor: '#F5F5F5',
    borderColor: COLORS.white,
    borderRadius: 12,
    minHeight: 50,
  },
  dropdownText: {
    fontFamily: FONTS.urbanistRegular,
    fontSize: 16,
    color: COLORS.greyDark,
  },
  placeholder: {
    color: COLORS.textGrey,
    fontFamily: FONTS.urbanistRegular,
  },
  dropdownList: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.greyLight,
    borderRadius: 12,
  },
  listItemLabel: {
    fontFamily: FONTS.urbanistRegular,
    fontSize: 16,
    color: COLORS.greyDark,
  },
  searchContainer: {
    borderBottomColor: COLORS.greyLight,
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  searchInput: {
    fontFamily: FONTS.urbanistRegular,
    fontSize: 16,
    color: COLORS.greyDark,
  },
  errorText: {
    fontFamily: FONTS.urbanistRegular,
    fontSize: 12,
    color: COLORS.error,
    marginTop: 5,
  },
});

export default BankSelector;
