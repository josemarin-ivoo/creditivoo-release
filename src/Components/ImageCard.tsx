import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import commonStyle from '../../commonStyle';
import ProgressiveImage from '../Components/ProgressiveImage';
import ResColor from '../Utils/Colors';
import Helper from '../Utils/Helper';

export const ImageCard = (props: any) => {
  const navigation = useNavigation();
  const discountFlag = props.discount == undefined ? false : props.discount;
  const priceTagFlag = props.priceTag == undefined ? false : props.priceTag;
  const onPressFlag =
    props.onPressFlag == undefined ? false : props.onPressFlag;

  return (
    <View style={{zIndex: 1}}>
      <View
        style={{
          marginTop: 20,
          position: 'relative',
          borderRadius: 16,
          overflow: 'hidden',
        }}>
        <TouchableWithoutFeedback
          onPress={() => {
            Helper.HandleVibration(),
              !onPressFlag &&
                navigation.navigate('ProductDetails', {
                  heading: props.imageTagName,
                  id: props.sku,
                });
          }}>
          <View>
            <View>
              <ProgressiveImage
                source={{uri: props.thumbnail + Helper.cardImageSize}}
                style={{
                  width: '100%',
                  height: undefined,
                  aspectRatio: 3 / 2,
                  maxHeight: 260,
                }}
                resizeMode="cover"
              />
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  width: '100%',
                  flex: 1,
                  height: 68,
                  overflow: 'hidden',
                  marginBottom: -1,
                  borderWidth: 0,
                }}>
                <ProgressiveImage
                  source={{uri: props.thumbnail + Helper.cardImageSize}}
                  style={{
                    width: '100%',
                    height: undefined,
                    aspectRatio: 3 / 2,
                    maxHeight: 260,
                    marginTop: -(
                      (Dimensions.get('window').width - 48) * 0.67 -
                      68
                    ),
                    marginLeft: 0,
                  }}
                  resizeMode="cover"
                  blurRadius={18}
                />
              </View>
            </View>

            {discountFlag && (
              <View
                style={[
                  styles.bannerImg_dis,
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  },
                ]}>
                <Text
                  style={[
                    commonStyle.h3,
                    commonStyle.fontBold,
                    {color: ResColor.white, alignSelf: 'flex-start'},
                  ]}>
                  {props.discountPrice + '%'}
                </Text>
              </View>
            )}
            {props.imageTagName && (
              <View
                style={[
                  styles.bannerImg,
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    overflow: 'hidden',
                  },
                ]}>
                <View style={{flex: 1}}>
                  <Text
                    style={[
                      commonStyle.h3,
                      commonStyle.fontBold,
                      {color: ResColor.white, alignSelf: 'flex-start'},
                    ]}
                    numberOfLines={1}>
                    {props.imageTagName}
                  </Text>
                </View>
                {priceTagFlag && (
                  <View style={{flex: 0.5}}>
                    <Text
                      style={[
                        commonStyle.h5,
                        commonStyle.fontBold,
                        {
                          alignSelf: 'flex-end',
                          backgroundColor: ResColor.white,
                          marginRight: 10,
                          color: ResColor.black,
                          paddingVertical: 5,
                          paddingHorizontal: 10,
                          borderRadius: 10,
                          overflow: 'hidden',
                          textAlign: 'center',
                        },
                      ]}
                      numberOfLines={1}>
                      {Helper.currencyFormat(props.price.value)}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width,
  },
  linearGradient: {
    borderRadius: 16,
  },
  bannerImg: {
    padding: 16,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    color: ResColor.white,
  },
  bannerImg_dis: {
    padding: 10,
    position: 'absolute',
    backgroundColor: ResColor.pink_product_price,
    top: 10,
    left: 10,
    color: ResColor.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
});
