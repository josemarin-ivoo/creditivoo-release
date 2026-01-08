import React from 'react';
import {View} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import {translate} from '../../src/locales';
import {useContext} from 'react';
import {AppContext} from './../Pages/AppContext';

const CustomPBar = props => {
  const {appTheme} = useContext(AppContext);

  const overlay =
    appTheme.type === 'dark' ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.30)';

  return (
    <View>
      <Spinner
        visible={props.showProgress}
        textContent={translate('progressbar.loading_text')}
        // textContent={'Loading...'}
        textStyle={{color: appTheme.text}}
        color={appTheme.text}
        overlayColor={overlay}
        size="large"
      />
    </View>
  );
};

export default CustomPBar;