import AsyncStorage from '@react-native-async-storage/async-storage';

export const LaunchService = async (callback) =>
{
    const value = await AsyncStorage.getItem('persist:ivo-app');
    var LaunchValue = true;
  //  console.log("_________", value)
    if ( value != null )
    {
        const localStorage = JSON.parse(value).AppLaunchReducer;
        LaunchValue = JSON.parse(localStorage).FIRST_LAUNCH;
        console.log( "_________FIRST_LAUNCH", LaunchValue )
       // console.log('if')
        return callback(LaunchValue);
    } else
    {
        //console.log('else')
        return callback(true);
    }
}