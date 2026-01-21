import {useLazyQuery, useQuery} from '@apollo/client';
import {useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  StatusBar,
  Dimensions,
  Animated,
  TouchableHighlight,
  ScrollView,
  Platform,
} from 'react-native';
import commonStyle from '../../../../../commonStyle';
import {
  productInfo,
  getFilterInputsForSearch,
  filterTag,
} from '../../../../Queries/queries';
import {Icon, SearchBar} from 'react-native-elements';
import {Filter} from '../../Shared/Filter';
import Search from '../Search';
import {ProductList} from './CategoryDetail/ProductList';
import {useSelector, useDispatch} from 'react-redux';
import {FilterAction} from '../../../../redux/filterAction';
import {getFilterInput} from '../../../../helpers/FilterModal/helpers';
import {translate} from '../../../../locales';
import {Modalize} from 'react-native-modalize';
import {Portal} from 'react-native-portalize';
import LoginOverlay from '../../Cart/LoginOverlay';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ProgressiveImage from '../../../../Components/ProgressiveImage';
import {GLOBAL_DATA} from '../../../../redux/actionTypes';
import ResColor from '../../../../Utils/Colors';
import ResImage from '../../../../Utils/Image';
import Helper from '../../../../Utils/Helper';
import {AppContext} from '../../../AppContext';
import ProductListSkelton from '../../../../Components/Skeleton/ProductListSkelton';
import {FlatList} from 'react-native';
import {Routes} from '../../../../Utils/NavigationRoutes';
import {allFilterAction} from './../../../../redux/filterAction';

