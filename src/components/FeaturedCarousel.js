import React, { useRef, useState, useEffect, memo } from "react";
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

  useEffect(() => {
    if (!items?.length) return;
    const timer = setInterval(() => {
      const next = (activeIdx + 1) % items.length;
      flatRef.current?.scrollToIndex({ index: next, animated: true });
      setActiveIdx(next);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeIdx, items?.length]);

  if (!items?.length) return null;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={items}
        keyExtractor={(_, i) => String(i)}
        removeClippedSubviews
        onMomentumScrollEnd={(e) => {
          setActiveIdx(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
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
