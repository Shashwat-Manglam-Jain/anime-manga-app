import React from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import ContentCard from "./ContentCard";
import { COLORS, SPACING } from "../utils/theme";

export default function ContentRow({ title, data, onPressItem, onSeeAll, badge }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {onSeeAll ? (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={(item, i) => `${item.id || i}`}
        contentContainerStyle={{ paddingHorizontal: SPACING.lg }}
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
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
  },
  seeAll: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: "600",
  },
});
