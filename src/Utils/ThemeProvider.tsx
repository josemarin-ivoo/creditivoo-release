// import * as React from 'react';
// import {useColorScheme} from 'react-native-appearance';
// import {lightColors, darkColors, themeColors} from './themeColors';

// export interface Themee {
//     isDark: boolean;
//     Themecolors: themeColors;
//     setScheme: (val: 'dark' | 'light') => void;
// }

// export const ThemeContext = React.createContext<Themee>({
//     isDark: false,
//     Themecolors: lightColors,
//     setScheme: () => {},
// });

// export const ThemeProvider = (props) => {
//     const colorScheme = useColorScheme();
//     const [isDark, setIsDark] = React.useState<boolean>(colorScheme === "dark");

//     React.useEffect(() => {
//         setIsDark(colorScheme === "dark");
//     }, [colorScheme]);

//     const defaultTheme: Themee = {
//         isDark,
//         Themecolors: isDark ? darkColors : lightColors,
//         setScheme: (scheme) => setIsDark(scheme === "dark"),
//     };

//   return (
//         <ThemeContext.Provider value={defaultTheme}>
//             {props.children}
//         </ThemeContext.Provider>
//     );
// };

// export const useTheme = () => React.useContext( ThemeContext );