import React, {useState} from 'react';
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
} from '../../styles';
import {useIvoSelector, useIvoDispatch} from '../../../../../redux/useIvo';
import AtomIcon from '../../svgs/svg-icons/atom.svg';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

interface HomeCreditCardProps {
  onRequestCredit: () => void;
  style?: any;
}

const HomeCreditCard: React.FC<HomeCreditCardProps> = ({
  onRequestCredit,
  style,
}) => {
  const {user} = useIvoSelector(state => state.creditivoo.auth);
  const [isCreditHidden, setIsCreditHidden] = useState(false);

  const hasCredit = !!user?.hasActiveCredit && (user.creditAvailable || 0) > 0;
  const availableAmount = user?.creditAvailable || user?.creditLimit || 0;
  const pendingAmount =
    (user?.pendingPayment || 0) + (user?.overduePayment || 0);
  const formattedAvailable = isCreditHidden
    ? 'USD $••••'
    : `USD $${availableAmount}`;
  const formattedPending = isCreditHidden
    ? 'USD $••••'
    : `USD $${pendingAmount}`;

  const toggleCreditVisibility = () => {
    setIsCreditHidden(!isCreditHidden);
  };

  return (
    <View style={[styles.mainCard, style]}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        {hasCredit && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={toggleCreditVisibility}
            activeOpacity={0.7}>
            <Icon
              name={isCreditHidden ? 'eye' : 'eye-off'}
              type={IconType.Feather}
              size={20}
              color="#000000"
            />
          </TouchableOpacity>
        )}
        <View style={styles.logoWrapper}>
          <Image
            source={require('../../images/creditivo-logo-full.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Text + Ivitoo */}
      <View style={styles.mainCardTopRow}>
        {!hasCredit && (
          <View style={styles.mainCardTextContainer}>
            <Text style={styles.mainCardTitle}>Solicita aquí tu línea de</Text>
            <Text style={styles.mainCardTitleBold}>CreditIvoo disponible</Text>
          </View>
        )}

        {!hasCredit && (
          <View style={styles.ivitooInCard}>
            <Image
              source={require('../../images/home/ivitoo-home-no-credit.png')}
              style={styles.ivitooInCardImage}
              resizeMode="contain"
            />
          </View>
        )}
      </View>

      {hasCredit ? (
        <>
          <View style={styles.balancesRow}>
            <View style={styles.balanceColumnLeft}>
              <Text style={styles.balanceLabel}>Disponible:</Text>
              <Text style={styles.availableAmount}>{formattedAvailable}</Text>
            </View>
            <View style={styles.balanceColumnRight}>
              <Text style={styles.balanceLabelRight}>Saldo pendiente:</Text>
              <Text style={styles.pendingAmount}>{formattedPending}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.dueRowNoPurchase}>
            {/* <View style={styles.dueTextColumn}>
              <Text style={styles.dueLabel}>Fecha límite de pago</Text>
              <Text style={styles.dueValue}>
                Ago 1 - <Text style={styles.dueAmount}>$ 150</Text>
              </Text>
            </View>
            <TouchableOpacity
              onPress={onRequestCredit}
              style={styles.payButton}
              activeOpacity={0.8}>
              <Text style={styles.payButtonText}>Pagar</Text>
            </TouchableOpacity> */}
          </View>
        </>
      ) : (
        <>
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
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  /* Card container */
  mainCard: {
    backgroundColor: IVOO_COLORS.white,
    borderRadius: SCREEN_WIDTH * 0.03,
    paddingHorizontal: SCREEN_WIDTH * 0.09, // reduced for more text space
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
    width: '100%',
    height: SCREEN_WIDTH * 0.39 * 0.16,
    alignSelf: 'center',
    marginBottom: SCREEN_HEIGHT * 0.012,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logo: {
    width: '100%',
    height: '100%',
  },

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
    zIndex: 1,
  },
  ivitooInCardImage: {width: '100%', height: '100%'},

  separator: {
    height: 1.5,
    backgroundColor: '#DADADA',
    width: '100%',
    marginBottom: SCREEN_HEIGHT * 0.016,
    marginTop: SCREEN_HEIGHT * -0.01,
    zIndex: 0,
  },

  /* Balances when there is credit */
  balancesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginTop: SCREEN_HEIGHT * 0.012,
    marginBottom: SCREEN_HEIGHT * 0.04,
  },
  balanceColumnLeft: {
    flex: 1,
  },
  balanceColumnRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: '#000000',
    marginBottom: SCREEN_HEIGHT * 0.003,
  },
  balanceLabelRight: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: '#000000',
    marginBottom: SCREEN_HEIGHT * 0.003,
  },
  availableAmount: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
    color: IVOO_COLORS.primary,
  },
  pendingAmount: {
    fontSize: SCREEN_WIDTH * 0.053,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: '#000000',
  },

  /* Due date row */
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: SCREEN_HEIGHT * 0.06,
  },
  dueRowNoPurchase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  dueTextColumn: {
    flex: 1.4,
  },
  dueLabel: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.black,
    marginBottom: SCREEN_HEIGHT * 0.004,
  },
  dueValue: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: IVOO_COLORS.black,
  },
  dueAmount: {
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    fontWeight: IVOO_TYPOGRAPHY.fontWeight.bold,
  },
  payButton: {
    backgroundColor: IVOO_COLORS.primary,
    borderRadius: SCREEN_HEIGHT * 0.03,
    paddingHorizontal: SCREEN_WIDTH * 0.08,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SCREEN_WIDTH * 0.04,
  },
  payButtonText: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interBold,
    color: IVOO_COLORS.textWhite,
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
    height: 36,
    flexDirection: 'row',
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
  logoWrapper: {
    width: SCREEN_WIDTH * 0.39,
    height: SCREEN_WIDTH * 0.39 * 0.16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 0,
  },
});

export default HomeCreditCard;