/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import { View, StyleSheet, Dimensions } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { moderateScale } from 'react-native-size-matters';
import React, { } from 'react';

export const SKELETON_SPEED = 1200;
export const SKELETON_BG = '#dddddd';
export const SKELETON_HIGHLIGHT = '#e7e7e7';
export const MAX_RATING_DEVIATION = 200;
const { width, height } = Dimensions.get('window');

const ProductDetailsSkelton = () => {

    return <View style={{ flex: 1, height: height }}>
        <SkeletonPlaceholder
            speed={SKELETON_SPEED}
            backgroundColor={SKELETON_BG}
            highlightColor={SKELETON_HIGHLIGHT}>

            <View style={{ width: width, height: height / 2, marginBottom: 6, }} />

            <View style={{ flexDirection: 'row', marginBottom: 26, }}>
                <View style={[styles.skeltonTabView, { marginLeft: 18, }]} />
                <View style={styles.skeltonTabView} />
                {/* <View style={styles.skeltonTabView} /> */}
            </View>

            <View style={[styles.LineView, { width: width / 1.7 }]} />
            <View style={[styles.LineView, { width: width / 2.5, marginBottom: height - (32 + height / 1.08) }]} />
            {/* marginBottom: height - (32 + height / 1.3),  */}

            {/* <View style={{ position: 'absolute', bottom: 0 }}> */}
            {/* <View style={{ flexDirection: 'row', marginTop: moderateScale(80), justifyContent: 'space-between' }}>
                <View style={[styles.priceView, { height: height * 0.015 }]} />
                <View style={[styles.priceView, { marginRight: moderateScale(16), height: height * 0.015 }]} />
            </View> */}

            <View style={{ flexDirection: 'row',  marginTop: moderateScale(80),height: height * 0.05, alignContent: 'space-between', justifyContent: 'space-between', marginBottom: 200 }}>
                <View style={[styles.priceView, { height: height * 0.025 ,marginTop: moderateScale(15)}]} />
                <View style={[styles.priceView, { height: height * 0.05 }]} />
                <View style={[styles.priceView, { marginRight: moderateScale(16), height: height * 0.05, }]} />
            </View>
            {/* </View> */}

        </SkeletonPlaceholder >
    </View>
};


const styles = StyleSheet.create({
    skeltonTabView: {
        width: width / 3.5,
        marginTop: moderateScale(8),
        borderWidth: 0,
        height: height * 0.04,
        elevation: moderateScale(5),
        shadowOpacity: 0.6,
        borderRadius: 12,
        marginRight: moderateScale(8),
    },
    priceView: {
        width: width / 3.7,
        marginTop: moderateScale(8),
        borderWidth: 0,
        elevation: moderateScale(5),
        shadowOpacity: 0.6,
        borderRadius: 12,
        marginLeft: 18,
    },
    LineView: {
        marginTop: moderateScale(8),
        borderWidth: 0,
        height: height * 0.022,
        elevation: moderateScale(5),
        shadowOpacity: 0.6,
        borderRadius: 12,
        marginRight: moderateScale(8), marginLeft: 18,
    },
    // skeltonMainView: {
    //     width: width / 1.4,
    //     margin: moderateScale(8),
    //     borderWidth: 0,
    //     height: height / 16,
    //     elevation: moderateScale(5),
    //     shadowOpacity: 0.6,
    //     shadowRadius: 5,
    //     shadowOffset: { height: 0, width: 0 },
    //     borderRadius: 5,
    //     // height: globals.screenHeight * 0.24,
    // },
    skeltonChangePasswordView: {
        width: '96%',
        margin: moderateScale(8),
        borderWidth: 0,
        borderRadius: moderateScale(5),
        height: height * 0.13,
        elevation: moderateScale(5),
        shadowOpacity: 0.6,
        shadowRadius: 5,
        shadowOffset: { height: 0, width: 0 },
    },
});

export default ProductDetailsSkelton;
