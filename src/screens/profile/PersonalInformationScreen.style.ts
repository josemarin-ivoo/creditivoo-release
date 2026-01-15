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
      width: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    editButton: {
      padding: 4,
    },
    editButtonCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme['color-primary-500'] || '#4CAF50',
      alignItems: 'center',
      justifyContent: 'center',
    },
    editIcon: {
      width: 20,
      height: 20,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    cancelButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    cancelButtonText: {
      fontFamily: FONTS.urbanistBold,
      fontSize: 14,
      color: theme['text-hint-color'] || '#999999',
    },
    saveButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme['color-primary-500'] || '#4CAF50',
      borderRadius: 8,
      minWidth: 80,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveButtonText: {
      fontFamily: FONTS.urbanistBold,
      fontSize: 14,
      color: '#FFFFFF',
    },
    container: {
      padding: 16,
      paddingBottom: 100, // Space for tab navigator
    },
    profileImageContainer: {
      alignItems: 'center',
      marginBottom: 24,
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 3,
      borderColor: theme['color-primary-500'] || '#4CAF50',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    fieldCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      marginBottom: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme['border-basic-color-3'] || '#E5E5E5',
    },
    fieldHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme['color-primary-100'] || '#E8F5E9',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    fieldContent: {
      flex: 1,
    },
    labelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    fieldLabel: {
      fontFamily: FONTS.urbanistBold,
      fontSize: 12,
      color: theme['text-hint-color'] || '#999999',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    verificationBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    verificationIcon: {
      width: 16,
      height: 16,
    },
    verificationText: {
      fontFamily: FONTS.urbanistBold,
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    verificationTextVerified: {
      color: '#4CAF50',
    },
    verificationTextNotVerified: {
      color: '#FF6B6B',
    },
    fieldValue: {
      fontFamily: FONTS.urbanistRegular,
      fontSize: 16,
      color: theme['text-basic-color'] || '#000000',
      lineHeight: 22,
    },
    fieldInput: {
      fontFamily: FONTS.urbanistRegular,
      fontSize: 16,
      color: theme['text-basic-color'] || '#000000',
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: theme['background-basic-color-1'] || '#F5F5F5',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme['border-basic-color-3'] || '#E5E5E5',
      marginTop: 4,
    },
    actionButtonsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 24,
      paddingBottom: 20,
    },
    cancelButtonBottom: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme['border-basic-color-3'] || '#E5E5E5',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
    },
    saveButtonBottom: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: theme['color-primary-500'] || '#4CAF50',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
    },
    kycSection: {
      marginTop: 32,
    },
    kycSectionTitle: {
      fontFamily: FONTS.urbanistBold,
      fontSize: 18,
      color: theme['text-basic-color'] || '#000000',
      marginBottom: 16,
      marginLeft: 4,
    },
  });
};

export default createStyles;
