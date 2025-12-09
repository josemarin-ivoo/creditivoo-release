import { useLazyQuery, useQuery } from '@apollo/client'
import { useNavigation, StackActions } from '@react-navigation/native'
import React, { useContext, useEffect, useState } from 'react'
import { View, Text, Image, TouchableOpacity, FlatList, StatusBar, SafeAreaView, ScrollView, StyleSheet, Button, BackHandler, TouchableHighlight, Dimensions, Platform } from 'react-native'
import commonStyle from '../../../../commonStyle'
import CustomPBar from '../../../Components/CustomPBar'
import { Layout } from '../../../Components/Layout'
import Helper from '../../../Utils/Helper'
import ProgressiveImage from '../../../Components/ProgressiveImage'
import { add, log } from 'react-native-reanimated'
import { DELETE_DATA, GLOBAL_DATA } from '../../../redux/actionTypes'
import { useSelector, useDispatch } from 'react-redux'
import { useNetInfo } from "@react-native-community/netinfo";
import { CustomButton } from '../../../Components/CustomButton';
import { translate } from '../../../locales';
import { getDeliveryTime, setDeliveryTime, DeliveryShippingMethod, PickupShippingMethod } from '../../../Queries/queries'
import CustomHeader from '../../../Components/CustomHeader'
import ResImage from '../../../Utils/Image'
import colorResource from '../../../Utils/Colors'
import Moment from 'moment';
import { Icon } from 'react-native-elements'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AppContext } from '../../AppContext'
import 'moment/src/locale/es'
import moment from 'moment'
import { DATETIMESLOTDATAAdd, ISDATETIMESLOTCacheUpdated } from './../../../redux/DateTimeSlotReducers/DateTimeSlotAction';
import { ISAddressONCart } from './../../../redux/CheckoutCacheReducer/CheckoutCacheAction';

