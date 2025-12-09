/* eslint-disable prettier/prettier */

import {Icon} from 'react-native-elements';
import React, {useState} from 'react';
import ResColor from '../Utils/Colors';
import {TouchableHighlight} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-simple-toast';
import Helper from './../Utils/Helper';

export const CopyControl = props => {
  const [data, setData] = useState(props.desc);
  const copyToClipboard = () => {
    console.log(props.desc);
    Helper.HandleVibration();
    Clipboard.setString(props.desc);
    Toast.showWithGravity('!Copiado!', Toast.SHORT, Toast.CENTER);
  };
  return (
    <TouchableHighlight
      style={{alignItems: 'flex-start', marginTop: 10}}
      underlayColor={ResColor.transparent}
      onPress={copyToClipboard}>
      <Icon
        name="copy"
        type="font-awesome-5"
        size={24}
        color={ResColor.Green}
      />
    </TouchableHighlight>
  );
};