export const CategoryDetail = props => {
  const insets = useSafeAreaInsets();
  const [isClear, setisClear] = useState(false);
  const [
    productInfoFunc,
    {loading: loading, data: productsResponse, fetchMore},
  ] = useLazyQuery(productInfo);
  const {appTheme} = useContext(AppContext);

  const filter_data = useSelector((state: any) => state.filterReducer);
  const dispatch = useDispatch();
  const global_data = useSelector((state: any) => state.commonReducer);

  const navigation = useNavigation();

  const [selectedId, setselectedId] = useState(''); // primary active filter
  const [visible, setVisible] = useState(false);
  const [isFilterApplied, setisFilterApplied] = useState(false);

  const [filterTagflag, setFilterTagflag] = useState(true);
  const [searchClickFlag, setSearchClickFlag] = useState(false);
  const [searchIconFlag, setSearchIconFlag] = useState(true);
  const [searchFocusFlag, setSearchFocusFlag] = useState(false);
  //const [titleWidth, settitleWidth] = useState(10)
  const modalizeRefFilter = React.useRef<Modalize>(null);
  // const [search, setSearch] = useState("");
  const [LoginOverlayvisible, setLoginOverlayvisible] = useState(false);
  const scrollOffsetY = useRef(new Animated.Value(0)).current;

  const {
    called: introspectionCalled,
    data: introspectionData,
    loading: introspectionLoading,
  } = useQuery(getFilterInputsForSearch);

  //#region  Filter and Other Operations
  const [backFlag, setbackFlag] = useState(true);

  // Create a type map we can reference later to ensure we pass valid args
  // to the graphql query.
  // For example: { category_id: 'FilterEqualTypeInput', price: 'FilterRangeTypeInput' }
  const filterTypeMap = useMemo(() => {
    const typeMap = new Map();
    if (introspectionData) {
      introspectionData.__type.inputFields.forEach(({name, type}) => {
        typeMap.set(name, type.name);
      });
    }
    return typeMap;
  }, [introspectionData]);

  const generateFilterObj = arrayObj => {
    let filterObj = {};
    if (!arrayObj) {
      return;
    }
    Object.keys(arrayObj).forEach(function (attribute_code) {
      let type = filterTypeMap.get(attribute_code);
      filterObj[attribute_code] = getFilterInput(
        arrayObj[attribute_code],
        type,
      );
    });
    return filterObj;
  };
  useEffect(() => {
    const localArr = {category_id: [props.route.params.id.toString()]};

    dispatch(FilterAction(localArr));
    productInfoFunc({
      variables: {
        filters: {category_id: {eq: props.route.params.id.toString()}},
        pageSize: filter_data.pageSize,
        sort: filter_data.sort,
        currentPage: 1,
      },
    });
    console.log('====================================');
    console.log({
      filters: {category_id: {eq: props.route.params.id.toString()}},
      pageSize: filter_data.pageSize,
      sort: filter_data.sort,
      currentPage: 1,
    });
    console.log('====================================');

    // filterTagFunc({variables: {"Id": props.route.params.id}})
  }, []);

  useEffect(() => {
    console.log(
      '===============productsResponse=====================',
      props.route.params.id.toString(),
    );
    if (productsResponse) {
      if (filter_data.allfilters == undefined) {
        var cacheObj = {
          category_id: props.route.params.id.toString(),
          exp_time: Helper.addHourstoSystemDate(5).toString(),
          filterCacheData: productsResponse.products.aggregations,
        };
        console.log('reducer added');
        dispatch(allFilterAction(cacheObj));
      } else {
        console.log('filter_data ------>>', JSON.stringify(productsResponse));
        var tempOBJ = filter_data.allfilters.filter(
          el => el.category_id === props.route.params.id.toString(),
        );
        if (tempOBJ.length > 0) {
          // Filter obj already exist than check if its expired than update it
          var expTime = new Date(tempOBJ[0].exp_time);
          if (new Date() > expTime) {
            var _cacheObj = {
              category_id: props.route.params.id.toString(),
              exp_time: Helper.addHourstoSystemDate(5).toString(),
              filterCacheData: productsResponse.products.aggregations,
            };
            console.log('reducer updae');
            dispatch(allFilterAction(_cacheObj));
          }
        } else {
          var _cacheObj = {
            category_id: props.route.params.id.toString(),
            exp_time: Helper.addHourstoSystemDate(5).toString(),
            filterCacheData: productsResponse.products.aggregations,
          };

          console.log('reducer added');
          dispatch(allFilterAction(_cacheObj));
        }
      }
    }
  }, [productsResponse]);

  const afterApplyFilter = multiselectFinalArr => {
    const filtersObj = generateFilterObj(multiselectFinalArr);
    productInfoFunc({
      variables: {
        filters: filtersObj,
        pageSize: filter_data.pageSize,
        sort: filter_data.sort,
        currentPage: 1,
      },
    });
  };

  const clearFilters = localArr => {
    localArr = {category_id: [props.route.params.id.toString()]};
    dispatch(FilterAction(localArr));
    //('localArr ', localArr)
    productInfoFunc({
      variables: {
        filters: {category_id: {eq: props.route.params.id.toString()}},
        pageSize: filter_data.pageSize,
        sort: filter_data.sort,
        currentPage: 1,
      },
    });
    setisClear(true);
  };

  useEffect(() => {
    setisClear(isClear => false);
  }, [isClear]);

  const closeToggleFilter = () => {
    modalizeRefFilter.current?.close();
  };

  const toggleSeachClickFlag = (toggleValue: any) => {
    setSearchClickFlag(toggleValue);
    setSearchFocusFlag(toggleValue);
    setSearchIconFlag(false);
  };
  const toggleSearchIconFlag = (toggleValue: any) => {
    toggleValue && setFilterTagflag(true);
    setSearchIconFlag(!searchIconFlag);
  };
  const toggleBackFlag = (toggleValue: any) => {
    setFilterTagflag(!toggleValue);
    !toggleValue && searchIconFlag && navigation.goBack();
  };
  const toggleSearchFocus = (focusFlag: any) => {
    setSearchFocusFlag(focusFlag);
  };
  const getFilterTagValue = (attribute_code, value: any) => {
    const localArr = {};
    localArr[attribute_code] = {eq: value};

    const _localArr = {};
    _localArr[attribute_code] = [value.toString()];
    dispatch(FilterAction(_localArr));

    if (value === '') {
      clearFilters([]);
    } else {
      productInfoFunc({
        variables: {
          filters: localArr,
          pageSize: filter_data.pageSize,
          sort: filter_data.sort,
          currentPage: 1,
        },
      });
      console.log('varoables ----->>', {
        filters: localArr,
        pageSize: filter_data.pageSize,
        sort: filter_data.sort,
        currentPage: 1,
      });
    }
  };

  const renderFilterArr = () => {
    // filterIncategoryDetailFunc({variables: {"filters": {"category_id": {"eq": props.route.params.id}}}})
    Helper.HandleVibration();
    modalizeRefFilter.current.open();
  };

  //#endregion

  //#region Filter Operations

  const [filterTagFunc, {loading: filLoad, data: dataFiterTag}] =
    useLazyQuery(filterTag);

  useEffect(() => {
    filterTagflag && filterTagFunc({variables: {Id: props.route.params.id}});
  }, []);

  useEffect(() => {
    filterTagflag && filterTagFunc({variables: {Id: props.route.params.id}});
  }, [isClear]);

  // const itemClick = ( item ) =>
  // {
  //     getFilterTagValue( dataFiterTag.categoryList[0].primary_filter_attribute[0].attribute_code, item )
  //     //props.renderFilterItem
  // }
  //#endregion

  //#region  Animation Operations

  const screenWidth = Dimensions.get('window').width;
  const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 60 : 73;

  let titleLen = props.route.params.name.length;
  let factor = 7;
  if (titleLen <= 3) {
    factor = 9.7;
  } else if (titleLen <= 6) {
    factor = 8.7;
  } else if (titleLen <= 9) {
    factor = 8.1;
  } else if (titleLen <= 12) {
    factor = 6.8;
  } else if (titleLen <= 15) {
    factor = 6.6;
  } else if (titleLen <= 18) {
    factor = 6.1;
  } else if (titleLen <= 21) {
    factor = 5.7;
  } else if (titleLen <= 24) {
    factor = 5.5;
  } else if (titleLen <= 27) {
    factor = 5.5;
  } else {
    factor = 4.8;
  }

  const YTranslate = scrollOffsetY.interpolate({
    inputRange: [0, 13, 26, 39, 52, 65, 78, 91, 104, 117, 130, 143, 156],
    outputRange: [
      0,
      -4,
      -8,
      -12,
      -16,
      -20,
      -24,
      -28,
      -32,
      -36,
      -40,
      Platform.OS == 'ios' ? -41 : -44,
      Platform.OS == 'ios' ? -44 : -48,
    ],
    extrapolate: 'clamp',
  });

  let sw12 = screenWidth / 2 - factor * titleLen;
  let sw11 = (11 / 13) * sw12;
  let sw10 = (10 / 13) * sw12;
  let sw9 = (9 / 13) * sw12;
  let sw8 = (8 / 13) * sw12;
  let sw7 = (7 / 13) * sw12;
  let sw6 = (6 / 13) * sw12;
  let sw5 = (5 / 13) * sw12;
  let sw4 = (4 / 13) * sw12;
  let sw3 = (3 / 13) * sw12;
  let sw2 = (2 / 13) * sw12;
  let sw1 = (1 / 13) * sw12;
  let sw0 = 0;

  const XTranslate = scrollOffsetY.interpolate({
    inputRange: [0, 13, 26, 39, 52, 65, 78, 91, 104, 117, 130, 143, 156],
    outputRange: [
      sw0,
      sw1,
      sw2,
      sw3,
      sw4,
      sw5,
      sw6,
      sw7,
      sw8,
      sw9,
      sw10,
      sw11,
      sw12,
    ],
    extrapolate: 'clamp',
  });

  const headerHeight = scrollOffsetY.interpolate({
    inputRange: [0, HEADER_MIN_HEIGHT],
    outputRange: [HEADER_MIN_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });
  //#endregion

  //#region Search
  const searchRef: any = useRef(null);
  const onSearchFocus = () => {
    toggleBackFlag(true);
    toggleSeachClickFlag(true);
    toggleSearchFocus(true);
    //dispatch({type: GLOBAL_DATA, payload: {resentSearchText: ''}});
  };
  //#endregion

  const [isLoadingSkelton, setIsLoadingSkelton] = useState(true);
  useEffect(() => {
    if (!loading) {
      //console.log('lod false');

      setTimeout(() => {
        //console.log('lod false11');

        setIsLoadingSkelton(false);
      }, Helper.skeletonTimeout);
    }
  }, [loading]);

  const renderFilterItem = ({item, index}) => {
    return (
      <TouchableHighlight
        underlayColor="transparent"
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={() => {
          Helper.HandleVibration();
          if (selectedId == item.value) {
            setselectedId('');
            getFilterTagValue(
              dataFiterTag.categoryList[0].primary_filter_attribute[0]
                .attribute_code,
              '',
            );
          } else {
            setselectedId(item.value);
            getFilterTagValue(
              dataFiterTag.categoryList[0].primary_filter_attribute[0]
                .attribute_code,
              item.value,
            );
          }
        }}>
        <Text
          style={[
            selectedId == item.value
              ? {
                  fontWeight: 'bold',
                  color: ResColor.Green,
                  backgroundColor:
                    appTheme.type == 'dark'
                      ? ResColor.Green_03
                      : ResColor.Green_06,
                }
              : {
                  color: appTheme.text,
                  backgroundColor: appTheme.InputBoxBGColor,
                },
            {
              borderRadius: 18,
              paddingVertical: 12,
              fontSize: 16,
              fontFamily: 'Inter-Regular',
              paddingHorizontal: 16,
              marginRight: 10,
              overflow: 'hidden',
            },
            index == 0 ? {marginLeft: 16} : null,
          ]}>
          {item.label}
        </Text>
      </TouchableHighlight>
    );
  };

  return (
    <View style={{flex: 1, backgroundColor: appTheme.background}}>
      {!isLoadingSkelton && (
        <Animated.View
          style={[
            styles.animatedContainer,
            {backgroundColor: appTheme.animHead},
          ]}>
          <View style={[styles.headerWrap, {marginTop: insets.top}]}>
            <TouchableHighlight
              onPress={() => {
                Helper.HandleVibration();
                searchRef.current != null && searchRef.current.blur();
                toggleBackFlag(false);
                toggleSeachClickFlag(false);
                toggleSearchIconFlag(false);
                dispatch({type: GLOBAL_DATA, payload: {resentSearchText: ''}});
                navigation.goBack();
              }}
              style={styles.ButtonViewStyles}
              underlayColor={ResColor.transparent}>
              <View style={styles.ButtonViewStyles}>
                <Icon
                  name="arrow-left"
                  type="font-awesome-5"
                  color={appTheme.backiconColor}
                  onPress={() => {
                    Helper.HandleVibration();
                    searchRef.current != null && searchRef.current.blur();
                    toggleBackFlag(false);
                    toggleSeachClickFlag(false);
                    toggleSearchIconFlag(false);
                    dispatch({
                      type: GLOBAL_DATA,
                      payload: {resentSearchText: ''},
                    });
                    // navigation.goBack();
                  }}
                />
              </View>
            </TouchableHighlight>
            {!searchIconFlag && (
              <View
                style={[
                  {backgroundColor: appTheme.background},
                  backFlag ? {flex: 0.85} : {flex: 1},
                ]}>
                <SearchBar
                  placeholder={translate('search.lbl_search')}
                  returnKeyLabel={translate('search.lbl_search')}
                  ref={searchRef}
                  searchIcon={{
                    type: 'font-awesome',
                    name: 'search',
                    color: appTheme.SearchiconColor,
                  }}
                  clearIcon={{
                    type: 'font-awesome',
                    name: 'close',
                    color: appTheme.iconColor,
                  }}
                  onFocus={onSearchFocus}
                  onChangeText={value => {
                    toggleSearchFocus(false);
                    dispatch({
                      type: GLOBAL_DATA,
                      payload: {resentSearchText: value},
                    });
                  }}
                  value={global_data.resentSearchText}
                  containerStyle={{
                    backgroundColor: 'transparent',
                    borderTopWidth: 0,
                    borderBottomWidth: 0,
                    padding: 0,
                  }}
                  inputContainerStyle={{
                    backgroundColor: appTheme.InputBoxBGColor,
                    borderRadius: 16,
                    paddingStart: 10,
                  }}
                  placeholderTextColor={appTheme.placeholderTextColor}
                  inputStyle={{color: appTheme.text}}
                />
              </View>
            )}
            {searchIconFlag && (
              <View
                style={[
                  styles.ButtonViewStyles,
                  commonStyle.flex_2pt,
                  {flexDirection: 'row'},
                ]}>
                <TouchableHighlight
                  underlayColor={ResColor.transparent}
                  onPress={() => {
                    renderFilterArr();
                  }}>
                  <ProgressiveImage
                    source={
                      appTheme.type == 'dark'
                        ? ResImage.ic_Filters_white
                        : ResImage.ic_Filters_black
                    }
                    style={[commonStyle.he_wi_24, {marginRight: 20}]}
                    resizeMode="stretch"
                  />
                </TouchableHighlight>
                <TouchableHighlight underlayColor={ResColor.transparent}>
                  <Icon
                    name="search"
                    type="font-awesome-5"
                    color={appTheme.SearchiconColor}
                    onPress={() => {
                      Helper.HandleVibration();
                      toggleSeachClickFlag(true);
                      toggleBackFlag(true);
                      toggleSearchIconFlag(false);
                      toggleSearchFocus(true);
                      setTimeout(() => {
                        searchRef.current != null && searchRef.current.focus();
                      }, 1000);
                    }}
                  />
                </TouchableHighlight>
              </View>
            )}
          </View>
          {!searchClickFlag && (
            <Animated.View
              style={{
                flexDirection: 'row',
                height: scrollOffsetY.interpolate({
                  inputRange: [0, 156],
                  outputRange: [50, 0],
                  extrapolate: 'clamp',
                }),
                justifyContent: 'space-between',
              }}>
              <Animated.View
                style={[
                  {
                    paddingHorizontal: screenWidth * 0.05,
                    height: headerHeight,
                    alignContent: 'flex-end',
                  },
                ]}>
                <Animated.Text
                  numberOfLines={1}
                  style={[
                    commonStyle.fontBold,
                    {
                      alignItems: 'flex-start',
                      marginTop: 10,
                      fontFamily: 'Gilroy-Bold',
                      fontWeight: '700',
                      width: '100%',
                      transform: [
                        {translateY: YTranslate},
                        {translateX: XTranslate},
                      ],
                      fontSize: scrollOffsetY.interpolate({
                        inputRange: [0, 32, 63, 94, 125, 156],
                        outputRange: [25, 24, 23, 22, 21, 20],
                        extrapolate: 'clamp',
                      }),
                      color: appTheme.text,
                    },
                  ]}>
                  {props.route.params.name}
                </Animated.Text>
              </Animated.View>
            </Animated.View>
          )}
          <Animated.View>
            {
              <View style={{flex: 0.8}}>
                {dataFiterTag && (
                  <FlatList
                    data={
                      dataFiterTag.categoryList[0].primary_filter_attribute[0]
                        .attribute_options
                    }
                    renderItem={renderFilterItem}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item.value}
                    contentContainerStyle={{
                      paddingVertical: 20,
                      alignItems: 'center',
                    }}
                    extraData={selectedId}
                  />
                )}
              </View>
            }
            {
              //filterTagflag &&
              // <View style={{ flexDirection: "row", alignItems: "center" }}>
              //     {
              //         dataFiterTag && dataFiterTag.categoryList[0].primary_filter_attribute[0].attribute_options.length > 0 ?
              // <Filterslider data={dataFiterTag.categoryList[0].primary_filter_attribute[0].attribute_options} StickyFilter={renderFilterArr} itemPress={itemClick} />
              //             :
              //             !loading && <View style={[{ width: 100, marginLeft: 16, marginVertical: 15, backgroundColor: ResColor.Green, borderRadius: 16, paddingVertical: 10, paddingHorizontal: 16 }]}>
              //                 <TouchableHighlight underlayColor="transparent" style={{ backgroundColor: ResColor.Green }} onPress={renderFilterArr}>
              //                     <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              //                         <View>
              //                             <Text style={[commonStyle.h5, commonStyle.fontBold, { color: ResColor.white }]}>
              //                                 {translate( 'filter.lbl_filter' )}
              //                             </Text>
              //                         </View>
              //                         <View>
              //                             <ProgressiveImage source={ResImage.ic_Filters} />
              //                         </View>
              //                     </View>
              //                 </TouchableHighlight>
              //             </View>
              //     }
              // </View>
            }
          </Animated.View>
        </Animated.View>
      )}

      {!searchClickFlag && (
        <View
          style={[
            commonStyle.paddingHorizontal_16,
            {backgroundColor: appTheme.background},
          ]}>
          {productsResponse &&
            (productsResponse.products.items.length == 0 ? (
              <View style={[styles.noProdView]}>
                <Text
                  style={[
                    commonStyle.h5,
                    commonStyle.marginTop_40,
                    {color: appTheme.text},
                  ]}>
                  {translate('products.lbl_no_product_found')}
                </Text>
              </View>
            ) : (
              <ProductList
                dataFiterTag={dataFiterTag}
                scrollOffsetY={scrollOffsetY}
                selectId={selectedId}
                items={productsResponse.products.items}
                currentPage={productsResponse.products.page_info.current_page}
                totalPage={productsResponse.products.page_info.total_pages}
                fetchMore={fetchMore}
                filter_data={filter_data}
                generateFilterObj={generateFilterObj}
                setLoginOverlay={login => {
                  setLoginOverlayvisible(login);
                }}
              />
            ))}
        </View>
      )}
      <Portal>
        <Modalize
          panGestureEnabled={false}
          modalTopOffset={StatusBar.currentHeight + 20}
          ref={modalizeRefFilter}
          scrollViewProps={{
            scrollEnabled: false,
            contentContainerStyle: {height: '100%'},
          }}>
          {productsResponse && (
            <Filter
              isFilterApplied={setisFilterApplied}
              isFilterAppliedtag={isFilterApplied}
              overlayToggle={closeToggleFilter}
              afterApplyFilter={afterApplyFilter}
              overlayToggleFlag={visible}
              current_page={productsResponse.products.page_info.current_page}
              //filterData={productsResponse}
              //red_Data={filter_data.allfilters.filter( el => el.category_id === props.route.params.id.toString() )}
              filterTypeMap={filterTypeMap}
              category_id={props.route.params.id.toString()}
              clearFilters={clearFilters}
            />
          )}
        </Modalize>
      </Portal>

      {isLoadingSkelton && (
        <View
          style={{
            width: Dimensions.get('window').width,
            position: 'absolute',
            top: 0,
            backgroundColor: appTheme.background,
            marginTop: insets.top,
          }}>
          <ProductListSkelton showTab={true} />
        </View>
      )}

      {searchClickFlag && (
        <ScrollView
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
          style={{marginTop: 160, padding: 16}}>
          <Search
            searchClickFlag={searchClickFlag}
            focus={searchFocusFlag}
            toggleSearchFocus={toggleSearchFocus}
          />
        </ScrollView>
      )}

      {LoginOverlayvisible === true ? (
        <View style={{width: '100%', zIndex: 11111, position: 'absolute'}}>
          <LoginOverlay
            visibleView={LoginOverlayvisible}
            OnClose={() => {
              setLoginOverlayvisible(false);
            }}
            onPressEmail={() => {
              setLoginOverlayvisible(false);
              navigation.navigate(Routes.AUTHSCREENS, {screen: 'Email'});
            }}
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  animatedContainer: {position: 'absolute', left: 0, right: 0, zIndex: 110},
  noProdView: {
    alignItems: 'center',
    justifyContent: 'center',
    height: Dimensions.get('window').height,
  },
  headerWrap: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    zIndex: 110,
  },
  ButtonViewStyles: {
    flex: 0.1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
