import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Dimensions } from "react-native";
import { useTheme } from "../utils/ThemeContext";
import { RADIUS, SPACING } from "../utils/theme";

const { width } = Dimensions.get("window");

function Shimmer({ style }) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return <Animated.View style={[{ backgroundColor: colors.shimmer }, style, { opacity }]} />;
}

const COLS = 3;
const GAP = SPACING.sm;
const GRID_CARD_W = (width - SPACING.lg * 2 - GAP * (COLS - 1)) / COLS;
const ROW_CARD_W = width * 0.36;

export function SkeletonGrid({ count = 9 }) {
  const rows = [];
  for (let i = 0; i < count; i += COLS) {
    const row = [];
    for (let j = 0; j < COLS && i + j < count; j++) {
      row.push(
        <View key={i + j} style={{ width: GRID_CARD_W }}>
          <Shimmer style={{ width: GRID_CARD_W, height: GRID_CARD_W * 1.45, borderRadius: RADIUS.md }} />
          <Shimmer style={{ width: GRID_CARD_W * 0.75, height: 10, borderRadius: 4, marginTop: 8 }} />
        </View>
      );
    }
    rows.push(
      <View key={i} style={{ flexDirection: "row", gap: GAP, marginBottom: GAP }}>
        {row}
      </View>
    );
  }
  return <View style={{ paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm }}>{rows}</View>;
}

export function SkeletonRow() {
  return (
    <View style={styles.rowContainer}>
      <View style={styles.rowHeader}>
        <Shimmer style={{ width: 120, height: 16, borderRadius: 4 }} />
      </View>
      <View style={styles.rowCards}>
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={i} style={{ width: ROW_CARD_W, marginRight: SPACING.md }}>
            <Shimmer style={{ width: ROW_CARD_W, height: ROW_CARD_W * 1.45, borderRadius: RADIUS.md }} />
            <Shimmer style={{ width: ROW_CARD_W * 0.7, height: 10, borderRadius: 4, marginTop: 8 }} />
          </View>
        ))}
      </View>
    </View>
  );
}

export function SkeletonCarousel() {
  return (
    <View style={styles.carouselWrap}>
      <Shimmer style={{ width, height: "100%", borderRadius: 0 }} />
    </View>
  );
}

export function SkeletonDetail() {
  return (
    <View style={{ padding: SPACING.lg }}>
      <Shimmer style={{ width: "100%", height: 200, borderRadius: RADIUS.md, marginBottom: SPACING.lg }} />
      <Shimmer style={{ width: "60%", height: 20, borderRadius: 4, marginBottom: SPACING.md }} />
      <Shimmer style={{ width: "40%", height: 14, borderRadius: 4, marginBottom: SPACING.lg }} />
      <View style={{ flexDirection: "row", gap: SPACING.sm, marginBottom: SPACING.lg }}>
        <Shimmer style={{ width: 50, height: 24, borderRadius: RADIUS.sm }} />
        <Shimmer style={{ width: 60, height: 24, borderRadius: RADIUS.sm }} />
        <Shimmer style={{ width: 70, height: 24, borderRadius: RADIUS.sm }} />
      </View>
      <Shimmer style={{ width: "100%", height: 12, borderRadius: 4, marginBottom: 6 }} />
      <Shimmer style={{ width: "100%", height: 12, borderRadius: 4, marginBottom: 6 }} />
      <Shimmer style={{ width: "70%", height: 12, borderRadius: 4 }} />
    </View>
  );
}

export function SkeletonChapterList({ count = 8 }) {
  const { colors } = useTheme();
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.chapterItem, { borderColor: colors.border }]}>
          <Shimmer style={{ flex: 1, height: 14, borderRadius: 4 }} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rowContainer: { marginBottom: SPACING.xl },
  rowHeader: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  rowCards: { flexDirection: "row", paddingHorizontal: SPACING.lg },
  carouselWrap: {
    width,
    height: Dimensions.get("window").height * 0.52,
    marginBottom: SPACING.lg,
  },
  chapterItem: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
});
