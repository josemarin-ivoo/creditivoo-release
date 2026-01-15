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
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 16,
      backgroundColor: theme['background-basic-color-1'] || '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: theme['border-basic-color-2'] || '#E5E5E5',
    },
    backButton: {
      padding: 8,
    },
    backButtonCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme['color-primary-500'] || '#4CAF50',
      alignItems: 'center',
      justifyContent: 'center',
    },
    backIcon: {
      width: 24,
      height: 24,
    },
    logoContainer: {
      marginRight: 12,
    },
    logoCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: theme['border-basic-color-3'] || '#E5E5E5',
      backgroundColor: theme['background-basic-color-1'] || '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: {
      fontSize: 12,
      fontFamily: FONTS.urbanistBold,
      color: theme['color-primary-500'] || '#4CAF50',
      letterSpacing: 1,
    },
    logoSubtext: {
      fontSize: 8,
      fontFamily: FONTS.urbanistBold,
      color: theme['text-basic-color'] || '#000000',
      letterSpacing: 0.5,
    },
    headerInfo: {
      flex: 1,
    },
    branchTitle: {
      fontSize: 24,
      fontFamily: FONTS.urbanistBold,
      color: theme['text-basic-color'] || '#000000',
      marginBottom: 4,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    locationIcon: {
      width: 16,
      height: 16,
    },
    branchState: {
      fontSize: 14,
      fontFamily: FONTS.urbanistRegular,
      color: theme['text-hint-color'] || '#999999',
      marginLeft: 4,
    },
    container: {
      padding: 16,
      paddingBottom: 100,
    },
    infoCard: {
      backgroundColor: theme['background-basic-color-2'] || '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme['border-basic-color-3'] || '#E5E5E5',
    },
    sectionTitle: {
      fontSize: 14,
      fontFamily: FONTS.urbanistBold,
      color: theme['text-basic-color'] || '#000000',
      marginBottom: 8,
    },
    sectionContent: {
      fontSize: 16,
      fontFamily: FONTS.urbanistRegular,
      color: theme['text-basic-color'] || '#000000',
      marginBottom: 16,
      lineHeight: 24,
    },
    divider: {
      marginVertical: 16,
      backgroundColor: theme['border-basic-color-3'] || '#E5E5E5',
    },
    emailSection: {
      position: 'relative',
    },
    directionsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-end',
      marginTop: 8,
    },
    directionsIcon: {
      width: 20,
      height: 20,
    },
    directionsButtonText: {
      fontSize: 16,
      fontFamily: FONTS.urbanistBold,
      color: theme['color-primary-500'] || '#4CAF50',
      marginLeft: 8,
    },
  });
};

export default createStyles;
