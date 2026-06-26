import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "../components/ScreenWrapper";
import { COLORS, RADIUS, SPACING } from "../utils/theme";

const SECTIONS = [
  { icon: "tv-outline", label: "TV Series", screen: "TVBrowse", color: "#3b82f6" },
  { icon: "book-outline", label: "Manga", screen: "MangaBrowse", color: "#22c55e" },
  { icon: "layers-outline", label: "Comics", screen: "ComicsBrowse", color: "#d946ef" },
  { icon: "library-outline", label: "Light Novels", screen: "NovelsBrowse", color: "#eab308" },
  { icon: "bookmark-outline", label: "My Library", screen: "Watchlist", color: "#8b5cf6" },
  { icon: "albums-outline", label: "Collections", screen: "Collections", color: "#ef4444" },
  { icon: "star-outline", label: "Top Rated", screen: "TopRated", color: "#f97316" },
];

export default function MoreScreen({ navigation }) {
  return (
    <ScreenWrapper>
      <Text style={styles.heading}>More</Text>
      <ScrollView contentContainerStyle={styles.grid}>
        {SECTIONS.map((s) => (
          <TouchableOpacity
            key={s.screen}
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(s.screen)}
          >
            <View style={[styles.iconWrap, { backgroundColor: s.color + "20" }]}>
              <Ionicons name={s.icon} size={28} color={s.color} />
            </View>
            <Text style={styles.label}>{s.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "800",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  grid: { paddingHorizontal: SPACING.lg, gap: SPACING.sm, paddingBottom: 100 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  label: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
  },
});
