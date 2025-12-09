/* eslint-disable prettier/prettier */
import React, {memo} from 'react';
import {StyleSheet, View} from 'react-native';
import resColor from '../../../../Utils/Colors'
const RailSelected = () => {
  return <View style={styles.root} />;
};

export default memo(RailSelected);

const styles = StyleSheet.create( {
  root: {
    height: 4,
    backgroundColor: resColor.Gray,
    borderRadius: 2,
  },
});
