import React, { memo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SkeletonGrid } from "./SkeletonLoader";
import { useTheme } from "../utils/ThemeContext";
import { RADIUS, SPACING } from "../utils/theme";

const { width } = Dimensions.get("window");
const COLS = 3;
const GAP = SPACING.sm;
const CARD_W = (width - SPACING.lg * 2 - GAP * (COLS - 1)) / COLS;
const CARD_H = CARD_W * 1.45;

function GridView({ data, onPressItem, onEndReached, loading, badge, ListHeaderComponent }) {
  const { colors } = useTheme();

  if (loading && (!data || data.length === 0)) {
    return (
      <View>
        {ListHeaderComponent}
        <SkeletonGrid count={12} />
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      numColumns={COLS}
      keyExtractor={(item, i) => `${item.id}-${i}`}
      contentContainerStyle={styles.grid}
      columnWrapperStyle={styles.row}
      showsVerticalScrollIndicator={false}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      removeClippedSubviews
      maxToRenderPerBatch={12}
      windowSize={7}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={loading ? <SkeletonGrid count={3} /> : null}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => onPressItem?.(item)}
        >
          <View style={[styles.imgWrap, { backgroundColor: colors.card }]}>
            <Image
              source={{ uri: item.poster || "https://via.placeholder.com/300x450?text=No+Image" }}
              style={styles.img}
            />
            {badge?.(item) ? (
              <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                <Text style={styles.badgeText}>{badge(item)}</Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}

export default memo(GridView);

const styles = StyleSheet.create({
  grid: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
  row: { gap: GAP, marginBottom: GAP },
  card: { width: CARD_W },
  imgWrap: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: RADIUS.md,
    overflow: "hidden",
  },
  img: { width: "100%", height: "100%", resizeMode: "cover" },
  badge: {
    position: "absolute",
    top: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  title: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
});
