import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  ScrollView,
  TouchableOpacity,
  Text,
  RefreshControl,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// ❗️Header height BASE (no incluye safe area)
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.14;

// Ajuste de overlap por plataforma
const CARD_OVERLAP = Platform.OS === 'ios' ? 20 : 35;

interface CurvedHeaderLayoutProps {
  title: string;
  children: React.ReactNode;
  headerContent?: React.ReactNode;
  headerColor?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  scroll?: boolean;
  floatingComponent?: React.ReactNode;
  refreshControl?: React.ReactElement<typeof RefreshControl>;
  noRoundedCorners?: boolean;
  increaseHeaderHeight?: boolean;
}

const CurvedHeaderLayout: React.FC<CurvedHeaderLayoutProps> = ({
  title,
  children,
  headerContent,
  headerColor = IVOO_COLORS.primary,
  showBackButton = true,
  onBackPress,
  scroll = true,
  floatingComponent,
  refreshControl,
  noRoundedCorners = false,
  increaseHeaderHeight = false,
}) => {
  const insets = useSafeAreaInsets();

  const currentHeaderHeight = increaseHeaderHeight
    ? HEADER_HEIGHT + SCREEN_HEIGHT * 0.04
    : HEADER_HEIGHT;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      {/* HEADER */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: headerColor,
            height: currentHeaderHeight + insets.top,
            paddingTop: insets.top,
          },
        ]}>
        <View style={styles.headerRow}>
          {showBackButton && onBackPress && (
            <TouchableOpacity
              onPress={onBackPress}
              activeOpacity={0.7}
              style={styles.backButton}>
              <Icon
                name="chevron-back"
                type={IconType.Ionicons}
                size={24}
                color={IVOO_COLORS.white}
              />
            </TouchableOpacity>
          )}

          <Text style={styles.headerTitle}>{title}</Text>
        </View>
      </View>

      {/* BODY */}
      <View style={styles.bodyWrapper}>
        <View
          style={[
            styles.bodyCard,
            !noRoundedCorners && styles.bodyCardRounded,
          ]}>
          {headerContent && (
            <View style={styles.cardHeader}>{headerContent}</View>
          )}

          {scroll ? (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              refreshControl={refreshControl}
              showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
          ) : (
            <View style={styles.nonScrollContent}>{children}</View>
          )}
        </View>

        {floatingComponent}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: IVOO_COLORS.white,
  },

  /* HEADER */
  header: {
    width: '100%',
    justifyContent: 'flex-end',
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingBottom: 20,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    marginRight: 8,
  },

  headerTitle: {
    fontSize: SCREEN_WIDTH * 0.05,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.white,
  },

  /* BODY */
  bodyWrapper: {
    flex: 1,
    marginTop: -CARD_OVERLAP,
    position: 'relative',
  },

  bodyCard: {
    flex: 1,
    backgroundColor: IVOO_COLORS.white,
    paddingHorizontal: SCREEN_WIDTH * 0.06,
    paddingTop: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: {width: 0, height: 4},
      },
      android: {
        elevation: 4,
      },
    }),
  },

  bodyCardRounded: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  cardHeader: {
    marginBottom: 16,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: SCREEN_HEIGHT * 0.03,
  },

  nonScrollContent: {
    flex: 1,
  },
});

export default CurvedHeaderLayout;