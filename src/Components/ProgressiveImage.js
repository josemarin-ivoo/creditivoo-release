import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

const ProgressiveImage = (props:any) => {
    return (
      <View style={styles.container}>
        <Image {...props} />
      </View>
    );

};

export default ProgressiveImage;
const styles = StyleSheet.create({
    imageOverlay: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      top: 0,
    },
    container: {
      backgroundColor: '#ffffff00',
    },
  });