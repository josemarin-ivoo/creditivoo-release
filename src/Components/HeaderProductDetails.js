/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-lone-blocks */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import React, {useEffect, useState} from 'react';
import {View, StyleSheet, TouchableHighlight, Share} from 'react-native';
import {Icon} from 'react-native-elements';

import {useNavigation} from '@react-navigation/native';

import ProgressiveImage from './ProgressiveImage';

import {StatusBar} from 'react-native';
import WishlistButton from '../Pages/Auth/Wishlist/WishlistButton';
import Helper from '../Utils/Helper';
import {useContext} from 'react';
import {AppContext} from '../Pages/AppContext';
//import {firebase} from '@react-native-firebase/dynamic-links';

const HeaderProductDetails = props => {
  const navigation = useNavigation();

  const [selectedSKU, setselectedSKU] = useState(props.sku);
  const isShareProductVisible = false
  const generateLink = async (id, cartId) => {
    console.log(`Generating Progress...id=${id}&cartId=${cartId}`);
    Alert.alert(''+id);
    Alert.alert(''+cartId);
    // const link = await firebase.dynamicLinks().buildShortLink({
    //   domainUriPrefix: 'https://ivoo.page.link',
    //   link: `https://ivoo.page.link/ProductDetails?id=${id}&cartId=${cartId}`,
    //   ios: {
    //     bundleId: 'com.siragon',
    //     appStoreId: '1479559802',
    //   },
    //   android: {
    //     packageName: 'com.ivoo.android',
    //   },
    // });
    //  const urlParams = new URLSearchParams( link );
    // const myParam = urlParams.get( 'id' );
    return 'https://ivoo.page.link' + `/ProductDetails?id=${id}&cartId=${cartId}`; // link;
  };


  useEffect(() =>{

    const generateLink = async (id, cartId) => {
    console.log(`Generating Progress...id=${id}&cartId=${cartId}`);
    Alert.alert(''+id);
    Alert.alert(''+cartId);
    // const link = await firebase.dynamicLinks().buildShortLink({
    //   domainUriPrefix: 'https://ivoo.page.link',
    //   link: `https://ivoo.page.link/ProductDetails?id=${id}&cartId=${cartId}`,
    //   ios: {
    //     bundleId: 'com.siragon',
    //     appStoreId: '1479559802',
    //   },
    //   android: {
    //     packageName: 'com.ivoo.android',
    //   },
    // });
    //  const urlParams = new URLSearchParams( link );
    // const myParam = urlParams.get( 'id' );
    return 'https://ivoo.page.link' + `/ProductDetails?id=${id}&cartId=${cartId}`; // link;
  };

  generateLink();
    
  });
  
  const [isShared, setIsShared] = useState(false);
  const onShare = async () => {
    if (isShared) {
      return;
    }
    try {
      Helper.HandleVibration();
      setIsShared(true);
      var link = await generateLink(props.url_key, '');
      console.log(props.url_key, ' ----onShare link --- ', link);

      const result = await Share.share({
        message: link, //`ivoo://ProductDetails/${ props.url_key }`,
      });
      console.log(result.action);
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
          setIsShared(false);
        } else {
          // shared
          setIsShared(false);
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
        setIsShared(false);
      }
    } catch (error) {
      setIsShared(false);
    }
  };
  const {appTheme} = useContext(AppContext);

  return (
    <View style={[styles.headerWrap]}>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" />
      <TouchableHighlight
        style={[
          styles.ButtonViewStyles,
          {paddingTop: 5, paddingRight: 8, paddingBottom: 5, paddingLeft: 0},
        ]}
        underlayColor="transparent"
        onPress={() => {
          Helper.HandleVibration();
          navigation.goBack();
        }}>
        <Icon
          name="arrow-left"
          type="font-awesome-5"
          color={appTheme.prodetailbackiconColor}
          onPress={() => {
            Helper.HandleVibration();
            navigation.goBack();
          }}
        />
      </TouchableHighlight>
      <View style={styles.shareViewStyles}>
          {isShareProductVisible && (<TouchableHighlight onPress={onShare} underlayColor="transparent">
          <ProgressiveImage
            source={appTheme.ic_share_new}
            style={{width: 24, height: 24, marginRight: 20}}
            resizeMode="stretch"
          />
        </TouchableHighlight>)}
        <WishlistButton
          SKU={selectedSKU}
          isLoading={load => {
            props.isLoading(load);
          }}
          pagetype={'product'}
          setLoginOverlay={login => {
            props.setLoginOverlay(login);
          }}
        />
      </View>
    </View>
  );
};

export default HeaderProductDetails;

const styles = StyleSheet.create({
  headerWrap: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    // position:"absolute",
    width: '100%',
  },
  ButtonViewStyles: {
    flex: 0.1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareViewStyles: {
    display: 'flex',
    flex: 0.1,
    justifyContent: 'flex-end',
    marginLeft: 'auto',
    flexDirection: 'row',
  },
  WishlistViewStyles: {
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
