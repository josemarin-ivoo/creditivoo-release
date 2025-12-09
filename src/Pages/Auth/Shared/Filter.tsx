import React, { useContext, useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableHighlight, View, TouchableOpacity, Platform } from 'react-native'
import commonStyle from '../../../../commonStyle';
import { CustomButton } from '../../../Components/CustomButton';
import { Icon } from 'react-native-elements';
import { useSelector, useDispatch } from 'react-redux';
import { FilterAction } from '../../../redux/filterAction';
import { translate } from '../../../locales';
import colorResource from '../../../Utils/Colors'
import Helper from '../../../Utils/Helper';
import { AppContext } from '../../AppContext';

export const Filter = ( props: any ) =>
{
    const { appTheme } = useContext( AppContext );
    const filter_data = useSelector( ( state: any ) => state.filterReducer );
    const dispatch = useDispatch();
    const filterTypeMap = props.filterTypeMap
    const [filterSelectionFlag, setFilterSelectionFlag] = useState( filter_data.filters.length > 0 ? true : false );
    const [multiselectFinalArr, setMultiselectFinalArr]: any = useState( filter_data.filters );
    const [filterOptions, setFilterOptions] = useState( null )

    useEffect( () =>
    {
        if ( props.current_page == 1 )
        {
            var tempData = filter_data.allfilters.filter( el => el.category_id === props.category_id )
            setFilterOptions( tempData[0].filterCacheData )
        }

        if ( props.isFilterAppliedtag )
        {
            console.log( '2 ---', props.isFilterAppliedtag );
            setFilterSelectionFlag( props.isFilterAppliedtag )
        }
    }, [] );


    const applyFilter = () =>
    {
        Helper.HandleVibration();
        const localArr = multiselectFinalArr
        //localArr['price'] = []
        //localArr['price'] = `${ low }_${ high }`

        setMultiselectFinalArr( {
            ...localArr
        } );
        dispatch( FilterAction( multiselectFinalArr ) );
        props.overlayToggle( !props.overlayToggleFlag )
        props.afterApplyFilter( multiselectFinalArr )

    };

    const clearAll = () =>
    {
        setFilterSelectionFlag( false );
        //setisFilterApplied( false )
        props.isFilterApplied( false )
        //props.overlayToggle( !props.overlayToggleFlag ) // uncomment this if want to close filter popup

        multiselectFinalArr.length = 0;

        var localArr = { "category_id": [props.category_id.toString()] }
        setMultiselectFinalArr( localArr )
        //setTimeout(() => {
        props.clearFilters( localArr );
        // }, 100);
    }

    const selectFilter = ( option, value ) =>
    {

        Helper.HandleVibration();
        console.log( '5' );
        setFilterSelectionFlag( true );

        //setisFilterApplied( true )
        props.isFilterApplied( true )

        const localArr = multiselectFinalArr
        const type = filterTypeMap.get( option )
        if ( !localArr[option] )
        {
            localArr[option] = []
        }

        if ( type == 'FilterMatchTypeInput' )
        {
            if ( localArr[option] != value )
            {
                localArr[option] = value
            } else
            {
                delete localArr[option]
            }
        }

        if ( type == 'FilterEqualTypeInput' )
        {

            const indexer = localArr[option]
            if ( !indexer.includes( value ) )
            {
                indexer.push( value )
                localArr[option] = indexer
            } else
            {
                localArr[option] = localArr[option].filter( item => item !== value )
                if ( localArr[option].length == 0 )
                {
                    delete localArr[option]
                }
            }
        }

        if ( type == 'FilterRangeTypeInput' )
        {
            if ( localArr[option] != value )
            {
                localArr[option] = value
            } else
            {
                delete localArr[option]
            }
        }

        setMultiselectFinalArr( {
            ...localArr
        } );

        console.log( localArr );
        // dispatch(FilterAction(multiselectFinalArr));
    }

    const isSelectedOption = ( attribute_code, value ) =>
    {

        // console.log(filter_data.filters);
        if ( !multiselectFinalArr[attribute_code] )
        {
            return false;
        }
        if ( multiselectFinalArr[attribute_code].includes( value ) )
        {
            return true;
        }

    }

    return ( <View style={[{ height: "100%", backgroundColor: appTheme.background, }, appTheme.type == 'light' ? { borderTopLeftRadius: 24, borderTopRightRadius: 24 } : null]}>

        <View style={[styles.filterHeaderContainer, { padding: 16 }]}>
            <View style={[{ flexGrow: 0, flexShrink: 1, flexBasis: "auto" }]}>
                <TouchableOpacity onPress={() =>
                {
                    Helper.HandleVibration();
                    props.overlayToggle( false )
                }} style={{ padding: 5 }}>
                    <Icon
                        name="times"
                        type="font-awesome-5" size={24}
                        color={appTheme.type === 'dark' ? colorResource.white : colorResource.black}
                    />

                </TouchableOpacity>
            </View>
            <View style={[{ flex: .4 }]}>
                <Text style={[commonStyle.h5, commonStyle.fontBold, { textAlign: 'right', right: -10, color: appTheme.text }]}>
                    {/* Filter */}
                    {translate( 'filter.lbl_filter' )}
                </Text>
            </View>
            <View style={[{ flex: .4 }]} />
            {/* {
                    // filterSelectionFlag &&
                    // <TouchableHighlight underlayColor="transparent" onPress={() => {
                    //     Helper.HandleVibration();
                    //     clearAll();
                    // }}>
                    //     <Text style={[commonStyle.h6, commonStyle.fontBold, { textAlign: 'right', color: colorResource.pink_product_price }]}>
                     
                    //         {translate('filter.lbl_clearall')}
                    //     </Text>
                    // </TouchableHighlight>
                }
            </View> */}
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ paddingHorizontal: 16, marginBottom: Platform.OS == 'ios' ? 120 : 80 }}>
                <View>
                    {
                        filterOptions && filterOptions.map( ( option: any ) =>
                        {
                            if ( option.attribute_code == 'category_id' ) return //dont need to give option to filter by category
                            return <View key={option.attribute_code}>
                                {
                                    option.attribute_code !== 'price' && <Text
                                        style={[commonStyle.h4, commonStyle.fontBold, commonStyle.marginVertical_20, { color: appTheme.text }]}>{option.label}</Text>
                                }
                                <View style={styles.filterViewContainer}>
                                    {
                                        option.options.map( ( items ) =>
                                        {
                                            return <View key={items.value} style={{ borderRadius: 16 }}>
                                                {
                                                    option.attribute_code !== 'price' && <TouchableHighlight underlayColor={colorResource.transparent} onPress={() =>
                                                    {
                                                        selectFilter( option.attribute_code, items.value )
                                                    }}>
                                                        <>
                                                            {/* Values */}
                                                            {
                                                                !items.swatch_data && <View style={[isSelectedOption( option.attribute_code, items.value ) ?
                                                                    {
                                                                        backgroundColor: appTheme.type === 'dark' ? colorResource.Green_03 : colorResource.Green_06,
                                                                        marginBottom: 10,
                                                                        borderRadius: 16,
                                                                        paddingVertical: 10,
                                                                        paddingHorizontal: 16,
                                                                        marginRight: 10
                                                                    }
                                                                    : {
                                                                        backgroundColor: appTheme.InputBoxBGColor,
                                                                        marginBottom: 10,
                                                                        borderRadius: 16,
                                                                        paddingVertical: 10,
                                                                        paddingHorizontal: 16,
                                                                        marginRight: 10
                                                                    }, { borderRadius: 16, marginRight: 10, marginBottom: 10, }]}>
                                                                    <Text
                                                                        style={[
                                                                            isSelectedOption( option.attribute_code, items.value ) ?
                                                                                {
                                                                                    color: colorResource.Green,
                                                                                    fontWeight: 'bold',
                                                                                }
                                                                                : { color: appTheme.text },
                                                                            {
                                                                                justifyContent: "center", textAlignVertical: "center", fontSize: 16,
                                                                                fontFamily: 'Inter-Regular', borderRadius: 16
                                                                            },
                                                                        ]}>{items.label}</Text>
                                                                </View>
                                                            }
                                                            {
                                                                items.swatch_data && items.swatch_data.type == "1" &&
                                                                <View style={[
                                                                    isSelectedOption( option.attribute_code, items.value ) ?
                                                                        styles.variantsSelected
                                                                        : styles.variantsUnSelected,
                                                                    styles.colorblock,
                                                                    isSelectedOption( option.attribute_code, items.value ) ? appTheme.type === 'dark' ? { backgroundColor: colorResource.Green_03 } : null : { backgroundColor: appTheme.InputBoxBGColor }
                                                                ]}>
                                                                    <View
                                                                        style={[
                                                                            isSelectedOption( option.attribute_code, items.value ) ?
                                                                                styles.variantsSelectedChild
                                                                                : styles.variantsUnSelectedChild,
                                                                            isSelectedOption( option.attribute_code, items.value ) ? appTheme.type === 'dark' ? { backgroundColor: '#0F4F33' } : null : { backgroundColor: appTheme.InputBoxBGColor }
                                                                        ]}>
                                                                        <View style={[styles.linearGradient, { backgroundColor: items.swatch_data.value }]}>
                                                                        </View>

                                                                    </View>
                                                                </View>}
                                                            {
                                                                items.swatch_data && items.swatch_data.type == "0" &&
                                                                <View style={[isSelectedOption( option.attribute_code, items.value ) ?
                                                                    {
                                                                        backgroundColor: appTheme.type === 'dark' ? colorResource.Green_03 : colorResource.Green_06,
                                                                        marginBottom: 10,
                                                                        borderRadius: 16,
                                                                        paddingVertical: 10,
                                                                        paddingHorizontal: 16,
                                                                        marginRight: 10
                                                                    }
                                                                    : {
                                                                        backgroundColor: appTheme.InputBoxBGColor,
                                                                        marginBottom: 10,
                                                                        borderRadius: 16,
                                                                        paddingVertical: 10,
                                                                        paddingHorizontal: 16,
                                                                        marginRight: 10
                                                                    }, { borderRadius: 16, marginRight: 10, marginBottom: 10, }]}>
                                                                    <Text
                                                                        style={[
                                                                            isSelectedOption( option.attribute_code, items.value ) ?
                                                                                {
                                                                                    color: colorResource.Green,
                                                                                    fontWeight: 'bold',
                                                                                    backgroundColor: appTheme.type === 'dark' ? colorResource.Green_03 : colorResource.Green_06,
                                                                                }
                                                                                : {
                                                                                    backgroundColor: appTheme.InputBoxBGColor,
                                                                                    color: appTheme.text,

                                                                                },
                                                                            { fontSize: 16, fontFamily: 'Inter-Regular', },
                                                                        ]}>{items.label}</Text>
                                                                </View>
                                                            }
                                                        </>
                                                    </TouchableHighlight>
                                                }
                                            </View>
                                        } )
                                    }
                                </View>
                            </View>
                        } )
                    }
                </View>
            </View>
        </ScrollView>
        {
            filterSelectionFlag && <View style={{ backgroundColor: appTheme.background, flex: 1, justifyContent: 'space-between', flexDirection: 'row', marginTop: 20, paddingHorizontal: 16, position: 'absolute', bottom: ( Platform.OS === 'ios' ) ? 40 : 25 }}>
                <View style={{ width: '48%' }}>

                    <CustomButton
                        customButtonStyle={[commonStyle.btnStyle, {
                            borderColor: colorResource.disable_clr, backgroundColor: appTheme.type === 'dark' ? colorResource.a696969 : colorResource.disable_clr
                        }]}
                        customTitleStyle={[commonStyle.h5, commonStyle.fontBold, {
                            fontSize: 16, lineHeight: 24, fontFamily: 'Inter-Regular', color: appTheme.text
                        }]}
                        onPress={() =>
                        {
                            Helper.HandleVibration();
                            clearAll();
                        }}
                        title={'filter.lbl_reset'}
                    />
                </View>
                <View style={{ width: '48%' }}>
                    <CustomButton title="filter.lbl_apply"
                        onPress={applyFilter}
                        customButtonStyle={[commonStyle.btn_primary,]}
                    />

                </View>
            </View>
        }
    </View > );
}


