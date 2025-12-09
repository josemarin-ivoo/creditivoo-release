import {StyleSheet} from 'react-native';
import {Theme} from '@ui-kitten/components';
import {FONTS} from 'app/styles/global.style';

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme['background-basic-color-1'] || '#FFFFFF',
    },
    layout: {
      flex: 1,
      backgroundColor: theme['background-basic-color-1'] || '#FFFFFF',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 16,
      backgroundColor: theme['background-basic-color-1'] || '#FFFFFF',
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontFamily: FONTS.urbanistBold,
      fontSize: 22,
      fontWeight: 'bold',
      color: theme['text-basic-color'] || '#000000',
      flex: 1,
      textAlign: 'center',
    },
    headerRight: {
      width: 40,
    },
    container: {
      padding: 16,
      paddingBottom: 100, // Space for tab navigator
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 16,
      fontFamily: FONTS.urbanistRegular,
      color: theme['text-hint-color'] || '#666666',
      textAlign: 'center',
      marginTop: 24,
    },
    branchCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme['border-basic-color-3'] || '#E5E5E5',
    },
    branchIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme['color-primary-100'] || '#F5F5F5',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    branchInfo: {
      flex: 1,
    },
    branchName: {
      fontSize: 16,
      fontFamily: FONTS.urbanistBold,
      color: theme['text-basic-color'] || '#000000',
      marginBottom: 4,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    branchLocation: {
      fontSize: 14,
      fontFamily: FONTS.urbanistRegular,
      color: theme['text-hint-color'] || '#999999',
      marginLeft: 4,
    },
  });
};

export default createStyles;
