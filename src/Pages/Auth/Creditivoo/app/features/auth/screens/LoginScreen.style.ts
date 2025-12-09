import {StyleSheet} from 'react-native';
import {ThemeType} from '@shared-theme';

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    layout: {
      flex: 1,
      padding: 20,
    },
    header: {
      marginBottom: 20,
    },
    backButton: {
      marginRight: 10,
    },
    title: {
      marginBottom: 10,
    },
    container: {
      flex: 1,
      //justifyContent: 'space-between',
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 20,
    },
    formContainer: {
      //flex: 1,
    },
    input: {
      marginVertical: 10,
    },
    button: {
      marginTop: 12,
    },
    secondaryButton: {
      backgroundColor:'#E9FBF0'
      //marginTop: 12,
    },
  });

export default createStyles;
