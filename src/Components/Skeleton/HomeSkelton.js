/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import { View, Dimensions } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
export const SKELETON_SPEED = 1500;
export const SKELETON_BG = '#dddddd';
export const SKELETON_HIGHLIGHT = '#e7e7e7';
export const MAX_RATING_DEVIATION = 200;

const { width, height } = Dimensions.get('window');
import React, { } from 'react';

const HomeSkeleton = () => {


    return <SkeletonPlaceholder
        speed={SKELETON_SPEED}
        backgroundColor={SKELETON_BG}
        highlightColor={SKELETON_HIGHLIGHT}>
        <View style={{ width: width - 36, height: 180, marginBottom: 6, marginHorizontal: 18, borderRadius: 16, marginVertical: 16 }} />
        <View style={{ width: width - 36, height: 180, marginBottom: 6, marginHorizontal: 18, borderRadius: 16, marginVertical: 16 }} />
        <View style={{ width: width - 36, height: 180, marginBottom: 6, marginHorizontal: 18, borderRadius: 16, marginVertical: 16 }} />
        <View style={{ width: width - 36, height: 180, marginBottom: 6, marginHorizontal: 18, borderRadius: 16, marginVertical: 16 }} />
        <View style={{ width: width - 36, height: 180, marginBottom: 6, marginHorizontal: 18, borderRadius: 16, marginVertical: 16 }} />
        <View style={{ width: width - 36, height: 180, marginBottom: 6, marginHorizontal: 18, borderRadius: 16, marginVertical: 16 }} />
        <View style={{ width: width - 36, height: 180, marginBottom: 6, marginHorizontal: 18, borderRadius: 16, marginVertical: 16 }} />
        <View style={{ width: width - 36, height: 180, marginBottom: 6, marginHorizontal: 18, borderRadius: 16, marginVertical: 16 }} />
    </SkeletonPlaceholder >;

};
export default HomeSkeleton;
