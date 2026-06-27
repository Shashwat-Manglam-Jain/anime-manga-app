import React, { useEffect, useState, useCallback } from "react";
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
import { SkeletonGrid } from "../components/SkeletonLoader";
import { useTheme } from "../utils/ThemeContext";
import { HINDI_WEB_SERIES } from "../data/curated";
import { discoverTV, img } from "../api/tmdb";
import { RADIUS, SPACING } from "../utils/theme";

const { width } = Dimensions.get("window");
const COLS = 3;
const GAP = SPACING.sm;
const CARD_W = (width - SPACING.lg * 2 - GAP * (COLS - 1)) / COLS;

const TABS = [
  { label: "Curated Top", value: "curated" },
  { label: "Popular Hindi", value: "discover" },
];

export default function HindiSeriesScreen({ navigation }) {
  const { colors } = useTheme();
  const [tab, setTab] = useState("curated");
  const [discoverData, setDiscoverData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const curatedData = HINDI_WEB_SERIES.map((s) => ({
    id: s.tmdbId,
    title: s.title,
    poster: s.poster,
    rating: s.rating,
    year: String(s.year),
    seasons: s.seasons,
    genre: s.genre,
  }));

  const fetchDiscover = useCallback(async (p) => {
    if (p === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const result = await discoverTV(p, {
        with_original_language: "hi",
        sort_by: "vote_count.desc",
      });
      const items = (result.results || []).map((s) => ({
        id: s.id,
        title: s.name || s.title,
        poster: img(s.poster_path),
        rating: s.vote_average ? s.vote_average.toFixed(1) : null,
        year: (s.first_air_date || "").split("-")[0],
      }));
      setDiscoverData((prev) => (p === 1 ? items : [...prev, ...items]));
      setHasMore((result.page || 1) < (result.total_pages || 1));
    } catch (err) {
      console.log(err.message);
    }
    setLoading(false);
    setLoadingMore(false);
  }, []);

  useEffect(() => {
    if (tab === "discover" && discoverData.length === 0) {
      fetchDiscover(1);
    }
  }, [tab]);

  const loadMore = useCallback(() => {
    if (tab !== "discover" || loading || loadingMore || !hasMore) return;
    const next = page + 1;
    setPage(next);
    fetchDiscover(next);
  }, [tab, loading, loadingMore, hasMore, page]);

  const data = tab === "curated" ? curatedData : discoverData;

  const renderHeader = useCallback(() => (
    <View style={styles.tabRow}>
      {TABS.map((t) => {
        const isActive = t.value === tab;
        return (
          <TouchableOpacity
            key={t.value}
            style={[
              styles.tab,
              { backgroundColor: colors.card, borderColor: colors.border },
              isActive && { backgroundColor: "#f97316", borderColor: "#f97316" },
            ]}
            onPress={() => setTab(t.value)}
          >
            <Text style={[styles.tabText, { color: colors.textSecondary }, isActive && { color: "#fff" }]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  ), [tab, colors]);

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.heading, { color: colors.text }]}>Hindi Web Series</Text>
          <Text style={[styles.subHeading, { color: colors.textMuted }]}>Top rated Indian shows</Text>
        </View>
      </View>

      {loading && data.length === 0 ? (
        <View>
          {renderHeader()}
          <SkeletonGrid count={12} />
        </View>
      ) : (
        <FlatList
          data={data}
          numColumns={COLS}
          keyExtractor={(item, i) => `${item.id}-${i}`}
          contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: 100 }}
          columnWrapperStyle={{ gap: GAP, marginBottom: GAP }}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          removeClippedSubviews
          maxToRenderPerBatch={12}
          windowSize={7}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={loadingMore ? <SkeletonGrid count={3} /> : null}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={{ width: CARD_W }}
              activeOpacity={0.7}
              onPress={() => navigation.navigate("TVDetail", { id: item.id })}
            >
              <View>
                <Image
                  source={{ uri: item.poster || "https://via.placeholder.com/300x450?text=?" }}
                  style={[styles.poster, { backgroundColor: colors.card }]}
                />
                {tab === "curated" ? (
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                ) : null}
                {item.rating ? (
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={8} color="#eab308" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
              <View style={styles.metaRow}>
                {item.year ? <Text style={[styles.year, { color: colors.textMuted }]}>{item.year}</Text> : null}
                {item.seasons ? <Text style={[styles.seasons, { color: colors.accent }]}>S{item.seasons}</Text> : null}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
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
  subHeading: { fontSize: 13 },
  tabRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: "center",
  },
  tabText: { fontSize: 13, fontWeight: "600" },
  poster: {
    width: CARD_W,
    height: CARD_W * 1.45,
    borderRadius: RADIUS.md,
  },
  rankBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "#f97316",
    borderRadius: RADIUS.sm,
    width: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  rankText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  ratingBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  ratingText: { color: "#eab308", fontSize: 10, fontWeight: "700" },
  title: { fontSize: 12, fontWeight: "500", marginTop: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 1 },
  year: { fontSize: 11 },
  seasons: { fontSize: 10, fontWeight: "600" },
});
