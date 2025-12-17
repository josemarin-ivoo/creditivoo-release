import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  IVOO_COLORS,
  IVOO_TYPOGRAPHY,
  IVOO_SPACING,
  IVOO_TEXT_STYLES,
  getShadowStyle,
} from '../../styles';
import AtomIcon from '../../svgs/svg-icons/atom.svg';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

interface HomeCreditCardProps {
  onRequestCredit: () => void;
  style?: any;
}

const HomeCreditCard: React.FC<HomeCreditCardProps> = ({
  onRequestCredit,
  style,
}) => {
  return (
    <View style={[styles.mainCard, style]}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../images/creditivo-logo-full.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Text + Ivitoo */}
      <View style={styles.mainCardTopRow}>
        <View style={styles.mainCardTextContainer}>
          <Text style={styles.mainCardTitle}>Solicita aquí tu línea</Text>
          <Text style={styles.mainCardTitleBold}>Creditivoo disponible</Text>
        </View>

        <View style={styles.ivitooInCard}>
          <Image
            source={require('../../images/home/ivitoo-home-no-credit.png')}
            style={styles.ivitooInCardImage}
            resizeMode="contain"
          />
        </View>
      </View>

      <View style={styles.separator} />

      <View style={styles.mainCardButtonContainer}>
        <TouchableOpacity
          onPress={onRequestCredit}
          style={styles.customButton}
          activeOpacity={0.8}>
          <View style={styles.iconContainer}>
            <AtomIcon width={18} height={18} />
          </View>
          <Text style={styles.buttonText}>Solicitar ahora</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  /* Card container */
  mainCard: {
    backgroundColor: IVOO_COLORS.white,
    borderRadius: SCREEN_WIDTH * 0.03,
    paddingHorizontal: SCREEN_WIDTH * 0.04, // reduced for more text space
    paddingTop: SCREEN_HEIGHT * 0.018,
    paddingBottom: SCREEN_HEIGHT * 0.024,
    shadowColor: '#00000040',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },

  /* Logo */
  logoContainer: {
    width: SCREEN_WIDTH * 0.39,
    height: SCREEN_WIDTH * 0.39 * 0.16,
    alignSelf: 'center',
    marginBottom: SCREEN_HEIGHT * 0.012,
  },
  logo: {width: '100%', height: '100%'},

  /* Content row */
  mainCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },

  /* Text block */
  mainCardTextContainer: {
    flex: 1,
    maxWidth: SCREEN_WIDTH * 0.55, // increased to avoid ellipsis
    justifyContent: 'center',
  },
  mainCardTitle: {
    fontSize: SCREEN_WIDTH * 0.045,
    lineHeight: SCREEN_WIDTH * 0.08,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.black,
  },
  mainCardTitleBold: {
    fontSize: SCREEN_WIDTH * 0.045,
    lineHeight: SCREEN_WIDTH * 0.052,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.black,
    marginTop: 0, // removed spacing between lines
  },

  /* Ivitoo */
  ivitooInCard: {
    width: SCREEN_WIDTH * 0.2,
    height: SCREEN_WIDTH * 0.22 * 1.15,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SCREEN_WIDTH * 0.02,
  },
  ivitooInCardImage: {width: '100%', height: '100%'},

  separator: {
    height: 1.5,
    backgroundColor: '#DADADA',
    width: '100%',
    marginBottom: SCREEN_HEIGHT * 0.016,
    marginTop: SCREEN_HEIGHT * -0.01,
  },

  /* Button */
  mainCardButtonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.01,
  },
  customButton: {
    backgroundColor: IVOO_COLORS.primary,
    borderRadius: IVOO_SPACING.buttonBorderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    width: '100%',
    height: 42,
    flexDirection: 'row',
    ...getShadowStyle('button'),
  },
  iconContainer: {
    marginRight: SCREEN_WIDTH * 0.024,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: IVOO_TEXT_STYLES.buttonText.fontSize,
    fontFamily: IVOO_TEXT_STYLES.buttonText.fontFamily,
    fontWeight: IVOO_TEXT_STYLES.buttonText.fontWeight,
    letterSpacing: IVOO_TEXT_STYLES.buttonText.letterSpacing,
    color: IVOO_COLORS.textWhite,
    includeFontPadding: false,
  },
});

export default HomeCreditCard;
