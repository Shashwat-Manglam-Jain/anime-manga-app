import React, { useState } from "react";
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
import FilterTabs from "../components/FilterTabs";
import { TOP_MOVIES, TOP_TV_SHOWS } from "../data/curated";
import { COLORS, RADIUS, SPACING } from "../utils/theme";

const { width } = Dimensions.get("window");
const COLS = 3;
const GAP = SPACING.sm;
const CARD_W = (width - SPACING.lg * 2 - GAP * (COLS - 1)) / COLS;

const TABS = [
  { label: "Movies", value: "movies" },
  { label: "TV Shows", value: "tv" },
];

export default function TopRatedScreen({ navigation }) {
  const [tab, setTab] = useState("movies");

  const data = tab === "movies"
    ? TOP_MOVIES.map((m) => ({ ...m, id: m.tmdbId, type: "movie" }))
    : TOP_TV_SHOWS.map((s) => ({ ...s, id: s.tmdbId, type: "tv" }));

  const goDetail = (item) => {
    if (item.type === "movie") navigation.navigate("MovieDetail", { id: item.id });
    else navigation.navigate("TVDetail", { id: item.id });
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.heading}>Top Rated</Text>
      </View>

      <FilterTabs tabs={TABS} active={tab} onPress={setTab} />

      <FlatList
        data={data}
        numColumns={COLS}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: 100, paddingTop: SPACING.sm }}
        columnWrapperStyle={{ gap: GAP, marginBottom: GAP }}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={{ width: CARD_W }}
            activeOpacity={0.7}
            onPress={() => goDetail(item)}
          >
            <View>
              <Image source={{ uri: item.poster }} style={styles.poster} />
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
            </View>
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="star" size={10} color={COLORS.yellow} />
              <Text style={styles.rating}>{item.rating}</Text>
              <Text style={styles.year}>{item.year}</Text>
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
  heading: { color: COLORS.text, fontSize: 22, fontWeight: "800" },
  poster: {
    width: CARD_W,
    height: CARD_W * 1.45,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.card,
  },
  rankBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.sm,
    width: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  rankText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  title: { color: COLORS.text, fontSize: 12, fontWeight: "500", marginTop: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  rating: { color: COLORS.yellow, fontSize: 11, fontWeight: "600" },
  year: { color: COLORS.textMuted, fontSize: 11 },
});
