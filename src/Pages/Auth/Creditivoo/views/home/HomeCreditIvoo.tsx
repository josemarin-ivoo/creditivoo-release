import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Text,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import {SCREENS} from '@shared-constants';
import HomeCreditCard from './HomeCreditCard';
import QuickActions from './QuickActions';
import {useIvoSelector, useIvoDispatch} from '../../../../../redux/useIvo';
import {fetchMe} from '../../store-creditivoo/slices/auth-slice';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const HomeCreditIvoo: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useIvoDispatch();
  const {user} = useIvoSelector(state => state.creditivoo.auth);
  const {hasPurchasePendingInvoice, hasPurchaseInProgress} = useIvoSelector(
    state => state.creditivoo.purchase,
  );
  const [refreshing, setRefreshing] = useState(false);

  const hasCredit = !!user?.hasActiveCredit && (user.creditAvailable || 0) > 0;

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await dispatch(fetchMe()).unwrap();
      console.log('[HomeCreditIvoo] Información del usuario refrescada');
    } catch (error: any) {
      console.error(
        '[HomeCreditIvoo] Error al refrescar información del usuario:',
        error,
      );
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleRequestCredit = () => {
    (navigation as any).navigate('IdentityVerificator');
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'compras':
        (navigation as any).navigate('MyPurchases');
        break;
      case 'puntos':
        (navigation as any).navigate('Gems');
        break;
      default:
        console.log('Quick Action', action);
        break;
    }
  };

  const handleProfilePress = () => {
    // Try to navigate to Profile tab first, if that doesn't work, use parent navigator
    try {
      (navigation as any).navigate(SCREENS.PROFILE);
    } catch (error) {
      // If navigation fails, try using parent navigator
      const parent = (navigation as any).getParent();
      if (parent) {
        parent.navigate(SCREENS.PROFILE);
      }
    }
  };

  const handleNotificationPress = () => {
    (navigation as any).navigate(SCREENS.NOTIFICATIONS);
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        alwaysBounceVertical={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[IVOO_COLORS.primary]}
            tintColor={IVOO_COLORS.primary}
            progressViewOffset={SCREEN_HEIGHT * 0.055}
          />
        }
        showsVerticalScrollIndicator={false}>
        <View style={styles.actionsWrapper}>
          <QuickActions onActionPress={handleQuickAction} />
        </View>
        {/* <View style={styles.debugContainer}>
          <Text style={styles.debugLabel}>
            hasPurchasePendingInvoice:{' '}
            {hasPurchasePendingInvoice ? 'true' : 'false'}
          </Text>
          <Text style={styles.debugLabel}>
            hasPurchaseInProgress: {hasPurchaseInProgress ? 'true' : 'false'}
          </Text>
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: IVOO_COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
    marginTop: SCREEN_HEIGHT * 0.2,
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
  debugContainer: {
    color: 'black',
    backgroundColor: 'red',
    padding: SCREEN_WIDTH * 0.04,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
    borderStyle: 'dashed',
  },
  debugLabel: {
    fontSize: SCREEN_WIDTH * 0.032,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
});

export default HomeCreditIvoo;
