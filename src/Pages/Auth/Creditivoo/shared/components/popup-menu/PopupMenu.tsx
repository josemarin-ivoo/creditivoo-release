import React from "react";
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";
import TextWrapper from "@shared-components/text-wrapper/TextWrapper";
import { StyleSheet } from "react-native";

interface PopupMenuProps {
  children: React.ReactNode;
  text: string;
  onSelect: () => void;
  containerMarginTop?: number;
}

const PopupMenu: React.FC<PopupMenuProps> = ({
  children,
  text,
  onSelect,
  containerMarginTop,
}) => {
  return (
    <Menu>
      <MenuTrigger>{children}</MenuTrigger>
      <MenuOptions
        optionsContainerStyle={[
          menuOptionsStyles.container,
          { marginTop: containerMarginTop },
        ]}
      >
        <MenuOption onSelect={onSelect}>
          <TextWrapper>{text}</TextWrapper>
        </MenuOption>
      </MenuOptions>
    </Menu>
  );
};

const menuOptionsStyles = StyleSheet.create({
  container: {
    paddingVertical: 5,
    paddingRight: 10,
    paddingLeft: 5,
    width: "auto",
  },
});

export default PopupMenu;
