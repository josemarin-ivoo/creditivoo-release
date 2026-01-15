import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import {FONTS} from 'app/styles/global.style';

export type CustomMessageType = 'success' | 'error' | 'warning' | 'primary';

interface CustomMessageAlertProps {
  message: string;
  type: CustomMessageType;
  visible: boolean;
}

const CustomMessageAlert: React.FC<CustomMessageAlertProps> = ({
  message,
  type,
  visible,
}) => {
  if (!visible || !message) {
    return null;
  }

  const getAlertStyle = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#d4edda',
          borderColor: '#c3e6cb',
          iconColor: '#155724',
          textColor: '#155724',
        };
      case 'error':
        return {
          backgroundColor: '#f8d7da',
          borderColor: '#f5c6cb',
          iconColor: '#721c24',
          textColor: '#721c24',
        };
      case 'warning':
        return {
          backgroundColor: '#fff3cd',
          borderColor: '#ffeaa7',
          iconColor: '#856404',
          textColor: '#856404',
        };
      case 'primary':
        return {
          backgroundColor: '#d1ecf1',
          borderColor: '#bee5eb',
          iconColor: '#0c5460',
          textColor: '#0c5460',
        };
      default:
        return {
          backgroundColor: '#d1ecf1',
          borderColor: '#bee5eb',
          iconColor: '#0c5460',
          textColor: '#0c5460',
        };
    }
  };

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'alert-triangle';
      case 'primary':
        return 'information';
      default:
        return 'information';
    }
  };

  const alertStyle = getAlertStyle();

  return (
    <View
      style={[styles.container, {backgroundColor: alertStyle.backgroundColor}]}>
      <View style={styles.iconContainer}>
        <Icon
          type={IconType.Feather}
          name={getIconName()}
          size={20}
          color={alertStyle.iconColor}
        />
      </View>
      <View style={styles.messageContainer}>
        <Text style={[styles.messageText, {color: alertStyle.textColor}]}>
          {message}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    borderRadius: 8,
  },
  iconContainer: {
    marginRight: 12,
  },
  messageContainer: {
    flex: 1,
  },
  messageText: {
    fontFamily: FONTS.urbanistRegular,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default CustomMessageAlert;
