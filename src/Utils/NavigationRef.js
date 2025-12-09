/* eslint-disable prettier/prettier */
import { CommonActions } from '@react-navigation/native';

let navigator;
var toNavigate = false;
var rName = null;
var param = null;

// nav is coming from react navigation
export const setNavigator = (navRef) => {
  //console.log('navigation ref', navRef);
  navigator = navRef;
  if (toNavigate === true) {
    navigator.current.navigate(rName, param);
    toNavigate = false;
  }
};

// nav is coming from react navigation
export const getNavigator = ( navRef ) =>
{
  console.log( navigator.current.getCurrentRoute().name );
  return navigator.current.getCurrentRoute().name;
};

export const navigate = ( routeName, params ) =>
{
  
  if ( navigator.current !== undefined )
  {
    navigator.current.navigate( routeName, params );
  } else
  {
    toNavigate = true;
    rName = routeName;
    param = params;
  }
};


export const navigateCommonActions = ( routeName, params ) =>
{
  if ( navigator.current !== undefined )
  {
    //navigator.current.navigate( routeName, params );
    navigator.dispatch(
      CommonActions.reset( {
        index: 0,
        routes: [{ name: routeName, params: params }],
      } ),
    );
  } else
  {
    toNavigate = true;
    rName = routeName;
    param = params;
  }
};