import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {COLORS, FONTS} from '../styles/global.style';
import {useNavigation} from '@react-navigation/native';
import {useStatusBar} from '../../utils/useStatusBar';

interface BackTopBarProps {
  middleText?: string; // Optional prop for text in the middle
  hideBackButton?: boolean; // Optional prop to hide the back button
  statusBarColor?: string; // Optional prop to customize status bar color
  statusBarStyle?: 'light-content' | 'dark-content'; // Optional prop to customize status bar style
}

const BackTopBar: React.FC<BackTopBarProps> = ({
  middleText = '',
  hideBackButton = false,
  statusBarColor = COLORS.white,
  statusBarStyle = 'dark-content',
}) => {
  const navigation = useNavigation();
  
  // Configurar status bar con el color de fondo
  useStatusBar({
    backgroundColor: statusBarColor,
    barStyle: statusBarStyle,
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {!hideBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon
              name="arrow-left"
              type={IconType.Feather}
              size={24}
              color={COLORS.greyDark}
            />
          </TouchableOpacity>
        )}
        {middleText ? (
          <Text style={styles.headerTitle}>{middleText}</Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    width: '100%',
  },
  backButton: {
    marginRight: 8,
  },
  headerTitle: {
    fontFamily: FONTS.urbanistBold,
    fontSize: 22,
    color: COLORS.greyDark,
    fontWeight: 'bold',
    marginLeft: 2,
  },
});

export default BackTopBar;
