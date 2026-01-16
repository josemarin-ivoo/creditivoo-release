/* eslint-disable semi */
/* eslint-disable prettier/prettier */
import {useLazyQuery} from '@apollo/client';
import {useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';

import commonStyle from '../../../../../commonStyle';
import {Layout} from '../../../../Components/Layout';
import {categoryList} from '../../../../Queries/queries';
import ProgressiveImage from '../../../../Components/ProgressiveImage';
import Search from '../Search';
import {useDispatch, useSelector} from 'react-redux';
import {GLOBAL_DATA} from '../../../../redux/actionTypes';
import CustomPBar from '../../../../Components/CustomPBar';
import clrs from '../../../../Utils/Colors';
import {Routes} from '../../../../Utils/NavigationRoutes';
import Helper from '../../../../Utils/Helper';
import {AppContext} from '../../../AppContext';
import {AnalyticsEvent} from './../../../../helpers/analyticHelper';
import TrackEvents from '../../../../Utils/TrackingEvent';

export const CategoryList = () => {
  const navigation = useNavigation();
  const global_data = useSelector((state: any) => state.commonReducer);
  const dispatch = useDispatch();
  const {appTheme} = useContext<any>(AppContext);
  const [isDark, setDark] = useState<any>(appTheme.type === 'dark');
  useEffect(() => {
    setDark(appTheme.type === 'dark');
  }, [appTheme.type]);

  const [search, setsrch] = useState('');
  const [categoryId, setCategoryId] = useState(2);
  const [productInfoFunc, {loading, error, data}] = useLazyQuery(categoryList);
  const [searchClickFlag, setSearchClickFlag] = useState(false);
  const [backFlag, setBackFlag] = useState(false);
  const [searchIconFlag, setSearchIconFlag] = useState(false);
  const [searchFocusFlag, setSearchFocusFlag] = useState(false);
  const [headHeight, setheadHeight] = useState(0);

  const hasInitialized = useRef(false);

  useEffect(() => {
    error && Helper.ShowAlert(error.message);
  }, [error]);
  console.log(categoryId);

  // useEffect(() => {
  //   const unsubscribe = navigation.addListener('focus', () => {
  //     if (categoryId == 2) {
  //       setsrch('');
  //       setBackFlag(false);
  //       setSearchIconFlag(false);
  //       setSearchFocusFlag(false);
  //       setSearchClickFlag(false);
  //       dispatch({type: GLOBAL_DATA, payload: {resentSearchText: ''}});
  //       setCategoryId(2);
  //     }
  //   });
  //   return unsubscribe;
  // }, [navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (!hasInitialized.current) {
        if (categoryId == 2) {
          setsrch('');
          setBackFlag(false);
          setSearchIconFlag(false);
          setSearchFocusFlag(false);
          setSearchClickFlag(false);
          dispatch({ type: GLOBAL_DATA, payload: { resentSearchText: '' } });
          setCategoryId(2);
        }
        hasInitialized.current = true;
      }
    });
    return unsubscribe;
  }, [navigation, categoryId]);

  useEffect(() => {
    productInfoFunc({variables: {Id: categoryId}});
  }, [categoryId]);

  const goToNext = (count: any, option: any) => {
    Helper.HandleVibration();
    if (count == 0) {
      AnalyticsEvent(TrackEvents.Category, {
        userEmail: global_data.email,
        category_id: option.id,
        saleType: option.name,
      });

      navigation.navigate(Routes.NAVIGATION_TO_CATEGORYDETAIL, {
        id: option.id,
        name: option.name,
      });
      setCategoryId(2); //"CategoryDetail"
    } else {
      dispatch({
        type: GLOBAL_DATA,
        payload: {resentSearch: global_data.resentSearch},
      });
      setCategoryId(option.id);
      setSearchClickFlag(false);
      setBackFlag(true);
      setSearchIconFlag(true);
    }
  };

  const toggleSeachClickFlag = (toggleValue: any) => {
    setSearchClickFlag(toggleValue);
    setSearchFocusFlag(true);
  };
  const toggleSearchIconFlag = (toggleValue: any) => {
    setSearchIconFlag(toggleValue);
  };
  const toggleBackFlag = (toggleValue: any) => {
    setCategoryId(2);
    setBackFlag(toggleValue);
  };
  const toggleSearchFocus = (focusFlag: any) => {
    setSearchFocusFlag(focusFlag);
  };

  return (
    <Layout
      searchHeaderFlag={true}
      searchIconFlag={searchIconFlag}
      searchValue={search}
      toggleSearchIconFlag={toggleSearchIconFlag}
      backFlag={backFlag}
      toggleBackFlag={toggleBackFlag}
      toggleSeachClickFlag={toggleSeachClickFlag}
      toggleSearchFocus={toggleSearchFocus}
      HeadViewheight={e => {
        setheadHeight(e);
      }}>
      {/* <StatusBar backgroundColor="rgba(255, 255, 255, 0.8)" barStyle="dark-content" /> */}
      <StatusBar
        backgroundColor={
          isDark ? appTheme.background : 'rgba(255, 255, 255, 0.8)'
        }
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      <View
        style={[
          commonStyle.paddingHorizontal_16,
          {backgroundColor: appTheme.background},
        ]}>
        <ScrollView
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}>
          <View
            style={{
              paddingTop:
                Platform.OS === 'ios'
                  ? headHeight + StatusBar.currentHeight + 45
                  : headHeight + StatusBar.currentHeight + 15,
              backgroundColor: appTheme.background,
            }}>
            {!searchClickFlag && data && (
              <>
                {data.categoryList[0].id != 2 ? (
                  <Text
                    style={[
                      commonStyle.h3,
                      commonStyle.fontBold,
                      styles.CatListContainer,
                      {color: appTheme.text},
                    ]}>
                    {data.categoryList[0].name}
                  </Text>
                ) : null}
                {data.categoryList[0].children.map(option => {
                  if (option.include_in_menu == 0 && option.level == 2) {
                    return null;
                  }
                  return (
                    <TouchableOpacity
                      key={option.id}
                      onPress={() => goToNext(option.children_count, option)}>
                      <View
                        style={[
                          styles.CategoryListContainer,
                          {backgroundColor: appTheme.InputBoxBGColor},
                        ]}>
                        <View style={[commonStyle.flex_15pt]}>
                          {option.icon != null ? (
                            <ProgressiveImage
                              source={{uri: option.icon}}
                              style={[commonStyle.he_wi_40]}
                              resizeMode="stretch"
                            />
                          ) : null}
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
              </>
            )}
            <View>
              {searchClickFlag ? (
                <ScrollView removeClippedSubviews={true}>
                  <Search
                    searchClickFlag={searchClickFlag}
                    focus={searchFocusFlag}
                    toggleSearchFocus={toggleSearchFocus}
                  />
                </ScrollView>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </View>
      <CustomPBar showProgress={loading} />
    </Layout>
  );
};

const styles = StyleSheet.create({
  CategoryListContainer: {
    flexDirection: 'row',
    backgroundColor: clrs.SmokeWhite,
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  CatListContainer: {color: clrs.black, marginBottom: 10},
});
