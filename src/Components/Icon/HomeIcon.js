/* eslint-disable prettier/prettier */
import {Image, View} from 'react-native';
import {Badge} from 'react-native-elements';
import React from 'react';
import imageResource from '../../Utils/Image';
import {useSelector, shallowEqual} from 'react-redux';

export const HomeIcon = props => {
  const global_data = useSelector((state: any) => state.commonReducer);

  const ispush = useSelector(
    ({PushCounterReducer: {PUSH_COUNTER_CHECK: ispush}}) =>
      ispush.filter(item => item.token === global_data.email).length > 0
        ? ispush.filter(item => item.token === global_data.email)[0].val
        : false,
    shallowEqual,
  );

  return (
    <View>
      {props.focused === true ? (
        <Image
          source={
            props.theme.type == 'green'
              ? imageResource.ic_home_green
              : imageResource.ic_home_green
          }
          resizeMode="stretch"
        />
      ) : (
        <Image
          source={
            props.theme.type == 'light'
              ? imageResource.ic_home_gray
              : props.theme.type == 'dark'
              ? imageResource.ic_home_dark
              : imageResource.ic_home_green
          }
          resizeMode="stretch"
        />
      )}
      {ispush && (
        <Badge
          status="error"
          containerStyle={[
            props.focused === true
              ? {position: 'absolute', right: 0, top: 0}
              : {position: 'absolute', right: 0},
          ]}
        />
      )}
    </View>
  );
};
