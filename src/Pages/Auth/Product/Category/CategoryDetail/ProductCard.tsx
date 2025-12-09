import { useNavigation } from '@react-navigation/native'
import React, { useContext, useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native'
import commonStyle from '../../../../../../commonStyle'
import ProgressiveImage from '../../../../../Components/ProgressiveImage'
import Helper from '../../../../../Utils/Helper'

import { Routes } from '../../../../../Utils/NavigationRoutes'
import WishlistButton from '../../../Wishlist/WishlistButton'
import ResColor from '../../../../../Utils/Colors'
import { AppContext } from '../../../../AppContext'


// Used Category --> Product List
export const ProductCard = (props) => {
    const navigation = useNavigation();
    const { appTheme } = useContext(AppContext);
    const [isDark, setDark] = useState(appTheme.type === 'dark');
    useEffect(() => {
        setDark(appTheme.type === 'dark')
    }, [appTheme.type])

    const item = props.item
    const index = props.index
    const isTrue = props.isTrue
    //const global_data = useSelector((state: any) => state.commonReducer);


    const renderPrice = (item) => {

        if (item.price_range.minimum_price.regular_price.value != 0 && item.price_range.minimum_price.regular_price.value != item.price_range.minimum_price.final_price.value) {
            return (<>
                <View >
                    <Text style={[commonStyle.h6, styles.regularPrice, { color: isDark ? ResColor.white : ResColor.disc_rate_clr, }]}>
                        {Helper.currencyFormat(item.price_range.minimum_price.regular_price.value)}
                    </Text>
                </View>
                <View  >
                    <Text style={[commonStyle.h6, commonStyle.fontBold, styles.finalPrice, { color: ResColor.pink_product_price, }]}>
                        {Helper.currencyFormat(item.price_range.minimum_price.final_price.value)}
                    </Text>
                </View>
            </>
            );
        } else {
            return (
                <View >
                    <Text style={[commonStyle.h6, commonStyle.fontBold, styles.finalPriceblack, { color: isDark ? ResColor.white : ResColor.blackShade, }]}>
                        {Helper.currencyFormat(item.price_range.minimum_price.regular_price.value)}
                    </Text>
                </View>);
        }
    }


    return (
        <TouchableOpacity key={item.sku}
            style={[styles.cardWrapper, isTrue ? styles.listWrapper : styles.gridWrapper]}
            onPress={() => {
                Helper.HandleVibration();
                navigation.navigate(Routes.NAVIGATION_TO_PRODUCTDETAILS, {
                    heading: item.name,
                    id: item.sku,
                    price: item.price_range.minimum_price.regular_price.value
                })
            }}>
            <View style={[commonStyle.productCardMainContainer, isTrue ? { marginTop: 30 } : null]}>
                <View
                    style={[isTrue ? null : [index % 2 == 0 ? styles.rightspace : styles.leftspace, { width: Dimensions.get('window').width / 2 - 20, height: Dimensions.get('window').width / 2 - 20, }]]}
                >
                    <View style={styles.cardStyle}>
                        {
                            item.small_image != undefined &&
                            <View>
                                {
                                    isTrue ? <ProgressiveImage source={{ uri: item.small_image.url + Helper.gridImageSize }} style={{
                                        width: "100%",
                                        height: undefined,
                                        aspectRatio: 109 / 80,
                                        resizeMode: 'contain'
                                    }} /> : <ProgressiveImage source={{ uri: item.small_image.url + Helper.gridImageSize }}
                                        style={{ width: Dimensions.get('window').width / 2 - 20, height: Dimensions.get('window').width / 2 - 20, }}
                                    />
                                }
                            </View>
                        }
                    </View>

                    <WishlistButton SKU={item.sku} isLoading={(load) => { props.isLoading(load) }} pagetype={'other'} setLoginOverlay={(login) => { props.setLoginOverlay(login) }} />
                </View>
                <Text style={[commonStyle.h6, styles.itemName, { width: isTrue ? '100%' : Dimensions.get('window').width / 2 - 30, color: appTheme.text }]}>{item.name}  </Text>
                <View style={[commonStyle.flexDir_Row]}>
                    {renderPrice(item)}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({

    rightspace: {
        marginRight: 4,
        //  backgroundColor:"red",


    },
    leftspace: {
        marginLeft: 4,
        //   backgroundColor:"black",


    },

    cardWrapper: {
        marginHorizontal: 0,
        marginBottom: 20,
        alignItems: "center"
    },
    gridWrapper: {
        width: '50%'
    },
    listWrapper: {
        width: '100%'
    },
    cardStyle: {
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
    itemName: {
        lineHeight: 16,
        marginTop: 5,
        paddingLeft: 4


    },
    regularPrice: {
        lineHeight: 16,
        marginTop: 5,
        color: ResColor.disc_rate_clr,
        textDecorationLine: "line-through",
        paddingLeft: 4


    },
    finalPrice: {
        lineHeight: 16,
        marginTop: 5,
        color: ResColor.pink_product_price,
        paddingLeft: 4


    },
    finalPriceblack: {
        lineHeight: 16,
        marginTop: 5,
        color: ResColor.blackShade,
        paddingLeft: 4


    }

})
