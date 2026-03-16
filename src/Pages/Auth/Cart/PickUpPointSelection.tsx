import MapView, { Marker, PROVIDER_GOOGLE, } from 'react-native-maps';
import { useLazyQuery } from '@apollo/client'
import { useNavigation } from '@react-navigation/native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { View, Text, Image, TouchableOpacity, TouchableHighlight, FlatList, StatusBar, SafeAreaView, ScrollView, StyleSheet, Dimensions, Animated, Platform, KeyboardAvoidingView, Keyboard } from 'react-native'
import commonStyle from '../../../../commonStyle'
import CustomPBar from '../../../Components/CustomPBar'
import ProgressiveImage from '../../../Components/ProgressiveImage'
import { useDispatch, useSelector } from 'react-redux'
import { useNetInfo } from "@react-native-community/netinfo";
import {
    getPickUpPoints,
    setPickupddressesOnCart,
    PickupShippingMethod,
    getDeliveryTime,
    setDeliveryTime
} from '../../../Queries/queries'
import { useCustomer } from '../../../Services/useCustomer'
import ResImage from '../../../Utils/Image'
import colorResource from '../../../Utils/Colors'
import { Icon, SearchBar } from 'react-native-elements'

import { translate } from '../../../locales';
import { CustomButton } from '../../../Components/CustomButton';

import Helper from '../../../Utils/Helper';
import Carousel from 'react-native-snap-carousel';
import { AppContext } from '../../AppContext';
import { ISCHECKOUTCacheUpdated, ISAddressONCart } from './../../../redux/CheckoutCacheReducer/CheckoutCacheAction';
import { isNeedtoUpdatePAYDATA } from './../../../redux/PaymentMethodsReducers/PaymentMethodsAction';

const { width, height } = Dimensions.get( 'window' );
const CARD_HEIGHT = 100;
const CARD_WIDTH = width * 0.8;

