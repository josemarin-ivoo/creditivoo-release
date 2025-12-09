/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
/* eslint-disable jsx-quotes */
import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  TouchableHighlight,
  StatusBar,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { getSalesProgressData } from '../Utils/pbutils';
import colorResource from '../Utils/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Helper from './../Utils/Helper';
import { useContext } from 'react';
import { AppContext } from './../Pages/AppContext';

const CustomHeader = (props) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  let theme = !props.gradientHeader
    ? ''
    : props.gradientHeaderOption.theme.split(',');

  //let theme = props.theme.split(",");
  theme = theme.length != 2 ? ['#FFE5DA', '#FFCDF1'] : theme;
  theme[0] = theme[0].trim();
  theme[1] = theme[1].trim();

  // const colorTheme = props.gradientHeaderOption.themeName;

  //const [remainingTime, setRemainingTime] = useState('0:0:0');
  //const [progressPercent, setProgressPercent] = useState(0);

  //@todo this is not right practice at all.. needs to improvise this logic to
  // define separate customer header for sales category only
  if (props.gradientHeaderOption.data) {
    const { sale_start_date, sale_end_date, current_date } =
      props.gradientHeaderOption.data;
    let current_time = new Date(current_date);

    const [currentDate, setCurrentDate] = useState(current_time);

    const setProgressInformation = (current_date) => {
      const { progressValue, remainingValue } = getSalesProgressData(
        sale_start_date,
        sale_end_date,
        current_date,
      );
      //  setProgressPercent(progressValue);
      //  setRemainingTime(remainingValue);
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
  }
  const { appTheme } = useContext(AppContext);

  return (
    <>
      {!props.gradientHeader ? (
        <View
          style={[
            styles.headerWrap,
            { position: 'absolute', top: Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight, width: '100%', zIndex: 9999, backgroundColor: colorResource.transparent },
          ]}>
          <StatusBar translucent={true} backgroundColor={colorResource.transparent} barStyle={appTheme.statusBar} />

          <TouchableHighlight
            style={[styles.ButtonViewStyles, { paddingTop: 5, paddingRight: 8, paddingBottom: 5, paddingLeft: 4 }]}
            onPress={() => {
              Helper.HandleVibration();
              navigation.goBack();
            }}
            underlayColor={colorResource.transparent}>

            <Icon
              name="arrow-left"
              type="font-awesome-5"
              color={appTheme.backiconColor}
            // onPress={() =>
            // {
            //   Helper.HandleVibration();
            //   navigation.goBack();
            // }}
            />

          </TouchableHighlight>
        </View>
      ) : props.scrolledValue === 0 ? (null
        // <LinearGradient colors={theme}>
        //   <StatusBar backgroundColor={theme[0]} />
        //   <View style={styles.headerWrap}>
        //     <View style={styles.ButtonViewStyles}>
        //       <TouchableHighlight
        //         style={{padding: 10}}
        //         onPress={() => {
        //           navigation.goBack();
        //         }}
        //         underlayColor="transparent">
        //         <Icon
        //           name="arrow-left"
        //           type="font-awesome-5"
        //           color={colorTheme}
        //           onPress={() => navigation.goBack()}
        //         />
        //       </TouchableHighlight>
        //     </View>
        //   </View>
        //   <View style={{flexDirection: 'row', paddingHorizontal: 20}}>
        //     <View style={{flex: 6}}>
        //       <Text
        //         style={[
        //           commonStyle.h2,
        //           commonStyle.fontBold,
        //           {color: colorTheme},
        //         ]}>
        //         {props.gradientHeaderOption.saleType}
        //       </Text>
        //     </View>
        //     <View style={{flex: 4, alignItems: 'flex-end'}}>
        //       <Text style={{color: colorTheme, marginTop: 15}}>
        //         {remainingTime}
        //       </Text>
        //     </View>
        //   </View>
        //   <View style={{paddingHorizontal: 20, paddingVertical: 20}}>
        //     <Progress.Bar
        //       progress={progressPercent}
        //       width={null}
        //       color={colorTheme}
        //       unfilledColor={colorResource.White80}
        //       borderColor={colorResource.White80}
        //     />
        //   </View>
        // </LinearGradient>
      ) : (null
        // <LinearGradient colors={theme}>
        //   <View style={[styles.headerWrap, {alignItems: 'center'}]}>
        //     <View style={styles.ButtonViewStyles}>
        //       <TouchableHighlight
        //         style={{padding: 10}}
        //         onPress={() => {
        //           navigation.goBack();
        //         }}
        //         underlayColor="transparent">
        //         <Icon
        //           name="arrow-left"
        //           type="font-awesome-5"
        //           color={colorTheme}
        //           onPress={() => navigation.goBack()}
        //         />
        //       </TouchableHighlight>
        //     </View>
        //     <View style={{flex: 1}}>
        //       <Text
        //         style={[
        //           commonStyle.h5,
        //           commonStyle.fontSemiBold,
        //           {color: colorTheme, textAlign: 'center', paddingLeft: 35},
        //         ]}>
        //         {props.gradientHeaderOption.saleType}
        //       </Text>
        //     </View>
        //     <View style={{alignItems: 'flex-end', paddingRight: 12}}>
        //       <Text style={[commonStyle.h5, {color: colorTheme}]}>
        //         {remainingTime}
        //       </Text>
        //     </View>
        //   </View>
        //   <View style={{paddingHorizontal: 20, paddingBottom: 10}}>
        //     <Progress.Bar
        //       progress={progressPercent}
        //       width={null}
        //       color={colorTheme}
        //       unfilledColor={colorResource.White80}
        //       borderColor={colorResource.White80}
        //     />
        //   </View>
        // </LinearGradient>
      )
      }
    </>
  );
};

export default CustomHeader;
const styles = StyleSheet.create({
  headerWrap: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  ButtonViewStyles: {
    flex: 0.1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoViewStyles: {
    flex: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
