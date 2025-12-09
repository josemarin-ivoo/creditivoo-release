import {StyleSheet} from 'react-native';
import {FONTS} from 'app/styles/global.style';

const createStyles = (theme: any) => {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    layout: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 16,
      backgroundColor: '#FFFFFF',
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    backButtonCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme['color-primary-500'] || '#4CAF50',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontFamily: FONTS.urbanistBold,
      fontSize: 22,
      fontWeight: 'bold',
      color: '#000000',
      flex: 1,
      textAlign: 'center',
    },
    headerRight: {
      width: 40,
    },
    container: {
      padding: 16,
      paddingBottom: 100, // Space for tab navigator and logout button
    },
    sectionContainer: {
      marginBottom: 24,
    },
    sectionTitle: {
      marginBottom: 12,
      marginLeft: 4,
      color: '#000000',
      fontFamily: FONTS.urbanistBold,
      fontSize: 16,
      fontWeight: 'bold',
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      overflow: 'hidden',
      elevation: 0,
      shadowColor: 'transparent',
      borderWidth: 0,
    },
    logoutContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 16,
      paddingBottom: 100, // Space for tab navigator
      paddingTop: 16,
      backgroundColor: '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: '#E5E5E5',
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: '#FF3D71',
    },
    logoutIcon: {
      width: 24,
      height: 24,
      marginRight: 8,
    },
    logoutText: {
      fontFamily: FONTS.urbanistBold,
      fontSize: 16,
      color: '#FF3D71',
    },
  });
};

export default createStyles;
