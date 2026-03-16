import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, Platform, PermissionsAndroid, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Feather';
import Geolocation from 'react-native-geolocation-service';
import { useMutation, useLazyQuery } from '@apollo/client';
import { useDispatch, useSelector } from 'react-redux';

// --- QUERIES Y ACCIONES ORIGINALES ---
import {
    setPickupddressesOnCart,
    PickupShippingMethod,
    getDeliveryTime,
    setDeliveryTime
} from '../../../Queries/queries';
import { ISAddressONCart } from './../../../redux/CheckoutCacheReducer/CheckoutCacheAction';
import { isNeedtoUpdatePAYDATA } from './../../../redux/PaymentMethodsReducers/PaymentMethodsAction';
import Colors from '../../../Utils/Colors';
import Helper from '../../../Utils/Helper';
import { AppContext } from '../../AppContext';

interface Props {
    onChange: (data: any) => void;
    stores: any[];
    cartId: string; // Recibido desde Checkout.tsx
}

export const PickupForm: React.FC<Props> = ({ onChange, stores, cartId }) => {
    const dispatch = useDispatch();
    const global_data = useSelector((state: any) => state.commonReducer);

    const [sortedStores, setSortedStores] = useState<any[]>([]);
    const [selectedStore, setSelectedStore] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // --- MUTACIONES (Copiadas de PickUpPointSelection) ---
    //const [setship] = useMutation(setPickupddressesOnCart);
    const [setPickupShippingMethod] = PickupShippingMethod();
    const [getAvailableSlot, { data: timeSlotData }] = useLazyQuery(getDeliveryTime);
    const [setDateTime] = setDeliveryTime();
    const [setship] = setPickupddressesOnCart();


    //add Frodriguez
    const { appTheme, themeName } = useContext(AppContext);
    const isDark = themeName === 'dark';

    const bg = appTheme.background;
    const surface = appTheme.InputBoxBGColor;
    const text = appTheme.text;
    //end Frodriguez

    // --- LÓGICA DE PERSISTENCIA (Sustituye a selectPickupPoint) ---
    const handleStoreSelect = async (store: any) => {
        setLoading(true);
        try {
            const enrichedStore = {
                ...store,
                name: `IVOO ${store.city || store.pickup_location_code}`,
                pickup_location_code: store.pickup_location_code
            };

            // 1. Guardar dirección de Pickup (Lógica idéntica al modal original)
            await setship({
                variables: {
                    cID: cartId,
                    pickup_location_code: enrichedStore.pickup_location_code,
                    fName: global_data.Fname,
                    lName: global_data.Lname,
                    telephone: global_data.phone,
                    street: [enrichedStore.street],
                    city: enrichedStore.city,
                    postcode: enrichedStore.postcode,
                    country: enrichedStore.country_id || "VE"
                }
            });

            // 2. Setear Método de Envío Pickup (Activa los métodos de pago)
            await setPickupShippingMethod({
                variables: { cart_id: cartId }
            });

            // 3. Notificar a Redux para desbloquear Checkout
            dispatch(ISAddressONCart(true));
            dispatch(isNeedtoUpdatePAYDATA(true));

            // 4. Cargar slots de tiempo (Como hacía el modal)
            getAvailableSlot();

            setSelectedStore(enrichedStore);
            setShowModal(false);

            // Notificar al componente ShippingMethod
            onChange({
                store: enrichedStore,
                cost: 0,
                method: 'pickup'
            });

            Helper.HandleVibration();
        } catch (error) {
            console.error("Error en proceso de pickup:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- GEOLOCALIZACIÓN Y DISTANCIA ---
    useEffect(() => {
        const initSort = async () => {
            if (Platform.OS === 'android') {
                await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
            }
            Geolocation.getCurrentPosition(
                (pos) => {
                    const uLat = pos.coords.latitude;
                    const uLng = pos.coords.longitude;
                    if (stores && stores.length > 0) {
                        const sorted = stores.map(store => ({
                            ...store,
                            distance: getLinearDistance(uLat, uLng, parseFloat(store.latitude), parseFloat(store.longitude))
                        })).sort((a, b) => a.distance - b.distance);
                        setSortedStores(sorted);
                        // Selección inicial automática de la más cercana
                        if (!selectedStore && sorted.length > 0) handleStoreSelect(sorted[0]);
                    }
                },
                () => {
                    setSortedStores(stores);
                    if (!selectedStore && stores.length > 0) handleStoreSelect(stores[0]);
                },
                { enableHighAccuracy: true, timeout: 15000 }
            );
        };
        initSort();
    }, [stores]);

    const getLinearDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: text }]}>Punto de Retiro</Text>
            <TouchableOpacity
                style={[styles.selectButton, loading && { opacity: 0.7 }, {
                    backgroundColor: surface,
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB',
                },]}
                onPress={() => !loading && setShowModal(true)}
                disabled={loading}
            >
                <View style={styles.iconBg}>
                    {loading ? <ActivityIndicator size="small" color={Colors.Green} /> : <Icon name="map-pin" size={20} color={Colors.Green} />}
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={[styles.selectLabel, { color: text }]}>Tienda Seleccionada:</Text>
                    <Text style={[styles.selectValue, { color: text }]} numberOfLines={1}>
                        {selectedStore ? selectedStore.name : "Cargando tienda cercana..."}
                    </Text>
                </View>
                <Icon name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>

            {/* Mini Mapa Estático */}
            {selectedStore && (
                <View style={styles.miniMapContainer}>
                    <MapView
                        style={StyleSheet.absoluteFill}
                        region={{
                            latitude: parseFloat(selectedStore.latitude),
                            longitude: parseFloat(selectedStore.longitude),
                            latitudeDelta: 0.01, longitudeDelta: 0.01,
                        }}
                        scrollEnabled={false} zoomEnabled={false}
                    >
                        <Marker coordinate={{ latitude: parseFloat(selectedStore.latitude), longitude: parseFloat(selectedStore.longitude) }} pinColor={Colors.Green} />
                    </MapView>
                </View>
            )}

            {/* Modal Reemplaza a PickUpPointSelection */}
            <Modal visible={showModal} animationType="slide" transparent>
                <View style={[
                    styles.modalOverlay,
                    { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)' },
                ]}>
                    <View style={[
                        styles.modalContent,
                        {
                            backgroundColor: bg,
                            borderWidth: isDark ? 1 : 0,
                            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'transparent',
                        },
                    ]}>
                        <Text style={[
                            styles.modalTitle,
                            { color: text },
                        ]}>Sucursales IVOO</Text>
                        <FlatList
                            data={sortedStores}
                            keyExtractor={(item) => item.pickup_location_code}
                            renderItem={({ item }) => {
                                const isSel = selectedStore?.pickup_location_code === item.pickup_location_code;
                                return (
                                    <TouchableOpacity
                                        style={[
                                            styles.storeOption,
                                            {
                                                borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#F9FAFB',
                                            },
                                            isSel && {
                                                backgroundColor: isDark ? 'rgba(4,136,156,0.12)' : '#F0FDF4',
                                                borderRadius: 8,
                                            },
                                        ]}
                                        onPress={() => handleStoreSelect(item)}
                                    >
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.storeName, { color: text }]}>{`IVOO ${item.city}`}</Text>
                                            <Text style={styles.storeAddress}>{item.street}</Text>
                                        </View>
                                        {item.distance && <Text style={styles.distText}>📍 {item.distance.toFixed(1)} km</Text>}
                                    </TouchableOpacity>
                                )
                            }}
                        />
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setShowModal(false)}>
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};



