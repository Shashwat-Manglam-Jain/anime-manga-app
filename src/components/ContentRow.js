import React, { memo } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import ContentCard from "./ContentCard";
import { SkeletonRow } from "./SkeletonLoader";
import { useTheme } from "../utils/ThemeContext";
import { SPACING } from "../utils/theme";

function ContentRow({ title, data, onPressItem, onSeeAll, badge, loading, onLoadMore, loadingMore }) {
  const { colors } = useTheme();

  if (loading || (!data || data.length === 0)) {
    if (loading) {
      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          </View>
          <SkeletonRow />
        </View>
      );
    }
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {onSeeAll ? (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={[styles.seeAll, { color: colors.accent }]}>See All</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={(item, i) => `${item.type || "item"}-${item.id || i}-${i}`}
        contentContainerStyle={{ paddingHorizontal: SPACING.lg }}
        removeClippedSubviews
        maxToRenderPerBatch={6}
        windowSize={5}
        onEndReached={onLoadMore || undefined}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator size="small" />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <ContentCard
            poster={item.poster}
            title={item.title}
            subtitle={item.subtitle}
            badge={badge?.(item)}
            onPress={() => onPressItem?.(item)}
          />
        )}
      />
    </View>
  );
}

export default memo(ContentRow);

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.xl },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "600",
  },
  footer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
  },
});