const DateandTimeSelection = ( props ) =>
{

    const { appTheme } = useContext( AppContext );
    const dispatch = useDispatch()
    const [isDark, setDark] = useState( appTheme.type === 'dark' );
    useEffect( () =>
    {
        setDark( appTheme.type === 'dark' )
    }, [appTheme.type] )
    const [getAvailableSlot, { loading, error, data }] = useLazyQuery( getDeliveryTime );

    const [CachedDeliverySlots, setCachedDeliverySlots] = useState( null )

    const [setDateTime, { loading: slotLoading, error: slotError, data: slotData }] = setDeliveryTime();
    const [setDeliveryShippingMethod, { loading: dLoading, error: dError, data: dData }] = DeliveryShippingMethod();// if develivery order
    const [setPickupShippingMethod, { loading: pickupLoading, error: pickupError, data: pickupData }] = PickupShippingMethod();  // if pickup order

    const DateTimeSlotReducers = useSelector( ( state: any ) => state.DateTimeSlotReducers );
    const CheckoutCacheReducer = useSelector( ( state: any ) => state.CheckoutCacheReducer );

    const [selectedDate, setselectedDate] = useState( null );
    const [selectedSlot, setselectedSlot] = useState( null );
    const [cdID, setCartId] = useState( props.cartId );
    const [isPickup, setisPickup] = useState( props.isPickup );

    useEffect( () =>
    {
        if ( error )
        {
            error && Helper.ShowAlert( `${ error }` );
        }
        if ( slotError )
        {
            slotError && Helper.ShowAlert( `${ slotError }` )
        }
        if ( dError )
        {
            dError && Helper.ShowAlert( `${ dError }` )
        }
    }, [error, slotError, dError] );

    useEffect( () =>
    {
        console.log( 'CheckoutCacheReducer. Nac chck --', JSON.stringify( CheckoutCacheReducer.isAddressSetonCart ) );
        // console.log( 'DateTimeSlotReducers --', JSON.stringify( DateTimeSlotReducers ) );
        var expTime = new Date( DateTimeSlotReducers.expTime );
        var date2 = new Date();
        if ( expTime.getTime() < date2.getTime() )
        {
            console.log( 'expTime and get callled getAvailableSlot -->', expTime )
            getAvailableSlot()
        }
        else
        {
            if ( !CheckoutCacheReducer.isAddressSetonCart && DateTimeSlotReducers.isUpdated )
            {
                setCachedDeliverySlots( DateTimeSlotReducers.DateTimeSlotData );
            }
            else
            {
                getAvailableSlot()
            }
        }
    }, [] );

    function UpdateCacheExpTime( isUpdated )
    {
        var expTime = new Date().setMinutes( new Date().getMinutes() + 10 )
        dispatch( ISDATETIMESLOTCacheUpdated( isUpdated, expTime ) )
    }
    // useEffect( () =>
    // {

    // }, [DateTimeSlotReducers] )

    const setDelivryDateandTime = () =>
    {
        Helper.HandleVibration();
        setDateTime( {
            variables: {
                deliveryDate: selectedDate.date,
                deliveryFrom: selectedSlot.from,
                deliveryTo: selectedSlot.to,
            }
        } )
    }

    useEffect( () =>
    {
        if ( CachedDeliverySlots )
        {
            setselectedDate( CachedDeliverySlots.deliveryTime[0] )
            setselectedSlot( CachedDeliverySlots.deliveryTime[0].slots[0] )
        }
    }, [CachedDeliverySlots] )

    useEffect( () =>
    {
        if ( data )
        {
            dispatch( ISAddressONCart( false ) )
            UpdateCacheExpTime( true )
            console.log( 'ISAddressONCart set on -- false' );
            setCachedDeliverySlots( data )
            dispatch( DATETIMESLOTDATAAdd( data ) )
        }
    }, [data] )

    useEffect( () =>
    {
        if ( slotData )
        {
            if ( isPickup )
            {
                setPickupShippingMethod( {
                    variables: {
                        cart_id: cdID,
                    }
                } )
            } else
            {
                setDeliveryShippingMethod( {
                    variables: {
                        cart_id: cdID,
                    }
                } )
            }
        }
    }, [slotData] )

    useEffect( () =>
    {
        if ( dData )
        {
            props.CloseBottomsheet( selectedDate.date, selectedSlot )
        }
    }, [dData] )

    useEffect( () =>
    {
        if ( pickupData )
        {
            props.CloseBottomsheet( selectedDate.date, selectedSlot )
        }
    }, [pickupData] )

    function getOnlyDate( date )
    {
        let trLocale = require( 'moment/locale/es' );
        moment.updateLocale( 'es', trLocale )
        return moment( date ).format( 'DD' )
    }

    function getMonthandYear( date )
    {
        let trLocale = require( 'moment/locale/es' );
        moment.updateLocale( 'es', trLocale )
        return moment( date ).format( 'MMMM, yyy' )
    }

    function getDayInitial( date )
    {
        let trLocale = require( 'moment/locale/es' );
        moment.updateLocale( 'es', trLocale )
        return moment( date ).format( 'ddd' )
    }
    function gettime( from )
    {
        let trLocale = require( 'moment/locale/es' );
        moment.updateLocale( 'es', trLocale )
        let a = moment( from, 'HH:mm' )
        return moment( a ).format( 'LT' )
    }

    /**
    * @param item - Render Date Items
    */
    const renderDateItem = ( item: any, index: Number ) =>
    {
        return (

            ( selectedDate != null ) &&

            <TouchableOpacity key={item.date} style={[styles.bg_container,]} onPress={() =>
            {
                Helper.HandleVibration();
                setselectedDate( item )
                setselectedSlot( item.slots[0] )
            }}>
                <Text style={{ marginBottom: 4, textTransform: 'capitalize', color: appTheme.text }}>{getDayInitial( item.date )}</Text>
                <View style={{ height: 40, width: 40, backgroundColor: ( selectedDate.date == item.date ? colorResource.Green : colorResource.transparent ), borderRadius: 16, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 16, textAlign: 'center', fontFamily: 'Inter-Regular', fontWeight: '600', color: ( selectedDate.date == item.date ? colorResource.white : isDark ? colorResource.white : colorResource.black ) }}>{getOnlyDate( item.date )}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    /**
        * @param item - Render Date Items
        */
    const renderTimeSlot = ( item: any, index ) =>
    {
        return (
            <TouchableOpacity key={index} style={[styles.container_slot,]} onPress={() =>
            {
                Helper.HandleVibration();
                setselectedSlot( item )

            }}>
                <View style={[commonStyle.padding_12, commonStyle.flexDir_Row, commonStyle.justifyContent_flex_start, { backgroundColor: item == selectedSlot ? isDark ? colorResource.Green_03 : colorResource.Green_06 : appTheme.InputBoxBGColor, width: '100%', borderRadius: 15 }]}>
                    <ProgressiveImage source={{ uri: selectedSlot == undefined ? ResImage.ic_store : ( item == selectedSlot ? item.active_icon : isDark ? item.dark_icon : item.icon ) }} style={[styles.type_icon]} resizeMode="center" />
                    {/* <ProgressiveImage source={{ uri: item.icon}} style={[styles.type_icon, {color: item == selectedSlot ? Colors.Green : Colors.black}]} resizeMode="center" />  */}

                    <View style={{ paddingLeft: 8 }}>
                        <Text style={[styles.text_TimeSlot, { color: item == selectedSlot ? colorResource.Green : appTheme.text }]}
                        > {item.name}
                        </Text>
                        <Text style={[styles.text_TimeSlotTime, { color: item == selectedSlot ? colorResource.Green : isDark ? colorResource.disable_clr : colorResource.Gray }]}>{gettime( item.from )} - {gettime( item.to )}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
    const renderItem = ( { item, index } ) =>
    {
        return renderTimeSlot( item, index )
    };


    const insets = useSafeAreaInsets();

    return <SafeAreaView style={[{ flex: 1, backgroundColor: appTheme.background }, isDark ? null : { borderTopLeftRadius: 24, borderTopRightRadius: 24, }]}>
        <View style={[styles.headerWrap, { alignItems: 'center' }]}>
            <View style={{ width: '100%', backgroundColor: 'transparent' }}>
                <Text style={[{
                    fontSize: 16,
                    lineHeight: 24, fontWeight: '800', fontFamily: 'Gilroy-Bold', color: appTheme.text, padding: 20, textAlign: 'center'
                }]}>{translate( 'DateTimeSlot.lbl_dttime_title' )}</Text>
            </View>
            <View style={[styles.ButtonViewStyles, { position: 'absolute', marginLeft: 8 }]}>
                <TouchableHighlight onPress={() => { Helper.HandleVibration(); props.CloseBottomsheet( null ) }} underlayColor={colorResource.transparent} style={{ padding: 5 }} >
                    <Icon
                        name="times"
                        type="font-awesome-5" size={24}
                        color={isDark ? colorResource.white : colorResource.black}
                    />
                </TouchableHighlight>
            </View>
        </View>
        <View style={[commonStyle.padding_16, commonStyle.flex_1, { paddingTop: 16 }]}>
            {
                CachedDeliverySlots && ( selectedDate != null && selectedDate != undefined ) &&
                <>
                    <Text style={[commonStyle.profileHeader, commonStyle.paddingBottom_16, { color: appTheme.text, fontWeight: '700', textTransform: 'capitalize' }]}>{getMonthandYear( selectedDate.date )}</Text>

                    <View style={{ width: '100%', height: 80 }}>
                        <ScrollView showsHorizontalScrollIndicator={false} horizontal={true} style={[commonStyle.flex_1]}>
                            {
                                CachedDeliverySlots.deliveryTime.map( ( dateItem, i ) =>
                                {
                                    return renderDateItem( dateItem, i )
                                } )
                            }
                        </ScrollView>

                    </View>
                    {
                        selectedDate != null &&
                        <FlatList
                            data={selectedDate.slots}
                            renderItem={renderItem} showsVerticalScrollIndicator={false}
                            keyExtractor={( item ) => item.date}
                            numColumns={1}
                            style={{
                                flex: 1, marginTop: 15,
                                marginBottom: insets.bottom + 75
                            }}
                        />
                    }
                </>
            }
        </View>
        <View style={[commonStyle.padding_24, { position: 'absolute', bottom: 17, width: '100%' }]}>
            <CustomButton
                title="pre_login.lbl_Continue"
                disabled={selectedSlot == null}
                onPress={() => setDelivryDateandTime()}
                customButtonStyle={[
                    selectedSlot != null
                        ? commonStyle.btn_primary
                        : commonStyle.btn_disabled,
                ]}
            />
        </View>

        <CustomPBar showProgress={loading || slotLoading || dLoading} />
    </SafeAreaView>
}

const styles = StyleSheet.create( {
    headerWrap: {
        flexDirection: "row",
        paddingTop: 2,
        paddingHorizontal: 10,
        width: '100%'
    },
    ButtonViewStyles: {
        alignItems: "center",
        justifyContent: "center",
        flexDirection: 'row',
        width: 40
    },
    type_icon: {
        width: 24,
        height: 24
    },
    close_icon: {
        width: 24,
        height: 24,
    },
    btn_submit: {
        fontWeight: '600',
        color: 'white'
    },
    bg_container: {
        justifyContent: 'center',
        alignContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
        marginRight: 8
    },
    container_slot: {
        justifyContent: 'center',
        alignContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
        marginRight: 8,
        marginBottom: 16,
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
    text_address: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        lineHeight: 24,
        paddingBottom: 4,
        fontWeight: '400'
    },
    text_TimeSlot: {
        marginBottom: 4,
        fontSize: 16,
        fontFamily: 'Inter-Bold',
        lineHeight: 24,
        fontWeight: '600'
    },
    text_TimeSlotTime: {
        marginBottom: 4,
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        lineHeight: 24,
        fontWeight: '400'
    },
    text_address_name: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        lineHeight: 24,
        paddingBottom: 4,
        fontWeight: '600'
    },
    container_address: {
        paddingLeft: 48,
        paddingRight: 48,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        paddingBottom: 12
    }
} )

export default DateandTimeSelection
