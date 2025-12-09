import React, {useContext, useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Input} from 'react-native-elements';
import {useSelector} from 'react-redux';
import commonStyle from '../../commonStyle';
import {translate} from '../locales';
import {AppContext} from '../Pages/AppContext';
import Colors from '../Utils/Colors';

export default function CustomInput(props) {
  const {appTheme} = useContext(AppContext);

  return (
    <>
      {props.labelText != undefined && (
        <Text
          style={[
            commonStyle.h6,
            commonStyle.label,
            {marginBottom: 5, color: appTheme.text},
          ]}>
          {translate(props.labelText)}
        </Text>
      )}
      <Input
        {...props}
        style={[
          styles.input,
          {color: appTheme.inputTextcolor},
          props.customOStyle,
        ]}
        containerStyle={[
          commonStyle.input,
          props.customStyle,
          {height: 48, backgroundColor: appTheme.InputBoxBGColor},
        ]}
        inputContainerStyle={{borderColor: Colors.transparent}}
        placeholder={
          props.placeholder != '' ? translate(props.placeholder) : ''
        }
        placeholderTextColor={appTheme.placeholderTextColor}
        textAlignVertical="center"
      />
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 48,
    borderRadius: 16,
    fontSize: 16,
    justifyContent: 'center',
    textAlignVertical: 'center',
  },
});
