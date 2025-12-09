import type { ViewStyle, ImageStyle } from 'react-native';
import { StyleSheet } from 'react-native';
import type { ExtendedTheme } from '@react-navigation/native';

interface Style {
  container: ViewStyle;
  titleContainer: ViewStyle;
  brandInfoContainer: ViewStyle;
  listContainer: ViewStyle;
  logo: ImageStyle;
  modelItem: ViewStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: colors.background,
      position: 'relative',
      bottom: 16,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    deviceUnitsCount: {
      color: theme.colors.text,
    },
    brandInfoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 10,
      marginTop: 40,
      marginBottom: 20,
    },
    listContainer: {
      marginTop: 17,
    },
    logo: {
      width: 35,
      height: 35,
      marginRight: 16,
    },
    modelItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#EDEFF6',
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
  });
};
