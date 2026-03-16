import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  PermissionsAndroid,
  Modal,
  FlatList,
  Switch,

  ScrollView,
  ActivityIndicator,

} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Geolocation from 'react-native-geolocation-service';
import Icon from 'react-native-vector-icons/Feather';
import Colors from '../../../Utils/Colors';


//add Jmarin
import { useDispatch, useSelector } from 'react-redux';
import { ISAddressONCart } from './../../../redux/CheckoutCacheReducer/CheckoutCacheAction';
import { isNeedtoUpdatePAYDATA } from './../../../redux/PaymentMethodsReducers/PaymentMethodsAction';
import Helper from '../../../Utils/Helper';

import {
  setShippingAddressesOnCart,
  setShippingMethodsOnCart,
  setAddress,
} from '../../../Queries/queries';
import { AppContext } from '../../AppContext';
// BORRA los anteriores y deja SOLO este bloque:
// Busca esta línea y asegúrate de que incluya calculateProviderCost
import {
  fetchDeliveryConfig,
  getProviderProfit,
  DELIVERY_CONFIG,
  isProviderActive,
  calculateProviderCost // <--- AGREGA ESTO AQUÍ
} from '../../../Utils/DeliveryConfig';

const GOOGLE_API_KEY = 'AIzaSyAEauWY8tB9iKYjYEy3B48JgsEAMlXU91s';

const imgYummyMoto = require('../../../../assets/images/shipping/yummy-moto1.png');
const imgYummyCar = require('../../../../assets/images/shipping/yummy-car2.png');
const imgMusculo = require('../../../../assets/images/shipping/musculo.png');
const imgCamionIVOO = require('../../../../assets/images/shipping/CamionIVOO.png');
const imgMotoIVOO = require('../../../../assets/images/shipping/ivoo-moto.png');
const imgMRW = require('../../../../assets/images/shipping/MRW.png');
const imgFletyVan = require('../../../../assets/images/shipping/flety-van.png');
const imgFletyCamion = require('../../../../assets/images/shipping/CamionIVOO.png');

// add Frodriguez
type ProviderMode = 'free' | 'express';

type Provider = {
  id: string;
  name: string;
  mode: ProviderMode;

  image?: any;

  // Pricing base (si aplica)
  base?: number;
  rate?: number;
  profit?: number;

  // Constraints
  minWeight?: number;
  maxWeight?: number;
  maxDim?: { x: number; y: number; z: number };

  // Extras para integraciones
  serviceTypeId?: string;

  // Para UI
  etaLabel?: string; // fallback
};

const PROVIDERS: Provider[] = [
  // ---------- FREE ----------
  {
    id: 'mrw_nacional',
    name: 'MRW',
    mode: 'free',
    image: imgMRW,
    etaLabel: '2 - 3 días',
    maxWeight: 80,
  },
  {
    id: 'ivoo_programado',
    name: 'IVOO',
    mode: 'free',
    image: imgCamionIVOO,
    etaLabel: '4 - 5 días',
    maxWeight: 1000,
  },

  // ---------- EXPRESS ----------
  {
    id: 'ivoo_moto',
    name: 'Moto IVOO',
    mode: 'express',
    base: 0,
    rate: 0,
    profit: 2,
    maxDim: { x: 65, y: 50, z: 37 },
    image: imgMotoIVOO,
  },
  {
    id: 'yummy_moto',
    name: 'Moto',
    mode: 'express',
    profit: 0.5,
    maxWeight: 15,
    maxDim: { x: 40, y: 40, z: 40 },
    serviceTypeId: '6978e869044548e89ffa6f33',
    image: imgYummyMoto,
  },
  {
    id: 'yummy_carro',
    name: 'Carro',
    mode: 'express',
    profit: 2,
    maxWeight: 180,
    maxDim: { x: 180, y: 60, z: 60 },
    serviceTypeId: '6978e869044548e89ffa6f33',
    image: imgYummyCar,
  },
  {
    id: 'flety_van',
    name: 'Flety (Vans)',
    mode: 'express',
    profit: 5,
    minWeight: 0,
    maxWeight: 1000,
    image: imgFletyVan,
  },
  {
    id: 'flety_camion',
    name: 'Camión',
    mode: 'express',
    profit: 5,
    maxWeight: 1000,
    image: imgFletyCamion,
  },
];

// add Frodriguez

const parseDimensionString = (value: string) => {
  if (!value || typeof value !== 'string') return null;

  const normalized = value.toLowerCase().trim();

  let unit = 'cm';
  if (normalized.includes('mm')) {
    unit = 'mm';
  }

  const cleaned = normalized
    .replace(/mm/g, '')
    .replace(/cm/g, '')
    .replace(/\s+/g, '');

  const parts = cleaned.split('x').map(v => parseFloat(v.replace(',', '.')));

  if (parts.length !== 3 || parts.some(isNaN)) return null;

  let [largo, ancho, alto] = parts;

  // Convertimos a cm si viene en mm
  if (unit === 'mm') {
    largo = largo / 10;
    ancho = ancho / 10;
    alto = alto / 10;
  }

  return {
    largo,
    ancho,
    alto,
  };
};

const parseWeightValue = (value: string | number) => {
  if (value == null) return null;

  const normalized = String(value)
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(',', '.');

  let parsed = 0;

  if (normalized.includes('kg')) {
    parsed = parseFloat(normalized.replace(/kg/g, ''));
    return isNaN(parsed) ? null : parsed;
  }

  if (normalized.includes('gr')) {
    parsed = parseFloat(normalized.replace(/gr/g, ''));
    return isNaN(parsed) ? null : parsed / 1000;
  }

  if (normalized.includes('g')) {
    parsed = parseFloat(normalized.replace(/g/g, ''));
    return isNaN(parsed) ? null : parsed / 1000;
  }

  // Si no trae unidad, asumimos kg
  parsed = parseFloat(normalized);
  return isNaN(parsed) ? null : parsed;
};

const getCartDeliveryMetrics = (items: any[]) => {
  let totalWeight = 0;
  let maxLargo = 0;
  let maxAncho = 0;
  let totalAlto = 0;
  let totalVolumen = 0;
  let missingData = false;
  const invalidItems: string[] = [];

  for (const item of items || []) {
    const attrs = item?.product?.additional_attributes || [];
    const qty = Number(item?.quantity || 1);

    const dimAttr =
      attrs.find((a: any) => a.code === 'dimensiones_deliver') ||
      attrs.find((a: any) => a.code === 'dimensiones');

    const weightAttr =
      attrs.find((a: any) => a.code === 'weightdelivery') ||
      attrs.find((a: any) => a.code === 'peso');

    const dims = parseDimensionString(dimAttr?.value);
    const weight = parseWeightValue(weightAttr?.value);

    if (!dims || weight == null) {
      missingData = true;
      invalidItems.push(item?.product?.sku || item?.product?.name || 'Producto');
      continue;
    }

    totalWeight += weight * qty;

    maxLargo = Math.max(maxLargo, dims.largo);
    maxAncho = Math.max(maxAncho, dims.ancho);
    totalAlto += dims.alto * qty;

    totalVolumen += dims.largo * dims.ancho * dims.alto * qty;
  }

  return {
    missingData,
    invalidItems,
    totalWeight,
    dimensions: {
      largo: maxLargo,
      ancho: maxAncho,
      alto: totalAlto,
    },
    totalVolumen,
  };
};
// end Frodriguez

