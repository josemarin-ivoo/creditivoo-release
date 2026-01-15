import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SCREENS} from '@shared-constants';
import {IVOO_COLORS, IVOO_TYPOGRAPHY} from '../../styles';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface HomeHelpIvooAdvisorProps {
  message?: string;
}

const HomeHelpIvooAdvisor: React.FC<HomeHelpIvooAdvisorProps> = ({
  message = 'Hola! Soy Ivitoo,\n tu asesor virtual de CreditIvoo.',
}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    (navigation as any).navigate(SCREENS.HELP);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}>
      <Image
        source={require('../../images/profile/ivitoo-profile.png')}
        style={styles.characterImage}
        resizeMode="contain"
      />
      <View style={styles.speechBubble}>
        <Text style={styles.speechText}>{message}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    height: '100%',
    paddingHorizontal: 0,
    paddingVertical: 2,
  },
  characterImage: {
    width: 70,
    height: 70,
    flexShrink: 0,
    marginRight: 1,
  },
  speechBubble: {
    flex: 1,
    backgroundColor: IVOO_COLORS.white,
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderRadius: 8,
    borderBottomLeftRadius: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    minWidth: 0,
  },
  speechText: {
    fontSize: SCREEN_WIDTH * 0.025,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.textSecondary,
    textAlign: 'left',
    lineHeight: SCREEN_WIDTH * 0.038,
  },
});

export default HomeHelpIvooAdvisor;
