import type { ExtendedTheme } from "@react-navigation/native";
import { DefaultTheme } from "@react-navigation/native";

export const orange = {
  mainOrange: "#F93B00",
  orange20: "#FF5C33",
  orange21: "#FFE0CC21",
  orange40: "#FF7D66",
  orange60: "#FFB399",
  orange80: "#FFE0CC21",
};

export const blueDacell = {
  mainBlue: "#200FDA",
  blue21: "#200FDA21",
};

export const bronze = {
  darkBronze: "#875202",
  golden: "#DDA921",
  mango: "#FDC228",
  blond: "#FFECBA",
  floralWhite: "#FFFAEC",
};

export const purple = {
  americanPurple: "#540F55",
  violet: "#963898",
  pearlyPurple: "#B462B6",
  brightGray: "#F2E1F2",
  powder: "#FFF6FF",
};

export const maroon = {
  maroon: "#6F1212",
  goldenGateBrigde: "#B83232",
  jellyBean: "#E05555",
  palePink: "#FFD6D6",
  snow: "#FFF6F6",
};

export const green = {
  laSalleGreen: "#117031",
  seaGreen: "#289B4F",
  shamrock: "#4DA66B",
  brightGreen: "#E6F6EC",
  mintCream: "#F4FFF8",
};

export const grass = {
  grass: "#0B453B",
  emerald: "#2A907E",
  verdigris: "#4FBCA8",
  columbiaBlue: "#C9EBE5",
  bubbles: "#E9FFFB",
};

export const blue = {
  blue: "#1D62CA",
  catalinaBlue: "#020056",
  celticBlue: "#343A87",
  bleuDeFrance: "#5756B8",
  cloud: "#797BE9",
  ghostWhite: "#9C9DFF",
};

export const black = {
  black: "#191919",
  blackCoral: "#535D66",
  slateGray: "#78838D",
  sliverSand: "#BAC2C7",
  azureishWhite: "#E1E3ED",
  totalBlack: "#000",
};

export const white = {
  aliceBlue: "#EDEFF6",
  cultured: "#F7F8FE",
  white: "#FFFFFF",
};

export const palette = {
  primary: orange.mainOrange,
  primary21: orange.orange21,
  secondary: "#ff6a00",
  background: "#FFFFFF",
  white: "#fff",
  black: black.black,
  button: "#1c1e21",
  shadow: "#757575",
  text: black.black,
  borderColor: black.azureishWhite,
  borderColorDark: "#333942",
  placeholder: black.sliverSand,
  error: "#9F0A0A",
  danger: "rgb(208, 2, 27)",
  title: "rgb(102, 102, 102)",
  separator: white.aliceBlue,
  highlight: "rgb(199, 198, 203)",
  blackOverlay: "rgba(0,0,0,0.6)",
  iconWhite: "#fff",
  iconBlack: "#101214",
  dynamicWhite: "#fff",
  dynamicBlack: "#1c1e21",
  dynamicBackground: "#fff",
  dynamicText: blue.blue,
  transparent: "transparent",
  calpyse: "#2b7488",
  itemSubtitle: black.slateGray,
  arrowDark: black.blackCoral,
  totalBlack: black.totalBlack,
};

export const LightTheme: ExtendedTheme = {
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    ...palette,
  },
};

export const DarkTheme: ExtendedTheme = {
  ...DefaultTheme,
  colors: {
    ...LightTheme.colors,
    // background: palette.black,
    // foreground: palette.white,
    // text: palette.white,
    // tabBar: palette.black,
    // iconWhite: palette.black,
    // iconBlack: palette.white,
    // dynamicBackground: palette.dynamicBlack,
    // shadow: palette.transparent,
    // borderColor: palette.borderColorDark,
  },
};

export const BlueTheme: ExtendedTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...palette,
    primary: blueDacell.mainBlue,
    primary21: blueDacell.blue21,
  },
};
