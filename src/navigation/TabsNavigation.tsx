import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  Platform,
} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {SCREENS} from '@shared-constants';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../ivoo/styles';

// Screens
import HomeCreditIvoo from '../ivoo/screens/home/HomeCreditIvoo';
import ProfileScreen from '../ivoo/screens/profile/ProfileScreen';
import QrScanner from '../ivoo/screens/scanner/QrScanner';
import HelpScreen from '../ivoo/screens/help/HelpScreen';

const Tab = createBottomTabNavigator();
const {width: SCREEN_WIDTH} = Dimensions.get('window');

const CustomTabBar = ({state, descriptors, navigation}: any) => {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route: any, index: number) => {
        const {options} = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Render different UI for each tab
        if (route.name === SCREENS.HOME) {
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? {selected: true} : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[
                styles.tabButton,
                styles.homeButton,
                isFocused && styles.homeButtonActive,
              ]}>
              <Icon
                name="grid"
                type={IconType.Feather}
                size={20}
                color={isFocused ? IVOO_COLORS.white : IVOO_COLORS.grayMedium}
              />
              {isFocused && (
                <Text
                  style={[styles.homeButtonText, styles.homeButtonTextActive]}>
                  Home
                </Text>
              )}
            </TouchableOpacity>
          );
        }

        if (route.name === SCREENS.QR_SCANNER) {
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? {selected: true} : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[
                styles.tabButton,
                styles.scannerButton,
                isFocused && styles.scannerButtonActive,
              ]}>
              <Icon
                name="scan"
                type={IconType.Ionicons}
                size={24}
                color={isFocused ? IVOO_COLORS.white : IVOO_COLORS.grayMedium}
              />
              {isFocused && (
                <Text style={styles.scannerButtonText}>Escanear</Text>
              )}
            </TouchableOpacity>
          );
        }

        if (route.name === SCREENS.PROFILE) {
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? {selected: true} : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[
                styles.tabButton,
                styles.menuButton,
                isFocused && styles.menuButtonActive,
              ]}>
              <Icon
                name="dots-three-horizontal"
                type={IconType.Entypo}
                size={25}
                color={isFocused ? IVOO_COLORS.white : IVOO_COLORS.grayMedium}
              />
              {isFocused && <Text style={styles.menuButtonText}>Perfil</Text>}
            </TouchableOpacity>
          );
        }

        return null;
      })}
    </View>
  );
};

const renderTabBar = (props: any) => <CustomTabBar {...props} />;

const MainTabs = () => {
  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen name={SCREENS.HOME} component={HomeCreditIvoo} />
      <Tab.Screen name={SCREENS.QR_SCANNER} component={QrScanner} />
      <Tab.Screen name={SCREENS.HELP} component={HelpScreen} />
      <Tab.Screen name={SCREENS.PROFILE} component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: IVOO_COLORS.white,
    height: SCREEN_WIDTH * 0.18,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingBottom: SCREEN_WIDTH * 0.03,
    paddingTop: SCREEN_WIDTH * 0.02,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#00000050',
        shadowOffset: {width: 0, height: -3},
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 15,
      },
    }),
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.01,
    paddingVertical: SCREEN_WIDTH * 0.035,
    borderRadius: SCREEN_WIDTH * 0.04,
    backgroundColor: 'transparent',
  },
  homeButtonActive: {
    backgroundColor: IVOO_COLORS.primary,
  },
  homeButtonText: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interSemiBold,
    color: IVOO_COLORS.grayMedium,
    marginLeft: SCREEN_WIDTH * 0.02,
  },
  homeButtonTextActive: {
    color: IVOO_COLORS.white,
    fontWeight: 'bold',
  },
  scannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.01,
    paddingVertical: SCREEN_WIDTH * 0.035,
    borderRadius: SCREEN_WIDTH * 0.04,
    backgroundColor: 'transparent',
  },
  scannerButtonActive: {
    backgroundColor: IVOO_COLORS.primary,
  },
  scannerButtonText: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interSemiBold,
    color: IVOO_COLORS.white,
    marginLeft: SCREEN_WIDTH * 0.02,
    fontWeight: 'bold',
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.01,
    paddingVertical: SCREEN_WIDTH * 0.035,
    borderRadius: SCREEN_WIDTH * 0.04,
    backgroundColor: 'transparent',
  },
  menuButtonActive: {
    backgroundColor: IVOO_COLORS.primary,
  },
  menuButtonText: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interSemiBold,
    color: IVOO_COLORS.white,
    marginLeft: SCREEN_WIDTH * 0.02,
    fontWeight: 'bold',
  },
});

export default MainTabs;
