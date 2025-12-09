/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {memo} from 'react';
import {View, StyleSheet} from 'react-native';
import { Image } from 'react-native-elements';
import resImage from '../../../../Utils/Image'
import resColor from '../../../../Utils/Colors'
import commonStyle from '../../../../../commonStyle';
const THUMB_RADIUS = 12;

const Thumb = () =>
{
    return <View style={{backgroundColor:resColor.transparent}}>
        <Image source={resImage.ic_Slider} style={[commonStyle.he_wi_88, { marginTop: 10 }]} />
    </View>;
};


export default memo(Thumb);
