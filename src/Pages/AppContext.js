/* eslint-disable prettier/prettier */
import React, {createContext, useEffect, useState} from 'react';
import {setItemInStorage, getItemFromStorage} from '../Utils/Storage';
import {Appearance} from 'react-native';
import {darkColors, greenColors, lightColors} from './../Utils/themeColors';
export const DEFAULT_THEME = 'light';

export const Theme = {
  light: lightColors,
  dark: darkColors,
};

// const APP_LANGUAGE = 'appLanguage';
const APP_THEME = 'appTheme';

export const AppContext = createContext({
  initializeAppLanguage: () => {},
  appTheme: DEFAULT_THEME,
  initializeAppTheme: () => {},
  setAppTheme: () => {},
});

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
    console.log('selected theme ------>>', APP_THEME, theme);
    setAppTheme(theme);
    setItemInStorage(APP_THEME, theme);
  };

  const initializeAppTheme = async themeType => {
    const currentTheme = await getItemFromStorage(APP_THEME);
    if (!currentTheme && !themeType) {
      const colorScheme = Appearance.getColorScheme();
      setAppTheme((colorScheme && colorScheme) || DEFAULT_THEME);
    } else {
      if (themeType) {
        setAppTheme(themeType);
        setItemInStorage(APP_THEME, themeType);
      } else {
        setAppTheme(currentTheme);
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
