import React from 'react';
import Animated, { interpolate, Extrapolate } from 'react-native-reanimated';
import { transformOrigin, } from 'react-native-redash';
import type { StickyItemContentProps } from '@gorhom/sticky-item';
import { styles } from './styles';
import { View, Platform } from 'react-native';
import { translate } from '../../../locales/translate';
import { Icon } from 'react-native-elements';
import commonStyle from '../../../../commonStyle';
import ProgressiveImage from '../../../Components/ProgressiveImage';
import ResImage from '../../../Utils/Image';


const BasicSticky = ( {
  x,
  threshold,
  itemWidth,
  itemHeight,
  stickyItemWidth,
  stickyItemHeight,
  separatorSize,
  isRTL,
}: StickyItemContentProps ) =>
{
  //#region plus
  const animatedPlusScale = interpolate( x, {
    inputRange: [0, threshold],
    outputRange: [0, 1],
    extrapolate: Extrapolate.CLAMP,
  } );
  const plusStyle = [
    styles.plus,
    {
      width: stickyItemWidth,
      height: stickyItemHeight,
      [isRTL ? 'right' : 'left']: '50%',
      transform: transformOrigin(
        { x: 0, y: 0 },
        {
          translateX: interpolate( x, {
            inputRange: [separatorSize, threshold],
            outputRange: [
              ( stickyItemWidth / 2 ) * ( isRTL ? 1 : -1 ),
              ( itemWidth / 2 - stickyItemWidth ) * ( isRTL ? -1 : 1 ),
            ],
            extrapolate: Extrapolate.CLAMP,
          } ),
          translateY: itemHeight / 2 - stickyItemHeight / 2,
          scale: animatedPlusScale,
        }
      ) as Animated.AnimatedTransform,
    },
  ];
  //#endregion

  //#region text
  const animatedTextOpacity = interpolate( x, {
    inputRange: [0, threshold * 0.6],
    outputRange: [1, 0],
    extrapolate: Extrapolate.CLAMP,
  } );
  const textStyle = [

    styles.image, { marginBottom: 5, position: "relative", top: ( Platform.OS === 'ios' ) ? null : 0, },
    {
      opacity: animatedTextOpacity,
      paddingHorizontal: separatorSize,
      transform: [
        {
          translateY: 0,
        },
      ] as Animated.AnimatedTransform,
    },
  ];
  //#endregion

  return (
    <>
      <Animated.View style={plusStyle}>
      
        <ProgressiveImage source={ResImage.ic_Filters} />
      </Animated.View>
      <Animated.Image style={[styles.image, {
        marginBottom: 5, position: "relative",zIndex:100000, top: ( Platform.OS === 'ios' ) ? null : 0,
        opacity: animatedTextOpacity,
        paddingHorizontal: separatorSize,
        transform: [
          {
            translateY: 0,
          },
        ] as Animated.AnimatedTransform,
        width: 110, height: 45
      }]}
        
        source={ResImage.ic_filtrar}
      >
        {/* <View style={{ flex: 1, alignContent: "center", alignItems:"center", justifyContent:"center",  }}>
      <ProgressiveImage
              source={ResImage.ic_Filters_Active}
              style={{ width:70, height:25,marginTop:7  }}
            /> 
        </View> */}
      </Animated.Image>

    </>
  )
};

export default BasicSticky;
