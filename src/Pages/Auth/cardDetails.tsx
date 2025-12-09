import { useLazyQuery } from '@apollo/client';
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import commonStyle from '../../../commonStyle';
import CustomPBar from '../../Components/CustomPBar';
import { Layout } from '../../Components/Layout';
import Sales from '../../Components/Sales';
import { cardDetailInfo } from '../../Queries/queries';
import { translate } from '../../locales';
import Helper from '../../Utils/Helper';

const CardDetails = ( props ) =>
{
  // console.log(props.route.params.id)
  const [
    cardDetailInfoFunc,
    {
      loading: cardDetailInfoLoading,
      error: cardDetailInfoError,
      data: cardDetailInfoData,
    },
  ] = useLazyQuery( cardDetailInfo );

  useEffect( () =>
  {
    cardDetailInfoError && Helper.ShowAlert( `${ cardDetailInfoError }` );
  }, [cardDetailInfoError] );


  useEffect( () =>
  {
    cardDetailInfoFunc( { variables: { cardId: props.route.params.id } } );
  }, [] );

  const getProgressPercent = ( option ) =>
  {
    var d1: any = new Date( option.sale_start_date ),
      d2: any = new Date( option.sale_end_date );
    var diff = d2 - d1;
    if ( diff > 60e3 )
    {
      return Math.floor( diff / 60e3 ) / 144000;
    } else
    {
      return Math.floor( diff / 1e3 ) / 8640000;
    }
  };
  const getRemainingTime = ( option ) =>
  {
    var d1: any = new Date( option.sale_start_date ),
      d2: any = new Date( option.sale_end_date );
    var diff = Math.abs( d1 - d2 );
    var seconds: any = ( diff / 1000 ).toFixed( 0 );
    var minutes: any = Math.floor( seconds / 60 );
    var hours: any = '';
    if ( minutes > 59 )
    {
      hours = Math.floor( minutes / 60 );
      hours = hours >= 10 ? hours : '0' + hours;
      minutes = minutes - hours * 60;
      minutes = minutes >= 10 ? minutes : '0' + minutes;
    }

    seconds = Math.floor( seconds % 60 );
    seconds = seconds >= 10 ? seconds : '0' + seconds;
    if ( hours != '' )
    {
      return hours + ':' + minutes + ':' + seconds;
    }
    return minutes + ':' + seconds;
  };
  return (
    <Layout>
      <View style={[commonStyle.padding_16]}>
        <Text style={[commonStyle.h2, commonStyle.fontBold]}>
          {props.route.params.heading}
        </Text>
        {
          cardDetailInfoData &&
        cardDetailInfoData.categoryList[0].children.length > 0 ? (
          cardDetailInfoData.categoryList[0].children.map((option) => {
            return (
              <View style={[commonStyle.marginTop_30]}>
                <Sales
                  themeName={option.text_color}
                  id={option.id}
                  imgName={option.icon}
                  progressValue={getProgressPercent( option )}
                  saleType={option.name}
                  theme={option.category_background_css}
                  time={getRemainingTime( option )}
                />
              </View>
            );
          } )
        ) : (
          <Text style={[commonStyle.h5, commonStyle.marginTop_40]}>
            {/* Insufficient offers data */}
            {translate( 'cardDetails.lbl_noOffers' )}
          </Text>
        )}
        <CustomPBar showProgress={cardDetailInfoLoading} />
      </View>
    </Layout>
  );
};

export default CardDetails;
