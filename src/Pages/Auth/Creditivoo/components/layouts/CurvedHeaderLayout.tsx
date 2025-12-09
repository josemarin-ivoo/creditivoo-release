import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const HEADER_HEIGHT = SCREEN_HEIGHT * 0.16;
const CARD_OVERLAP = 35;

interface CurvedHeaderLayoutProps {
  title: string;
  children: React.ReactNode;
  headerContent?: React.ReactNode;
  headerColor?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  scroll?: boolean;
}

const CurvedHeaderLayout: React.FC<CurvedHeaderLayoutProps> = ({
  title,
  children,
  headerContent,
  headerColor = IVOO_COLORS.primary,
  showBackButton = true,
  onBackPress,
  scroll = true,
}) => {
  const BodyWrapper = scroll ? ScrollView : View;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header de color */}
      <View style={[styles.header, {backgroundColor: headerColor}]}>
        {showBackButton && onBackPress ? (
          <TouchableOpacity
            onPress={onBackPress}
            style={styles.headerRow}
            activeOpacity={0.7}>
            <Icon
              name="chevron-back"
              type={IconType.Ionicons}
              size={24}
              color={IVOO_COLORS.white}
            />
            <Text style={styles.headerTitle}>{title}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>{title}</Text>
          </View>
        )}
      </View>

      {/* Contenedor blanco con borde curvo */}
      <View style={styles.bodyWrapper}>
        <View style={styles.bodyCard}>
          {headerContent && (
            <View style={styles.cardHeader}>{headerContent}</View>
          )}

          <BodyWrapper
            {...(scroll ? {contentContainerStyle: styles.scrollContent} : {})}>
            {children}
          </BodyWrapper>
        </View>
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
    width: '100%',
    height: HEADER_HEIGHT,
    justifyContent: 'flex-end',
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingBottom: SCREEN_HEIGHT * 0.08,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginTop: SCREEN_HEIGHT * 0.03,
  },
  headerTitle: {
    fontSize: SCREEN_WIDTH * 0.05,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.white,
    marginLeft: 8,
  },
  bodyWrapper: {
    flex: 1,
    marginTop: -CARD_OVERLAP, // solo se monta un poco, no tapa el título
    position: 'relative',
  },
  bodyCard: {
    flex: 1,
    backgroundColor: IVOO_COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
  cardHeader: {
    marginBottom: 16,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SCREEN_HEIGHT * 0.03,
  },
});

export default CurvedHeaderLayout;
