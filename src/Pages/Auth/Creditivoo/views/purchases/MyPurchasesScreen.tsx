import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import CurvedHeaderLayout from '../../components/layouts/CurvedHeaderLayout';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import {PurchaseCard, Purchase} from '../../components/purchases';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

type PurchaseStatus = 'pending' | 'completed' | 'cancelled';

// Helper function to format date in Spanish
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const days = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ];
  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];

  return `${dayName} ${day} de ${month}`;
};

// Mock data - Replace with actual API call
const mockPurchases: Purchase[] = [
  {
    id: '1',
    storeName: 'IVOO Plaza Venezuela',
    date: '2024-10-05',
    amount: 144.68,
    status: 'completed',
    formattedDate: formatDate('2024-10-05'),
  },
  {
    id: '2',
    storeName: 'IVOO Sambil Candelaria',
    date: '2024-08-21',
    amount: 30.6,
    status: 'completed',
    formattedDate: formatDate('2024-08-21'),
  },
  {
    id: '3',
    storeName: 'IVOO Multiplaza',
    date: '2024-11-15',
    amount: 250.0,
    status: 'pending',
    formattedDate: formatDate('2024-11-15'),
  },
  {
    id: '4',
    storeName: 'IVOO Galerías',
    date: '2024-09-10',
    amount: 89.5,
    status: 'cancelled',
    formattedDate: formatDate('2024-09-10'),
  },
];

const MyPurchasesScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState<PurchaseStatus>('completed');

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handlePurchasePress = (purchase: Purchase) => {
    // Navigate to payment installments screen
    navigation.navigate(
      'PaymentInstallments' as never,
      {
        purchase,
      } as never,
    );
  };

  const handlePayPress = (purchase: Purchase) => {
    // Navigate to payment installments screen
    navigation.navigate(
      'PaymentInstallments' as never,
      {
        purchase,
      } as never,
    );
  };

  const filteredPurchases = mockPurchases.filter(
    purchase => purchase.status === selectedTab,
  );

  const tabs: {key: PurchaseStatus; label: string}[] = [
    {key: 'pending', label: 'Pendientes'},
    {key: 'completed', label: 'Pagadas'},
    {key: 'cancelled', label: 'Canceladas'},
  ];

  const renderPurchaseCard = ({item}: {item: Purchase}) => (
    <PurchaseCard
      purchase={item}
      onPress={() => handlePurchasePress(item)}
      onPayPress={() => handlePayPress(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        No tienes compras {selectedTab === 'pending' && 'pendientes'}
        {selectedTab === 'completed' && 'pagadas'}
        {selectedTab === 'cancelled' && 'canceladas'}
      </Text>
    </View>
  );

  return (
    <CurvedHeaderLayout
      title="Mis compras"
      showBackButton={true}
      onBackPress={handleBackPress}
      scroll={false}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, selectedTab === tab.key && styles.tabActive]}
            onPress={() => setSelectedTab(tab.key)}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.tabText,
                selectedTab === tab.key && styles.tabTextActive,
              ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Purchases List */}
      <FlatList
        data={filteredPurchases}
        renderItem={renderPurchaseCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </CurvedHeaderLayout>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: SCREEN_WIDTH * 0.04,
    backgroundColor: IVOO_COLORS.grayLight,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: SCREEN_WIDTH * 0.02,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: IVOO_COLORS.white,
  },
  tabText: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interSemiBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.semibold,
    color: IVOO_COLORS.grayMedium,
  },
  tabTextActive: {
    color: IVOO_COLORS.textPrimary,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: SCREEN_HEIGHT * 0.05,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.1,
  },
  emptyStateText: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.grayMedium,
    textAlign: 'center',
  },
});

export default MyPurchasesScreen;
