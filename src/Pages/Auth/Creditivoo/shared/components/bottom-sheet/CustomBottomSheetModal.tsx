import React, {useRef, useCallback, useEffect, memo} from 'react';
import {StyleSheet, Platform} from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {vh} from '@freakycoder/react-native-helpers';

interface CustomBottomSheetModalProps {
  isVisible: boolean;
  onClose: () => void;
  snapPoints?: (string | number)[];
  scrollEnabled?: boolean;
  accessibilityLabel?: string;
  children: React.ReactNode;
}

/**
 * CustomBottomSheetModal
 * Profesional wrapper for Gorhom BottomSheetModal
 */
const CustomBottomSheetModal: React.FC<CustomBottomSheetModalProps> = ({
  isVisible,
  onClose,
  snapPoints = ['50%'],
  scrollEnabled = false,
  accessibilityLabel,
  children,
}) => {
  const sheetRef = useRef<BottomSheetModal>(null);

  /** Handles opening/closing without flickering */
  useEffect(() => {
    if (isVisible) {
      // Usar requestAnimationFrame para asegurar que el ref esté listo
      // y el componente esté completamente montado
      requestAnimationFrame(() => {
        if (sheetRef.current) {
          console.log('[CustomBottomSheetModal] Abriendo modal');
          sheetRef.current.present();
        } else {
          console.warn('[CustomBottomSheetModal] Ref no está listo');
          // Retry después de un pequeño delay
          setTimeout(() => {
            if (sheetRef.current) {
              sheetRef.current.present();
            }
          }, 100);
        }
      });
    } else {
      console.log('[CustomBottomSheetModal] Cerrando modal');
      sheetRef.current?.dismiss();
    }
  }, [isVisible]);

  /** Detect when sheet is fully closed */
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) onClose();
    },
    [onClose],
  );

  /** Smooth backdrop animation */
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
      />
    ),
    [],
  );

  /** Common props for both scroll & non-scroll content */
  const sheetProps = {
    ref: sheetRef,
    snapPoints,
    index: 0,
    onChange: handleSheetChanges,
    backdropComponent: renderBackdrop,
    accessibilityLabel,
    enablePanDownToClose: true,
    handleIndicatorStyle: styles.handleHidden,
    enableDynamicSizing: true,
    maxDynamicContentSize: 90 * vh,
    android_keyboardInputMode: 'adjustResize' as any,
    keyboardBehavior: 'interactive' as const,
    keyboardBlurBehavior: 'restore' as const,
  };

  return (
    <BottomSheetModal {...sheetProps}>
      {scrollEnabled ? (
        <BottomSheetScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {children}
        </BottomSheetScrollView>
      ) : (
        <BottomSheetView style={styles.content}>{children}</BottomSheetView>
      )}
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  handleHidden: {
    display: 'none',
  },
});

export default memo(CustomBottomSheetModal);
