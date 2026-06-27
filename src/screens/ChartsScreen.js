import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "../components/ScreenWrapper";
import { useTheme } from "../utils/ThemeContext";
import { CHARTS, HINDI_WEB_SERIES, TOP_MOVIES, TOP_TV_SHOWS } from "../data/curated";
import { RADIUS, SPACING } from "../utils/theme";

const POSTER_W = 100;

function QuickRow({ title, items, onPress, color, colors }) {
  return (
    <View style={styles.quickRow}>
      <Text style={[styles.quickTitle, { color }]}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SPACING.lg }}>
        {items.slice(0, 10).map((item, i) => (
          <TouchableOpacity key={item.tmdbId} style={styles.quickCard} activeOpacity={0.7} onPress={() => onPress(item)}>
            <View>
              <Image source={{ uri: item.poster }} style={[styles.quickPoster, { backgroundColor: colors.card }]} />
              <View style={[styles.quickRank, { backgroundColor: colors.accent }]}>
                <Text style={styles.quickRankText}>{i + 1}</Text>
              </View>
              {item.rating ? (
                <View style={styles.quickRating}>
                  <Ionicons name="star" size={8} color="#eab308" />
                  <Text style={styles.quickRatingText}>{item.rating}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.quickCardTitle, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export default function ChartsScreen({ navigation }) {
  const { colors } = useTheme();
  const goMovie = (item) => navigation.navigate("MovieDetail", { id: item.tmdbId });
  const goTV = (item) => navigation.navigate("TVDetail", { id: item.tmdbId });

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.heading, { color: colors.text }]}>Charts & Browse</Text>
        </View>

        <View style={styles.gridSection}>
          {CHARTS.map((chart) => (
            <TouchableOpacity
              key={chart.key}
              style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.7}
              onPress={() => {
                if (chart.key === "hindi") navigation.navigate("HindiSeries");
                else if (chart.key === "topMovies") navigation.navigate("TopRated");
                else if (chart.key === "topTV") navigation.navigate("TopRated");
                else if (chart.key === "collections") navigation.navigate("Collections");
                else if (chart.key === "anime") navigation.navigate("AnimeTab");
                else if (chart.key === "manga") navigation.navigate("MangaBrowse");
                else if (chart.key === "comics") navigation.navigate("ComicsBrowse");
                else if (chart.key === "novels") navigation.navigate("NovelsBrowse");
              }}
            >
              <View style={[styles.chartIcon, { backgroundColor: chart.color + "20" }]}>
                <Ionicons name={chart.icon} size={24} color={chart.color} />
              </View>
              <View style={styles.chartInfo}>
                <Text style={[styles.chartTitle, { color: colors.text }]}>{chart.title}</Text>
                <Text style={[styles.chartDesc, { color: colors.textMuted }]}>{chart.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <QuickRow title="Top Hindi Series" items={HINDI_WEB_SERIES} onPress={goTV} color="#f97316" colors={colors} />
        <QuickRow title="Top Rated Movies" items={TOP_MOVIES} onPress={goMovie} color="#3b82f6" colors={colors} />
        <QuickRow title="Top TV Shows" items={TOP_TV_SHOWS} onPress={goTV} color="#22c55e" colors={colors} />

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.md,
  },
  heading: { fontSize: 22, fontWeight: "800" },
  gridSection: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  chartCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  chartIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  chartInfo: { flex: 1 },
  chartTitle: { fontSize: 15, fontWeight: "600" },
  chartDesc: { fontSize: 12, marginTop: 1 },
  quickRow: { marginBottom: SPACING.xl },
  quickTitle: {
    fontSize: 17,
    fontWeight: "700",
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  quickCard: { width: POSTER_W, marginRight: SPACING.md },
  quickPoster: {
    width: POSTER_W,
    height: POSTER_W * 1.5,
    borderRadius: RADIUS.md,
  },
  quickRank: {
    position: "absolute",
    top: 4,
    left: 4,
    borderRadius: RADIUS.sm,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  quickRankText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  quickRating: {
    position: "absolute",
    top: 4,
    right: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  quickRatingText: { color: "#eab308", fontSize: 9, fontWeight: "700" },
  quickCardTitle: { fontSize: 11, fontWeight: "500", marginTop: 4 },
});
