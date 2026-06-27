import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "../components/ScreenWrapper";
import { useTheme } from "../utils/ThemeContext";
import { HINDI_WEB_SERIES, TOP_MOVIES } from "../data/curated";
import { RADIUS, SPACING } from "../utils/theme";

const { width } = Dimensions.get("window");
const MINI_W = 70;

const BROWSE = [
  { icon: "tv-outline", label: "TV Series", screen: "TVBrowse", color: "#3b82f6" },
  { icon: "book-outline", label: "Manga", screen: "MangaBrowse", color: "#22c55e" },
  { icon: "layers-outline", label: "Comics", screen: "ComicsBrowse", color: "#d946ef" },
  { icon: "library-outline", label: "Light Novels", screen: "NovelsBrowse", color: "#eab308" },
];

const LIBRARY = [
  { icon: "bookmark-outline", label: "My Library", screen: "Watchlist", color: "#8b5cf6" },
  { icon: "albums-outline", label: "Collections", screen: "Collections", color: "#ef4444" },
  { icon: "bar-chart-outline", label: "Charts & Browse", screen: "Charts", color: "#06b6d4" },
  { icon: "star-outline", label: "Top Rated", screen: "TopRated", color: "#f97316" },
];

export default function MoreScreen({ navigation }) {
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Text style={[styles.heading, { color: colors.text }]}>More</Text>
          <View style={[styles.themeToggle, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name={isDark ? "moon" : "sunny"} size={18} color={isDark ? "#a78bfa" : "#f59e0b"} />
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: "#d1d5db", true: "#6d28d9" }}
              thumbColor={isDark ? "#a78bfa" : "#f59e0b"}
              style={{ transform: [{ scale: 0.8 }] }}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.hindiCard, { backgroundColor: "#f97316" + "15", borderColor: "#f97316" + "30" }]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("HindiSeries")}
        >
          <View style={styles.hindiLeft}>
            <View style={styles.hindiBadge}>
              <Ionicons name="flag" size={16} color="#fff" />
            </View>
            <View>
              <Text style={[styles.hindiTitle, { color: colors.text }]}>Hindi Web Series</Text>
              <Text style={[styles.hindiSub, { color: colors.textMuted }]}>Top rated Indian shows</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} pointerEvents="none">
            {HINDI_WEB_SERIES.slice(0, 5).map((s) => (
              <Image key={s.tmdbId} source={{ uri: s.poster }} style={[styles.hindiPoster, { backgroundColor: colors.card }]} />
            ))}
          </ScrollView>
        </TouchableOpacity>

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Browse</Text>
        <View style={styles.grid}>
          {BROWSE.map((s) => (
            <TouchableOpacity
              key={s.screen}
              style={[styles.gridCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(s.screen)}
            >
              <View style={[styles.gridIcon, { backgroundColor: s.color + "20" }]}>
                <Ionicons name={s.icon} size={22} color={s.color} />
              </View>
              <Text style={[styles.gridLabel, { color: colors.text }]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Library & Charts</Text>
        <View style={styles.listSection}>
          {LIBRARY.map((s) => (
            <TouchableOpacity
              key={s.screen}
              style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(s.screen)}
            >
              <View style={[styles.listIcon, { backgroundColor: s.color + "20" }]}>
                <Ionicons name={s.icon} size={24} color={s.color} />
              </View>
              <Text style={[styles.listLabel, { color: colors.text }]}>{s.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Quick Picks</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl }}>
          {TOP_MOVIES.slice(0, 8).map((m) => (
            <TouchableOpacity
              key={m.tmdbId}
              style={styles.quickCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate("MovieDetail", { id: m.tmdbId })}
            >
              <Image source={{ uri: m.poster }} style={[styles.quickPoster, { backgroundColor: colors.card }]} />
              <Text style={[styles.quickTitle, { color: colors.text }]} numberOfLines={1}>{m.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  heading: {
    fontSize: 26,
    fontWeight: "800",
  },
  themeToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  hindiCard: {
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
  },
  hindiLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  hindiBadge: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: "#f97316",
    justifyContent: "center",
    alignItems: "center",
  },
  hindiTitle: { fontSize: 16, fontWeight: "700" },
  hindiSub: { fontSize: 12 },
  hindiPoster: {
    width: MINI_W,
    height: MINI_W * 1.4,
    borderRadius: RADIUS.sm,
    marginRight: SPACING.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  gridCard: {
    width: (width - SPACING.lg * 2 - SPACING.sm) / 2,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    alignItems: "center",
    gap: SPACING.sm,
  },
  gridIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
  },
  gridLabel: { fontSize: 14, fontWeight: "600" },
  listSection: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  listCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  listIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  listLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  quickCard: { width: 90, marginRight: SPACING.md },
  quickPoster: {
    width: 90,
    height: 130,
    borderRadius: RADIUS.sm,
  },
  quickTitle: { fontSize: 11, fontWeight: "500", marginTop: 4 },
});
