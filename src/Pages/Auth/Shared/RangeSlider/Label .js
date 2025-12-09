/* eslint-disable prettier/prettier */
import React, {memo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import ResColor from '../../../../Utils/Colors'

const Label = ({text, ...restProps}) => {
  return (
    <View style={styles.root} {...restProps}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create( {
  root: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: ResColor.Green,
    borderRadius: 4,
  },
  text: {
    fontSize: 16,
    color: ResColor.white,
  },
});

export default memo(Label);