//add Jmarin
interface Props {
  onChange: (data: any) => void;
  cartId: string;
  cartTotal: number;
  dimensiones: number;
  stores: any[];
  // add Frodriguez
  cartItems: any[];
  // end Frodriguez
}
//end Jmarin

// add Frodriguez

const getAvailableProviders = (
  weight: number,
  dimensions: { x: number; y: number; z: number },
) => {
  const { x, y, z } = dimensions;

  return PROVIDERS.filter(provider => {
    if (provider.maxWeight && weight > provider.maxWeight) return false;
    if (provider.minWeight && weight < provider.minWeight) return false;

    if (provider.maxDim) {
      if (
        x > provider.maxDim.x ||
        y > provider.maxDim.y ||
        z > provider.maxDim.z
      ) {
        return false;
      }
    }

    return true;
  });
};

const getFriendlyStoreName = (store: any) => {
  if (store.city === 'Valencia') {
    let cleanName = store.name || store.city;
    cleanName = cleanName.replace(/^[Vv]alencia\s*[-–—]?\s*/, '').trim();

    if (!cleanName || /^\d+$/.test(cleanName)) {
      cleanName = store.city || store.pickup_location_code || 'Valencia';
    }

    return cleanName.toUpperCase().includes('IVOO')
      ? cleanName
      : `IVOO ${cleanName}`;
  }

  return `IVOO ${store.city || store.pickup_location_code}`;
};
// end Frodriguez

