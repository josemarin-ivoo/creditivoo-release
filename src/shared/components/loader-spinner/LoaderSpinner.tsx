// Loader.tsx
import React from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  ActivityIndicatorProps,
} from 'react-native';

import {COLORS} from 'app/styles/global.style';

interface LoaderProps extends ActivityIndicatorProps {}

const LoaderSpinner: React.FC<LoaderProps> = ({size = 40}) => {
  return (
    <View style={styles.overlay}>
      <ActivityIndicator size={size} color={COLORS.primaryGreen} />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    //marginTop: 35 * vh,
    //alignItems: "center",
  },
});

export default LoaderSpinner;
