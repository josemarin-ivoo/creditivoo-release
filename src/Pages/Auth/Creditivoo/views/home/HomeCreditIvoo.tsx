import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Text,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import {SCREENS} from '@shared-constants';
import HomeCreditCard from './HomeCreditCard';
import QuickActions from './QuickActions';
import {Routes} from '../../../../../Utils/NavigationRoutes';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const HomeCreditIvoo: React.FC = () => {
  const navigation = useNavigation();

  const handleRequestCredit = () => {
    (navigation as any).navigate('IdentityVerificator');
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'compras':
        // (navigation as any).navigate('MyPurchases');
        (navigation as any).navigate(Routes.NAVIGATION_MYPURCHASES);
        break;
      case 'puntos':
        // (navigation as any).navigate('Gems');
        (navigation as any).navigate(Routes.NAVIGATION_GEMS);
        break;
      default:
        console.log('Quick Action', action);
        break;
    }
  };

  const handleProfilePress = () => {
    // Try to navigate to Profile tab first, if that doesn't work, use parent navigator
    try {
      (navigation as any).navigate(Routes.NAVIGATION_PROFILE);
    } catch (error) {
      // If navigation fails, try using parent navigator
      const parent = (navigation as any).getParent();
      if (parent) {
        parent.navigate(Routes.NAVIGATION_PROFILE);
      }
    }
  };

  const handleNotificationPress = () => {
    (navigation as any).navigate(Routes.NAVIGATION_NOTIFICATIONS);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor={IVOO_COLORS.primary}
        barStyle="light-content"
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleProfilePress}
          style={styles.profileLink}>
          <Text style={styles.profileLinkText}> </Text>
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIcon}>
            <Icon
              name="eye-off"
              type={IconType.Feather}
              size={20}
              color="white"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={handleNotificationPress}>
            <Icon name="bell" type={IconType.Feather} size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Icon
              name="help-circle"
              type={IconType.Feather}
              size={20}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </View>

      <HomeCreditCard
        style={styles.mainCard}
        onRequestCredit={handleRequestCredit}
      />

      <View style={styles.actionsWrapper}>
        <QuickActions onActionPress={handleQuickAction} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: IVOO_COLORS.white,
  },

  header: {
    backgroundColor: IVOO_COLORS.primary,
    paddingTop: SCREEN_HEIGHT * 0.011,
    paddingBottom: SCREEN_HEIGHT * 0.05, // Extra height to show the card overlap
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileLink: {
    padding: SCREEN_WIDTH * 0.01,
  },
  profileLinkText: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interSemiBold,
    color: 'white',
  },
  headerIcons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SCREEN_WIDTH * 0.05,
  },
  headerIcon: {
    padding: SCREEN_WIDTH * 0.01,
  },

  mainCard: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.055,
    left: SCREEN_WIDTH * 0.05,
    right: SCREEN_WIDTH * 0.05,
    zIndex: 20,
  },

  actionsWrapper: {
    flex: 1,
    justifyContent: 'flex-start',
    marginTop: SCREEN_HEIGHT * 0.28,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingBottom: SCREEN_WIDTH * 0.18,
    alignItems: 'center',
  },

  /* BOTTOM TABS */
  tabBar: {
    position: 'absolute',
    bottom: 0,
    height: SCREEN_HEIGHT * 0.11,
    width: '100%',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#00000050',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
    paddingBottom: SCREEN_HEIGHT * 0.02,
  },
  tabItemActive: {
    backgroundColor: IVOO_COLORS.primary,
    width: SCREEN_WIDTH * 0.14,
    height: SCREEN_WIDTH * 0.14,
    borderRadius: SCREEN_WIDTH * 0.07,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabItem: {
    width: SCREEN_WIDTH * 0.14,
    height: SCREEN_WIDTH * 0.14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabDots: {
    flexDirection: 'row',
    gap: SCREEN_WIDTH * 0.01,
  },
  tabDot: {
    width: SCREEN_WIDTH * 0.013,
    height: SCREEN_WIDTH * 0.013,
    borderRadius: SCREEN_WIDTH * 0.0065,
    backgroundColor: '#C4C4C4',
  },
});

export default HomeCreditIvoo;
