import fonts from "@fonts";
import type { IRNTextProps } from "@freakycoder/react-native-custom-text";
import RNText from "@freakycoder/react-native-custom-text";
import React, { useMemo } from "react";

interface ITextWrapperProps extends IRNTextProps {
  color?: string;
  fontFamily?: string;
  children?: React.ReactNode;
  fontSize?: number;
  fontWeight?: string;
  boldSora?: boolean;
  semiBoldSora?: boolean;
  extraBoldSora?: boolean;
}

const TextWrapper: React.FC<ITextWrapperProps> = ({
  fontFamily = fonts.sora.regular,
  color = "#191919",
  children,
  fontSize,
  fontWeight,
  extraBoldSora,
  boldSora,
  semiBoldSora,
  ...rest
}) => {
  const determinedFontFamily = useMemo(() => {
    if (boldSora) return fonts.sora.bold;
    if (semiBoldSora) return fonts.sora.semiBold;
    if (extraBoldSora) return fonts.sora.extraBold;
    return fontFamily;
  }, [extraBoldSora, boldSora, semiBoldSora, fontFamily]);

  return (
    <RNText
      fontFamily={determinedFontFamily}
      color={color}
      style={{ fontSize, fontWeight }}
      {...rest}
    >
      {children}
    </RNText>
  );
};

export default TextWrapper;
