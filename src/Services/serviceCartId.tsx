import AsyncStorage from '@react-native-async-storage/async-storage';

export const getCartId = async (callback) => {
    const value = await AsyncStorage.getItem('persist:ivo-app');
    var cartId = "";
  //  console.log("_________", value)
    if (value != null) {
        const localStorage = JSON.parse(value).cartReducer;
        cartId = JSON.parse(localStorage).token;
        console.log("_________cartId", cartId)
        return cartId == "" ? cartId : ""
    } else {
        return callback("");
    }
}

