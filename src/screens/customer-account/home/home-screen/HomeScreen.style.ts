import type { ImageStyle, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

interface Style {
  container: ViewStyle;
  headerContainer: ViewStyle;
  balanceContainer: ViewStyle;
  devicesContainer: ViewStyle;
  deviceLeftSide: ViewStyle;
  brandLogo: ImageStyle;
  listHeader: ViewStyle;
  listHeaderRight: ViewStyle;
  arrowIcon: ViewStyle;
}

export default () => {
  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      padding: 12,
    },
    headerContainer: {
      marginTop: 32,
      marginLeft: 6,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    balanceContainer: {
      marginTop: 24,
      marginLeft: 12,
      marginRight: 5,
      marginBottom: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    devicesContainer: {
      marginTop: 12,
      // marginLeft: 6,
      // marginRight: 8,
      // flexDirection: "row",
      // justifyContent: "space-between",
      // alignItems: "center",
    },
    deviceLeftSide: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    brandLogo: {
      height: 43,
      width: 43,
    },
    listHeader: {
      marginTop: 10,
      marginHorizontal: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    listHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    arrowIcon: { position: 'relative', top: 1 },
  });
};
