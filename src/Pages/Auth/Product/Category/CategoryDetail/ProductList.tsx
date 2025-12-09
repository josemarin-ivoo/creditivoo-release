import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Animated,
} from 'react-native';
import {ProductCard} from './ProductCard';
import clr from '../../../../../Utils/Colors';
import commonStyle from '../../../../../../commonStyle';
import CustomPBar from '../../../../../Components/CustomPBar';
import LoginOverlay from '../../../Cart/LoginOverlay';
import {useNavigation} from '@react-navigation/native';
import {Routes} from '../../../../../Utils/NavigationRoutes';

export const ProductList = props => {
  //const [scrolledValue, setScrolledValue] = useState( 0 )
  const navigation = useNavigation();
  const fetchMore = props.fetchMore;

  // const filtersObj = props.filtersObj
  const filter_data = props.filter_data;
  const selectedId = props.selectedId;

  const [currentPage, setCurrentPage] = useState(props.currentPage);
  const [totalPage, setTotalPage] = useState(props.totalPage);
  const [items, setItems] = useState(props.items);
  const [loading, setLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [LoginOverlayvisible, setLoginOverlayvisible] = useState(false);

  const columns = props.items.length > 5 ? 2 : 1;

  const renderDom = (item: any, index: any, isTrue: Boolean) => {
    //console.log( "888888888888888888", item.sku )
    return (
      <ProductCard
        key={item.sku}
        item={item}
        index={index}
        isTrue={isTrue}
        isLoading={load => {
          setLoading(load);
        }}
        setLoginOverlay={props.setLoginOverlay}
      />
    );
  };

  const renderItem = ({item, index}) => {
    if (columns == 1) {
      return renderDom(item, index, true);
    } else {
      return renderDom(item, index, false);
    }
  };

  // const handleScroll = ( event ) =>
  // {
  //    // setScrolledValue( event.nativeEvent.contentOffset.y );
  // }

  const loadMoreData = () => {
    if (isLoadingMore || currentPage >= totalPage) {
      return;
    }

    setIsLoadingMore(true);
    setCurrentPage(currentPage + 1);

    const filtersObj = props.generateFilterObj(filter_data.filters);

    fetchMore({
      variables: {
        filters: filtersObj,
        pageSize: filter_data.pageSize,
        sort: filter_data.sort,
        currentPage: currentPage + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          setIsLoadingMore(false);
          return prev;
        }

        // Merge the new items with the existing ones
        const newItems = [
          ...prev.products.items,
          ...fetchMoreResult.products.items,
        ];

        setIsLoadingMore(false);
        console.log('nextPage');
        console.log(newItems.length);

        // Update the state with the new items
        setItems(newItems);

        // Return the updated query result
        return {
          ...prev,
          products: {
            ...prev.products,
            items: newItems,
          },
        };
      },
    }).catch(error => {
      console.error('Error fetching more data:', error);
      setIsLoadingMore(false);
    });
  };

  const renderFooter = () => {
    try {
      // Check If Loading
      if (isLoadingMore) {
        return (
          <View style={[styles.container, styles.horizontal]}>
            <ActivityIndicator size="large" color={clr.Green} />
          </View>
        );
      } else {
        return (
          <View style={{backgroundColor: clr.transparent, height: 0}}></View>
        );
      }
    } catch (error) {
      //  console.log( error );
    }
  };

  const renderspacedHeader = () => {
    return props.dataFiterTag ? (
      <View style={{height: 210}} />
    ) : (
      <View style={{height: 130}} />
    );
  };

  return (
    <>
      {columns == 1 ? (
        <FlatList
          data={items}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          numColumns={1}
          ListHeaderComponent={renderspacedHeader}
          keyExtractor={item => item.sku}
          extraData={selectedId}
          // onMomentumScrollBegin={handleScroll}
          onScroll={Animated.event(
            [
              {
                nativeEvent: {contentOffset: {y: props.scrollOffsetY}},
              },
            ],
            {useNativeDriver: false},
          )}
          scrollEventThrottle={50}
        />
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          numColumns={2}
          removeClippedSubviews={true}
          keyExtractor={item => item.sku}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderspacedHeader}
          contentContainerStyle={[commonStyle.paddingVertical_20]}
          extraData={selectedId}
          // onMomentumScrollBegin={handleScroll}
          columnWrapperStyle={[commonStyle.justifyContent_space_between]}
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          onScroll={Animated.event(
            [
              {
                nativeEvent: {contentOffset: {y: props.scrollOffsetY}},
              },
            ],
            {useNativeDriver: false},
          )}
          scrollEventThrottle={50}
        />
      )}
      <CustomPBar showProgress={loading} />
      {LoginOverlayvisible === true ? (
        <View style={{width: '100%', position: 'absolute'}}>
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
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    // flexDirection: "row",
    justifyContent: 'space-around',
  },
});
