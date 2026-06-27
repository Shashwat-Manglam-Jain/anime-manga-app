import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "../components/ScreenWrapper";
import { useTheme } from "../utils/ThemeContext";
import { TOP_MOVIES, TOP_TV_SHOWS } from "../data/curated";
import { RADIUS, SPACING } from "../utils/theme";

const { width } = Dimensions.get("window");
const COLS = 3;
const GAP = SPACING.sm;
const CARD_W = (width - SPACING.lg * 2 - GAP * (COLS - 1)) / COLS;

export default function TopRatedScreen({ navigation }) {
  const { colors } = useTheme();
  const [tab, setTab] = useState("movies");

  const data = tab === "movies"
    ? TOP_MOVIES.map((m) => ({ ...m, id: m.tmdbId, type: "movie" }))
    : TOP_TV_SHOWS.map((s) => ({ ...s, id: s.tmdbId, type: "tv" }));

  const goDetail = useCallback((item) => {
    if (item.type === "movie") navigation.navigate("MovieDetail", { id: item.id });
    else navigation.navigate("TVDetail", { id: item.id });
  }, [navigation]);

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.heading, { color: colors.text }]}>Top Rated</Text>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: colors.card, borderColor: colors.border },
            tab === "movies" && { backgroundColor: colors.accent, borderColor: colors.accent },
          ]}
          onPress={() => setTab("movies")}
        >
          <Ionicons name="film-outline" size={16} color={tab === "movies" ? "#fff" : colors.textSecondary} />
          <Text style={[styles.tabText, { color: colors.textSecondary }, tab === "movies" && { color: "#fff" }]}>Movies</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: colors.card, borderColor: colors.border },
            tab === "tv" && { backgroundColor: colors.accent, borderColor: colors.accent },
          ]}
          onPress={() => setTab("tv")}
        >
          <Ionicons name="tv-outline" size={16} color={tab === "tv" ? "#fff" : colors.textSecondary} />
          <Text style={[styles.tabText, { color: colors.textSecondary }, tab === "tv" && { color: "#fff" }]}>TV Shows</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        numColumns={COLS}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: 100, paddingTop: SPACING.sm }}
        columnWrapperStyle={{ gap: GAP, marginBottom: GAP }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={{ width: CARD_W }}
            activeOpacity={0.7}
            onPress={() => goDetail(item)}
          >
            <View>
              <Image source={{ uri: item.poster }} style={[styles.poster, { backgroundColor: colors.card }]} />
              <View style={[styles.rankBadge, { backgroundColor: colors.accent }]}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
            </View>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="star" size={10} color="#eab308" />
              <Text style={styles.rating}>{item.rating}</Text>
              <Text style={[styles.year, { color: colors.textMuted }]}>{item.year}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
    gap: SPACING.md,
  },
  heading: { fontSize: 22, fontWeight: "800" },
  tabRow: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  tabText: { fontSize: 14, fontWeight: "600" },
  poster: {
    width: CARD_W,
    height: CARD_W * 1.45,
    borderRadius: RADIUS.md,
  },
  rankBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    borderRadius: RADIUS.sm,
    width: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  rankText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  title: { fontSize: 12, fontWeight: "500", marginTop: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  rating: { color: "#eab308", fontSize: 11, fontWeight: "600" },
  year: { fontSize: 11 },
});
