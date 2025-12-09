import React, { useContext, useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import { StyleSheet } from 'react-native';
import { AppContext } from '../../../Pages/AppContext';
import ResColor from '../../../Utils/Colors'
interface FilterItemProps
{
  item: string;
  width: number;
  height: number;
  borderRadius: number;
  ItemPressed: any;
  isSelected: any,
}

const FilterItem = ( {
  item,
  isSelected
}: FilterItemProps ) =>
{
  const containerStyle = useMemo(
    () => [
      styles.container,
    ],
    []
  );

  const { appTheme } = useContext( AppContext );
  const [isDark, setDark] = useState( appTheme.type === 'dark' );


  return (
    <View style={containerStyle}>
      <Text
        style={[isSelected ? ( {
          fontWeight: 'bold', color: ResColor.Green, backgroundColor: isDark ? ResColor.Green_03 : ResColor.Green_06
        } ) : ( styles.unSelectedOption, { color: appTheme.text, backgroundColor: appTheme.InputBoxBGColor } ),
        {
          borderRadius: 18, paddingVertical: 12, fontSize: 16,
          fontFamily: 'Inter-Regular', paddingHorizontal: 16, marginRight: 5, overflow: "hidden"
        }]}
      >{item}</Text>
    </View>
  );
};

const styles = StyleSheet.create( {
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2
  },
  selectedOption: {

  },
  unSelectedOption: {
    backgroundColor: ResColor.SmokeWhite,
    color: ResColor.Gray
  },
} );

export default FilterItem;
