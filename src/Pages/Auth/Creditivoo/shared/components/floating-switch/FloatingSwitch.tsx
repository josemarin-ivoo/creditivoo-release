import React, { useState } from "react";
import { StyleSheet, Switch } from "react-native";
import { useTheme } from "@react-navigation/native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSelector } from "react-redux";
import { RootState } from "store/store";

interface Props {
  toggleTheme: () => void;
}

const FloatingSwitch: React.FC<Props> = ({ toggleTheme }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const { colors } = useTheme();
  const isLoading = useSelector(
    (state: RootState) => state.loader.globalLoader
  );

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      //
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd(() => {
      translateX.value = withSpring(translateX.value);
      translateY.value = withSpring(translateY.value);
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  const onToggleSwitch = () => {
    setIsEnabled((previousState) => !previousState);
    toggleTheme();
  };

  if (isLoading) return null;

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.floatingContainer, animatedStyle]}>
        <Switch
          trackColor={{ false: "#F93B00", true: "#200FDA" }}
          thumbColor={isEnabled ? colors.accent : "#f4f3f4"}
          onValueChange={onToggleSwitch}
          value={isEnabled}
        />
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: "absolute",
    top: 90,
    right: 12,
    zIndex: 1000,
  },
});

export default FloatingSwitch;
