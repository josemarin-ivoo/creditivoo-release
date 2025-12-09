import React, {useContext, useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  Dimensions,
  SafeAreaView,
  TouchableHighlight,
  StatusBar,
  Platform,
} from 'react-native';

import MapView, {
  Marker,
  Overlay,
  PROVIDER_GOOGLE,
  AnimatedRegion,
} from 'react-native-maps';
import ResImage from '../../../Utils/Image';
//import all the components we are going to use.
import {useNavigation} from '@react-navigation/native';
const {width, height} = Dimensions.get('window');
import {Icon} from 'react-native-elements';
import colorResource from '../../../Utils/Colors';
import commonStyle from '../../../../commonStyle';
import {CustomButton} from '../../../Components/CustomButton';
import CustomPBar from '../../../Components/CustomPBar';
import {
  AddAddress,
  setAddress,
  updateCustomerAddress,
} from './../../../Queries/queries';
import {translate} from '../../../locales';
import {useSelector, useDispatch} from 'react-redux';
import Helper from '../../../Utils/Helper';
import {AppContext} from '../../AppContext';
import {
  ISAddressCacheUpdated,
  ADDRESSAdd,
} from '../../../redux/DeliveryAddressReducers/DeliveryAddressAction';

const AddressMapSelection = props => {
  let LATITUDE_DELTA = 0.003;
  let LONGITUDE_DELTA = 0.003;
  const [marker, setMarker] = useState([]);
  const [loading, setloading] = useState(false);
  const [Address, setAddress] = useState('');
  const dispatch = useDispatch();
  const [newAdd, {loading: aloading, error: aError, data: aData}] =
    AddAddress();
  const [updateAdd, {loading: eLoading, error: eError, data: eData}] =
    updateCustomerAddress();
  const {appTheme} = useContext(AppContext);
  const [isDark, setDark] = useState(appTheme.type === 'dark');
  useEffect(() => {
    setDark(appTheme.type === 'dark');
  }, [appTheme.type]);

  useEffect(() => {
    setloading(true);

    if (props.Useraddress) {
      const addrs =
        props.Useraddress.urbanization +
        ' ' + // Direction
        props.Useraddress.city +
        ' Venezuela';

      setAddress(addrs);
    }
  }, [props.Useraddress]);

  useEffect(() => {
    aError && Helper.ShowAlert(`${aError}`);
    eError && Helper.ShowAlert(`${eError}`);
  }, [aError, eError]);

  const [location, setlocation] = useState(null);

  useEffect(() => {
    setloading(true);
    const encodedAddress = encodeURI(Address);

    Address &&
      fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?country=Venezuela&region=VE&language=es&address=${encodedAddress}&key=${
          Platform.OS == 'ios'
            ? 'AIzaSyDJLaZGw_hepaXX3Z4Jf1RPKUtoObR974o'
            : 'AIzaSyAKRXEFlzaa65i4vVWP2Rk2A028nbw8HIo'
        }`,
      )
        .then(response => response.json())
        .then(json => {
          if (json.results.length > 0) {
            console.log('Chagned from API marker -- ');

            const location1 = json.results[0].geometry.location;
            setlocation(location1);
            // setMarker(
            //   [{
            //     latitude: location.lat,
            //     longitude: location.lng,
            //     latitudeDelta: LATITUDE_DELTA,
            //     longitudeDelta: LONGITUDE_DELTA
            //   }]
            // )
          } else {
            setloading(false);
            const addrs = props.Useraddress.city + ' Venezuela';
            setAddress(addrs);
          }
        })
        .catch(error => {
          Helper.ShowAlert(error);
          setloading(false);
        });
  }, [Address]);

  useEffect(() => {
    if (location) {
      const loc = location; //.geometry.location;
      setMarker([
        {
          latitude: loc.lat,
          longitude: loc.lng,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        },
      ]);
    }
  }, [location]);

  useEffect(() => {
    console.log('marker -- ' + JSON.stringify(marker));
    marker.length > 0 && setloading(false);
  }, [marker]);

  const SaveAddress = () => {
    Helper.HandleVibration();
    if (props.Useraddress.isNewAddress) {
      newAdd({
        variables: {
          firstname: props.Useraddress.firstname,
          lastname: props.Useraddress.lastname,
          city: props.Useraddress.city,
          street: [props.Useraddress.street, props.Useraddress.urbanization],
          address_type: props.Useraddress.address_type,
          apartment_number: props.Useraddress.apartment_number,
          default_shipping: true,
          default_billing: false,
          postcode: props.Useraddress.postcode,
          nearest_city: props.Useraddress.nearest_city,
          latitude: marker[0].latitude,
          longitude: marker[0].longitude,
        },
      });
    } else {
      updateAdd({
        variables: {
          aid: props.Useraddress.aid,
          firstname: props.Useraddress.firstname,
          lastname: props.Useraddress.lastname,
          city: props.Useraddress.city,
          street: [props.Useraddress.street, props.Useraddress.urbanization],
          address_type: props.Useraddress.address_type,
          apartment_number: props.Useraddress.apartment_number,
          default_shipping: true,
          default_billing: false,
          postcode: props.Useraddress.postcode,
          nearest_city: props.Useraddress.nearest_city,
          latitude: marker[0].latitude,
          longitude: marker[0].longitude,
        },
      });
    }
  };

  useEffect(() => {
    if (aData) {
      if (aData.createCustomerAddress) {
        console.log('Saved address --- ' + JSON.stringify(aData));
        dispatch(ISAddressCacheUpdated(true));
        Helper.ShowAlert(translate('address.msg_address_added'), null);

        props.Useraddress.Useraddress = null;
        props.Saved();
      }
    }
  }, [aData]);

  useEffect(() => {
    if (eData) {
      if (eData.updateCustomerAddress) {
        console.log('eData address --- ' + JSON.stringify(eData));
        dispatch(ISAddressCacheUpdated(true));
        dispatch(
          ADDRESSAdd(
            eData.updateCustomerAddress,
            eData.updateCustomerAddress.id,
            eData.updateCustomerAddress.id,
          ),
        );
        Helper.ShowAlert(translate('addrslist.lbl_addrs_update'), null);
        props.CloseBottomsheet();
      }
    }
  }, [eData]);

  return (
    <>
      <SafeAreaView
        style={[
          {flex: 1, backgroundColor: appTheme.background},
          isDark ? null : {borderTopLeftRadius: 24, borderTopRightRadius: 24},
        ]}>
        <View style={styles.headerWrap}>
          <View style={styles.ButtonViewStyles}>
            <TouchableHighlight
              onPress={props.CloseBottomsheet}
              underlayColor={colorResource.transparent}
              style={{padding: 5}}>
              <Icon
                name="times"
                type="font-awesome-5"
                size={24}
                color={isDark ? colorResource.white : colorResource.black}
              />
              {/* <Image source={ResImage.ic_close_modal} style={[commonStyle.he_wi_24]} /> */}
            </TouchableHighlight>
          </View>
        </View>
        {marker && marker.length > 0 && (
          <View style={[{width: '100%', height: '100%'}]}>
            <MapView
              provider={PROVIDER_GOOGLE}
              mapType={'hybrid'}
              showsBuildings={true}
              style={[commonStyle.flex_1]}
              onRegionChangeComplete={e => {
                setMarker([
                  {
                    latitude: e.latitude,
                    longitude: e.longitude,
                    latitudeDelta: e.latitudeDelta,
                    longitudeDelta: e.longitudeDelta,
                  },
                ]);
              }}
              initialRegion={{
                latitude: marker[0].latitude,
                longitude: marker[0].longitude,
                latitudeDelta: marker[0].latitudeDelta,
                longitudeDelta: marker[0].longitudeDelta,
              }}
            />

            <View style={styles.markerFixed}>
              <Image style={styles.marker} source={ResImage.ic_mappin_active} />
            </View>
          </View>
        )}

        <View
          style={{
            position: 'absolute',
            bottom: 25,
            marginHorizontal: 24,
            width: '90%',
          }}>
          <CustomButton
            title={'address.lbl_save_address'}
            onPress={SaveAddress}
            customButtonStyle={[commonStyle.btn_primary]}
          />
        </View>
        <CustomPBar showProgress={loading} />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  headerWrap: {
    flexDirection: 'row',
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  ButtonViewStyles: {
    flex: 0.1,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  markerFixed: {
    left: '50%',
    marginLeft: -24,
    marginTop: -48,
    position: 'absolute',
    top: '50%',
  },
  marker: {
    height: 50,
    width: 50,
  },
  footer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    bottom: 0,
    position: 'absolute',
    width: '100%',
  },
  region: {
    color: colorResource.white,
    lineHeight: 20,
    margin: 20,
  },
});

export default AddressMapSelection;
