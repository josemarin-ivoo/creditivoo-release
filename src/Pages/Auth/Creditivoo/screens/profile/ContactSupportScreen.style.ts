import {StyleSheet} from 'react-native';
import {Theme} from '@ui-kitten/components';
import {FONTS} from 'app/styles/global.style';

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme['background-basic-color-1'],
    },
    layout: {
      flex: 1,
      backgroundColor: theme['background-basic-color-1'],
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme['background-basic-color-1'],
      borderBottomWidth: 1,
      borderBottomColor: theme['border-basic-color-2'],
    },
    backButton: {
      padding: 8,
    },
    backButtonCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme['color-primary-500'],
      alignItems: 'center',
      justifyContent: 'center',
    },
    backIcon: {
      width: 24,
      height: 24,
    },
    headerTitle: {
      fontFamily: FONTS.urbanistBold,
      fontSize: 22,
      color: theme['text-basic-color'],
    },
    headerRight: {
      width: 36 + 16, // Match back button size + padding
    },
    container: {
      padding: 16,
      paddingBottom: 100, // Space for tab navigator
    },
    introText: {
      fontFamily: FONTS.urbanistRegular,
      fontSize: 16,
      color: theme['text-hint-color'],
      marginBottom: 24,
      lineHeight: 24,
    },
    card: {
      backgroundColor: theme['background-basic-color-2'],
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 24,
    },
    contactMethod: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    contactIcon: {
      width: 24,
      height: 24,
      marginRight: 12,
    },
    contactInfo: {
      flex: 1,
    },
    contactLabel: {
      fontFamily: FONTS.urbanistBold,
      fontSize: 14,
      color: theme['text-basic-color'],
      marginBottom: 4,
    },
    contactValue: {
      fontFamily: FONTS.urbanistRegular,
      fontSize: 14,
      color: theme['text-hint-color'],
    },
    chevronIcon: {
      width: 20,
      height: 20,
    },
    formCard: {
      backgroundColor: theme['background-basic-color-2'],
      borderRadius: 12,
      padding: 16,
    },
    formTitle: {
      fontFamily: FONTS.urbanistBold,
      fontSize: 18,
      color: theme['text-basic-color'],
      marginBottom: 20,
    },
    formLabel: {
      fontFamily: FONTS.urbanistBold,
      fontSize: 14,
      color: theme['text-basic-color'],
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme['background-basic-color-1'],
      borderRadius: 8,
      padding: 12,
      fontFamily: FONTS.urbanistRegular,
      fontSize: 16,
      color: theme['text-basic-color'],
      borderWidth: 1,
      borderColor: theme['border-basic-color-3'],
    },
    textArea: {
      height: 120,
      paddingTop: 12,
    },
    submitButton: {
      marginTop: 20,
    },
  });
};

export default createStyles;
