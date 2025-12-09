import React, {useEffect, useCallback} from 'react';
import {Text} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useDispatch, useSelector} from 'react-redux';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {useTheme} from '@ui-kitten/components';

import {AppDispatch, RootState} from '../store/store';
import {loadAuth} from '../store/slices/auth-slice';
import {getUserBalance} from '../store/slices/balance-slice';
import {fetchPurchasesByUserId} from '../store/slices/purchase-slice';
import {fetchPaymentsByPurchaseIds} from '../store/slices/payment-slice';

import {SCREENS} from '@shared-constants';
import HomeCreditIvoo from '../views/home/HomeCreditIvoo';
import ProfileScreen from '@screens/profile/ProfileScreen';
import BranchesScreen from '@screens/branches/BranchesScreen';
import {palette} from '@theme/themes';
import fonts from '../shared/theme/fonts';

const Tab = createBottomTabNavigator();

const TabsNavigation = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const {user} = useSelector((state: RootState) => state.auth);
  const {selectedPurchaseIds} = useSelector(
    (state: RootState) => state.purchases,
  );

  // Fetch user-related data
  const fetchUserData = useCallback(() => {
    if (user) {
      dispatch(getUserBalance(user.id));
      dispatch(fetchPurchasesByUserId({userId: user.id}));
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (!user) {
      dispatch(loadAuth());
    } else {
      fetchUserData();
    }
  }, [dispatch, user, fetchUserData]);

  // Fetch payments for all selected purchases
  useEffect(() => {
    if (selectedPurchaseIds.length > 0) {
      dispatch(fetchPaymentsByPurchaseIds(selectedPurchaseIds));
    }
  }, [selectedPurchaseIds, dispatch]);

  const renderTabIcon = (
    route: any,
    focused: boolean,
    color: string,
    size: number,
  ) => {
    let iconName = 'home';
    let iconType = IconType.Ionicons;

    switch (route.name) {
      case 'HomeTab':
      case SCREENS.HOME:
        iconName = focused ? 'home' : 'home-outline';
        iconType = IconType.Ionicons;
        break;
      case SCREENS.STORES:
        iconName = focused ? 'storefront' : 'storefront-outline';
        iconType = IconType.Ionicons;
        break;
      case SCREENS.PROFILE:
        iconName = focused ? 'person-circle' : 'person-circle-outline';
        iconType = IconType.Ionicons;
        break;
      default:
        iconName = focused ? 'home' : 'home-outline';
        iconType = IconType.Ionicons;
        break;
    }

    // Incrementamos el tamaño del icono cuando el tab está enfocado
    const adjustedSize = focused ? size + 2 : size;

    return (
      <Icon name={iconName} type={iconType} size={adjustedSize} color={color} />
    );
  };

  return (
    <Tab.Navigator
      id="main-stack-navigator"
      initialRouteName="HomeTab"
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({focused, color, size}) =>
          renderTabIcon(route, focused, color, size),
        // Etiqueta con tamaño dinámico
        tabBarLabel: ({focused, color}) => {
          const labels: Record<string, string> = {
            HomeTab: 'Inicio',
            [SCREENS.HOME]: 'Inicio',
            [SCREENS.STORES]: 'Sucursales',
            [SCREENS.PROFILE]: 'Perfil',
          };

          return (
            <Text
              style={{
                color,
                fontSize: focused ? 14 : 12,
                paddingBottom: 10,
                fontFamily: fonts.urbanist.regular,
              }}>
              {labels[route.name] || ''}
            </Text>
          );
        },
        tabBarActiveTintColor: theme['color-primary-500'] || '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: palette.white,
          height: 75,
        },
        tabBarItemStyle: {
          paddingTop: 10,
        },
      })}>
      <Tab.Screen name="HomeTab" component={HomeCreditIvoo} />
      <Tab.Screen name={SCREENS.STORES} component={BranchesScreen} />
      <Tab.Screen name={SCREENS.PROFILE} component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabsNavigation;