const styles = StyleSheet.create( {
    variantsSelected: {
        height: 88,
        width: 88,
        backgroundColor: colorResource.variantSelections,
        borderRadius: 16,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    variantsUnSelected: {
        height: 88,
        width: 88,
        backgroundColor: colorResource.SmokeWhite,
        borderRadius: 16,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    variantsSelectedChild: {
        height: 50,
        width: 50,
        backgroundColor: colorResource.white,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colorResource.Green,

    },
    variantsUnSelectedChild: {
        height: 50,
        width: 50,
        backgroundColor: colorResource.SmokeWhite,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: colorResource.SmokeWhite,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedOption: {
        backgroundColor: colorResource.Green,
        color: colorResource.Green,
        fontWeight: 'bold',
    },
    unSelectedOption: {
        color: colorResource.Gray
    },
    options: {
        backgroundColor: colorResource.SmokeWhite,
        marginBottom: 10,
        borderRadius: 16,
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginRight: 10
    },
    optionsgreen: {
        backgroundColor: colorResource.Green_06,
        marginBottom: 10,
        borderRadius: 16,
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginRight: 10
    },
    linearGradient: {
        top: 0,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        height: 32,
        width: 32,
        borderWidth: 1,
        borderColor: colorResource.Blue_Magenta,
    },
    colorblock: {
        height: 88,
        width: 88,
        // backgroundColor: clr.SmokeWhite,
        borderRadius: 16,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 5,
        margin: 5
    },
    txtclr: {
        textAlign: 'center', textAlignVertical: 'center',
        marginTop: 8,
        color: colorResource.Gray
    },
    filterHeaderContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    filterViewContainer: { flexDirection: "row", flexWrap: "wrap", alignItems: "center" },
} );



