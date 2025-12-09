import React, { useRef, useCallback, useEffect } from "react";
import { StyleSheet } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
  //BottomSheetView,
} from "@gorhom/bottom-sheet";
import { vh } from "@freakycoder/react-native-helpers";

interface BottomSheetModalProps {
  isVisible: boolean;
  onClose: () => void;
  snapPoints?: (string | number)[];
  accessibilityLabel?: string;
  bottomSheetScrollView?: boolean;
  children: React.ReactNode;
}

const CustomBottomSheetModal: React.FC<BottomSheetModalProps> = ({
  isVisible,
  onClose,
  snapPoints,
  accessibilityLabel,
  bottomSheetScrollView = false,
  children,
}) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        {...props}
      />
    ),
    []
  );

  return (
    <>
      {bottomSheetScrollView ? (
        <BottomSheetModal
          ref={bottomSheetRef}
          index={isVisible ? 0 : -1}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
          accessibilityLabel={accessibilityLabel}
          handleIndicatorStyle={{ display: "none" }}
          enableDynamicSizing
          maxDynamicContentSize={90 * vh}
        >
          <BottomSheetScrollView style={styles.contentContainer}>
            {children}
          </BottomSheetScrollView>
        </BottomSheetModal>
      ) : (
        <BottomSheetModal
          ref={bottomSheetRef}
          index={isVisible ? 0 : -1}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
          accessibilityLabel={accessibilityLabel}
          handleIndicatorStyle={{ display: "none" }}
        >
          <BottomSheetView style={styles.contentContainer}>
            {children}
          </BottomSheetView>
        </BottomSheetModal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

export default CustomBottomSheetModal;