const PickUpPointSelection = ( props ) =>
{
    const { appTheme } = useContext( AppContext );
    const [isDark, setDark] = useState( appTheme.type === 'dark' );
    const dispatch = useDispatch()
    useEffect( () =>
    {
        setDark( appTheme.type === 'dark' )
    }, [appTheme.type] )
    const global_data = useSelector( ( state: any ) => state.commonReducer );
    const [data, setData] = useState( props.data )
    const [setship, { loading: aLoading, error: aError, data: aData }] = setPickupddressesOnCart();
    const [selectedShip, setselectedShip] = useState( null );
    const [isListView, setisListView] = useState( true )
    const [cdID, setCartId] = useState( props.cartId );
    const [setPickupShippingMethod, { loading: pickupLoading, error: pickupError, data: pickupData }] = PickupShippingMethod();
    const [keyboardStatus, setKeyboardStatus] = useState( false );
    const [getAvailableSlot, { loading:slotLoading, error:dateTimeError, data:timeSlotData }] = useLazyQuery( getDeliveryTime );
    const [setDateTime, { loading: slotSaveApiLoading, error: dateTimeApiError, data: datetimeApiResponse }] = setDeliveryTime();

    const SPACING_FOR_CARD_INSET = width * 0.1 - 10;
    const ASPECT_RATIO = width / height;
    let LATITUDE: any;
    let LONGITUDE: any;
    let LATITUDE_DELTA = 0.01;
    let LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
    // const _scrollView = React.useRef(null);

    let mapIndex = 0;
    let mapAnimation = new Animated.Value( 0 );
    const _map = React.useRef( null );
    var _carousel: any = useRef( null )

    useEffect( () =>
    {
        mapAnimation.addListener( ( { value } ) =>
        {

            let index = Math.floor( value / CARD_WIDTH + 0.3 ); // animate 30% away from landing on the next item


            if ( index >= data.length )
            {
                index = data.length - 1;
                // console.log( 'slide lo', index )

            }
            if ( index <= 0 )
            {
                // console.log( 'slide Zero', index )
                index = 0;

            }
            // console.log( 'slideindex', index )
            const regionTimeout = setTimeout( () =>
            {
                if ( mapIndex !== index )
                {
                    mapIndex = index;
                    const latitude = data[index].latitude;
                    const longitude = data[index].longitude;

                    //  console.log( latitude )
                    // console.log(longitude)

                    setselectedShip( data[mapIndex] )

                    _map.current.animateToRegion(
                        {
                            latitude,
                            longitude,
                            latitudeDelta: LATITUDE_DELTA,
                            longitudeDelta: LONGITUDE_DELTA,
                        },
                        350
                    );
                }
            }, 10 );
            // clearTimeout( regionTimeout );
        } );
    } );

    const selectPickupPoint = () =>
    {
        Helper.HandleVibration();
        if ( selectedShip.country_id == "VE" )
        {
            setship(
                {
                    variables: {
                        cID: cdID,
                        pickup_location_code: selectedShip.pickup_location_code,
                        // fName: customerData.customer.firstName,
                        // lName: customerData.customer.lastName,
                        fName: global_data.Fname,
                        lName: global_data.Lname,
                        telephone: global_data.phone,
                        street: [selectedShip.street],
                        city: selectedShip.city,
                        postcode: selectedShip.postcode,
                        country: selectedShip.country_id
                    }
                }
            )

        } else
        {

            setship(
                {
                    variables: {
                        cID: cdID,
                        pickup_location_code: selectedShip.pickup_location_code,
                        // fName: customerData.customer.firstName,
                        // lName: customerData.customer.lastName,
                        fName: global_data.Fname,
                        lName: global_data.Lname,
                        telephone: global_data.phone,
                        street: [selectedShip.street],
                        city: selectedShip.city,
                        postcode: selectedShip.postcode,
                        region_id: selectedShip.region_id,
                        country: selectedShip.country_id
                    }
                }
            )

        }

        //setDeliveryDateAndTime();
    }

    //   Set Shipping API Error

    useEffect( () =>
    {
        aError && Helper.ShowAlert( `${ aError }` );
        pickupError && Helper.ShowAlert( `${ pickupError }` );
    }, [aError, pickupError] )


    useEffect( () =>
    {
        if ( aData )
        {
            //  console.log('setPickupShippingMethod')
            // console.log( JSON.stringify( aData ) )
            if ( aData.setShippingAddressesOnCart )
            {
                setPickupShippingMethod( {
                    variables: {
                        cart_id: cdID,
                    }
                } )


            }
        }
    }, [aData] )

    useEffect( () =>
    {
        if ( pickupData )
        {
            if ( pickupData.setShippingMethodsOnCart )
            {
                dispatch( ISAddressONCart( true ) )
                dispatch( isNeedtoUpdatePAYDATA( true ) )

                getAvailableSlot()
            }
        }
    }, [pickupData] )

    const toggleView = () =>
    {
        Helper.HandleVibration();
        setisListView( !isListView )
        if ( selectedShip || selectedShip == undefined )
        {
            return;
        }

        if ( data )
        {
            let CValue = selectedShip;

            CValue && CValue == undefined ? CValue = data[0] : console.log( 'had value' )
            // console.log( 'CValue', isListView )
            if ( !isListView )
            {

                setSearch( '' );
                setFilteredDataSource( [] )
                CValue = data[0]
                setselectedShip( CValue )
            } else
            {
                //  setselectedShip( data.items[0] )

                setTimeout( () =>
                {
                    let markerID = 0

                    CValue == undefined ? markerID = 0 : markerID = data.findIndex( data => data.pickup_location_code == CValue.pickup_location_code )
                    // console.log( CValue )
                    setselectedShip( CValue )

                    let x = ( markerID * CARD_WIDTH ) + ( markerID * 20 );
                    // if ( Platform.OS === 'ios' )
                    {
                        x = x - SPACING_FOR_CARD_INSET;
                    }
                    // console.log('x')
                    // console.log(x)
                    // _scrollView.current.scrollTo({ x: x, y: 0, animated: true });
                    let lat = CValue.latitude;
                    let lon = CValue.longitude;


                    _carousel.current && _carousel.current.snapToItem( markerID, true )

                    _map.current.animateToRegion(
                        {
                            lat,
                            lon,
                            latitudeDelta: LATITUDE_DELTA,
                            longitudeDelta: LONGITUDE_DELTA,
                        },
                        350
                    );
                }, 1000 );
            }
        }
    }

    const renderSearchItem = ( { item, index } ) =>
    {
        return renderSearchItemDom( item, index, data.length )
    };
    const deviceWidth: any = Dimensions.get( 'window' ).width;
    const renderSearchItemDom = ( item: any, index, cnt ) =>
    {
        if ( selectedShip == undefined )
        {
            return;
        }
        return (

            <TouchableOpacity key={index}
                style={{ justifyContent: 'center', alignContent: 'center', borderRadius: 16, flexDirection: 'column', marginBottom: index == cnt - 1 ? 100 : 0 }}
                onPress={() =>
                {
                    Helper.HandleVibration();
                    setselectedShip( item )
                }}>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 30, marginTop: 12, marginBottom: 11 }}>
                    <View style={styles.add_inner_container}>
                        <View style={[{ height: 48, width: 48, backgroundColor: isDark ? item.pickup_location_code == selectedShip.pickup_location_code ? 'rgba(0, 168, 107, 0.3)' : appTheme.InputBoxBGColor : 'rgba(0,168,107,0.06)', padding: 12, borderRadius: 16 }]}>
                            <ProgressiveImage source={selectedShip == undefined ? ResImage.ic_store : ( item.pickup_location_code == selectedShip.pickup_location_code ? ResImage.ic_Store_active : isDark ? ResImage.ic_store_new : ResImage.ic_store )} style={styles.type_icon} resizeMode="center" />
                        </View>
                        <Text style={[commonStyle.h5, styles.text_add_title, { marginTop: -22, color: selectedShip == undefined ? colorResource.blackText : ( item.pickup_location_code == selectedShip.pickup_location_code ? colorResource.Green : appTheme.text ) }]}>{`${ item.name }`}</Text>
                    </View>
                </View>
                <View style={[styles.container_address, { marginTop: -22 }]}>
                    <Text style={[styles.text_address_name, { paddingLeft: 10, color: selectedShip == undefined ? colorResource.Gray : ( item.pickup_location_code == selectedShip.pickup_location_code ? colorResource.Green : isDark ? appTheme.text : colorResource.Gray ) }]}>{item.street}, {item.postcode}</Text>
                    <Text style={[styles.text_address_name, { paddingLeft: 10, color: selectedShip == undefined ? colorResource.Gray : ( item.pickup_location_code == selectedShip.pickup_location_code ? colorResource.Green : isDark ? appTheme.text : colorResource.Gray ) }]}>{item.city}, {item.country_id}</Text>
                </View>
            </TouchableOpacity>
        );
    }


    const _renderCarouselItem = ( { item } ) => (
        <View key={Math.random()} style={[styles.card, { backgroundColor: appTheme.InputBoxBGColor }]} >
            <View style={[commonStyle.flexDir_Row]}>
                <Image style={{ height: 60, width: 60, margin: 12, borderRadius: 8, marginTop: 20 }} source={item.store_image ? { uri: item.store_image + '?width=200' } : ResImage.ic_Store_active} resizeMode="contain" resizeMethod="resize" />

                <View style={{ marginTop: 15 }}>
                    <Text style={[commonStyle.h5, commonStyle.fontBold, { color: selectedShip == undefined ? colorResource.blackShade : item.pickup_location_code.trim() == selectedShip.pickup_location_code.trim() ? colorResource.Green : colorResource.blackShade }]} >{`${ item.name }`}</Text>
                    <View style={styles.mapMarkerDetails_address}>
                        <Text numberOfLines={2} ellipsizeMode="tail" style={[styles.text_address_name, { color: selectedShip == undefined ? colorResource.Gray : item.pickup_location_code == selectedShip.pickup_location_code ? colorResource.Green : colorResource.Gray }]} >{item.street}, {item.postcode} {item.city}, {item.country_id}</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    useEffect( () =>
    {
        if ( data )
        {
            setselectedShip( data[0] )
        }
    }, [data] );
    let interpolations = null;

    if ( data )
    {
        if ( data.length > 0 )
        {
            // change here for manage selected addrress from list to map marker
            LATITUDE = data[0].latitude;
            LONGITUDE = data[0].longitude;
            LATITUDE_DELTA = LATITUDE_DELTA;
            LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
        }
        interpolations = data.map( ( marker, index ) =>
        {
            const inputRange = [
                ( index - 1 ) * CARD_WIDTH,
                index * CARD_WIDTH,
                ( ( index + 1 ) * CARD_WIDTH ),
            ];

            const scale = mapAnimation.interpolate( {
                inputRange,
                outputRange: [1, 1.5, 1],
                extrapolate: "clamp"
            } );

            return { scale };
        } )
    }

    const renderAddress = ( e, index ) =>
    {
        // renderAddress On Marker Click
        // LATITUDE = e.nativeEvent.coordinate.latitude;
        // LONGITUDE = e.nativeEvent.coordinate.longitude;
        // LATITUDE_DELTA = LATITUDE_DELTA;
        // LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

        // const markerID = e._targetInst.return.key;

        // let x = (markerID * CARD_WIDTH) + (markerID * 20);
        // if (Platform.OS === 'ios') {
        //     x = x - SPACING_FOR_CARD_INSET;
        // }
        // console.log('render')
        // _scrollView.current.scrollTo({ x: x, y: 0, animated: true });
    }

    const searchRef: any = useRef( null );
    const [filteredDataSource, setFilteredDataSource] = useState( [] );
    const [search, setSearch] = useState( '' );

    const searchFilterFunction = ( text ) =>
    {
        /// console.log( text )
        if ( text )
        {
            const newData = data.filter( function ( item )
            {
                const itemData = item.city
                    ? item.city.toUpperCase()
                    : ''.toUpperCase();
                const textData = text.toUpperCase();
                return itemData.indexOf( textData ) > -1;
            } );
            setFilteredDataSource( newData )
            filteredDataSource.length >= 0 && setselectedShip( newData[0] )
            setSearch( text );
        } else
        {
            setSearch( text );
            setFilteredDataSource( [] );
            setselectedShip( data[0] )
        }
    };


    useEffect( () =>
    {
        Keyboard.addListener( "keyboardDidShow", () => { setKeyboardStatus( true ) } );
        Keyboard.addListener( "keyboardDidHide", () => { setKeyboardStatus( false ) } );

        // cleanup function
        return () =>
        {
            Keyboard.addListener( "keyboardDidShow", () => { setKeyboardStatus( true ) } );
            Keyboard.addListener( "keyboardDidHide", () => { setKeyboardStatus( false ) } );
        };
    }, [] );


    useEffect(() => {
        console.log(timeSlotData);
        console.log("time error" + dateTimeError);

        dateTimeError && Helper.ShowAlertWithCallback(dateTimeError.message, {
            onPress: () => {
                Helper.HandleVibration();
                props.CloseBottomsheet(null)
            }
        });

        if(timeSlotData!=null){
            setDeliveryDateAndTime();
        }
    }, [dateTimeError, timeSlotData]);


    useEffect(() => {
        if (dateTimeApiError!=null && typeof dateTimeApiError!=undefined) {
            console.log("time slot saved response" + dateTimeApiError);
        }else if(datetimeApiResponse!=null && typeof datetimeApiResponse!=undefined){
            console.log("time slot saved response" + datetimeApiResponse);
            let filterData = data.filter( data => data.pickup_location_code == selectedShip.pickup_location_code )
            props.CloseBottomsheet( filterData[0] )
        }
    }, [dateTimeApiError, datetimeApiResponse]);

    const setDeliveryDateAndTime = () =>
    {
        //Helper.HandleVibration();
        setDateTime( {
            variables: {
                deliveryDate: timeSlotData.deliveryTime[0].date,
                deliveryFrom: timeSlotData.deliveryTime[0].slots[0].from,
                deliveryTo: timeSlotData.deliveryTime[0].slots[0].to,
            }
        } )

        console.log("time slot api called");

    }

    return <SafeAreaView style={[{ flex: 1, backgroundColor: appTheme.background }, isDark ? null : { borderTopLeftRadius: 24, borderTopRightRadius: 24, }]}>
        <View style={[styles.headerWrap, { alignItems: 'center', justifyContent: 'space-between' }]}>
            <View style={[styles.ButtonViewStyles]}>

                <TouchableHighlight onPress={() => { Helper.HandleVibration(); props.CloseBottomsheet( null ) }} underlayColor={colorResource.transparent} style={{ padding: 5 }}>
                    <Icon
                        name="times"
                        type="font-awesome-5" size={24}
                        color={isDark ? colorResource.white : colorResource.black}
                    />
                    {/* <Image source={ResImage.ic_close_modal} style={[commonStyle.he_wi_24]} /> */}

                </TouchableHighlight>
            </View>
            <View style={{ backgroundColor: 'transparent' }}>
                <Text style={[commonStyle.h5, { color: appTheme.text, padding: 8, textAlign: 'center' }]}>{translate( 'checkout.lbl_to_the_pickpoint' )}</Text>
            </View>
            <View style={[styles.ButtonViewStyles,]}>
                <TouchableHighlight onPress={() => { toggleView() }} underlayColor={colorResource.transparent} >
                    <ProgressiveImage source={isListView ? ( isDark ? ResImage.ic_mapview_new : ResImage.ic_mapview ) : ( isDark ? ResImage.ic_listview_new : ResImage.ic_listview )} style={{ width: 24, height: 24, marginRight: 8 }} resizeMode="stretch" />
                </TouchableHighlight>
            </View>
        </View>

        {
            data &&
            ( data.length == 0 ? <View style={{ flex: 1 }}>
                <Text style={[commonStyle.h5, { textAlign: 'center', marginTop: 120, color: appTheme.text }]}>
                    {translate( 'pickup.lbl_noPickup' )}
                </Text>
            </View> : null
            )}
        <KeyboardAvoidingView
            behavior={'height'}
        >
            {
                data &&
                ( data.length == 0 ? null :
                    <View>
                        {
                            isListView &&
                            <View style={[{ width: '100%', padding: 16, height: '100%' }]} >
                                <View style={{ marginBottom: 16 }}>
                                    <SearchBar
                                        placeholder={translate( 'search.lbl_search' )}
                                        returnKeyLabel={translate( 'search.lbl_search' )}
                                        ref={searchRef}
                                        searchIcon={{ type: 'font-awesome', name: 'search', color: isDark ? colorResource.white : colorResource.Gray }}
                                        clearIcon={{ type: 'font-awesome', name: 'close', color: isDark ? colorResource.white : colorResource.Gray }}
                                        onChangeText={( text ) => { searchFilterFunction( text ) }}
                                        value={search}
                                        containerStyle={{ backgroundColor: "transparent", borderTopWidth: 0, borderBottomWidth: 0, padding: 0 }}
                                        inputContainerStyle={{ backgroundColor: appTheme.InputBoxBGColor, borderRadius: 16, paddingStart: 10 }}
                                        placeholderTextColor={isDark ? appTheme.text : colorResource.Gray}
                                        inputStyle={{ textAlign: "left", color: appTheme.text }}
                                    />
                                </View>
                                {
                                    filteredDataSource && filteredDataSource.length <= 0 && <ScrollView  >
                                        <View style={{ flex: 1, marginBottom: 30 }}>
                                            {
                                                data.map( ( product, index ) =>
                                                {
                                                    return renderSearchItemDom( product, index, data.length )
                                                } )

                                                // <View>
                                                //     <FlatList
                                                //         data={data}
                                                //         renderItem={renderSearchItem}
                                                //         numColumns={1}
                                                //         style={{ flex: 1, marginBottom: 30 }} />
                                                // </View>
                                            }
                                        </View>
                                    </ScrollView>
                                }
                                {filteredDataSource.length > 0 && <View style={{ flex: 1 }}>
                                    <Text style={[commonStyle.h4, commonStyle.fontBold, { paddingBottom: 16, paddingLeft: 5, color: appTheme.text }]}> {translate( 'search.lbl_locationsearch' )}</Text>
                                    {
                                        data &&
                                        ( data.length == 0 ? <Text style={[commonStyle.h5, { marginTop: 20, color: appTheme.text }]}>{'No Pickup location found'}</Text>
                                            :
                                            <View style={{ flex: 1 }}>
                                                <FlatList
                                                    data={filteredDataSource}
                                                    renderItem={renderSearchItem}
                                                    numColumns={1}
                                                    style={{ flex: 1, marginBottom: 30 }} />
                                            </View> )
                                    }
                                </View>
                                }
                            </View>
                        }
                        {
                            !isListView && data && selectedShip &&
                            <View style={[{ width: '100%', height: '100%' }]} >
                                <MapView style={{ flex: 1 }}
                                    mapType={'hybrid'}
                                    showsBuildings={true}
                                    ref={_map}
                                    initialRegion={{
                                        latitude: LATITUDE,
                                        longitude: LONGITUDE,
                                        latitudeDelta: LATITUDE_DELTA,
                                        longitudeDelta: LONGITUDE_DELTA,
                                    }}
                                    provider={PROVIDER_GOOGLE}
                                >
                                    {
                                        data.map( ( marker, index ) =>
                                        {
                                            // const scaleStyle = {
                                            //     transform: [
                                            //         {
                                            //             scale: interpolations[index].scale,
                                            //         },
                                            //     ],
                                            // };

                                            return (
                                                marker.latitude && marker.longitude && selectedShip != undefined && <Marker key={index}
                                                    coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                                                    image={selectedShip.pickup_location_code === marker.pickup_location_code ? ResImage.ic_mappin_active : ResImage.ic_mappin_inactive}
                                                    style={{ zIndex: selectedShip.pickup_location_code === marker.pickup_location_code ? 1111 : 0 }}
                                                    onPress={( e ) => renderAddress( e, index )}>
                                                </Marker>
                                            );
                                        } )
                                    }
                                </MapView>

                                {
                                    <View style={{ position: 'absolute', bottom: 50 }}>
                                        <Carousel
                                            containerCustomStyle={{
                                                bottom: 110,
                                                height: 110
                                            }}
                                            ref={_carousel}
                                            keyExtractor={( item ) => item.pickup_location_code}
                                            data={data}
                                            renderItem={_renderCarouselItem}
                                            sliderWidth={deviceWidth}
                                            itemWidth={deviceWidth - deviceWidth * 0.16}
                                            itemHeight={300}
                                            inactiveSlideScale={1}
                                            removeClippedSubviews={false}
                                            onSnapToItem={( index ) =>
                                            {
                                                //setActiveSlide( index );
                                                Helper.HandleVibration();
                                                const regionTimeout = setTimeout( () =>
                                                {
                                                    const latitude = data[index].latitude;
                                                    const longitude = data[index].longitude;

                                                    setselectedShip( data[index] )

                                                    _map.current.animateToRegion(
                                                        {
                                                            latitude,
                                                            longitude,
                                                            latitudeDelta: LATITUDE_DELTA,
                                                            longitudeDelta: LONGITUDE_DELTA,
                                                        },
                                                        350
                                                    );
                                                }, 10 );
                                            }}
                                        />
                                    </View>
                                }
                            </View>
                        }
                    </View>
                )
            }
            {
                !keyboardStatus && data.length > 0 && <View style={{ width: '100%', paddingHorizontal: 16, backgroundColor: 'transparent', position: 'absolute', bottom: ( Platform.OS === 'ios' ) ? 75 : 90 }}>
                    <CustomButton
                        title="selectdelivery.lbl_send_point"
                        disabled={selectedShip == null}
                        onPress={() => selectPickupPoint()}
                        customButtonStyle={[
                            selectedShip != null
                                ? commonStyle.btn_primary
                                : commonStyle.btn_disabled,

                        ]}
                    />
                </View>
            }
        </KeyboardAvoidingView>
        <CustomPBar showProgress={aLoading || slotLoading || slotSaveApiLoading} />
    </SafeAreaView>
}

