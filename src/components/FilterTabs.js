import React, { memo } from "react";
import { Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "../utils/ThemeContext";
import { RADIUS, SPACING } from "../utils/theme";

function FilterTabs({ tabs, active, onPress }) {
  const { colors } = useTheme();

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
            style={[
              styles.tab,
              { backgroundColor: colors.card, borderColor: colors.border },
              isActive && { backgroundColor: colors.accent, borderColor: colors.accent },
            ]}
            onPress={() => onPress(tab.value)}
          >
            <Text
              style={[
                styles.text,
                { color: colors.textSecondary },
                isActive && styles.textActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export default memo(FilterTabs);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  tab: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    minWidth: 60,
    alignItems: "center",
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
  },
  textActive: { color: "#fff" },
});
