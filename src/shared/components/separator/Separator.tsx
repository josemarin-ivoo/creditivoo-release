import React, { useMemo } from "react";
import { ColorValue, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import createStyles from "./Separator.style";

interface Props {
  backgroundColor?: ColorValue;
}

export const Separator: React.FC<Props> = ({ backgroundColor = "#EDEFF6" }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return <View style={[styles.separator, { backgroundColor }]} />;
};