export const DeliveryForm: React.FC<Props> = ({
  onChange,

  //add Jmarin
  cartId,
  cartTotal,
  stores,
  dimensiones,
  // add Frodriguez
  cartItems,
  // end Frodriguez
  //end Jmarin
}) => {
  //add Jmarin
  const dispatch = useDispatch();
  const global_data = useSelector((state: any) => state.commonReducer);
  const [loading, setLoading] = useState(false);
  //end Jmarin

  // Add Rfusco22
  const [deliveryType, setDeliveryType] = useState<'free' | 'express'>('express');
  // End Rfusco22

  // add Frodriguez
  const deliveryMetrics = getCartDeliveryMetrics(cartItems);

  const currentWeight = deliveryMetrics.totalWeight;

  const currentDimensions = {
    x: deliveryMetrics.dimensions.largo,
    y: deliveryMetrics.dimensions.ancho,
    z: deliveryMetrics.dimensions.alto,
  };

  const volumenProduct = deliveryMetrics.totalVolumen > 0 ? deliveryMetrics.totalVolumen / 1000 : dimensiones;

  // add Frodriguez
  useEffect(() => {
    console.log('================ DELIVERY METRICS ================');
    console.log('cartItems =>', cartItems);
    console.log('missingData =>', deliveryMetrics.missingData);
    console.log('invalidItems =>', deliveryMetrics.invalidItems);
    console.log('totalWeight =>', currentWeight);
    console.log('currentDimensions =>', currentDimensions);
    console.log('totalVolumen(cm3) =>', deliveryMetrics.totalVolumen);
    console.log('volumenProduct(litros aprox) =>', volumenProduct);
    console.log('==================================================');
  }, [
    cartItems,
    deliveryMetrics.missingData,
    deliveryMetrics.invalidItems,
    deliveryMetrics.totalVolumen,
    currentWeight,
    currentDimensions.x,
    currentDimensions.y,
    currentDimensions.z,
    volumenProduct,
  ]);

  // end Frodriguez

  const canUseCalculatedDelivery =
    !deliveryMetrics.missingData &&
    currentWeight > 0 &&
    currentDimensions.x > 0 &&
    currentDimensions.y > 0 &&
    currentDimensions.z > 0;
  // end Frodriguez

  const [activeConfig, setActiveConfig] = useState<any>(null);
  const [configVersion, setConfigVersion] = useState(0);
  const [sortedStores, setSortedStores] = useState<any[]>([]);
  const [origin, setOrigin] = useState<any>(null);
  const [destination, setDestination] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<any>(null);

  const [showStoreModal, setShowStoreModal] = useState(false);
  const [addressText, setAddressText] = useState('');
  const [yummyEta, setYummyEta] = useState<number | null>(null);

  const [textSelection, setTextSelection] = useState<
    { start: number; end?: number } | undefined
  >(undefined);

  const [routeInfo, setRouteInfo] = useState({ distance: 0, duration: 0 });
  const [isMusculito, setIsMusculito] = useState(false);
  //add Rfusco22
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  //End Rfusco22
  const [loadingGps, setLoadingGps] = useState(true);

  const mapRef = useRef<MapView>(null);
  const placesRef = useRef<GooglePlacesAutocomplete>(null);
  const lastSentData = useRef<string>('');
  const hasInitialized = useRef(false);

  const [yummyApiPrices, setYummyApiPrices] = useState<any[]>([]);

  // add Frodriguez
  const freeProviders = PROVIDERS.filter(p => {
    if (p.mode !== 'free') return false;

    if (p.id !== 'ivoo_programado' && !canUseCalculatedDelivery) return false;

    if (p.maxWeight && currentWeight > p.maxWeight) return false;
    if (p.minWeight && currentWeight < p.minWeight) return false;

    if (p.id === 'ivoo_programado' && routeInfo.distance > 40) return false;

    return true;
  });

  const expressProviders = canUseCalculatedDelivery
    ? getAvailableProviders(currentWeight, currentDimensions).filter(
      p => p.mode === 'express',
    )
    : [];

  const availableProviders = React.useMemo(() => {
    const baseList = deliveryType === 'free' ? freeProviders : expressProviders;
    const configSource = activeConfig || DELIVERY_CONFIG;

    return baseList.filter(p => {
      const s = configSource[p.id];
      if (!s || !s.active) return false;

      // Control de distancia desde el panel (max_dist)
      if (routeInfo.distance > (s.max_dist || 80)) return false;

      // Validación de APIs (Yummy)
      if (p.id.includes('yummy') && routeInfo.distance > 0) {
        const hasQuote = yummyApiPrices.some(quote =>
          (p.id === 'yummy_moto' && quote.typename.includes('Mandaditos')) ||
          (p.id === 'yummy_carro' && quote.typename === 'Mandaditos XL')
        );
        if (!hasQuote) return false;
      }

      return true;
    });
  }, [deliveryType, activeConfig, routeInfo.distance, yummyApiPrices]);
  // end Frodriguez

  //add Jmarin
  const [setShippingAddress] = setShippingAddressesOnCart();
  const [setMethod] = setShippingMethodsOnCart();
  //end Jmarin

  // Add Rfusco22
  const getAddressFromCoords = async (lat: number, lng: number) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const address = data.results[0].formatted_address;
        const detailsExtra = getAddressDetail(data.results[0]);

        setAddressText(address);
        placesRef.current?.setAddressText(address);

        setDestination({
          latitude: lat,
          longitude: lng,
          city: detailsExtra.city,
          municipality: detailsExtra.municipality,
          state: detailsExtra.state,
          postal_code: detailsExtra.postal_code,
          country: detailsExtra.country,
        });
      }
    } catch (error) {
      console.error('Error en Geocoding inversa:', error);
    }
  };

  const getMenssajeroLocationIds = async (
    stateName: string,
    cityName: string,
  ) => {
    const headers = {
      Authorization: 'Bearer 174|HnLj9ueoGc0lErG7GyjBYJ02GAlpkPzmt70pbNdO',
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    try {
      const resState = await fetch(
        'https://test.menssajero.com/api/consulta/estados',
        {
          method: 'POST',
          headers,
        },
      );
      const states = await resState.json();
      const stateMatch = states.data.find((s: any) =>
        s.nombre.toLowerCase().includes(stateName.toLowerCase()),
      );

      if (!stateMatch) return null;

      const resMun = await fetch(
        'https://test.menssajero.com/api/consulta/municipios',
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ estado_id: stateMatch.estado_id }),
        },
      );
      const municipios = await resMun.json();
      const munMatch = municipios.data.find((m: any) =>
        m.nombre.toLowerCase().includes(cityName.toLowerCase()),
      );

      console.log('MRW stateName =>', stateName);
      console.log('MRW cityName =>', cityName);
      console.log('MRW estado encontrado =>', stateMatch);
      console.log('MRW municipios disponibles =>', municipios.data);
      console.log('MRW municipio encontrado =>', munMatch);

      return {
        estado_id: stateMatch.estado_id,
        municipio_id: munMatch?.municipio_id || null,
      };
    } catch (e) {
      console.error('Error mapeando IDs:', e);
      return null;
    }
  };

  const [mrwPrice, setMrwPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchMRWPrice = async () => {
      console.log('=== MRW EFFECT ===');
      console.log('origin =>', origin);
      console.log('destination =>', destination);
      console.log('addressText =>', addressText);
      console.log('currentWeight =>', currentWeight);
      console.log('currentDimensions =>', currentDimensions);
      console.log('canUseCalculatedDelivery =>', canUseCalculatedDelivery);

      if (
        origin?.latitude &&
        destination?.latitude &&
        canUseCalculatedDelivery &&
        currentWeight > 0
      ) {
        const price = await getMRWQuote(
          origin,
          destination,
          currentWeight,
          currentDimensions,
        );

        console.log('MRW PRICE RESULT =>', price);

        if (price !== null) {
          setMrwPrice(price);
        } else {
          setMrwPrice(null);
        }
      } else {
        console.log('MRW NO COTIZA POR CONDICIÓN INCOMPLETA');
        setMrwPrice(null);
      }
    };

    fetchMRWPrice();
  }, [
    origin,
    destination,
    addressText,
    currentWeight,
    currentDimensions.x,
    currentDimensions.y,
    currentDimensions.z,
    canUseCalculatedDelivery,
  ]);
  // end Frodriguez

  // add Frodriguez
  const getMRWQuote = async (
    originLoc: any,
    destLoc: any,
    weight: number,
    dimensions: { x: number; y: number; z: number },
  ) => {
    // end Frodriguez
    const locationIds = await getMenssajeroLocationIds(
      destLoc.state || '',
      destLoc.municipality || destLoc.city || '',
    );

    if (!locationIds) return null;

    const payload = {
      tipo_envio: 'DOMICILIO',
      consulta: true,
      origen: {
        estado_id: originLoc.fullData?.estado_id || 11,
        municipio_id: originLoc.fullData?.municipio_id || 462,
        direccion: originLoc.name || 'Tienda IVOO',
        latitud: originLoc.latitude.toString(),
        longitud: originLoc.longitude.toString(),
      },
      destino: {
        estado_id: locationIds.estado_id,
        municipio_id: locationIds.municipio_id,
        direccion: addressText,
        latitud: destLoc.latitude.toString(),
        longitud: destLoc.longitude.toString(),
      },
      destinatario: {
        nombres: global_data?.Fname || 'Cliente',
        apellidos: global_data?.Lname || 'IVOO',
        tipo_dni: 'V',
        dni: String(global_data?.customerData?.citizen_id ?? '').replace(
          /\D/g,
          '',
        ),
        telefono: global_data.phone || '04120000000',
        email: global_data?.email || 'cliente@ivoo.com',
      },
      remitente: {
        nombres: 'IVOO',
        apellidos: 'VENEZUELA',
        tipo_dni: 'J',
        dni: '400163994',
        telefono: '0212-0000000',
        email: 'info@ivoo.com',
      },
      paquete: {
        peso: weight.toFixed(2),
        // add Frodriguez
        alto: dimensions.z.toFixed(2),
        ancho: dimensions.y.toFixed(2),
        largo: dimensions.x.toFixed(2),
        // end Frodriguez
        precio: cartTotal.toFixed(2),
        descripcion: `Pedido IVOO #${cartId}`,
      },
    };

    try {
      const response = await fetch(
        'https://test.menssajero.com/api/v1/orden-envios/crear',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization:
              'Bearer 174|HnLj9ueoGc0lErG7GyjBYJ02GAlpkPzmt70pbNdO',
          },
          body: JSON.stringify(payload),
        },
      );
      console.log('MRW request payload:', JSON.stringify(payload));
      console.log('MRW response status:', JSON.stringify(response));
      const data = await response.json();
      if (data.status === 200 && data.costo_del_envio_logistica) {
        return parseFloat(data.costo_del_envio_logistica.replace('$', ''));
      }
      return null;
    } catch (error) {
      console.error('Error MRW:', error);
      return null;
    }
  };
  // End Rfusco22

  //add Frodriguez
  const { appTheme, themeName } = useContext(AppContext);
  const isDark = themeName === 'dark';

  const bg = appTheme.background;
  const surface = appTheme.InputBoxBGColor;
  const text = appTheme.text;
  //end Frodriguez

  // jmarin para cargar direcciones

  const [setAdd, {loading: aLoading, error: aError, data: aData}] =
      setAddress();

  const [selectedId, setselectedId] = useState(null);

  // end jmarin

  const getYummyQuote = async (
    weight: number,
    originLoc: any,
    destLoc: any,
  ) => {
    const pLat = parseFloat(originLoc?.latitude);
    const pLng = parseFloat(originLoc?.longitude);
    const dLat = parseFloat(destLoc?.latitude);
    const dLng = parseFloat(destLoc?.longitude);

    if (isNaN(pLat) || isNaN(dLat)) return null;

    try {
      const body = JSON.stringify({
        weight: weight || 1,
        pickupLatitude: pLat,
        pickupLongitude: pLng,
        destinationLatitude: dLat,
        destinationLongitude: dLng,
      });

      const url = 'https://api.yummyrides.com/api/v1/quotation/api-corporate';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Api-Key': '603179be-e09f-4cee-8026-0a241ab9c3d1',
          language: 'es',
        },
        body,
      });

      const data = await response.json();

      if (data.status === 201 && data.response) {
        // ACTUALIZACIÓN DEL ETA:
        // Convertimos de segundos a minutos y redondeamos
        if (data.response.eta !== undefined) {
          const minutes = Math.round(data.response.eta / 60);
          console.log(`[YUMMY_DEBUG] ETA: ${data.response.eta}s -> ${minutes}m`);
          setYummyEta(minutes); // <--- ESTO ES LO QUE FALTA
        }

        const qId = data.response.quotationId;
        return data.response.trip_services.map((service: any) => ({
          ...service,
          quotationId: qId,
          serviceTypeId: String(service.id),
        }));
      }

      // Si falla la respuesta, limpiamos el ETA
      setYummyEta(null);
      return null;

    } catch (error) {
      setYummyEta(null);
      console.error('[YUMMY_API] Error:', error);
      return null;
    }
  };
  useEffect(() => {
    if (!selectedProvider) return;

    const existsInCurrentMode = availableProviders.some(p => p.id === selectedProvider);
    if (!existsInCurrentMode) {
      setSelectedProvider(null);
      setIsMusculito(false);
    }
  }, [deliveryType, availableProviders, selectedProvider]);

  useEffect(() => {
    if (!hasInitialized.current && stores && stores.length > 0) {
      hasInitialized.current = true;
      initLocationAndSort();
    }
  }, [stores]);

  const initLocationAndSort = async () => {
    try {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
      }

      Geolocation.getCurrentPosition(
        pos => {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          setUserLocation({ latitude: userLat, longitude: userLng });

          if (stores && stores.length > 0) {
            const sorted = stores
              .map(store => {
                const sLat = parseFloat(store.latitude || store.lat);
                const sLng = parseFloat(store.longitude || store.lng);
                const dist = getLinearDistance(userLat, userLng, sLat, sLng);
                return { ...store, distance: dist };
              })
              .sort((a, b) => a.distance - b.distance);

            setSortedStores(sorted);
            if (sorted.length > 0) selectOrigin(sorted[0]);
          }
          setLoadingGps(false);
        },
        err => {
          setSortedStores(stores);
          if (stores.length > 0) selectOrigin(stores[0]);
          setLoadingGps(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    } catch (e) {
      setLoadingGps(false);
    }
  };

  const getLinearDistance = (lat1: any, lon1: any, lat2: any, lon2: any) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 99999;
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const [officialStores, setOfficialStores] = useState<any[]>([]);

  // Efecto para cargar el diccionario de tiendas al iniciar
  useEffect(() => {
    const loadStoresMap = async () => {
      try {
        const response = await fetch('https://deliveryqa.ivoofix.com/api/stores');
        const json = await response.json();
        if (json.success) {
          setOfficialStores(json.data);
        }
      } catch (e) {
        console.error("Error cargando diccionario de tiendas:", e);
      }
    };
    loadStoresMap();
  }, []);

  // add Frodriguez
  const selectOrigin = async (store: any) => {
    // 1. Obtenemos el código de Magento que viene del modal (ej: "903", "203")
    const magentoCode = String(store.pickup_location_code || "");

    // 2. Buscamos en nuestro diccionario oficial cargado desde la API
    const matchedStore = officialStores.find(s => String(s.magento_id) === magentoCode);

    // 3. Definimos el ID Final
    let storeIdForApi = "2"; // Default

    if (matchedStore) {
      // Si hubo match, usamos el ID de la tabla (ej: 9)
      storeIdForApi = String(matchedStore.id);
      console.log(`✅ Match encontrado: Magento ${magentoCode} -> ID Auditoría ${storeIdForApi}`);
    } else {
      // Si no hay match, aplicamos el recorte (903 -> 9)
      storeIdForApi = magentoCode.length >= 3
        ? magentoCode.substring(0, magentoCode.length - 2)
        : magentoCode;
      console.log(`⚠️ No hubo match directo, usando recorte: ${storeIdForApi}`);
    }

    setOrigin({
      latitude: parseFloat(store.latitude),
      longitude: parseFloat(store.longitude),
      name: getFriendlyStoreName(store),
      fullData: store,
    });

    setShowStoreModal(false);
    setLoading(true);

    try {
      const data = await fetchDeliveryConfig(storeIdForApi);
      console.log("Configuración cargada para ID:", storeIdForApi, !!data);
      setActiveConfig(data);
      setConfigVersion((v: number) => v + 1);
    } catch (e) {
      console.error("Error API Delivery:", e);
    } finally {
      setLoading(false);
    }

    if (destination) {
      fitMap({ latitude: parseFloat(store.latitude), longitude: parseFloat(store.longitude) }, destination);
    }
  };

  // end Frodriguez

  const fitMap = (p1: any, p2: any) => {
    setTimeout(() => {
      if (mapRef.current && p1?.latitude && p2?.latitude) {
        mapRef.current.fitToCoordinates(
          [
            { latitude: p1.latitude, longitude: p1.longitude },
            { latitude: p2.latitude, longitude: p2.longitude },
          ],
          {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          },
        );
      }
    }, 500);
  };

  const handleGpsPress = () => {
    if (userLocation) {
      setDestination(userLocation);
      setAddressText('Mi Ubicación Actual');
      if (placesRef.current)
        placesRef.current.setAddressText('Mi Ubicación Actual');
      fitMap(origin, userLocation);
      setTextSelection({ start: 0, end: 0 });
    } else {
      hasInitialized.current = false;
      initLocationAndSort();
    }

    //cargarlo al final de la funcion, jmarin
    setTimeout(() => {
      if (selectedId) handleAutoSaveAddress(selectedId);
    }, 500);
  };

  const getAddressDetail = (details: any) => {
    const components = details.address_components || [];

    const find = (type: string) =>
      components.find((c: any) => c.types.includes(type))?.long_name || null;

    const city =
      find('locality') ||
      find('administrative_area_level_2') ||
      find('sublocality');

    return {
      city,
      municipality: find('administrative_area_level_2') || city,
      state: find('administrative_area_level_1'),
      postal_code: find('postal_code'),
      country: find('country') === 'Venezuela' ? 'VE' : find('country'),
    };
  };

  const getProviderConstraints = (providerId: string | null) => {
    const p = PROVIDERS.find(x => x.id === providerId);

    return {
      providerMaxDim: p?.maxDim ?? null,
      providerMaxWeight: p?.maxWeight ?? null,
      providerMinWeight: p?.minWeight ?? null,
    };
  };

  useEffect(() => {
    const getPrices = async () => {
      // add Frodriguez
      if (
        origin?.latitude &&
        destination?.latitude &&
        deliveryType === 'express' &&
        canUseCalculatedDelivery &&
        currentWeight > 0
      ) {
        const services = await getYummyQuote(currentWeight, origin, destination);
        if (services && services.length > 0) {
          setYummyApiPrices(services);
        } else {
          setYummyApiPrices([]);
        }
      } else {
        setYummyApiPrices([]);
      }
      // end Frodriguez
    };
    getPrices();
    // add Frodriguez
  }, [
    origin,
    destination,
    deliveryType,
    currentWeight,
    canUseCalculatedDelivery,
  ]);
  // end Frodriguez

  useEffect(() => {
    // add Frodriguez
    if (
      origin &&
      destination &&
      canUseCalculatedDelivery &&
      currentWeight > 0
    ) {
      getYummyQuote(currentWeight, origin, destination).then(services => {
        if (services) {
          setYummyApiPrices(services);
        } else {
          setYummyApiPrices([]);
        }
      });
    } else {
      setYummyApiPrices([]);
    }
    // end Frodriguez
  }, [
    destination,
    origin,
    // add Frodriguez
    currentWeight,
    canUseCalculatedDelivery,
    // end Frodriguez
  ]);


  //add Jmarin no se esta usando commit Frodriguez
  const autoConfirmAddress = async (coords: any, text: string) => {
    setLoading(true);
    try {
      await setShippingAddress({
        variables: {
          cID: cartId,
          address: {
            firstname: global_data?.Fname || 'Cliente',
            lastname: global_data?.Lname || 'IVOO',
            street: [text],
            city: origin?.city || 'Valencia',
            telephone: global_data?.phone || '04120000000',
            postcode: '1010',
            country_code: 'VE',
            save_in_address_book: false,
          },
        },
      });

      // Nota: mantenemos tu payload “real” en el useEffect (más abajo).
      // Aquí solo hacemos unlock y una notificación mínima al checkout.
      onChange({
        confirmed: true,
        address: text,
        store: origin,
        method: 'delivery',
      });

      dispatch(ISAddressONCart(true));
      dispatch(isNeedtoUpdatePAYDATA(true));

      Helper.HandleVibration();
    } catch (e: any) {
      console.log('Error auto-confirm:', e);
      Helper.ShowAlert('Error al sincronizar ubicación: ' + e.message);
    } finally {
      setLoading(false);
    }
  };
  //end Jmarin

  //add Jmarin no se esta usando commit Frodriguez
  const handleConfirmAddress = async () => {
    if (!destination || !addressText) {
      Helper.ShowAlert('Por favor, selecciona un destino en el mapa.');
      return;
    }

    setLoading(true);
    try {
      await setShippingAddress({
        variables: {
          cID: cartId,
          address: {
            firstname: global_data?.Fname || 'Cliente',
            lastname: global_data?.Lname || 'IVOO',
            street: [addressText],
            city: origin?.city || 'Valencia',
            telephone: global_data?.phone || '04120000000',
            postcode: '1010',
            country_code: 'VE',
            save_in_address_book: false,
          },
        },
      });

      onChange({
        confirmed: true,
        address: addressText,
        store: origin,
        method: 'delivery',
      });

      dispatch(ISAddressONCart(true));
      dispatch(isNeedtoUpdatePAYDATA(true));

      Helper.ShowAlert('Dirección y envío confirmados.');
      Helper.HandleVibration();
    } catch (e: any) {
      console.log(e);
      Helper.ShowAlert('Error al sincronizar: ' + e.message);
    } finally {
      setLoading(false);
    }
  };
  //end Jmarin


  // Add Rfusco22

  const isInitialMount = useRef(true);


  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    let cost = 0;
    let providerName = '';
    let isApiShipment = false;
    let service_type = '';

    const providerData = PROVIDERS.find(p => p.id === selectedProvider);
    providerName = providerData?.name || '';

    // Lógica de cálculo de costos
    if (deliveryType === 'free') {
      if (selectedProvider === 'ivoo_programado') {
        cost = isMusculito ? cartTotal * 0.05 : 0;
        service_type = 'Ivoo_Flety';
      }
    } else {
      if (providerData) {
        const dist = routeInfo.distance;

        // 1. OBTENEMOS EL PROFIT DESDE LA CONFIGURACIÓN DEL SERVIDOR
        const currentProfit = getProviderProfit(selectedProvider, activeConfig);

        if (providerData.id === 'ivoo_moto') {
          // Base ($2) + Musculito ($5) + Profit dinámico del panel
          cost = 2.0 + (isMusculito ? 5.0 : 0) + currentProfit;

        } else if (providerData.id === 'flety_van') {
          let base = dist <= 20 ? 65 : dist <= 30 ? 80 : dist <= 40 ? 100 : 150;
          // Sumamos los $5 fijos de Flety + el Profit dinámico
          cost = base + currentProfit;

        } else if (providerData.id === 'flety_camion') {
          let base = dist <= 20 ? 80 : dist <= 30 ? 110 : dist <= 40 ? 130 : 210;
          // Sumamos los $5 fijos de Flety + el Profit dinámico
          cost = base + currentProfit;

        } else if (providerData.id.includes('yummy')) {
          const yummyData = yummyApiPrices.find(
            s =>
              (providerData.id === 'yummy_moto' && s.typename.includes('Mandaditos')) ||
              (providerData.id === 'yummy_carro' && s.typename === 'Mandaditos XL'),
          );
          // Tarifa de la API de Yummy + Profit dinámico
          cost = yummyData ? yummyData.estimated_fare + currentProfit : currentProfit;

        } else {
          // Fallback para otros proveedores configurables
          cost = (providerData.base || 0) + currentProfit + dist * (providerData.rate || 0);
        }
      }
    }

    const originLabel = origin ? getFriendlyStoreName(origin.fullData || origin) : 'Tienda IVOO';
    const destLabel = addressText && addressText.length > 20 ? addressText.substring(0, 20) + '...' : addressText || 'Ubicación Cliente';

    const originFull = `Origen: ${originLabel}`;
    const destFull = `Destino: ${destLabel}`;
    const combined = `${originFull} | ${destFull}`;

    const { providerMaxDim, providerMaxWeight, providerMinWeight } = getProviderConstraints(selectedProvider);

    // OBTENEMOS EL SERVICIO SELECCIONADO PARA EXTRAER LOS IDS DE MONGODB
    const selectedYummyService = yummyApiPrices.find((s: any) =>
      (selectedProvider === 'yummy_moto' && s.typename?.toLowerCase().includes('mandaditos')) ||
      (selectedProvider === 'yummy_carro' && s.typename?.toLowerCase().includes('xl'))
    );

    // 2. DEBUG: Mira tu consola al seleccionar el transporte
    if (selectedProvider?.includes('yummy')) {
      console.log("--- YUMMY SELECTION DEBUG ---");
      console.log("Typename en API:", selectedYummyService?.typename);
      console.log("ID en API:", selectedYummyService?.id);
      console.log("ServiceTypeId en API:", selectedYummyService?.serviceTypeId);
    }

    const payload = {
      store: origin,
      destination: destination,
      address: addressText,
      distance: routeInfo.distance,

      sourceAddress: origin?.fullData?.street || origin?.fullData?.address || origin?.name || 'Tienda IVOO',
      storeFullName: origin?.name || 'Ivoo Valencia',
      destinationAddress: addressText,

      // FIX: Intentamos capturar el ID de MongoDB de cualquiera de las dos llaves posibles
      quotationId: selectedYummyService?.quotationId || '',
      serviceTypeId: selectedYummyService?.service_type_id || selectedYummyService?.id || '',
      providerId: selectedProvider,

      provider: providerName,
      service_type: service_type,
      cost: parseFloat(cost.toFixed(2)),
      isMusculito: (selectedProvider === 'ivoo_programado' || selectedProvider === 'ivoo_moto') ? isMusculito : false,
      confirmed: true,

      apiData: isApiShipment ? {
        tipo_servicio: 'NACIONAL',
        modalidad: 'DOMICILIO',
        customer_address: addressText,
        lat: destination?.latitude,
        lng: destination?.longitude,
        store_id: origin?.fullData?.pickup_location_code,
      } : null,

      destination_address: {
        type: 'DELIVERY',
        name: null,
        address_line1: addressText,
        city: destination?.city || null,
        state: destination?.state || null,
        country: destination?.country || null,
        postal_code: destination?.postal_code || null,
        lat: destination?.latitude,
        lng: destination?.longitude,
      },

      deliveryType,
      isApiShipment,
      maxDim: providerMaxDim,
      maxWeight: providerMaxWeight,
      minWeight: providerMinWeight,

      deliveryMetrics: {
        missingData: deliveryMetrics.missingData,
        invalidItems: deliveryMetrics.invalidItems,
        totalWeight: currentWeight,
        dimensions: {
          largo: currentDimensions.x,
          ancho: currentDimensions.y,
          alto: currentDimensions.z,
        },
        totalVolumen: deliveryMetrics.totalVolumen,
      },

      pickupPersonName: originFull,
      pickupPersonId: destFull,
      pickupPersonPhone: ' ',
      name: originFull,
      dni: destFull,
      identification: destFull,
      receiverName: originFull,
      receiverId: destFull,
      authorizedPerson: originFull,
      authorizedPersonId: destFull,
      other: combined,
      reference: combined,
      instructions: combined,
      notes: combined,
    };

    if (selectedProvider?.includes('yummy')) {
      console.log(`[YUMMY_SYNC] Prov: ${selectedProvider} | Quotation: ${selectedYummyService?.quotationId || 'VACIO'} | ServiceType: ${payload.serviceTypeId}`);
    }

    const payloadString = JSON.stringify(payload);

    if (payloadString !== lastSentData.current) {
      lastSentData.current = payloadString;
      onChange(payload);
    }
  }, [
    deliveryType,
    isMusculito,
    selectedProvider,
    activeConfig,
    mrwPrice,
    routeInfo,
    destination,
    origin,
    addressText,
    yummyApiPrices,
    cartTotal,
    onChange,
    deliveryMetrics.missingData,
    deliveryMetrics.invalidItems,
    deliveryMetrics.totalVolumen,
    currentWeight,
    currentDimensions.x,
    currentDimensions.y,
    currentDimensions.z,
  ]);

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View
        style={[
          styles.tabs,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6' },
        ]}>
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.tabBtn,
            deliveryType === 'express' && [
              styles.tabActive,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : '#FFFFFF' },
            ],
          ]}
          onPress={() => setDeliveryType('express')}>
          <Text
            style={[
              styles.tabTxt,
              { color: isDark ? 'rgba(255,255,255,0.6)' : '#6B7280' },
              deliveryType === 'express' && {
                color: Colors.Green,
                fontWeight: '700',
              },
            ]}>
            Delivery Express
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.tabBtn,
            deliveryType === 'free' && [
              styles.tabActive,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : '#FFFFFF' },
            ],
          ]}
          onPress={() => setDeliveryType('free')}>
          <Text
            style={[
              styles.tabTxt,
              { color: isDark ? 'rgba(255,255,255,0.6)' : '#6B7280' },
              deliveryType === 'free' && {
                color: Colors.Green,
                fontWeight: '700',
              },
            ]}>
            Delivery
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.inputSection,
          {
            backgroundColor: surface,
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB',
          },
        ]}>
        <TouchableOpacity
          style={styles.inputRow}
          onPress={() => setShowStoreModal(true)}>
          <Icon
            name="box"
            size={18}
            color={Colors.Green}
            style={styles.inputIcon}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.labelTiny, { color: text }]}>
              ORIGEN (TIENDAS IVOO)
            </Text>
            <Text style={[styles.inputText, { color: text }]} numberOfLines={1}>
              {loadingGps
                ? 'Cargando...'
                : origin
                  ? getFriendlyStoreName(origin.fullData || origin)
                  : 'Seleccionar...'}
            </Text>
          </View>
          <Icon name="chevron-down" size={20} color="#999" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <View style={styles.searchRowContainer}>
          <Icon
            name="map-pin"
            size={18}
            color="#EF4444"
            style={styles.inputIcon}
          />

          <View
            style={{
              flex: 1,
              zIndex: 9999,
              elevation: 1000,
              overflow: 'visible',
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 2,
              }}>

              <Text style={[styles.labelTiny, { color: text }]}>DESTINO</Text>

              <TouchableOpacity
                onPress={handleGpsPress}
                style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon
                  name="crosshair"
                  size={12}
                  color={Colors.Green}
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.gpsTextBtn}>Mi Ubicación actual</Text>
              </TouchableOpacity>
            </View>

            <GooglePlacesAutocomplete
              ref={placesRef}
              placeholder="Escribe tu dirección exacta..."
              debounce={300}
              enablePoweredByContainer={false}
              fetchDetails={true}
              keyboardShouldPersistTaps="always"
              listUnderlayColor={text}
              preProcess={data => {
                if (!data || !data.predictions) return data;

                const forbidden = [
                  'nueva esparta',
                  'margarita',
                  'porlamar',
                  'pampatar',
                  'juan griego',
                ];

                const filteredPredictions = data.predictions.filter(
                  prediction => {
                    const description = prediction.description.toLowerCase();
                    return !forbidden.some(word => description.includes(word));
                  },
                );

                return {
                  ...data,
                  predictions: filteredPredictions,
                };
              }}
              textInputProps={{
                value: addressText,
                onChangeText: t => {
                  setAddressText(t);
                  setTextSelection(undefined);
                },
                onFocus: () => setTextSelection(undefined),
                selection: textSelection,
                placeholderTextColor: isDark
                  ? 'rgba(255,255,255,0.45)'
                  : '#9CA3AF',
                selectionColor: Colors.Green,
                cursorColor: Colors.Green,
                numberOfLines: 1,
                textAlign: 'left',
              }}
              onPress={(data, details = null) => {
                if (details) {

                  const detailsExtra = getAddressDetail(details);

                  const loc = {
                    latitude: details.geometry.location.lat,
                    longitude: details.geometry.location.lng,
                    city: detailsExtra.city,
                    municipality: detailsExtra.municipality,
                    state: detailsExtra.state,
                    postal_code: detailsExtra.postal_code,
                    country: detailsExtra.country,
                  };


                  setAddressText(data.description);

                  setDestination(loc);

                  if (origin) {
                    fitMap(origin, loc);
                  }
                }
              }}
              query={{
                key: GOOGLE_API_KEY,
                language: 'es',
                components: 'country:ve',
                location: origin
                  ? `${origin.latitude},${origin.longitude}`
                  : undefined,
                radius: '50000',
              }}
              styles={{
                container: { flex: 0 },
                textInputContainer: {
                  backgroundColor: 'transparent',
                  borderTopWidth: 0,
                  borderBottomWidth: 0,
                  paddingHorizontal: 0,
                  paddingVertical: 0,
                  marginTop: 0,
                  marginBottom: 0,
                },
                textInput: {
                  height: 22,
                  color: text,
                  fontSize: 14,
                  fontWeight: '600',
                  marginTop: 0,
                  paddingTop: 0,
                  paddingBottom: 0,
                  paddingLeft: 0,
                  backgroundColor: 'transparent',
                  includeFontPadding: false,
                  textAlignVertical: 'center',
                },
                listView: {
                  position: 'absolute',
                  top: 35,
                  left: 0,
                  right: 0,
                  backgroundColor: surface,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  zIndex: 9999,
                  elevation: 1000,
                  overflow: 'hidden',
                },
                row: { padding: 0, height: 55, backgroundColor: surface },
                separator: { height: 1, backgroundColor: '#F3F4F6' },
                description: { color: text },
              }}
              renderRow={data => (
                <View style={styles.customRow}>
                  <View style={styles.pinIconBg}>
                    <Icon name="map-pin" size={16} color={Colors.Green} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowMainText, { color: text }]}>
                      {data.structured_formatting?.main_text || data.description}
                    </Text>
                    <Text
                      style={[
                        styles.rowSubText,
                        { color: isDark ? 'rgba(255,255,255,0.6)' : '#6B7280' },
                      ]}>
                      {data.structured_formatting?.secondary_text || ''}
                    </Text>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      </View>

      <View
        style={[
          styles.mapContainer,
          {
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#cbcdd1',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB',
          },
        ]}>
        <MapView
          ref={mapRef}
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
          }}
          initialRegion={{
            latitude: 10.2443,
            longitude: -67.9944,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}>
          {origin?.latitude && (
            <Marker
              coordinate={{
                latitude: parseFloat(origin.latitude),
                longitude: parseFloat(origin.longitude),
              }}
              title={origin.name}
              pinColor={Colors.Green}
            />
          )}
          {destination?.latitude && (
            <Marker
              draggable
              coordinate={{
                latitude: parseFloat(destination.latitude),
                longitude: parseFloat(destination.longitude),
              }}
              title="Tu ubicación de entrega"
              pinColor="red"
              onDragEnd={e => {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                getAddressFromCoords(latitude, longitude);
              }}
            />
          )}

          {origin && destination && (
            <MapViewDirections
              origin={origin}
              destination={destination}
              apikey={GOOGLE_API_KEY}
              strokeWidth={4}
              strokeColor={Colors.Green}
              onReady={result => {
                if (Math.abs(result.distance - routeInfo.distance) > 0.01) {
                  setRouteInfo({
                    distance: result.distance,
                    duration: result.duration,
                  });
                }

                dispatch(ISAddressONCart(true));
                dispatch(isNeedtoUpdatePAYDATA(true));
              }}
              onError={err => {
                console.log('MapViewDirections error:', err);
              }}
            />
          )}
        </MapView>
      </View>


      {/* add Rfusco */}
      <View style={[styles.optionsContainer, { backgroundColor: surface, borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB' }]}>
        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator color={Colors.Green} size="large" />
            <Text style={{ marginTop: 10, color: text, fontSize: 12 }}>Sincronizando proveedores...</Text>
          </View>
        ) : !destination ? (
          /* MENSAJE: DESTINO REQUERIDO (Ahora con estilo Warning Rojo) */
          <View style={{ padding: 10 }}>
            <View style={styles.warningBox}>
              <Icon name="map" size={22} color="#B91C1C" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.warningText}>Destino requerido</Text>
                <Text style={[styles.boxSubText, { color: '#B91C1C' }]}>
                  Ingresa una dirección de destino para calcular las rutas de entrega disponibles.
                </Text>
              </View>
            </View>
          </View>
        ) : availableProviders.length === 0 ? (
          /* ESTADO 2: DISTANCIA EXCEDIDA */
          <View style={{ padding: 10 }}>
            <View style={styles.warningBox}>
              <Icon name="alert-triangle" size={22} color="#B91C1C" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.warningText}>Sin cobertura para esta zona</Text>
                <Text style={{ color: '#B91C1C', fontSize: 11, marginTop: 2 }}>
                  La distancia actual ({routeInfo.distance.toFixed(1)} km) excede los límites permitidos.
                  Selecciona una ubicación más cercana.
                </Text>
              </View>
            </View>
          </View>
        ) : (
          /* ESTADO 3: LISTA DE PROVEEDORES */
          <View>
            <Text style={[styles.sectionTitle, { color: text }]}>Transportes disponibles:</Text>
            {availableProviders.map(p => {
              const isSelected = selectedProvider === p.id;
              const settings = activeConfig ? activeConfig[p.id] : DELIVERY_CONFIG[p.id];
              const dist = routeInfo.distance;

              const yummyData = yummyApiPrices?.find(s =>
                (p.id === 'yummy_moto' && s.typename?.toLowerCase().includes('mandaditos')) ||
                (p.id === 'yummy_carro' && s.typename?.toLowerCase().includes('xl'))
              );

              const yummyBase = yummyData?.estimated_fare || 0;
              const finalPrice = calculateProviderCost(p.id, dist, yummyBase, activeConfig);

              let timeLabel = "";
              if (p.id === 'ivoo_moto') timeLabel = "~30 min";
              else if (p.id.includes('flety')) timeLabel = "~30-60 min";
              else if (p.id.includes('yummy')) timeLabel = yummyEta ? `~${yummyEta} min` : "...";
              else timeLabel = p.etaLabel || "Hoy";

              const isFreeNow = (finalPrice === 0 && settings?.is_free);

              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.providerCard, isSelected && { borderColor: Colors.Green, backgroundColor: isDark ? 'rgba(4,136,156,0.18)' : '#F0FDF4' }]}
                  onPress={() => setSelectedProvider(p.id)}
                >
                  <Image source={p.image} style={styles.musculoLogo} resizeMode="contain" />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.provName, { color: text }]}>{p.name}</Text>
                    <Text style={{ color: '#6B7280', fontSize: 11 }}>{timeLabel}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.priceText, { color: isFreeNow ? Colors.Green : (isSelected ? Colors.Green : text) }]}>
                      {isFreeNow ? 'GRATIS' : `$${finalPrice.toFixed(2)}`}
                    </Text>
                    {isFreeNow && <Text style={{ fontSize: 8, color: Colors.Green, fontWeight: '800' }}>PROMO IVOO</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
      {/* End Rfusco */}

      <Modal visible={showStoreModal} animationType="slide" transparent>
        <View
          style={[
            styles.modalOverlay,
            { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)' },
          ]}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: bg,
                borderWidth: isDark ? 1 : 0,
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'transparent',
              },
            ]}>
            <Text style={[styles.modalTitle, { color: text }]}>
              Tiendas Disponibles
            </Text>
            <FlatList
              data={sortedStores}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => {
                const distLabel = item.distance ? `${item.distance.toFixed(1)} km` : '';

                // add Frodriguez
                const name = getFriendlyStoreName(item);
                // end Frodriguez

                const isSelected =
                  origin?.fullData?.pickup_location_code ===
                  item.pickup_location_code;

                return (
                  <TouchableOpacity
                    style={[
                      styles.storeOption,
                      {
                        borderBottomColor: isDark
                          ? 'rgba(255,255,255,0.06)'
                          : '#F9FAFB',
                      },
                      isSelected && {
                        backgroundColor: isDark
                          ? 'rgba(4,136,156,0.12)'
                          : '#F0FDF4',
                        borderRadius: 8,
                      },
                    ]}
                    onPress={() => selectOrigin(item)}>
                    <View style={styles.iconCircle}>
                      <Icon name="box" size={20} color={Colors.Green} />
                    </View>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={[styles.storeOptionTitle, { color: text }]}>
                        {name}
                      </Text>
                      <Text
                        style={[
                          styles.storeOptionSub,
                          { color: isDark ? 'rgba(255,255,255,0.6)' : '#6B7280' },
                        ]}>
                        {item.street}
                      </Text>
                      <Text style={styles.distText}>📍 {distLabel}</Text>
                    </View>
                    {isSelected && (
                      <Icon name="check" size={20} color={Colors.Green} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity
              style={[
                styles.closeBtn,
                {
                  backgroundColor: Colors.Green,
                  borderWidth: isDark ? 1 : 0,
                  borderColor: isDark
                    ? 'rgba(255,255,255,0.10)'
                    : 'transparent',
                },
              ]}
              onPress={() => setShowStoreModal(false)}>
              <Text style={{ color: text, fontWeight: 'bold' }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* add Frodriguez */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Sincronizando dirección...</Text>
        </View>
      )}
      {/* end Frodriguez */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 15,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: { backgroundColor: '#FFFFFF' },
  tabTxt: { color: '#6B7280', fontWeight: '600', fontSize: 13 },
  tabTxtActive: { color: Colors.Green, fontWeight: '700' },

  inputSection: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 15,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },

  searchRowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 8,
    paddingBottom: 4,
    zIndex: 9999,
    elevation: 5,
  },
  inputIcon: { marginRight: 10, width: 24, textAlign: 'center', marginTop: 6 },

  labelTiny: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  inputText: { fontSize: 14, color: '#1F2937', fontWeight: '600' },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 5,
    marginLeft: 34,
  },

  gpsTextBtn: {
    color: Colors.Green,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  truckLogo: { width: 75, height: 75, marginRight: 16, alignSelf: 'center' },
  musculoLogo: { width: 55, height: 55, marginRight: 16, alignSelf: 'center' },

  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    width: '100%',
  },
  pinIconBg: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  rowMainText: { fontWeight: '600', color: '#1F2937', fontSize: 14 },
  rowSubText: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  map: {
    width: '100%',
    height: '100%',
  },

  mapContainer: {
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    backgroundColor: '#cbcdd1',
  },
  optionsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 8,
  },
  provName: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  provTime: { fontSize: 12, color: '#6B7280' },
  freeText: { fontSize: 16, fontWeight: '800', color: Colors.Green },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  switchTitle: { fontSize: 14, fontWeight: '700', color: '#374151' },
  switchSub: { fontSize: 12, color: '#9CA3AF' },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 8,
  },
  providerSelected: { borderColor: Colors.Green, backgroundColor: '#F0FDF4' },
  priceText: { fontSize: 16, fontWeight: '800', color: '#1F2937' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 15,
    color: '#111827',
    textAlign: 'center',
  },
  storeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  storeOptionSelected: { backgroundColor: '#F0FDF4', borderRadius: 8 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeOptionTitle: { fontWeight: '700', fontSize: 14, color: '#1F2937' },
  storeOptionSub: { fontSize: 12, color: '#6B7280' },
  distText: {
    fontSize: 11,
    color: Colors.Green,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    marginTop: 15,
    backgroundColor: '#1F2937',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },

  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    alignItems: 'center',
  },
  warningText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  emptyStateText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },

  // add Frodriguez
  emptyStateBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
  },

  loadingOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(17,24,39,0.92)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },



  // Cuadro Verde (Información - IDÉNTICO AL ROJO)
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#030403', // Verde claro corporativo
    padding: 15,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: Colors.Green,
    alignItems: 'center',
    marginVertical: 5,
  },
  infoText: {
    color: Colors.Green,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  // Estilo para el texto descriptivo pequeño dentro de los cuadros
  boxSubText: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
    lineHeight: 15,
  },
  // end Frodriguez
});
