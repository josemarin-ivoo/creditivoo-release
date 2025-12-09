import {Alert, Platform} from 'react-native';
import {
  check,
  openSettings,
  PERMISSIONS,
  request,
  RESULTS,
} from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';
import DeviceInfo from 'react-native-device-info';
import {getObjectFromStore, setItemInStorage} from './Storage';

const PermissionHandler = {
  openSetting: (page = 'other') => {
    var title =
      page == 'ischeckout'
        ? 'Necesitamos su permiso de ubicación para un mejor servicio. Permita que se configure.'
        : '¿Quieres cambiar el permiso ?. es decir, servicio de ubicación.';

    Alert.alert('', title, [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {text: 'Go to Setting', onPress: () => openSettings()},
    ]);
  },

  // getCurrentLatLong: () => {
  //   try {
  //     Geolocation.getCurrentPosition(
  //       position => {
  //         // console.log('FN getCurrentLatLong  ---- ', position.coords );
  //         setItemInStorage('latitude', position.coords.latitude.toString());
  //         setItemInStorage('longitude', position.coords.longitude.toString());
  //         return position;
  //       },
  //       error => {
  //         // See error code charts below.
  //         console.log('getCurrentLatLong  ---- ', error.code, error.message);
  //       },
  //       {
  //         enableHighAccuracy: true,
  //         timeout: 10000,
  //         maximumAge: 10000,
  //       },
  //     );
  //   } catch (error) {
  //     return null;
  //   }
  // },
  getCurrentLatLong: async () => {
    try {
      const location = Geolocation.getCurrentPosition(
        async position => {
          await setItemInStorage(
            'latitude',
            position.coords.latitude.toString(),
          );
          await setItemInStorage(
            'longitude',
            position.coords.longitude.toString(),
          );
          console.log(
            'getCurrentLatLong ------->>',
            position.coords.latitude,
            position.coords.longitude,
          );

          const data = await getObjectFromStore('locationData');
          const minLocaDist =
            (await getObjectFromStore('minLocationDistance')) || 10;
          if (data == null) {
            const cityName = await getCityFromCoords(
              position.coords.latitude.toString(),
              position.coords.longitude.toString(),
            );
            await setItemInStorage('lat', position.coords.latitude.toString());
            await setItemInStorage('lng', position.coords.longitude.toString());
            //await setItemInStorage('cityNameVal', cityName);
          } else {
            if (
              distance(
                position.coords.latitude.toString(),
                position.coords.longitude.toString(),
                data.latitude,
                data.longitude,
                'K',
              ) > minLocaDist
            ) {
              console.log('You are > ' + minLocaDist + ' kilometers away');
              const cityName = await getCityFromCoords(
                position.coords.latitude.toString(),
                position.coords.longitude.toString(),
              );
              await setItemInStorage(
                'lat',
                position.coords.latitude.toString(),
              );
              await setItemInStorage(
                'lng',
                position.coords.longitude.toString(),
              );
              //await setItemInStorage('cityNameVal', cityName);
              await setItemInStorage('isLocationFar', 'true');
              return true;
            } else {
              console.log('You are < ' + minLocaDist + ' kilometers away');
              await setItemInStorage(
                'lat',
                position.coords.latitude.toString(),
              );
              await setItemInStorage(
                'lng',
                position.coords.longitude.toString(),
              );
              await setItemInStorage('isLocationFar', 'false');
              return false;
            }
          }
        },
        error => console.error(error.message),
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
      );
    } catch (error) {
      console.error('error message --->>', error.message);
    }
  },

  hasLocationPermission: async () => {
    if (Platform.OS === 'ios') {
      const hasPermission = await hasPermissionIOS();
      return hasPermission;
    }

    if (Platform.OS === 'android' && Platform.Version < 23) {
      return true;
    }

    const hasPermission = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);

    if (hasPermission) {
      return true;
    }

    const status = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);

    if (status === RESULTS.GRANTED) {
      return true;
    }

    return false;
  },
};

export default PermissionHandler;

async function hasPermissionIOS() {
  const status = await Geolocation.requestAuthorization('always');
  console.log('hasPermissionIOS --- ', status);

  if (status === 'granted') {
    return true;
  }

  if (status === 'denied' || status === 'disabled' || status === 'restricted') {
    Alert.alert(
      `Activa los Servicios de ubicación para permitir que "${DeviceInfo.getApplicationName()}" determine tu ubicación.`,
      '',
      [
        {
          text: 'Go to Settings',
          onPress: () => {
            openSettings();
          },
        },
        {text: "Don't Use Location", onPress: () => {}},
      ],
    );
  }

  return false;
}

function distance(lat1, lon1, lat2, lon2, unit) {
  var radlat1 = (Math.PI * lat1) / 180;
  var radlat2 = (Math.PI * lat2) / 180;
  var theta = lon1 - lon2;
  var radtheta = (Math.PI * theta) / 180;
  var dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  if (unit == 'K') {
    dist = dist * 1.609344;
  }
  if (unit == 'M') {
    dist = dist * 0.8684;
  }
  return dist;
}

const getCityFromCoords = async (latitude, longitude) => {
  const API_KEY =
    Platform.OS == 'ios'
      ? 'AIzaSyDJLaZGw_hepaXX3Z4Jf1RPKUtoObR974o'
      : 'AIzaSyAKRXEFlzaa65i4vVWP2Rk2A028nbw8HIo';
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`;

  fetch(url)
    .then(response => response.json())
    .then(async responseJson => {
      if (responseJson.results.length > 0) {
        const addressComponents = responseJson.results[0].address_components;
        let city = '';
        for (let i = 0; i < addressComponents.length; i++) {
          if (addressComponents[i].types.includes('locality')) {
            city = addressComponents[i].long_name;
            break;
          }
        }
        console.log('City name value using google api :----------->> ', city);
        // Do something with the city name
        await setItemInStorage('cityNameVal', city);
        return city;
      } else {
        await setItemInStorage('cityNameVal', '');
        console.log('No results found');
        return '';
      }
    })
    .catch(error => {
      console.error(error);
    });
};
