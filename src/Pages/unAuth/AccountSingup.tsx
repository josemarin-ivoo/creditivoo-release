import { useNavigation, StackActions } from '@react-navigation/native'
import React, { useContext, useEffect, useState } from 'react'
import { Text, StyleSheet, View } from 'react-native'
import { colors, Image } from 'react-native-elements'

import commonStyle from '../../../commonStyle'
import { CustomButton } from '../../Components/CustomButton'
import { Layout } from '../../Components/Layout'
import { translate } from '../../locales'
import imgs from '../../Utils/Image'
import clr from '../../Utils/Colors'
import { Routes } from '../../Utils/NavigationRoutes'
import ProgressiveImage from '../../Components/ProgressiveImage'
import Helper from '../../Utils/Helper'
import { AppContext } from '../AppContext'

export const AccountSingup = () => {
    const navigation = useNavigation();
    const { appTheme } = useContext(AppContext);


    const goToCREATEACCOUNT = () => {
        Helper.HandleVibration();
        navigation.navigate(Routes.NAVIGATION_TO_CREATEACCOUNT)
    }

    return <Layout>
        <>
            <View style={[styles.MainConatiner, { backgroundColor: appTheme.background }]}>
                <View style={{ height: "45%", width: "100%", justifyContent: "flex-end", alignItems: "center", }}>
                    <ProgressiveImage
                        source={imgs.ic_user_singup}
                        style={[commonStyle.he_wi_240,]}
                        resizeMode="stretch" />
                </View>

                <View style={{ height: "55%", width: "100%", justifyContent: "flex-start", marginTop: 40 }}>
                    <Text style={[commonStyle.h2, commonStyle.fontBold, styles.NoAccount_Text, { color: appTheme.text }]}>{translate('pre_login.lbl_dont_have_account')}</Text>
                    <Text style={[commonStyle.h5, styles.CreateAccount_Text, { color: appTheme.text }]}>{translate('pre_login.lbl_create_account')}</Text>
                    <View style={styles.btnContainer}>

                        <CustomButton
                            title="pre_login.lbl_sign_up"
                            onPress={goToCREATEACCOUNT}
                            customButtonStyle={[
                                commonStyle.btn_primary
                            ]}
                        />
                    </View>
                </View>

            </View>

        </>
    </Layout>
}

const styles = StyleSheet.create({
    MainConatiner: { paddingLeft: 24, paddingRight: 24, flex: 1, justifyContent: "center", alignItems: "center", },
    btnContainer: { position: 'absolute', bottom: 60, width: '100%' },
    CreateAccount_Text: { textAlign: "center", marginBottom: 50 },
    NoAccount_Text: { textAlign: "center", marginBottom: 10 },

})

