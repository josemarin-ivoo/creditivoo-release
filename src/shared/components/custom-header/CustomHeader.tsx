import React from 'react';
import {TouchableOpacity, StyleSheet, View, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {clearAuth} from 'store/slices/auth-slice';
import {AppDispatch, RootState} from '../../../store/store';
import PopupMenu from '@shared-components/popup-menu/PopupMenu';
import TextWrapper from '@shared-components/text-wrapper/TextWrapper';
import IvooLogo from '@assets/svgs/IvooLogo.svg';
//import headerLogo from 'assets/img/headerLogo.jpg';

interface CustomHeaderProps {
  notGoBack?: boolean;
  middleText?: string | null;
  middleLogo?: boolean;
  withoutAvatar?: boolean;
  popupToCLose?: boolean;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
  notGoBack,
  middleText = null,
  middleLogo = false,
  withoutAvatar = false,
  popupToCLose = true,
}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const isLoading = useSelector(
    (state: RootState) => state.loader.globalLoader,
  );

  const onClose = () => {
    dispatch(clearAuth());
  };

  if (isLoading) return null;

  return (
    <SafeAreaView
      style={[
        styles.container,
        notGoBack && !middleLogo && {justifyContent: 'flex-end'},
      ]}>
      {!notGoBack && (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon
            name="chevron-left"
            type={IconType.FontAwesome5}
            size={20}
            style={{
              minHeight: 24,
            }}
            color="#22177A"
          />
        </TouchableOpacity>
      )}
      {middleText && (
        <TextWrapper fontSize={16} semiBoldSora>
          {middleText}
        </TextWrapper>
      )}
      {middleLogo && (
        <Icon
          name="menu-sharp"
          type={IconType.Ionicons}
          size={30}
          style={{
            minHeight: 30,
          }}
          color="#22177A"
        />
      )}
      {middleLogo && <Image source={IvooLogo} style={styles.image} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 12,
    paddingBottom: 1,
    // borderWidth: 1,
    // borderColor: '#f00',
    shadowColor: 'black',
  },
  rightSide: {
    paddingRight: 6,
  },
  image: {
    width: 100,
    height: 43,
    // width: 61,
    // height: 30,
    position: 'relative',
    bottom: 2,
    paddingBottom: 2,
  },
});

export default CustomHeader;
