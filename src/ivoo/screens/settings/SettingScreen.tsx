import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import {SCREENS} from '@shared-constants';
import CurvedHeaderLayout from '../../components/layouts/CurvedHeaderLayout';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface SettingOption {
  id: string;
  title: string;
}

const SettingScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleOptionPress = (optionId: string) => {
    switch (optionId) {
      case 'changePassword':
        (navigation as any).navigate('ChangePassword');
        break;
      case 'security':
        (navigation as any).navigate(SCREENS.SECURITY);
        break;
      default:
        console.log('Option pressed:', optionId);
    }
  };

  const options: SettingOption[] = [
    {id: 'changePassword', title: 'Cambiar contraseña'},
    {id: 'security', title: 'Seguridad'},
  ];

  return (
    <CurvedHeaderLayout
      title="Configuración"
      showBackButton={true}
      onBackPress={handleBackPress}
      scroll={true}>
      <View style={styles.content}>
        <View style={styles.optionsList}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionItem,
                index === options.length - 1 && styles.optionItemLast,
              ]}
              onPress={() => handleOptionPress(option.id)}>
              <View style={styles.optionLeft}>
                <Text style={styles.optionText}>{option.title}</Text>
              </View>
              <Icon
                name="chevron-forward"
                type={IconType.Ionicons}
                size={20}
                color={IVOO_COLORS.grayLight}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </CurvedHeaderLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: SCREEN_WIDTH * 0.02,
    paddingBottom: SCREEN_WIDTH * 0.03,
  },
  optionsList: {
    backgroundColor: IVOO_COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
    justifyContent: 'space-between',
  },
  optionItemLast: {
    borderBottomWidth: 0,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  optionText: {
    fontSize: SCREEN_WIDTH * 0.042,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.textPrimary,
    flexShrink: 1,
  },
});

export default SettingScreen;
