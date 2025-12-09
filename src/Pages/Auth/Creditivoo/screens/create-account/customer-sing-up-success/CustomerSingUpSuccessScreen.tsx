import Button from '@shared-components/button/Button';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import createStyles from './CustomerSingUpSuccessScreen.style';
import TextWrapper from '@shared-components/text-wrapper/TextWrapper';
import SingUpSuccessLogo from './components/SingUpSuccessLogo';
import {useDispatch, useSelector} from 'react-redux';
import {clearUser} from 'store/slices/users-slice';
import {updateAuth} from 'store/slices/auth-slice';
import {AppDispatch, RootState} from 'store/store';
import {ScrollView} from 'react-native-gesture-handler';

const CustomerSingUpSuccessScreen: React.FC = () => {
  const styles = useMemo(() => createStyles(), []);
  const dispatch = useDispatch<AppDispatch>();
  const {user, token} = useSelector((state: RootState) => state.users);

  const handlePress = async () => {
    await dispatch(updateAuth({token, user}));
    dispatch(clearUser());
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <SingUpSuccessLogo />
        <View style={styles.textTitle}>
          <TextWrapper fontSize={22} semiBoldSora center>
            Cliente Registrado!
          </TextWrapper>
          <View style={styles.textSubtitle}>
            <TextWrapper fontSize={14} center>
              El cliente ha sido registrado exitosamente
            </TextWrapper>
          </View>
        </View>
        <View style={styles.button}>
          <Button title="Hecho" onPress={handlePress} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CustomerSingUpSuccessScreen;
