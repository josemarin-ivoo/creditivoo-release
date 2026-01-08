import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {IVOO_COLORS} from '../../styles';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

interface RegisterLayoutProps {
  logo: React.ReactNode;
  children: React.ReactNode;
  bottomAction: React.ReactNode;

  // New Flexible Props
  contentAlign?: 'flex-start' | 'center' | 'flex-end';
  contentPaddingTop?: number;
}

const RegisterLayout: React.FC<RegisterLayoutProps> = ({
  logo,
  children,
  bottomAction,
  contentAlign = 'flex-start', // Default visually better for auth screens
  contentPaddingTop = SCREEN_HEIGHT * 0.03,
}) => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Top logo */}
        <View style={styles.logoContainer}>{logo}</View>

        {/* Center Content with Flexible Alignment */}
        <KeyboardAvoidingView
          style={[
            styles.content,
            {
              justifyContent: contentAlign,
              paddingTop: contentPaddingTop,
            },
          ]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          enabled={true}>
          {children}
        </KeyboardAvoidingView>

        {/* Bottom Button */}
        <View style={styles.bottomContainer}>{bottomAction}</View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: IVOO_COLORS.white,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    marginTop: SCREEN_HEIGHT * 0.06, // Increased space above logo
    alignItems: 'center',
  },
  content: {
    flexGrow: 1,
    width: SCREEN_WIDTH * 0.88,
    alignItems: 'center',
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: SCREEN_HEIGHT * 0.04,
  },
});

export default RegisterLayout;