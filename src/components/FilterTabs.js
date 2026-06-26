import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { COLORS, RADIUS, SPACING } from "../utils/theme";

export default function FilterTabs({ tabs, active, onPress }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {tabs.map((tab) => {
        const isActive = tab.value === active;
        return (
          <TouchableOpacity
            key={tab.value}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onPress(tab.value)}
          >
            <Text style={[styles.text, isActive && styles.textActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  tab: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  text: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  textActive: { color: "#fff" },
});
