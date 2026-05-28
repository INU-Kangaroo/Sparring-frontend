import React, { useEffect, useRef } from "react";
import { Dimensions, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { GestureDetector } from "react-native-gesture-handler";

const { height: H } = Dimensions.get("window");

type RecommendationBottomSheetProps = {
  gesture: any;
  sheetOpen: boolean;
  animatedStyle: StyleProp<ViewStyle>;
  children: React.ReactNode;
  gradientColors?: [string, string];
  handleColor?: string;
  contentBottomPadding?: number;
  fullHeight?: boolean;
  gradientMinHeight?: number;
  dragOnHandleOnly?: boolean;
  onContentHeightChange?: (height: number) => void;
  style?: StyleProp<ViewStyle>;
};

export default function RecommendationBottomSheet({
  gesture,
  sheetOpen,
  animatedStyle,
  children,
  gradientColors = ["rgba(217, 145, 151, 0.8)", "rgba(217, 145, 151, 0.12)"],
  handleColor = "rgba(246, 246, 246, 0.91)",
  contentBottomPadding = 140,
  fullHeight = false,
  gradientMinHeight,
  dragOnHandleOnly = false,
  onContentHeightChange,
  style,
}: RecommendationBottomSheetProps) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!sheetOpen) {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  }, [sheetOpen]);

  const handleNode = (
    <View style={dragOnHandleOnly ? styles.handleTouchArea : undefined}>
      <View style={[styles.handle, { backgroundColor: handleColor }]} />
    </View>
  );

  const sheetNode = (
    <Animated.View
      style={[
        styles.sheetBase,
        fullHeight ? styles.fullHeightSheet : styles.fitSheet,
        style,
        animatedStyle,
      ]}
    >
      <View
        style={[
          styles.gradient,
          { backgroundColor: gradientColors[0] },
          gradientMinHeight ? { minHeight: gradientMinHeight } : undefined,
        ]}
      >
        {dragOnHandleOnly ? <GestureDetector gesture={gesture}>{handleNode}</GestureDetector> : handleNode}
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          scrollEnabled={sheetOpen}
          nestedScrollEnabled
          bounces={false}
          overScrollMode="never"
          onContentSizeChange={(_, height) => onContentHeightChange?.(height)}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: contentBottomPadding }]}
        >
          {children}
        </ScrollView>
      </View>
    </Animated.View>
  );

  return (
    <>
      {dragOnHandleOnly ? sheetNode : <GestureDetector gesture={gesture}>{sheetNode}</GestureDetector>}
    </>
  );
}

const styles = StyleSheet.create({
  sheetBase: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  fitSheet: {
    maxHeight: H - 80,
  },
  fullHeightSheet: {
    height: H,
  },
  gradient: {
    flex: 1,
    paddingTop: 10,
  },
  handleTouchArea: {
    alignSelf: "stretch",
    alignItems: "center",
    paddingBottom: 8,
  },
  handle: {
    alignSelf: "center",
    width: 90,
    height: 6,
    borderRadius: 3,
    marginBottom: 22,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
});
