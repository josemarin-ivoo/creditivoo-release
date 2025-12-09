import React, { useContext, useState } from 'react';
import { useEffect } from 'react';
import { View, StyleSheet, Modal, Image, SafeAreaView, StatusBar, Dimensions, Animated, Platform, TouchableOpacity } from 'react-native';
import { Text, Overlay } from 'react-native-elements';
import { handlers } from 'react-native-localize/dist/typescript/module';
import { useSelector } from 'react-redux';
import commonStyle from '../../../../commonStyle';
import { translate } from '../../../locales';
import { cartDelete } from '../../../Queries/queries';
import { CartItemCounterAction } from '../../../redux/cartItemCounterAction';
import ResColors from '../../../Utils/Colors'
import imageResource from '../../../Utils/Image'
import { AppContext } from '../../AppContext';
import Helper from './../../../Utils/Helper';
import { setItemInStorage, setObjectInStore } from './../../../Utils/Storage';
import { useDispatch } from 'react-redux';

const ProductAddedOverlay = (props) => {
  const animation = new Animated.Value(100);
  const dispatch = useDispatch()
  const [cartDeleteFunc, { loading, error, data }] = cartDelete();
  const cartId = useSelector((state: any) => state.cartReducer);

  useEffect(() => {
    //cartDelete
    if (data) {

      var tmp = JSON.stringify(data).replace('{"cart":', '{"customerCart":')
      var parsedObj = JSON.parse(tmp);

      if (parsedObj.removeItemFromCart.customerCart.items.length <= 0) {
        dispatch(CartItemCounterAction(false));
      } else {
        dispatch(CartItemCounterAction(true));
      }

      UpdateCachedData('0', parsedObj.removeItemFromCart)
    }
  }, [data]);

  async function UpdateCachedData(isUpdated, obj) {
    //isUpdated     // 1 -> True     //0 -> False

    await setItemInStorage('CartCacheStatus_isUpdated', isUpdated);
    await setItemInStorage('CartCacheStatus_expTime', Helper.addHourstoSystemDate(5).toString());

    await setObjectInStore('CartCacheStatus_customerCart', obj);
  }

  useEffect(() => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true // Add This line
    }).start(() => {
      // animation = 0;
      //If you remove above line then it will stop the animation at toValue point
    });
  }, []);


  setTimeout(() => {
    Animated.timing(animation, {
      toValue: 100,
      duration: 1000,
      useNativeDriver: true // Add This line

    }).start(
    );

  }, 2500);

  setTimeout(() => {
    props.addCartNotifaction(false)
  }, 3000);
  
  const transformStyle = {

    transform: [{
      translateY: animation,
    }]
  }

  return (
    <Animated.View style={[transformStyle, { height: 70, backgroundColor: '#00A344' }]} >
      <View style={[styles.modalView, { backgroundColor: '#00A344' }]} >

        <View style={[{ flex: 0.8, flexDirection: "row", justifyContent: 'flex-start', alignItems: 'center' }]}>
          <Image style={{ width: 24, height: 24, marginTop: 2, marginLeft: 24, marginRight: 4, justifyContent: "center" }} source={imageResource.Check}></Image>
          <Text style={[commonStyle.h4, commonStyle.fontBold, styles.modalText]} >
            {/* {translate( 'products.lbl_added_product_success' )} */}
            Agregado al carrito
          </Text>
        </View>
        <View style={[{ flex: 0.35, alignSelf: 'flex-end', flexDirection: 'row', alignContent: 'space-between' }]}>
          <TouchableOpacity onPress={() => {
            Helper.HandleVibration();
            cartDeleteFunc({
              variables: {
                cart_id: cartId.cart_id,
                cart_item_id: props.CanUndoitemID
              }
            });
          }}>
            <Text style={[commonStyle.h4, commonStyle.fontBold, styles.modalText, { marginRight: 0 }]} >Deshacer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View >
    // <Animated.View style={[transformStyle]} >
    //   <View style={[styles.modalView, { backgroundColor: appTheme.background }]} >
    //     <Image style={{ width: 48, height: 51, marginTop: 2, marginLeft: 4, marginRight: 4, justifyContent: "center" }} source={imageResource.img_Notification}></Image>
    //     <Text adjustsFontSizeToFit style={[styles.h4, commonStyle.fontBold, styles.modalText]} >{translate( 'products.lbl_added_product_success' )}</Text>
    //   </View>
    // </Animated.View>
  );
};

const styles = StyleSheet.create({
  modalView: {
    width: Dimensions.get("window").width,
    flexDirection: 'row',

    marginTop: 10,

    paddingRight: 10,
    alignItems: "center",
    shadowColor: ResColors.Green,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    flexShrink: 1,
  },
  modalText: {
    flexShrink: 1,
    marginBottom: 10,
    marginTop: 10,
    color: ResColors.white,
    marginRight: 8
  },
  h4: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },
});

export default ProductAddedOverlay