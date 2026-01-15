import type { ViewStyle, ImageStyle } from 'react-native';
import { StyleSheet } from 'react-native';
import type { ExtendedTheme } from '@react-navigation/native';

interface Style {
  container: ViewStyle;
  titleContainer: ViewStyle;
  listContainer: ViewStyle;
  card: ViewStyle;
  brandContainer: ViewStyle;
  logo: ImageStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 1,
      backgroundColor: colors.background,
      position: 'relative',
      bottom: 16,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    listContainer: {
      marginTop: 17,
    },
    card: {
      width: '100%',
      height: 46,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.background,
      marginVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 4,
    },
    brandContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logo: {
      width: 35,
      height: 35,
      marginRight: 16,
    },
  });
};
