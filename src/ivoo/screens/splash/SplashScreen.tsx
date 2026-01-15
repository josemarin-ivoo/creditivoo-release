import React, {useEffect} from 'react';
import {StatusBar, StyleSheet, View, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useIvoSelector} from '../../store/hooks';
import {SCREENS} from '@shared-constants';
import CreditIvooLogo from '../../svgs/CreditIvooLogo';

const SplashScreen: React.FC = () => {
  const navigation = useNavigation();
  const {isLoggedIn, isAutoLoginLoading} = useIvoSelector(state => state.auth);

  useEffect(() => {
    if (!isAutoLoginLoading) {
      const timer = setTimeout(() => {
        if (!isLoggedIn) {
          (navigation as any).navigate(SCREENS.LOGIN);
        } else {
          navigation.reset({
            index: 0,
            routes: [{name: 'MainTabs' as never}],
          });
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAutoLoginLoading, isLoggedIn, navigation]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        overScrollMode="always"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}>
        {/* Central Logo/Asset */}
        <View style={styles.logoContainer}>
          <CreditIvooLogo width={171} height={109} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 10,
  },
  logoContainer: {
    width: 171,
    height: 109,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SplashScreen;
