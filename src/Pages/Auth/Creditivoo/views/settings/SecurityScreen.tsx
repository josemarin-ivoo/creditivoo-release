import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  Switch,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';
import CurvedHeaderLayout from '../../components/layouts/CurvedHeaderLayout';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface SecurityOption {
  id: string;
  title: string;
  type: 'toggle' | 'navigation';
}

const SecurityScreen: React.FC = () => {
  const navigation = useNavigation();
  const [faceIdEnabled, setFaceIdEnabled] = useState(true);
  const [biometricIdEnabled, setBiometricIdEnabled] = useState(true);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleOptionPress = (optionId: string) => {
    if (optionId === 'googleAuthenticator') {
      // TODO: navegación a Google Authenticator
      console.log('Google Authenticator pressed');
    }
  };

  const options: SecurityOption[] = [
    {id: 'faceId', title: 'Face ID', type: 'toggle'},
    {id: 'biometricId', title: 'Biometric ID', type: 'toggle'},
    {
      id: 'googleAuthenticator',
      title: 'Google Authenticator',
      type: 'navigation',
    },
  ];

  return (
    <CurvedHeaderLayout
      title="Seguridad"
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
              onPress={() => handleOptionPress(option.id)}
              disabled={option.type === 'toggle'}>
              <View style={styles.optionLeft}>
                <Text style={styles.optionText}>{option.title}</Text>
              </View>
              {option.type === 'toggle' ? (
                <Switch
                  value={
                    option.id === 'faceId' ? faceIdEnabled : biometricIdEnabled
                  }
                  onValueChange={
                    option.id === 'faceId'
                      ? setFaceIdEnabled
                      : setBiometricIdEnabled
                  }
                  trackColor={{
                    false: '#E0E0E0',
                    true: IVOO_COLORS.primary,
                  }}
                  thumbColor={IVOO_COLORS.white}
                  ios_backgroundColor="#E0E0E0"
                />
              ) : (
                <Icon
                  name="chevron-forward"
                  type={IconType.Ionicons}
                  size={20}
                  color={IVOO_COLORS.grayLight}
                />
              )}
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

export default SecurityScreen;
