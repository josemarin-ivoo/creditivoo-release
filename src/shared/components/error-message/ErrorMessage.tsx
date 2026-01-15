import TextWrapper from '@shared-components/text-wrapper/TextWrapper';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { COLORS } from 'app/styles/global.style';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {

  return (
    <View style={styles.errorContainer}>
      <TextWrapper fontSize={12} color={COLORS.error}>
        {message}
      </TextWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    position: 'relative',
    left: 4,
    bottom: 10,
  },
});

export default ErrorMessage;
