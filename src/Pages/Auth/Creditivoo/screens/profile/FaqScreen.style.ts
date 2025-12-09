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
    },
    faqItem: {
      padding: 16,
    },
    questionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    questionIcon: {
      width: 24,
      height: 24,
      marginRight: 8,
    },
    questionText: {
      fontFamily: FONTS.urbanistBold,
      fontSize: 16,
      color: theme['text-basic-color'],
      flex: 1,
    },
    answerText: {
      fontFamily: FONTS.urbanistRegular,
      fontSize: 14,
      color: theme['text-hint-color'],
      lineHeight: 20,
      marginLeft: 32, // Align with question text
    },
  });
};

export default createStyles;
