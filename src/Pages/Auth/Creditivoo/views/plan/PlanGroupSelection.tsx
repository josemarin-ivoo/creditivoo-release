import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import CurvedHeaderLayout from '../../components/layouts/CurvedHeaderLayout';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {getPlanGroups, PlanGroup} from '../../services/plan';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const PlanGroupSelection: React.FC = () => {
  const navigation = useNavigation();
  const [planGroups, setPlanGroups] = useState<PlanGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPlanGroups = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      console.log('[PlanGroupSelection] Obteniendo grupos de planes');
      const response = await getPlanGroups({page: 1, pageSize: 50});
      console.log('[PlanGroupSelection] Grupos obtenidos:', response);
      setPlanGroups(response.data || []);
    } catch (err: any) {
      console.error('[PlanGroupSelection] Error al obtener grupos:', err);
      setError(err.message || 'Error al cargar los grupos de planes');
    } finally {
      if (showRefreshing) {
        setRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  const onRefresh = useCallback(() => {
    fetchPlanGroups(true);
  }, [fetchPlanGroups]);

  // Hacer fetch cuando la pantalla recibe foco (incluyendo cuando se vuelve de otra pantalla)
  useFocusEffect(
    useCallback(() => {
      fetchPlanGroups();
    }, [fetchPlanGroups]),
  );

  const handlePlanSelect = (groupId: number) => {
    (navigation as any).navigate('PlanSelection', {groupId});
  };

  return (
    <CurvedHeaderLayout
      title="Inicial"
      showBackButton
      onBackPress={() => navigation.goBack()}
      scroll={false}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[IVOO_COLORS.primary]}
            tintColor={IVOO_COLORS.primary}
          />
        }>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={IVOO_COLORS.primary} />
            <Text style={styles.loadingText}>Cargando grupos de planes...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : planGroups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image
              // source={require('../../images/plans/empty-box.png')}
              source={require('../../images/plans/empty-box.png')}
              style={styles.emptyBoxIcon}
              resizeMode="contain"
            />
            <Text style={styles.emptyText}>No hay planes disponibles</Text>
          </View>
        ) : (
          <View style={styles.content}>
            <Text style={styles.mainTitle}>Elige tu inicial</Text>
            <View style={styles.plansContainer}>
              {planGroups.map(plan => (
                <TouchableOpacity
                  key={plan.id}
                  style={styles.planCard}
                  onPress={() => handlePlanSelect(plan.id)}
                  activeOpacity={0.7}>
                  <View style={styles.planContent}>
                    <View style={styles.planTextContainer}>
                      <Text style={styles.planTitle}>{plan.name}</Text>
                      {plan.description && (
                        <Text style={styles.planDescription}>
                          {plan.description}
                        </Text>
                      )}
                    </View>
                    <Icon
                      name="chevron-forward"
                      type={IconType.Ionicons}
                      size={24}
                      color={IVOO_COLORS.black}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </CurvedHeaderLayout>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingTop: SCREEN_HEIGHT * 0.02,
  },
  mainTitle: {
    fontSize: SCREEN_WIDTH * 0.064,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
    marginBottom: SCREEN_HEIGHT * 0.04,
    textAlign: 'left',
  },
  plansContainer: {
    width: '100%',
  },
  planCard: {
    width: '100%',
    backgroundColor: '#F9FAFC',
    borderRadius: 12,
    paddingVertical: SCREEN_HEIGHT * 0.015,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    marginBottom: SCREEN_WIDTH * 0.03,
    borderWidth: 1,
    borderColor: 'rgba(110, 113, 124, 0.2)',
  },
  planContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planTextContainer: {
    flex: 1,
  },
  planTitle: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
    marginBottom: 2,
  },
  planDescription: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: '#6E717C',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.1,
  },
  loadingText: {
    marginTop: SCREEN_HEIGHT * 0.02,
    fontSize: SCREEN_WIDTH * 0.04,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.textSecondary || '#6E717C',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.1,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
  },
  errorText: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: '#E74C3C',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: SCREEN_WIDTH * 0.06,
    paddingTop: SCREEN_HEIGHT * 0.15,
  },
  emptyBoxIcon: {
    width: SCREEN_WIDTH * 0.3,
    height: SCREEN_WIDTH * 0.3,
    marginBottom: SCREEN_HEIGHT * 0.04,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: SCREEN_WIDTH * 0.042,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.grayMedium || IVOO_COLORS.textSecondary || '#6E717C',
    textAlign: 'center',
  },
});

export default PlanGroupSelection;
