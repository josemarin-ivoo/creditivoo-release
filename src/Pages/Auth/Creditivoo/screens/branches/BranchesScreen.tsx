import React, {useEffect, useMemo} from 'react';
import {
  View,
  ScrollView,
  Text,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from 'store/store';
import {COLORS} from 'app/styles/global.style';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {getTenants} from 'store/slices/tenants-slice';
import {useNavigation} from '@react-navigation/native';
import {SCREENS} from '@shared-constants';
import {Tenant} from '@services/api/tenants';
import {Layout, useTheme} from '@ui-kitten/components';
import {SafeAreaView} from 'react-native-safe-area-context';
import createStyles from './BranchesScreen.style';

const BranchesScreen: React.FC = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const tenantsState = useSelector((state: RootState) => state.tenants);
  const tenants: Tenant[] = useMemo(
    () => (Array.isArray(tenantsState?.tenants) ? tenantsState.tenants : []),
    [tenantsState?.tenants],
  );
  const isLoading = tenantsState?.isLoading || false;

  useEffect(() => {
    console.log('[BranchesScreen] Component mounted, dispatching getTenants');
    dispatch(getTenants());
  }, [dispatch]);

  useEffect(() => {
    console.log('[BranchesScreen] Tenants state changed:', {
      tenantsState,
      tenants: tenantsState?.tenants,
      tenantsLength: tenantsState?.tenants?.length || 0,
      isLoading: tenantsState?.isLoading,
      error: tenantsState?.error,
    });
    console.log('[BranchesScreen] Processed tenants array:', tenants);
    console.log('[BranchesScreen] Processed tenants length:', tenants.length);
  }, [tenantsState, tenants]);

  const handleBranchPress = (tenant: Tenant) => {
    (navigation as any).navigate(SCREENS.BRANCH_DETAIL, {tenant});
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#ffffff" />
      <Layout style={styles.layout}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => {}}>
            {/* Empty space for alignment */}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sucursales</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={COLORS.primaryGreen || '#4CAF50'}
              />
            </View>
          ) : !tenants || tenants.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon
                name="store"
                type={IconType.MaterialIcons}
                size={80}
                color={COLORS.primaryGreen || '#4CAF50'}
              />
              <Text style={styles.emptyText}>
                No hay sucursales disponibles
              </Text>
            </View>
          ) : (
            <>
              {/* Branch List */}
              {(tenants || []).map(tenant => (
                <TouchableOpacity
                  key={tenant.id}
                  style={styles.branchCard}
                  onPress={() => handleBranchPress(tenant)}>
                  <View style={styles.branchIconContainer}>
                    <Icon
                      name="storefront"
                      type={IconType.MaterialIcons}
                      size={24}
                      color={COLORS.greyDark || '#666666'}
                    />
                  </View>
                  <View style={styles.branchInfo}>
                    <Text style={styles.branchName}>{tenant.name}</Text>
                    {tenant.address && (
                      <View style={styles.locationRow}>
                        <Icon
                          name="location-on"
                          type={IconType.MaterialIcons}
                          size={16}
                          color={COLORS.textGrey || '#999999'}
                        />
                        <Text style={styles.branchLocation} numberOfLines={1}>
                          {tenant.address}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Icon
                    name="chevron-right"
                    type={IconType.MaterialIcons}
                    size={24}
                    color={COLORS.greyDark || '#000000'}
                  />
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      </Layout>
    </SafeAreaView>
  );
};

export default BranchesScreen;
