import AsyncStorage from '@react-native-async-storage/async-storage';

export const CartItemCounterService = async ( callback ) =>
{
    const value = await AsyncStorage.getItem( 'persist:ivo-app' );
    var itemcntr = 0;
   // console.log( '_________', value );
    if ( value != null )
    {
        const localStorage = JSON.parse( value ).CartItemCounterReducer;
        itemcntr = JSON.parse( localStorage ).CART_ITEM_COUNTER;
        console.log( 'CART_ITEM_COUNTER reducer', itemcntr );
        
        return callback( itemcntr );
    } else
    {
        return callback( true );
    }
};
