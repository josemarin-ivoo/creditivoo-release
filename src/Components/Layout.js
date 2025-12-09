/* eslint-disable react-native/no-inline-styles */ /* eslint-disable prettier/prettier */
import React, {useState} from 'react';
import {ScrollView, View} from 'react-native';
import commonStyle from '../../commonStyle';
import CustomHeader from './CustomHeader';
import {useContext} from 'react';
import {AppContext} from './../Pages/AppContext';
import {CustomHeaderWithSearch} from './CustomHeaderWithSearch';

export const Layout = props => {
  const searchHeaderFlag =
    props.searchHeaderFlag === undefined ? false : props.searchHeaderFlag;

  const getFilterTagValue =
    props.getFilterTagValue === undefined ? null : props.getFilterTagValue;
  const renderFilterArr =
    props.renderFilterArr === undefined ? null : props.renderFilterArr;
  const filterTagflag =
    props.filterTagflag === undefined ? false : props.filterTagflag;
  const categroryHeading =
    props.categroryHeading === undefined ? '' : props.categroryHeading;
  const categoryId = props.categoryId === undefined ? '' : props.categoryId;

  const headerFlag = props.header === undefined ? true : props.header;
  const gradientHeader =
    props.gradientHeader === undefined ? false : props.gradientHeader;
  const gradientHeaderOption =
    props.gradientHeaderOption === undefined
      ? false
      : props.gradientHeaderOption;
  const scroll = props.scroll === undefined ? false : props.scroll;
  const [scrolledValue, setScrolledValue] = useState(0);

  const {appTheme} = useContext(AppContext);

  const handleScroll = event => {
    setScrolledValue(event.nativeEvent.contentOffset.y);
  };

  return (
    <>
      <View style={{flex: 1, backgroundColor: appTheme.background}}>
        {headerFlag && !searchHeaderFlag ? (
          <CustomHeader
            gradientHeader={gradientHeader}
            gradientHeaderOption={gradientHeaderOption}
            scrolledValue={scrolledValue}
          />
        ) : null}
        {searchHeaderFlag ? (
          <>
            <CustomHeaderWithSearch
              searchIconFlag={props.searchIconFlag}
              backFlag={props.backFlag}
              toggleSeachClickFlag={props.toggleSeachClickFlag}
              toggleSearchIconFlag={props.toggleSearchIconFlag}
              toggleBackFlag={props.toggleBackFlag}
              toggleSearchFocusFlag={props.toggleSearchFocusFlag}
              toggleSearchFocus={props.toggleSearchFocus}
              clearFilter={props.clearFilter}
              filterTagflag={filterTagflag}
              getFilterTagValue={getFilterTagValue}
              renderFilterArr={renderFilterArr}
              categroryHeading={categroryHeading}
              categoryId={categoryId}
              searchValue={props.searchValue}
              HeadViewheight={props.HeadViewheight}
            />
          </>
        ) : null}
        {
          <ScrollView
            contentContainerStyle={[
              commonStyle.wrapper,
              !scroll && {flex: 1},
              {backgroundColor: appTheme.background},
            ]}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={true}
            showsVerticalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}>
            {props.children}
          </ScrollView>
        }
      </View>
    </>
  );
};
