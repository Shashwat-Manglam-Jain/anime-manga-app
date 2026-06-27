import React, { useEffect, useState, useCallback, memo } from "react";
import { View, Text, Image, FlatList, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "../components/ScreenWrapper";
import { SkeletonGrid } from "../components/SkeletonLoader";
import { useTheme } from "../utils/ThemeContext";
import { getTrending, getPopular, getTopRated, getNowPlaying, getUpcoming, discoverMovies, img } from "../api/tmdb";
import { MOVIE_GENRES, RADIUS, SPACING } from "../utils/theme";

const { width } = Dimensions.get("window");
const COLS = 3;
const GAP = SPACING.sm;
const CARD_W = (width - SPACING.lg * 2 - GAP * (COLS - 1)) / COLS;

const TABS = [
  { label: "Trending", value: "trending", icon: "flame-outline" },
  { label: "Popular", value: "popular", icon: "heart-outline" },
  { label: "Top Rated", value: "top_rated", icon: "star-outline" },
  { label: "Now Playing", value: "now_playing", icon: "play-outline" },
  { label: "Upcoming", value: "upcoming", icon: "calendar-outline" },
];

function mapMovies(results) {
  return (results || []).map((m) => ({
    id: m.id,
    type: "movie",
    title: m.title || m.name,
    poster: img(m.poster_path),
    rating: m.vote_average ? m.vote_average.toFixed(1) : null,
    year: (m.release_date || "").split("-")[0],
  }));
}

const MovieCard = memo(function MovieCard({ item, onPress, colors }) {
  return (
    <TouchableOpacity style={{ width: CARD_W }} activeOpacity={0.7} onPress={onPress}>
      <View>
        <Image
          source={{ uri: item.poster || "https://via.placeholder.com/300x450?text=?" }}
          style={[styles.poster, { backgroundColor: colors.card }]}
        />
        {item.rating ? (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={8} color="#eab308" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
      {item.year ? <Text style={[styles.year, { color: colors.textMuted }]}>{item.year}</Text> : null}
    </TouchableOpacity>
  );
});

export default function MoviesScreen({ navigation }) {
  const { colors } = useTheme();
  const [tab, setTab] = useState("trending");
  const [genre, setGenre] = useState(null);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchData = useCallback(async (t, p, g) => {
    if (p === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      let result;
      if (g) {
        result = await discoverMovies(p, {
          with_genres: String(g),
          sort_by: t === "top_rated" ? "vote_average.desc" : t === "trending" ? "popularity.desc" : "popularity.desc",
          "vote_count.gte": t === "top_rated" ? 200 : undefined,
        });
      } else if (t === "trending") {
        result = await getTrending();
      } else if (t === "popular") {
        result = await getPopular(p);
      } else if (t === "top_rated") {
        result = await getTopRated(p);
      } else if (t === "now_playing") {
        result = await getNowPlaying(p);
      } else {
        result = await getUpcoming(p);
      }
      const items = mapMovies(result.results);
      setData((prev) => (p === 1 ? items : [...prev, ...items]));
      const noPage = !g && t === "trending";
      setHasMore(!noPage && (result.page || 1) < (result.total_pages || 1));
    } catch (err) {
      console.log(err.message);
    }
    setLoading(false);
    setLoadingMore(false);
  }, []);

  useEffect(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    fetchData(tab, 1, genre);
  }, [tab, genre]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    const next = page + 1;
    setPage(next);
    fetchData(tab, next, genre);
  }, [loading, loadingMore, hasMore, page, tab, genre]);

  const renderHeader = useCallback(() => (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContainer}>
        {TABS.map((t) => {
          const isActive = t.value === tab;
          return (
            <TouchableOpacity
              key={t.value}
              style={[
                styles.tab,
                { backgroundColor: colors.card, borderColor: colors.border },
                isActive && { backgroundColor: colors.accent, borderColor: colors.accent },
              ]}
              onPress={() => setTab(t.value)}
            >
              <Ionicons name={t.icon} size={14} color={isActive ? "#fff" : colors.textMuted} />
              <Text style={[styles.tabText, { color: colors.textSecondary }, isActive && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genreContainer}>
        <TouchableOpacity
          style={[
            styles.genreChip,
            { backgroundColor: colors.card, borderColor: colors.border },
            !genre && { backgroundColor: colors.accent, borderColor: colors.accent },
          ]}
          onPress={() => setGenre(null)}
        >
          <Text style={[styles.genreText, { color: colors.textSecondary }, !genre && { color: "#fff" }]}>All</Text>
        </TouchableOpacity>
        {MOVIE_GENRES.map((g) => {
          const isActive = g.id === genre;
          return (
            <TouchableOpacity
              key={g.id}
              style={[
                styles.genreChip,
                { backgroundColor: colors.card, borderColor: colors.border },
                isActive && { backgroundColor: colors.accent, borderColor: colors.accent },
              ]}
              onPress={() => setGenre(isActive ? null : g.id)}
            >
              <Text style={[styles.genreText, { color: colors.textSecondary }, isActive && { color: "#fff" }]}>{g.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  ), [tab, genre, colors]);

  return (
    <ScreenWrapper>
      <Text style={[styles.heading, { color: colors.text }]}>Movies</Text>

      {loading && data.length === 0 ? (
        <View>
          {renderHeader()}
          <SkeletonGrid count={12} />
        </View>
      ) : (
        <FlatList
          data={data}
          numColumns={COLS}
          keyExtractor={(item, i) => `${tab}-${genre}-${item.id}-${i}`}
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
          renderItem={({ item }) => (
            <MovieCard
              item={item}
              colors={colors}
              onPress={() => navigation.navigate("MovieDetail", { id: item.id })}
            />
          )}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 26,
    fontWeight: "800",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xs,
  },
  tabContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  tabText: { fontSize: 12, fontWeight: "600" },
  tabTextActive: { color: "#fff" },
  genreContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.xs,
    marginBottom: SPACING.md,
    paddingVertical: 2,
  },
  genreChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  genreText: { fontSize: 11, fontWeight: "600" },
  poster: {
    width: CARD_W,
    height: CARD_W * 1.45,
    borderRadius: RADIUS.md,
  },
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
  year: { fontSize: 11 },
});
