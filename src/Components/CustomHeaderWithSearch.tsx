import {useLazyQuery} from '@apollo/client';
import {useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  TouchableHighlight,
  Platform,
} from 'react-native';
import {Icon, SearchBar} from 'react-native-elements';
import {useSelector, useDispatch} from 'react-redux';
import commonStyle from '../../commonStyle';
import {translate} from '../locales/translate';
import {AppContext} from '../Pages/AppContext';
import {filterTag} from '../Queries/queries';
import {GLOBAL_DATA} from '../redux/actionTypes';
import colorResource from '../Utils/Colors';
import Helper from '../Utils/Helper';
import ImageRes from '../Utils/Image';
import Filterslider from './FilterSlider/Filterslider';
import ProgressiveImage from './ProgressiveImage';
import Colors from '../Utils/Colors';

export const CustomHeaderWithSearch = (props: any) => {
  const {appTheme} = useContext<any>(AppContext);

  const navigation = useNavigation();
  const global_data = useSelector((state: any) => state.commonReducer);
  const dispatch = useDispatch();
  const searchRef: any = useRef(null);

  const [scrolledValue, setScrolledValue] = useState(0);
  const [selectedId] = useState(null);
  const [headerheight, setheight] = useState(0);
  const [filterTagFunc, {loading, data: dataFiterTag}] =
    useLazyQuery(filterTag);

  useEffect(() => {
    props.filterTagflag && filterTagFunc({variables: {Id: props.categoryId}});
  }, []);

  useEffect(() => {
    props.filterTagflag && filterTagFunc({variables: {Id: props.categoryId}});
  }, [props.clearFilter]);

  const onSearchFocus = () => {
    props.toggleBackFlag(true);
    props.toggleSeachClickFlag(true);
    props.toggleSearchFocus(true);
   // dispatch({type: GLOBAL_DATA, payload: {resentSearchText: ''}});
  };
  const onLayout = (e: any) => {
    const height = e.nativeEvent.layout.height;
    height && props.HeadViewheight(height);
  };
  const renderFilterItem = ({attribute_code, item}: any) => {
    return (
      <TouchableHighlight
        underlayColor="transparent"
        onPress={() => {
          Helper.HandleVibration();
          props.getFilterTagValue(
            dataFiterTag.categoryList[0].primary_filter_attribute[0]
              .attribute_code,
            item.value,
          );
        }}>
        <Text
          style={{
            backgroundColor: colorResource.SmokeWhite,
            borderRadius: 16,
            paddingVertical: 10,
            paddingHorizontal: 16,
            marginRight: 10,
            overflow: 'hidden',
          }}>
          {item.label}
        </Text>
      </TouchableHighlight>
    );
  };
  const itemClick = (item: any) => {
    props.getFilterTagValue(
      dataFiterTag.categoryList[0].primary_filter_attribute[0].attribute_code,
      item,
    );
  };

  return (
    <>
      <View
        style={[
          styles.headerWrap,
          {
            backgroundColor:
              appTheme.type == 'green'
                ? Colors.greenBackground
                : appTheme.whiteOpacity08,

            marginTop: Platform.OS === 'ios' ? 45 : 25,
            position: 'absolute',
            top: 0,
            zIndex: 9999,
          },
        ]}
        onLayout={onLayout}>
        <StatusBar
          translucent={true}
          backgroundColor={
            appTheme.type == 'green' ? Colors.Green : appTheme.whiteOpacity08
          }
          barStyle={appTheme.statusBar}
        />
        <View
          style={{
            flexDirection: 'row',
            flex: 1,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          {props.backFlag ? (
            <View style={{flex: 0.1}}>
              <TouchableHighlight
                underlayColor="transparent"
                onPress={() => {
                  Helper.HandleVibration();
                  searchRef.current != null && searchRef.current.blur();
                  props.toggleBackFlag(false);
                  props.toggleSeachClickFlag(false);
                  props.toggleSearchIconFlag(false);
                  dispatch({
                    type: GLOBAL_DATA,
                    payload: {resentSearchText: ''},
                  });
                }}>
                <Icon
                  name="arrow-left"
                  type="font-awesome-5"
                  color={appTheme.backiconColor}
                  onPress={() => {
                    Helper.HandleVibration();
                    searchRef.current != null && searchRef.current.blur();
                    props.toggleBackFlag(false);
                    props.toggleSeachClickFlag(false);
                    props.toggleSearchIconFlag(false);
                    dispatch({
                      type: GLOBAL_DATA,
                      payload: {resentSearchText: ''},
                    });
                  }}
                />
              </TouchableHighlight>
            </View>
          ) : null}
          {!props.searchIconFlag ? (
            <View
              style={
                props.backFlag
                  ? {flex: 0.85}
                  : props.searchIconFlag
                  ? {flex: 0.75}
                  : {flex: 1}
              }>
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
                  props.toggleSearchFocus(false);
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
                inputStyle={{textAlign: 'left', color: appTheme.text}}
                placeholderTextColor={colorResource.Gray}
              />
            </View>
          ) : null}
          {props.searchIconFlag ? (
            <View style={[styles.ButtonViewStyles, commonStyle.flex_1pt]}>
              <TouchableHighlight underlayColor={colorResource.transparent}>
                <Icon
                  name="search"
                  type="font-awesome-5"
                  color={appTheme.background}
                  onPress={() => {
                    Helper.HandleVibration();
                    props.toggleSeachClickFlag(true);
                    props.toggleBackFlag(true);
                    props.toggleSearchIconFlag(false);
                    props.toggleSearchFocus(true);
                    setTimeout(() => {
                      searchRef.current != null && searchRef.current.focus();
                    }, 1000);
                  }}
                />
              </TouchableHighlight>
            </View>
          ) : null}
        </View>
      </View>

      {props.filterTagflag ? (
        <View style={{backgroundColor: 'white', paddingTop: 85}}>
          <Text
            style={[
              commonStyle.h2,
              commonStyle.fontBold,
              {paddingHorizontal: 15, marginTop: 5},
            ]}>
            {props.categroryHeading}
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {/* {dataFiterTag ? (
              <Filterslider
                data={
                  dataFiterTag.categoryList[0].primary_filter_attribute[0]
                    .attribute_options
                }
                StickyFilter={props.renderFilterArr}
                clearFilter={props.clearFilter}
                itemPress={itemClick}
              />
            ) : null} */}
            {!loading && !dataFiterTag ? (
              <View
                style={[
                  {
                    width: 100,
                    marginLeft: 16,
                    marginVertical: 15,
                    backgroundColor: colorResource.Green,
                    borderRadius: 16,
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                  },
                ]}>
                <TouchableHighlight
                  underlayColor="transparent"
                  style={{backgroundColor: colorResource.Green}}
                  onPress={props.renderFilterArr}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    {
                      <View>
                        <Text
                          style={[
                            commonStyle.h5,
                            commonStyle.fontBold,
                            {color: colorResource.white},
                          ]}>
                          {translate('filter.lbl_filter')}
                        </Text>
                      </View>
                    }
                    <View>
                      <ProgressiveImage source={ImageRes.ic_Filters} />
                    </View>
                  </View>
                </TouchableHighlight>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  SectionLineStyles: {
    width: '100%',
    height: 1.5,
    backgroundColor: 'lightgrey',
    marginVertical: 10,
  },
  headerWrap: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  ButtonViewStyles: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoViewStyles: {
    flex: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
