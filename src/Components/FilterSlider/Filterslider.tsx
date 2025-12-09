import React, {useRef, useCallback, useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  Alert,
  Platform,
  FlatList,
  ListRenderItemInfo,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import StickyItemFlatList from '@gorhom/sticky-item';
import FilterItem from './FilterItem/FilterItem';
import BasicSticky from './basicsticky/BasicSticky';
import ResColor from '../../Utils/Colors';
import Helper from '../../Utils/Helper';
// const data = [...Array(20)]
// .fill(0)
// .map((_, item) => ({ id: `item-${item}` }));

export const STORY_WIDTH = 120;
export const STORY_HEIGHT = 46;
const STICKY_ITEM_WIDTH = 56;
const STICKY_ITEM_HEIGHT = 66;
const SEPARATOR_SIZE = 10;
const BORDER_RADIUS = 18;

const Filterslider = (prop: any) => {
  const flatListRef = useRef<FlatList>(null);

  // styles
  const containerStyle = {
    paddingVertical: SEPARATOR_SIZE * 2,
    backgroundColor: 'rgba(255, 255, 255, 0.0)',
  };

  // methods
  // const handleStickyItemPress = () => {prop.StickyFilter;}
  // const handleScrollToEnd = () =>
  // {
  //   const flatlist = flatListRef.current;
  //   if ( flatlist )
  //   {
  //     flatlist.scrollToEnd( { animated: true } );
  //   }
  // };
  // const handleScrollToStart = () =>
  // {
  //   const flatlist = flatListRef.current;
  //   if ( flatlist )
  //   {
  //     flatlist.scrollToOffset( { animated: true, offset: 0 } );
  //   }
  // };
  // const handleScrollToIndex = useCallback( item =>
  // {
  //   const flatlist = flatListRef.current;
  //   if ( flatlist )
  //   {
  //     flatlist.scrollToIndex( { index } );
  //   }
  // }, [] );

  const [state, setstate] = useState('');

  // useEffect( () =>
  // {
  //   setstate( '' )
  // }, []);

  // render
  const renderItem = ({item}: ListRenderItemInfo<{}>) => (
    <TouchableOpacity
      key={Math.random()}
      onPress={() => {
        Helper.HandleVibration();
        if (state == item.value) {
          setstate('');
          prop.itemPress('');
          //console.log( item )
        } else {
          setstate(item.value);
          prop.itemPress(item.value);
        }
      }}>
      <FilterItem isSelected={state == item.value} item={item.label} />
    </TouchableOpacity>
  );
  return (
    <SafeAreaView style={styles.root}>
      <View style={containerStyle}>
        <StickyItemFlatList
          ref={flatListRef}
          itemWidth={STORY_WIDTH}
          itemHeight={STORY_HEIGHT}
          separatorSize={SEPARATOR_SIZE}
          borderRadius={BORDER_RADIUS}
          stickyItemWidth={STICKY_ITEM_WIDTH}
          stickyItemHeight={STICKY_ITEM_HEIGHT}
          stickyItemBackgroundColors={[ResColor.transparent, ResColor.Green]}
          stickyItemContent={BasicSticky}
          onStickyItemPress={prop.StickyFilter}
          data={prop.data}
          keyExtractor={(item: any) => item.value}
          renderItem={renderItem}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  text: {
    marginHorizontal: SEPARATOR_SIZE * 2,
    marginBottom: SEPARATOR_SIZE,
    fontSize: 43,
    fontWeight: Platform.OS === 'ios' ? '900' : 'bold',
    textTransform: 'uppercase',
    //color: 'red',
  },
});

export default Filterslider;
