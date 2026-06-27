import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "../components/ScreenWrapper";
import { SkeletonGrid } from "../components/SkeletonLoader";
import { useTheme } from "../utils/ThemeContext";
import { searchAnime } from "../api/jikan";
import { searchMovies, img } from "../api/tmdb";
import { searchManga } from "../api/mangadex";
import { searchComics } from "../api/comick";
import { searchNovels } from "../api/novels";
import { RADIUS, SPACING } from "../utils/theme";

const { width } = Dimensions.get("window");
const COLS = 3;
const GAP = SPACING.sm;
const CARD_W = (width - SPACING.lg * 2 - GAP * (COLS - 1)) / COLS;

const TABS = [
  { label: "Anime", value: "anime" },
  { label: "Movies", value: "movie" },
  { label: "Manga", value: "manga" },
  { label: "Comics", value: "comic" },
  { label: "Novels", value: "novel" },
];

export default function SearchScreen({ navigation }) {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("anime");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      let items = [];
      if (tab === "anime") {
        const data = await searchAnime(query.trim());
        items = data.data.map((a) => ({
          id: a.mal_id,
          type: "anime",
          title: a.title,
          poster: a.images?.jpg?.large_image_url,
          subtitle: a.score ? `★ ${a.score}` : a.type,
        }));
      } else if (tab === "movie") {
        const data = await searchMovies(query.trim());
        items = data.results
          .filter((m) => m.media_type === "movie" || m.media_type === "tv")
          .map((m) => ({
            id: m.id,
            type: m.media_type === "tv" ? "tv" : "movie",
            title: m.title || m.name,
            poster: img(m.poster_path),
            subtitle: m.vote_average ? `★ ${m.vote_average.toFixed(1)}` : "",
          }));
      } else if (tab === "manga") {
        const data = await searchManga(query.trim());
        items = data.map((m) => ({
          id: m.id,
          type: "manga",
          title: m.title,
          poster: m.cover,
          subtitle: m.year ? String(m.year) : "",
        }));
      } else if (tab === "comic") {
        const data = await searchComics(query.trim());
        items = data.map((c) => ({
          id: c.id,
          type: "comic",
          title: c.title,
          poster: c.cover,
          subtitle: c.status || "",
        }));
      } else {
        const data = await searchNovels(query.trim());
        items = data.map((n) => ({
          id: n.id,
          type: "novel",
          title: n.title,
          poster: n.image,
          subtitle: n.score ? `★ ${n.score}` : "",
        }));
      }
      setResults(items);
    } catch (err) {
      console.log(err.message);
    }
    setLoading(false);
  }, [query, tab]);

  const goDetail = useCallback((item) => {
    if (item.type === "anime") navigation.navigate("AnimeDetail", { id: item.id });
    else if (item.type === "movie") navigation.navigate("MovieDetail", { id: item.id });
    else if (item.type === "tv") navigation.navigate("TVDetail", { id: item.id });
    else if (item.type === "manga") navigation.navigate("MangaDetail", { id: item.id });
    else if (item.type === "comic") navigation.navigate("ComicDetail", { id: item.id, title: item.title });
    else if (item.type === "novel") navigation.navigate("NovelDetail", { id: item.id, title: item.title });
  }, [navigation]);

  return (
    <ScreenWrapper>
      <Text style={[styles.heading, { color: colors.text }]}>Search</Text>

      <View style={styles.searchRow}>
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Search anime, movies, manga..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={doSearch}
            returnKeyType="search"
          />
          {query ? (
            <TouchableOpacity onPress={() => { setQuery(""); setResults([]); setSearched(false); }}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity style={[styles.searchBtn, { backgroundColor: colors.accent }]} onPress={doSearch}>
          <Ionicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
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
              onPress={() => { setTab(t.value); setResults([]); setSearched(false); }}
            >
              <Text style={[styles.tabText, { color: colors.textSecondary }, isActive && { color: "#fff" }]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <SkeletonGrid count={9} />
      ) : results.length === 0 && searched ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>No results found</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="sparkles-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Search for your favorite content</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          numColumns={COLS}
          keyExtractor={(item, i) => `${item.id}-${i}`}
          contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: 100 }}
          columnWrapperStyle={{ gap: GAP, marginBottom: GAP }}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          maxToRenderPerBatch={12}
          windowSize={7}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{ width: CARD_W }}
              activeOpacity={0.7}
              onPress={() => goDetail(item)}
            >
              <Image
                source={{ uri: item.poster || "https://via.placeholder.com/300x450?text=?" }}
                style={[styles.poster, { backgroundColor: colors.card }]}
              />
              <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
                {item.title}
              </Text>
              {item.subtitle ? (
                <Text style={[styles.cardSub, { color: colors.textMuted }]}>{item.subtitle}</Text>
              ) : null}
            </TouchableOpacity>
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
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    height: 44,
    gap: SPACING.sm,
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
  },
  input: { flex: 1, fontSize: 15 },
  tabRow: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: "center",
  },
  tabText: { fontSize: 12, fontWeight: "600" },
  poster: {
    width: CARD_W,
    height: CARD_W * 1.45,
    borderRadius: RADIUS.md,
  },
  cardTitle: { fontSize: 12, fontWeight: "500", marginTop: 4 },
  cardSub: { fontSize: 11 },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 80 },
  emptyText: { fontSize: 16, marginTop: SPACING.md },
});
