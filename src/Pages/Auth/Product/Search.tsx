import {useLazyQuery} from '@apollo/client';
import {useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import commonStyle from '../../../../commonStyle';
import {filterBycategory} from '../../../Queries/queries';
import ProgressiveImage from '../../../Components/ProgressiveImage';
import useDebounce from '../../../Services/debouncing';
import {useSelector, useDispatch} from 'react-redux';
import {GLOBAL_DATA} from '../../../redux/actionTypes';
import CustomPBar from '../../../Components/CustomPBar';
import {translate} from '../../../locales';
import clr from '../../../Utils/Colors';
import {Routes} from '../../../Utils/NavigationRoutes';
import Helper from '../../../Utils/Helper';
import {AppContext} from '../../AppContext';
import {AnalyticsEvent} from './../../../helpers/analyticHelper';
import TrackEvents from '../../../Utils/TrackingEvent';
import ResourceColors from '../../../Utils/Colors';

export default function Search(props: any) {
  const global_data = useSelector((state: any) => state.commonReducer);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {appTheme} = useContext<any>(AppContext);
  const [isDark, setDark] = useState<any>(appTheme.type === 'dark');
  useEffect(() => {
    setDark(appTheme.type === 'dark');
  }, [appTheme.type]);

  const debouncedSearchTerm = useDebounce(global_data.resentSearchText, 1500);
  const [searchFunc, {loading, data}] = useLazyQuery(filterBycategory);
  const goToNext = (option: any) => {
    Helper.HandleVibration();
    navigation.navigate(Routes.NAVIGATION_TO_PRODUCTDETAILS, {
      heading: option.name,
      id: option.sku,
    });
  };

  useEffect(() => {
    if (debouncedSearchTerm) {
      console.log('search==================', debouncedSearchTerm);

      let recentSearch = global_data.resentSearch;

      //firstly remove the duplicate from the list before pushing it into the list
      if (recentSearch.length > 0) {
        recentSearch = recentSearch.filter(
          searchTerm => searchTerm !== debouncedSearchTerm,
        );
      }
      recentSearch.length > 4 && recentSearch.pop();
      recentSearch.unshift(debouncedSearchTerm);

      dispatch({type: GLOBAL_DATA, payload: {resentSearch: recentSearch}});

      AnalyticsEvent(TrackEvents.Category, {
        userEmail: global_data.email,
        category_id: 0,
        saleType: '',
        CategorySearchterm: debouncedSearchTerm,
      });

      searchFunc({variables: {name: debouncedSearchTerm}});
    }
  }, [debouncedSearchTerm]);

  const categoryNavigation = (count: any, option: any) => {
    Helper.HandleVibration();

    AnalyticsEvent(TrackEvents.Category, {
      userEmail: global_data.email,
      category_id: option.id,
      saleType: option.name,
    });

    navigation.navigate(Routes.NAVIGATION_TO_CATEGORYDETAIL, {
      id: option.id,
      name: option.name,
    });
  };

  return (
    <View>
      {props.focus && global_data.resentSearch.length > 0 && (
        <>
          <Text
            style={[
              commonStyle.h4,
              commonStyle.fontBold,
              {color: appTheme.text},
            ]}>
            {/* Recent Search */}
            {translate('search.lbl_recent_search')}
          </Text>
          {global_data.resentSearch.slice(0, 3).map(option => {
            return (
              <TouchableOpacity
                onPress={() => {
                  Helper.HandleVibration();
                  dispatch({
                    type: GLOBAL_DATA,
                    payload: {resentSearchText: option},
                  });
                  props.toggleSearchFocus(false);
                }}>
                <Text
                  style={[
                    commonStyle.h4,
                    {
                      color: isDark ? appTheme.text : clr.Gray,
                    },
                  ]}>
                  {option}
                </Text>
                <View style={styles.SectionLineStyles}></View>
              </TouchableOpacity>
            );
          })}
        </>
      )}
      {!props.focus &&
        data &&
        data.products.categoryList.length > 0 &&
        data.products.categoryList.map(option => {
          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => categoryNavigation(option.children_count, option)}>
              <View
                style={[
                  styles.CategoryListContainer,
                  {backgroundColor: appTheme.InputBoxBGColor},
                ]}>
                <View style={[commonStyle.flex_15pt]}>
                  {option.icon != null && (
                    <ProgressiveImage
                      source={{uri: option.icon}}
                      style={[commonStyle.he_wi_40]}
                      resizeMode="stretch"
                    />
                  )}
                </View>
                <View style={[commonStyle.flex_85pt]}>
                  <Text
                    style={[
                      commonStyle.customfontsize,
                      {color: appTheme.text},
                    ]}>
                    {option.name}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      {!props.focus && data && (
        <>
          <CustomPBar showProgress={loading} />
          {data.products.items.length > 0 ? (
            <>
              <Text
                style={[
                  commonStyle.h4,
                  commonStyle.fontBold,
                  {
                    marginBottom: 15,
                    marginTop: 15,
                    color: appTheme.text,
                  },
                ]}>
                {translate('search.lbl_product_search')}
              </Text>
              {data.products.items.map(option => {
                return (
                  <TouchableOpacity onPress={() => goToNext(option)}>
                    <View style={styles.searchItemContainer}>
                      <View style={[commonStyle.marginRight_20]}>
                        {
                          <ProgressiveImage
                            source={{
                              uri:
                                option.small_image.url + Helper.listImageSize,
                            }}
                            style={[styles.searchItemImage, {borderRadius: 12}]}
                            resizeMode="stretch"
                          />
                        }
                      </View>
                      <View style={{flex: 0.89}}>
                        <Text
                          numberOfLines={1}
                          style={[
                            commonStyle.h4,
                            {color: isDark ? appTheme.text : clr.Gray},
                          ]}>
                          {option.name}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </>
          ) : (
            global_data.resentSearch.length > 0 && (
              <View style={[styles.noProdView]}>
                <Text
                  style={[
                    commonStyle.h5,
                    {color: appTheme.text, fontWeight: '700'},
                  ]}>
                  {translate('search.lbl_no_result')}
                </Text>
              </View>
            )
          )}
        </>
      )}
      <CustomPBar showProgress={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  SectionLineStyles: {
    width: '100%',
    height: 1.5,
    backgroundColor: ResourceColors.lightgrey,
    marginVertical: 10,
  },
  noProdView: {
    alignItems: 'center',
    justifyContent: 'center',
    height: Dimensions.get('window').height - 300,
  },
  searchItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchItemImage: {width: 40, height: 40},
  CategoryListContainer: {
    flexDirection: 'row',
    backgroundColor: ResourceColors.SmokeWhite,
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  CatListContainer: {color: ResourceColors.black, marginBottom: 10},
});