const styles = StyleSheet.create({
    container: { marginTop: 10 },
    label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 8 },

    selectButton: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E7EB',
        borderRadius: 12, padding: 12, marginBottom: 15
    },
    iconBg: { backgroundColor: '#F0FDF4', padding: 8, borderRadius: 8 },
    selectLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase' },
    selectValue: { fontSize: 15, color: '#1F2937', fontWeight: '600' },

    // MAPA ESTILOS
    miniMapContainer: { height: 120, borderRadius: 12, overflow: 'hidden', marginBottom: 10, backgroundColor: '#eee' },
    mapOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.9)', padding: 8 },
    mapText: { fontSize: 11, color: '#333', textAlign: 'center' },

    stockBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', padding: 10, borderRadius: 8, marginBottom: 15 },
    stockText: { fontSize: 12, color: '#166534', fontWeight: '700', marginLeft: 8 },

    divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 15 },

    switchContainer: { flexDirection: 'row', backgroundColor: '#F3F4F6', padding: 4, borderRadius: 10, marginBottom: 15 },
    switchBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
    switchActive: { backgroundColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    switchTxt: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
    switchTxtActive: { color: '#111827' },

    form: { gap: 10 },
    input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, height: 45, paddingHorizontal: 12, color: '#111827' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '70%' },
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 15, textAlign: 'center' },
    storeOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    storeOptionSelected: { backgroundColor: '#F0FDF4', paddingHorizontal: 5, borderRadius: 8 },
    storeName: { fontSize: 15, fontWeight: '700', color: '#374151' },
    storeAddress: { fontSize: 12, color: '#9CA3AF' },
    distText: { fontSize: 11, color: Colors.Green, fontWeight: '700' },
    closeBtn: { marginTop: 15, backgroundColor: Colors.Green, padding: 15, borderRadius: 12, alignItems: 'center' }
});