import type {ImageStyle, ViewStyle} from 'react-native';
import {StyleSheet} from 'react-native';

interface Style {
  container: ViewStyle;
  tabsContainer: ViewStyle;
  tabButton: ViewStyle;
  activeTab: ViewStyle;
  noPurchasesContainer: ViewStyle;
  headerContainer: ViewStyle;
  creditContainer: ViewStyle;
  refreshIcon: ImageStyle;
  balanceContainer: ViewStyle;
  devicesContainer: ViewStyle;
  deviceItem: ViewStyle;
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
      padding: 0,
    },
    tabsContainer: {
      flexDirection: 'row',
      marginHorizontal: 0,
      marginTop: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
    },
    tabButton: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: '#FF6C44',
    },
    noPurchasesContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      top: 100,
      flex: 1,
    },

    headerContainer: {
      marginTop: 32,
      marginLeft: 6,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    creditContainer: {
      marginTop: 24,
      marginLeft: 12,
      marginRight: 5,
      marginBottom: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    refreshIcon: {
      position: 'relative',
      right: 4,
    },
    balanceContainer: {
      marginTop: 12,
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
    deviceItem: {
      //   borderWidth: 1,
      //   borderColor: '#E4E4E4',
      //   borderRadius: 8,
      // shadowColor: '#000',
      // shadowOffset: {
      //   width: 0,
      //   height: 1,
      // },
      // shadowOpacity: 0.22,
      // shadowRadius: 2.22,
      // elevation: 3,
    },
    deviceLeftSide: {flexDirection: 'row', alignItems: 'center', gap: 12},
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
    listHeaderRight: {flexDirection: 'row', alignItems: 'center', gap: 6},
    arrowIcon: {position: 'relative', top: 1},
  });
};
