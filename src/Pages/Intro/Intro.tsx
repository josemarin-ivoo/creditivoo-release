import React from 'react';
import {
  ImageBackground,
  Text,
  StyleSheet,
  View,
  SafeAreaView,
} from 'react-native';

import ColorResource from '../../Utils/Colors';

import commonStyle from '../../../commonStyle';
import {useNavigation} from '@react-navigation/native';
import {Routes} from '../../Utils/NavigationRoutes';
import {useDispatch} from 'react-redux';
import {ApplaunchAction} from '../../redux/ApplaunchAction';
import {StackActions} from '@react-navigation/native';
import imageResource from '../../Utils/Image';
import {translate} from './../../locales/translate';
import {tokenFound} from '../../Services/service';
import {setItemInStorage} from '../../Utils/Storage';
import AppIntroSlider from './slider';

const data = [
  {
    key: 's1',
    image: imageResource.ic_S1,
  },
  {
    key: 's2',
    image: imageResource.ic_S2,
  },
  {
    key: 's3',
    image: imageResource.ic_S3,
  },
  {
    key: 's4',
    image: imageResource.ic_S4,
  },
  {
    key: 's5',
    image: imageResource.ic_S5,
  },
  {
    key: 's6',
    image: imageResource.ic_S6,
  },
];

export const Intro = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  type Item = typeof data[0];

  const _renderItem = ({item}: {item: Item}) => {
    return (
      <ImageBackground
        style={styles.ImageBackgroundslide}
        source={item.image}></ImageBackground>
    );
  };
  const _renderDoneButton = () => {
    return (
      <Text style={[commonStyle.h4, styles.doneText]}>
        {translate('Intro.lbl_done')}{' '}
      </Text>
    );
  };
  const _renderNextButton = () => {
    return (
      <Text style={[commonStyle.h4, styles.nextText]}>
        {translate('Intro.lbl_next')}
      </Text>
    );
  };

  const _renderprevButton = () => {
    return <Text style={[commonStyle.h4, styles.nextText]}>Anterior</Text>;
  };

  const _renderSkipButton = () => {
    return (
      <Text style={[commonStyle.h4, styles.skipText]}>
        {translate('Intro.lbl_skip')}
      </Text>
    );
  };
  const _onDone = () => {
    dispatch(ApplaunchAction(false)); // For setup Flag for Intro screen recuring

    tokenFound(afterTokenFound);
  };

  const afterTokenFound = flag => {
    console.log('TokenFound on Intro Page ' + flag);
    const now = new Date();

    setItemInStorage('LastseenTime', now.toISOString());

    // var nextRoute = flag ? Routes.APPSCREENS : Routes.AUTHSCREENS;

    navigation.dispatch(StackActions.replace(Routes.APPSCREENS));
  };
  const _keyExtractor = (item: Item) => item.key;

  return (
    <View style={[commonStyle.flex_1]}>
      <AppIntroSlider
        keyExtractor={_keyExtractor}
        renderItem={_renderItem}
        data={data}
        dotClickEnabled={true}
        dotStyle={styles.SliderPagination}
        activeDotStyle={{backgroundColor: ColorResource.inactiveDots}}
        showSkipButton
        showPrevButton
        renderSkipButton={_renderSkipButton}
        renderDoneButton={_renderDoneButton}
        renderNextButton={_renderNextButton}
        renderPrevButton={_renderprevButton}
        onDone={_onDone}
        onSkip={_onDone}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  SliderPagination: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ColorResource.Gray,
  },
  doneText: {marginTop: 10, color: ColorResource.Gray},
  skipText: {marginTop: 10, color: ColorResource.Gray},
  nextText: {marginTop: 9, color: ColorResource.Gray},
  // buttonCircle: {
  //     width: 40,
  //     height: 40,
  //     backgroundColor: 'rgba(2, 62, 63, 1)',
  //     borderRadius: 20,
  //     justifyContent: 'center',
  //     alignItems: 'center',
  // },
  ImageBackgroundslide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
