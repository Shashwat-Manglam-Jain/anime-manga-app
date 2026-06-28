import React, { useRef, useState, useEffect, useCallback, memo } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../utils/ThemeContext";
import { RADIUS, SPACING } from "../utils/theme";

const { width, height } = Dimensions.get("window");
const CAROUSEL_H = height * 0.52;

function FeaturedCarousel({ items, onPress }) {
  const { colors } = useTheme();
  const flatRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const autoTimer = useRef(null);
  const userScrolling = useRef(false);

  const count = items?.length || 0;

  const loopedData = count > 0
    ? [...items.map((it, i) => ({ ...it, _key: `pre-${i}` })),
       ...items.map((it, i) => ({ ...it, _key: `mid-${i}` })),
       ...items.map((it, i) => ({ ...it, _key: `post-${i}` }))]
    : [];

  useEffect(() => {
    if (!count) return;
    const timer = setTimeout(() => {
      flatRef.current?.scrollToOffset({ offset: count * width, animated: false });
    }, 100);
    return () => clearTimeout(timer);
  }, [count]);

  const resetAutoAdvance = useCallback(() => {
    if (autoTimer.current) clearInterval(autoTimer.current);
    if (!count) return;
    autoTimer.current = setInterval(() => {
      if (userScrolling.current) return;
      setActiveIdx((prev) => {
        const next = (prev + 1) % count;
        const absoluteIdx = count + next;
        flatRef.current?.scrollToIndex({ index: absoluteIdx, animated: true });
        return next;
      });
    }, 5000);
  }, [count]);

  useEffect(() => {
    resetAutoAdvance();
    return () => { if (autoTimer.current) clearInterval(autoTimer.current); };
  }, [count, resetAutoAdvance]);

  const handleScroll = useCallback((e) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const absoluteIdx = Math.round(offsetX / width);
    const realIdx = ((absoluteIdx % count) + count) % count;
    setActiveIdx(realIdx);
  }, [count]);

  const handleScrollEnd = useCallback((e) => {
    userScrolling.current = false;
    if (!count) return;
    const offsetX = e.nativeEvent.contentOffset.x;
    const absoluteIdx = Math.round(offsetX / width);
    const realIdx = ((absoluteIdx % count) + count) % count;

    setActiveIdx(realIdx);

    if (absoluteIdx < count || absoluteIdx >= count * 2) {
      const middleIdx = count + realIdx;
      flatRef.current?.scrollToOffset({ offset: middleIdx * width, animated: false });
    }
    resetAutoAdvance();
  }, [count, resetAutoAdvance]);

  const handleScrollBegin = useCallback(() => {
    userScrolling.current = true;
  }, []);

  if (!items?.length) return null;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={loopedData}
        keyExtractor={(item) => item._key}
        removeClippedSubviews
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBegin}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onPress?.(item)}
            style={styles.slide}
          >
            <Image source={{ uri: item.poster }} style={styles.image} />
            <LinearGradient
              colors={["transparent", `${colors.bg}99`, colors.bg]}
              style={styles.gradient}
            />
            <View style={styles.info}>
              <View style={styles.tagsRow}>
                {item.tags?.slice(0, 3).map((t, i) => (
                  <View key={i} style={[styles.tag, { backgroundColor: `${colors.accent}40` }]}>
                    <Text style={[styles.tagText, { color: colors.accentLight }]}>{t}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.title} numberOfLines={2}>
                {item.title}
              </Text>
              {item.subtitle ? (
                <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              ) : null}
              <View style={styles.btnRow}>
                <TouchableOpacity style={styles.playBtn} onPress={() => onPress?.(item)}>
                  <Ionicons name="play" size={18} color="#000" />
                  <Text style={styles.playText}>Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
      <View style={styles.dots}>
        {items.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIdx && [styles.dotActive, { backgroundColor: colors.accent }]]}
          />
        ))}
      </View>
    </View>
  );
}

export default memo(FeaturedCarousel);

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.lg },
  slide: { width, height: CAROUSEL_H },
  image: { width: "100%", height: "100%", resizeMode: "cover" },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: CAROUSEL_H * 0.65,
  },
  info: {
    position: "absolute",
    bottom: 30,
    left: SPACING.lg,
    right: SPACING.lg,
  },
  tagsRow: { flexDirection: "row", marginBottom: SPACING.sm },
  tag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    marginRight: SPACING.xs,
  },
  tagText: { fontSize: 11, fontWeight: "600" },
  title: { color: "#fff", fontSize: 26, fontWeight: "800", marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: SPACING.md },
  btnRow: { flexDirection: "row", marginTop: SPACING.sm },
  playBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    gap: 6,
  },
  playText: { color: "#000", fontWeight: "700", fontSize: 14 },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: -20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 3,
  },
  dotActive: { width: 18 },
});