const styles = StyleSheet.create( {

    searchItem: { color: colorResource.Gray },
    mapMarkerDetails_address: {

        paddingRight: CARD_WIDTH - 210,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        paddingBottom: 12
    },
    type_icon: {
        width: 24,
        height: 24
    },
    bg_container: {
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignContent: 'center',
        borderRadius: 16,
        flexDirection: 'column',
        marginBottom: 24,

    },
    add_top_container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 30,
        margin: 16,
        marginTop: 12,
        marginBottom: 4,
        borderRadius: 16,

    },
    add_inner_container: {
        width: '80%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    text_add_title: {
        paddingLeft: 10,
        fontWeight: '700'
    },
    text_address_name: {
        color: colorResource.Gray,
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        lineHeight: 22,
        fontWeight: '400',
        paddingRight: 30
    },
    container_address: {
        paddingLeft: 48,
        paddingRight: 48,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        paddingBottom: 12,

    },
    headerWrap: {
        flexDirection: "row",
        paddingVertical: 10,
        paddingHorizontal: 10,
        width: "100%",
    },
    ButtonViewStyles: {
        width: 40,
        aspectRatio: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    shareViewStyles: {
        display: "flex",
        flex: .1,
        justifyContent: "flex-end",
        marginLeft: "auto",
        flexDirection: "row"
    },
    scrollView: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingVertical: 10,
    },
    card: {
        backgroundColor: colorResource.white,
        marginHorizontal: 10,
        shadowColor: colorResource.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        height: CARD_HEIGHT,
        width: CARD_WIDTH,
        overflow: "hidden",
        borderRadius: 16,
    },
} )

export default PickUpPointSelection
