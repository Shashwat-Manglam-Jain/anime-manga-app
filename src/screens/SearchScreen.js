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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "../components/ScreenWrapper";
import FilterTabs from "../components/FilterTabs";
import { searchAnime } from "../api/jikan";
import { searchMovies, img } from "../api/tmdb";
import { searchManga } from "../api/mangadex";
import { searchComics } from "../api/comick";
import { searchNovels } from "../api/novels";
import { COLORS, RADIUS, SPACING } from "../utils/theme";

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

  const goDetail = (item) => {
    if (item.type === "anime") navigation.navigate("AnimeDetail", { id: item.id });
    else if (item.type === "movie") navigation.navigate("MovieDetail", { id: item.id });
    else if (item.type === "tv") navigation.navigate("TVDetail", { id: item.id });
    else if (item.type === "manga") navigation.navigate("MangaDetail", { id: item.id });
    else if (item.type === "comic") navigation.navigate("ComicDetail", { id: item.id, title: item.title });
    else if (item.type === "novel") navigation.navigate("NovelDetail", { id: item.id, title: item.title });
  };

  return (
    <ScreenWrapper>
      <Text style={styles.heading}>Search</Text>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={COLORS.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="Search anime, movies, manga, comics..."
          placeholderTextColor={COLORS.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={doSearch}
          returnKeyType="search"
        />
        {query ? (
          <TouchableOpacity onPress={() => { setQuery(""); setResults([]); setSearched(false); }}>
            <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      <FilterTabs tabs={TABS} active={tab} onPress={(t) => { setTab(t); setResults([]); setSearched(false); }} />

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 40 }} />
      ) : results.length === 0 && searched ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No results found</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="sparkles-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>Search for your favorite content</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          numColumns={COLS}
          keyExtractor={(item, i) => `${item.id}-${i}`}
          contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: 100 }}
          columnWrapperStyle={{ gap: GAP, marginBottom: GAP }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{ width: CARD_W }}
              activeOpacity={0.7}
              onPress={() => goDetail(item)}
            >
              <Image
                source={{ uri: item.poster || "https://via.placeholder.com/300x450?text=?" }}
                style={styles.poster}
              />
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              {item.subtitle ? (
                <Text style={styles.cardSub}>{item.subtitle}</Text>
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
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "800",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 46,
    gap: SPACING.sm,
  },
  input: { flex: 1, color: COLORS.text, fontSize: 15 },
  poster: {
    width: CARD_W,
    height: CARD_W * 1.45,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.card,
  },
  cardTitle: { color: COLORS.text, fontSize: 12, fontWeight: "500", marginTop: 4 },
  cardSub: { color: COLORS.textMuted, fontSize: 11 },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 80 },
  emptyText: { color: COLORS.textMuted, fontSize: 16, marginTop: SPACING.md },
});
