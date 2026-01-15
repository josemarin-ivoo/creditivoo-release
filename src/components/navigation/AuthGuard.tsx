import React, {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {RootState, AppDispatch} from 'store/store';
import {handleSessionExpiration} from 'store/slices/auth-slice';
import {SCREENS} from '@shared-constants';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({children}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const {isLoggedIn, sessionExpired, isAutoLoginLoading} = useSelector(
    (state: RootState) => state.auth,
  );

  useEffect(() => {
    const handleAuthState = async () => {
      if (isAutoLoginLoading) {
        return; // Wait for auto-login to complete
      }

      if (!isLoggedIn || sessionExpired) {
        // Clear any existing auth data
        await dispatch(handleSessionExpiration());
        // Navigate to login screen
        navigation.reset({
          index: 0,
          routes: [{name: 'SignIn' as never}],
        });
      }
    };

    handleAuthState();
  }, [isLoggedIn, sessionExpired, isAutoLoginLoading, dispatch, navigation]);

  // Don't render children while checking auth state
  if (isAutoLoginLoading) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
