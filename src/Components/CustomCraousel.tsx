import React, {useContext, useRef, useState} from 'react';
import {Dimensions, Text, View,Pressable} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Icon} from 'react-native-elements';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import commonStyle from '../../commonStyle';
import {ImageCard} from './ImageCard';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {translate} from '../locales';
import Helper from '../Utils/Helper';
import ResColor from '../Utils/Colors';
import TrackEvents from '../Utils/TrackingEvent';

import {AppContext} from '../Pages/AppContext';
import {AnalyticsEvent} from '../helpers/analyticHelper';
import {useSelector} from 'react-redux';

export const CustomCarousel = (props: any) => {
  const navigation = useNavigation();
  const {appTheme} = useContext<any>(AppContext);
  const global_data = useSelector((state: any) => state.commonReducer);

  const deviceWidth: any = Dimensions.get('window').width;

  const priceTagFlag = props.priceTag == undefined ? false : props.priceTag;

  var _carousel: any = useRef(null);

  const [activeSlide, setActiveSlide] = useState(0);
  const _renderItem = ({item}: any) => {
    const discountFlag =
      item.price_range.minimum_price.discount.percent_off > 0 ? true : false;
    return (
      <ImageCard
        id={item.id}
        sku={item.sku}
        discount={discountFlag}
        discountPrice={item.price_range.minimum_price.discount.percent_off}
        priceTag={priceTagFlag}
        imageTagName={item.name}
        price={item.price_range.minimum_price.final_price}
        thumbnail={item.image.url}
      />
    );
  };
  const goToCategoryDetail = () => {
    Helper.HandleVibration();
    AnalyticsEvent(TrackEvents.Category, {
      userEmail: global_data.email,
      category_id: props.id,
      saleType: props.heading,
    });

      console.log("Navigation 2---->" + props.id + props.heading)
    navigation.navigate('CategoryDetail', {id: props.id, name: props.heading});
  };

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginTop: props.sliderItem.length == 1 ? 30 : 10,
        }}>
        <View style={{flex: props.sliderItem.length > 4 ? 0.5 : 1}}>
          <Text
            style={[
              commonStyle.h3,
              commonStyle.fontBold,
              {color: appTheme.text},
            ]}>
            {props.heading}
          </Text>
        </View>
        {props.totalCount > 4 && (
          <View style={{flex: 0.5, justifyContent: 'flex-end'}}>
            <Pressable onPress={()=>{
                goToCategoryDetail()
                console.log("prod count 2---->" + props.totalCount)
            }

            }>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                }}>
                <Text
                  style={[
                    commonStyle.h4,
                    commonStyle.fontBold,
                    appTheme.type == 'green'
                      ? commonStyle.colorWhite
                      : commonStyle.colorCategory,
                    {marginRight: 10},
                  ]}>
                  {translate('home.lbl_seeall')}
                </Text>
                <Icon
                  name="play"
                  type="font-awesome-5"
                  color={ResColor.black}
                  iconStyle={[
                    appTheme.type == 'green'
                      ? commonStyle.colorWhite
                      : commonStyle.colorCategory,
                    {fontSize: 12},
                  ]}
                />
              </View>
            </Pressable>
          </View>
        )}
      </View>

      <Carousel
        containerCustomStyle={{left: -26}}
        ref={_carousel}
        keyExtractor={item => item.sku}
        data={props.sliderItem}
        renderItem={_renderItem}
        sliderWidth={deviceWidth}
        itemWidth={deviceWidth - deviceWidth * 0.11}
        itemHeight={((deviceWidth - 45) * 3) / 2}
        // itemWidth={388}
        // itemHeight={240}
        // inactiveSlideScale={1}
        onSnapToItem={index => {
          Helper.HandleVibration();
          setActiveSlide(index);
        }}
      />
      <Pagination
        carouselRef={_carousel}
        dotsLength={props.sliderItem.length}
        activeDotIndex={activeSlide}
        dotStyle={{
          width: 8,
          height: 8,
          borderRadius: 4,
          position: 'relative',
          top: -9,
          backgroundColor: appTheme.placeholderTextColor,
        }}
        inactiveDotStyle={{backgroundColor: ResColor.inactiveDots}}
        inactiveDotScale={1}
        tappableDots={true}
        containerStyle={{marginBottom: -35}}
        dotContainerStyle={{marginRight: 0}}
      />
    </>
  );
};
