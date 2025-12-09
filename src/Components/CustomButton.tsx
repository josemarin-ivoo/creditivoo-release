import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Button, Icon } from 'react-native-elements'
import commonStyle from '../../commonStyle'
import { translate } from '../locales';
import Colors from '../Utils/Colors';

export const CustomButton = ( props ) =>
{
    const isGreen = props.customButtonStyle[0].backgroundColor == Colors.Green ? true : false
    return isGreen ? <TouchableOpacity style={[commonStyle.btnshwdow, { width: "100%", height: 50, borderRadius: 16 }]}>
        <Button
            {...props}
            containerStyle={[commonStyle.btn_full, { position: "relative" }]}
            buttonStyle={[commonStyle.btn_primary, commonStyle.btn_full, commonStyle.btnStyle, props.customButtonStyle, {}]}
            titleStyle={[commonStyle.btn, props.customTitleStyle]}
            icon={
                props.icon != undefined ? { type: 'font-awesome-5', ...props.icon } : null
            }
            title={props.title != undefined ? translate( props.title ) : undefined}
        />
    </TouchableOpacity> : <Button
        {...props}
        containerStyle={[commonStyle.btn_full, { position: "relative" }]}
        buttonStyle={[commonStyle.btn_primary, commonStyle.btn_full, commonStyle.btnStyle, props.customButtonStyle, {}]}
        titleStyle={[commonStyle.btn, props.customTitleStyle]}
        icon={
            props.icon != undefined ? { type: 'font-awesome-5', ...props.icon } : null
        }
        title={props.title != undefined ? translate( props.title ) : undefined}
    />

}
