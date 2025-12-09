import React, { useContext, useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Platform, TouchableHighlight } from 'react-native'
import ProgressiveImage from '../../../Components/ProgressiveImage'
import Helper from '../../../Utils/Helper'
import CustomHeader from '../../../Components/CustomHeader';
import { useNavigation } from '@react-navigation/native';
import { Routes } from '../../../Utils/NavigationRoutes'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSelector } from 'react-redux'
import { AppContext } from '../../AppContext'
import { Icon } from 'react-native-elements';
import 'moment/src/locale/es'
import commonStyle from '../../../../commonStyle'
import ResColor from "../../../Utils/Colors";
import ResImage from "../../../Utils/Image";
import { useDispatch } from 'react-redux';
import { _PUSH_COUNTER_CHECK, PUSHDelete, PUSHClear } from '../../../redux/PushInboxReducers/PushCounterAction';
 
const Notificationlist = () =>
{
    const navigation = useNavigation()
    const dispatch = useDispatch();
    const PushCounter = useSelector((state: any) => state.PushCounterReducer);
    const global_data = useSelector((state: any) => state.commonReducer);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {


            console.log('nav datart');

            console.log(JSON.stringify(PushCounter.PUSH_COUNTER_DATA.filter(item => item.value.token === global_data.email)));

            var msgCount = PushCounter.PUSH_COUNTER_DATA.filter(item => item.value.token === global_data.email).length;

            // if ( msgCount == 0 )
            // {
            //     dispatch( PUSHClear( global_data.email ) )
            // }

            var counter = PushCounter.PUSH_COUNTER_CHECK.filter(item => item.token === global_data.email)[0].count;

            if (counter !== msgCount) {
                dispatch(_PUSH_COUNTER_CHECK(true, global_data.email, msgCount, 'update'))
            }

            prcs();
        });
        return unsubscribe;
    }, [navigation])



    const prcs = async () => {
        // var data = await getObjectFromStore( 'remoteMessage' )
        // console.log( data )
    }

    function getFormatedDate(date) {
        const now = new Date();
        var Difference_In_Time = now.getTime() - new Date(date).getTime();

        // To calculate the no. of days between two dates
        var seconds = Number(Difference_In_Time / 1000);
        var daysTill = Math.floor(Difference_In_Time / (1000 * 60 * 60 * 24))
        var h = Math.floor(seconds / 3600);
        var m = Math.floor(seconds % 3600 / 60);

        if (daysTill > 1) {
            return `Hace ${daysTill} dias`
        } else if (daysTill === 1) {
            return `Hace ${daysTill} dia`
        }
        else if (h >= 1) {
            return `Hace ${h} horas`
        }
        else if (m >= 1) {
            return `Hace ${m} minutos`
        }
        else {
            return `hace un minutos`
        }
    }

    const insets = useSafeAreaInsets();
    const { appTheme } = useContext(AppContext);
    const [isDark, setDark] = useState(appTheme.type === 'dark');

    useEffect(() => {
        setDark(appTheme.type === 'dark')
    }, [appTheme.type])

    const renderDom = (item) => {
        return (
            <TouchableOpacity key={Math.random()} style={[commonStyle.marginBottom_30, { backgroundColor: isDark ? appTheme.InputBoxBGColor : ResColor.SmokeWhite, borderRadius: 15 }]} onPress={() => {
                Helper.HandleVibration();
                if ('data' in item.value.remoteMessage.data) {
                    console.log('data' in item.value.remoteMessage.data)
                    const customData = JSON.parse(item.value.remoteMessage.data.data);
                    navigation.navigate(Routes.NAVIGATION_TO_ORDERHISTORYDETAIL, { id: customData.increment_id });
                }
            }}>
                <View style={[styles.renderDomContainer, { justifyContent: 'space-between' }]}>
                    <View style={{ flex: .2, marginLeft: 8, justifyContent: 'center' }}>
                        {
                            Platform.OS === 'android' ? <ProgressiveImage resizeMode="contain" source={'imageUrl' in item.value.remoteMessage.notification.android ? { uri: item.value.remoteMessage.notification.android.imageUrl } : ResImage.ivoo} style={[commonStyle.he_wi_88, , 'imageUrl' in item.value.remoteMessage.notification.android ? { borderRadius: 16 } : null]} />
                                :
                                <ProgressiveImage resizeMode="contain"
                                    source={'fcm_options' in item.value.remoteMessage.data ? ('image' in item.value.remoteMessage.data.fcm_options ? { uri: item.value.remoteMessage.data.fcm_options.image } : ResImage.ivoo) : ResImage.ivoo}
                                    style={[commonStyle.he_wi_88, 'fcm_options' in item.value.remoteMessage.data ? ('image' in item.value.remoteMessage.data.fcm_options ? { borderRadius: 16 } : null) : null]} />
                            //{ width: Dimensions.get( 'window' ).width / 3 - 40, height: Dimensions.get( 'window' ).width / 3 - 20 }
                        }
                    </View>
                    <View style={{ flex: .7, marginTop: 25 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", }}>
                            <View style={{ marginLeft: 8, marginRight: 12, width: '80%', }}>
                                <Text numberOfLines={2} style={[commonStyle.h5, commonStyle.fontBold, { color: appTheme.text }]}>{item.value.remoteMessage.notification.title}</Text>
                                <Text numberOfLines={2} style={[commonStyle.h6, { color: appTheme.text }]}>{item.value.remoteMessage.notification.body}</Text>
                                <Text numberOfLines={2} style={[commonStyle.h6, { marginTop: 15, color: appTheme.placeholderTextColor }]}>{getFormatedDate(item.value.received_at)}</Text>
                            </View>

                            <TouchableHighlight style={{ marginRight: 15 }} underlayColor="transparent"
                                onPress={() => {
                                    Helper.HandleVibration();
                                    dispatch(PUSHDelete(global_data.email, item.value.remoteMessage.messageId));

                                    PushCounter.PUSH_COUNTER_DATA.length == 1 ? dispatch(_PUSH_COUNTER_CHECK(true, global_data.email, 0, 'clear')) : dispatch(_PUSH_COUNTER_CHECK(true, global_data.email, 1, 'sub'));

                                }}>
                                <Icon name='times' type='font-awesome-5' color={ResColor.CloseIconColor} iconStyle={{ fontSize: 20 }} />
                            </TouchableHighlight>
                        </View>
                    </View>

                </View>
            </TouchableOpacity >

        );
    }

    const renderItem = (item) => {
        return renderDom(item)
    };
    return <View style={[styles.MainContainer, { backgroundColor: appTheme.background }]}>
        <View>
            <CustomHeader gradientHeader={false} gradientHeaderOption={false} scrolledValue={false} />
            <ScrollView showsVerticalScrollIndicator={false} style={[commonStyle.paddingBottom_400, {
                paddingTop: insets.top + 20,
                paddingBottom: insets.bottom,
            }]}>
                <View style={{ flexDirection: 'row', marginTop: 30, }}>
                    <View style={[styles.Order_Title_Status, , { flex: 0.7 }]}>
                        <Text style={[commonStyle.h2, commonStyle.fontBold, commonStyle.titlePageHeaderText, { color: appTheme.text, }]}>Notificaciones</Text>
                    </View>
                    {
                        PushCounter.PUSH_COUNTER_DATA.filter(item => item.value.token === global_data.email).length !== 0 && PushCounter.PUSH_COUNTER_CHECK.filter(item => item.token === global_data.email)[0].count > 0 &&
                        <TouchableOpacity style={{ backgroundColor: appTheme.InputBoxBGColor, alignSelf: 'flex-end', flex: 0.4, marginRight: 15, borderRadius: 16, }} onPress={() => {
                            Helper.HandleVibration();
                            dispatch(PUSHClear(global_data.email));
                            dispatch(_PUSH_COUNTER_CHECK(true, global_data.email, 0, 'clear'))
                        }} >
                            <Text style={[commonStyle.h6, commonStyle.titlePageHeaderText, { color: appTheme.text, padding: 6, borderRadius: 16, textAlign: 'center' }]}>Limpiar buzón</Text>
                        </TouchableOpacity>
                    }
                </View>
                <View style={[styles.MainViewContainer, { marginBottom: insets.bottom + 20, }]}>
                    {
                        PushCounter.PUSH_COUNTER_DATA.filter(item => item.value.token === global_data.email).length === 0 && <View>
                            <Text style={[commonStyle.h5, { marginTop: 40, textAlign: "center", color: appTheme.text }]}>
                                No se encontraron notificaciones
                            </Text>
                        </View>

                    }
                    {
                        PushCounter.PUSH_COUNTER_DATA.filter(item => item.value.token === global_data.email).map((option, index) => {
                            return renderItem(option)
                        })
                    }
                    {/* <CustomPBar showProgress={loading || CancelLoad} /> */}
                </View>
            </ScrollView>
        </View>
    </View >
}


export default Notificationlist

const styles = StyleSheet.create({
    itemName: {
        lineHeight: 16,
        marginTop: 5,
    }, cardStyle: {
        flexDirection: "row",
        flexWrap: "nowrap",
        overflow: 'hidden',
        backgroundColor: ResColor.F4F4F4F4,
        position: "relative",
        borderRadius: 16,
        justifyContent: "center",
        marginRight: 0,
        marginLeft: 0,
    },
    MainContainer: { flex: 1 },
    Order_Title_Status: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 18, paddingRight: 16 },
    MainViewContainer: { padding: 16, flex: 1 },
    add_top_container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 30,
        margin: 16,
        marginTop: 12,
        marginBottom: 4
    }, renderDomContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }
})