import React, {useEffect, useState} from 'react';
import {setItemInStorage, getItemFromStorage} from '../Utils/Storage';
import {Appearance} from 'react-native';
import {greenColors, lightColors} from './../Utils/themeColors';
import {
  DEFAULT_THEME,
  currentThemeType,
  Theme,
  APP_THEME,
  currentTheme,
  AppContext,
} from './AppContext';

export const AppContextProvider = ({children}) => {
  const [appTheme, setAppTheme] = useState(DEFAULT_THEME);
  const [isInit, setIsInit] = useState(true);

  useEffect(() => {
    setInitialLoad();
  });

  const setInitialLoad = async () => {
    if (isInit) {
      await initializeAppTheme();
      setIsInit(false);
    }
  };

  const setLanguage = language => {
    // setItemInStorage(APP_LANGUAGE, language);
  };

  const setTheme = theme => {
    console.log('selected theme ------>>', theme);
    setAppTheme(theme);
    setItemInStorage(APP_THEME, theme);
  };

  const initializeAppTheme = async themeType => {
    currentTheme = await getItemFromStorage(APP_THEME);
    currentThemeType = await getItemFromStorage('THEME_TYPE');
    console.log(
      'current theme ------------->>',
      currentTheme,
      themeType,
      currentThemeType,
    );
    if (!currentTheme && !themeType) {
      console.log('colorScheme if ---->>');
      const colorScheme = Appearance.getColorScheme();
      console.log('colorScheme if ---->>', colorScheme, themeType);
      setAppTheme((colorScheme && colorScheme) || DEFAULT_THEME);
    } else {
      console.log('colorScheme else ---->>', themeType);
      if (themeType) {
        console.log('colorScheme else if ---->>', themeType);
        setAppTheme(themeType);
        setItemInStorage(APP_THEME, themeType);
      } else {
        console.log('colorScheme else else ---->>', themeType);
        setAppTheme(currentThemeType);
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        setAppLanguage: setLanguage,
        appTheme: Theme[appTheme],
        setAppTheme: setTheme,
        initializeAppTheme,
      }}>
      {children}
    </AppContext.Provider>
  );
};
