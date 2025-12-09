import {useLazyQuery} from '@apollo/client';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableHighlight, View} from 'react-native';
import {Icon, Image} from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import * as Progress from 'react-native-progress';
import commonStyle from '../../commonStyle';
import {productInfo} from '../Queries/queries';
import CustomPBar from './CustomPBar';
import ProgressiveImage from './ProgressiveImage';
import {getSalesProgressData} from '../Utils/pbutils';
import colorResource from '../Utils/Colors';
import {Routes} from '../Utils/NavigationRoutes';
import Helper from '../Utils/Helper';
import {AnalyticsEvent} from './../helpers/analyticHelper';
import TrackEvents from '../Utils/TrackingEvent';
import {useSelector} from 'react-redux';

const Sales = props => {
  const navigation = useNavigation();
  let theme = props.theme.split(',');
  theme = theme.length != 2 ? ['#FFE5DA', '#FFCDF1'] : theme;
  theme[0] = theme[0].trim();
  theme[1] = theme[1].trim();
  // const theme = ['#FFE5DA', '#FFCDF1'];
  const colorTheme = props.themeName;

  const {sale_start_date, sale_end_date, current_date} = props.data;
  let current_time = new Date(current_date);

  const [currentDate, setCurrentDate] = useState(current_time);
  const [remainingTime, setRemainingTime] = useState('00:00:00');
  const [progressPercent, setProgressPercent] = useState(0);

  const setProgressInformation = current_date => {
    const {progressValue, remainingValue} = getSalesProgressData(
      sale_start_date,
      sale_end_date,
      current_date,
    );
    setProgressPercent(progressValue);
    setRemainingTime(remainingValue);
  };
  const timer = () => {
    let new_current_date = currentDate;
    new_current_date.setSeconds(new_current_date.getSeconds() + 1); //set new ticker date and time according to time interval e.g. 5 sec
    setCurrentDate(new_current_date);
    setProgressInformation(new_current_date);
  };

  useEffect(() => {
    setProgressInformation(currentDate);
    const id = setInterval(timer, 1000);
    return () => clearInterval(id);
  });

  const global_data = useSelector((state: any) => state.commonReducer);

  const goToProductList = () => {
    Helper.HandleVibration();
    props.data.current_date = currentDate.toISOString();
    // console.log( "props.id", props.id );
    // console.log( "props.saleType", props.saleType );
    AnalyticsEvent(TrackEvents.SalesCategory, {
      userEmail: global_data.email,
      category_id: props.id,
      saleType: props.saleType,
    });
    navigation.navigate(Routes.NAVIGATION_TO_PRODUCTLIST, {
      headerOption: props,
      id: props.id,
    });
  };
  return (
    <>
      <LinearGradient
        start={{x: 0, y: 0.0}}
        end={{x: 1, y: 1}}
        colors={theme}
        style={{borderRadius: 16}}>
        <TouchableHighlight
          underlayColor="transparent"
          onPress={goToProductList}>
          <View style={styles.container_sale}>
            <View style={{flex: 0.15}}>
              <ProgressiveImage
                source={{uri: props.imgName}}
                style={{width: 32, height: 32}}
                resizeMode="contain"
              />
            </View>
            <View style={{flex: 0.8}}>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <View>
                  <Text
                    style={[
                      commonStyle.h4,
                      commonStyle.fontSemiBold,
                      {color: colorTheme},
                    ]}>
                    {props.saleType}
                  </Text>
                </View>
                <View>
                  <Icon
                    name="chevron-right"
                    type="font-awesome-5"
                    color={colorTheme}
                    iconStyle={{fontSize: 16}}
                  />
                </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <View style={{flex: 4}}>
                  <Text
                    style={[
                      commonStyle.h6,
                      commonStyle.fontSemiBold,
                      {color: colorTheme},
                    ]}>
                    {remainingTime}
                  </Text>
                </View>
                {progressPercent != 0 && (
                  <View style={{flex: 6}}>
                    <Progress.Bar
                      progress={progressPercent}
                      color={colorTheme}
                      unfilledColor={colorResource.White80}
                      borderColor={colorResource.White80}
                    />
                  </View>
                )}
              </View>
            </View>
          </View>
        </TouchableHighlight>
      </LinearGradient>
    </>
  );
};

export default Sales;

const styles = StyleSheet.create({
  linearGradient: {
    borderRadius: 16,
  },
  bannerImg: {
    padding: 10,
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    bottom: 0,
    width: '100%',
    color: colorResource.white,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  bannerImg_dis: {
    padding: 10,
    position: 'absolute',
    backgroundColor: colorResource.pink_product_price,
    top: 10,
    left: 10,
    color: colorResource.white,
    borderRadius: 16,
  },
  container_sale: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 18,
    paddingLeft: 24,
    paddingRight: 10,
    alignItems: 'center',
  },
});
