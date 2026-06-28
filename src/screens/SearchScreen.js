import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image as RNImage,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import ScreenWrapper from "../components/ScreenWrapper";
import { SkeletonGrid } from "../components/SkeletonLoader";
import { useTheme } from "../utils/ThemeContext";
import { searchAnime, getTopAnime } from "../api/jikan";
import { searchMovies, getPopular, img } from "../api/tmdb";
import { searchManga, getPopularManga } from "../api/mangadex";
import { searchComics, browseComics } from "../api/comick";
import { searchNovels, getPopularNovels } from "../api/novels";
import { getSettings } from "../utils/settings";
import { Image as ExpoImage } from "expo-image";
import { RADIUS, SPACING } from "../utils/theme";

const { width } = Dimensions.get("window");
const COLS = 3;
const GAP = SPACING.sm;
const CARD_W = (width - SPACING.lg * 2 - GAP * (COLS - 1)) / COLS;

const ALL_TABS = [
  { label: "All", value: "all" },
  { label: "Anime", value: "anime", setting: "anime" },
  { label: "Movies", value: "movie", setting: "movies" },
  { label: "Manga", value: "manga", setting: "manga" },
  { label: "Comics", value: "comic", setting: "comics" },
  { label: "Novels", value: "novel", setting: "novels" },
];

export default function SearchScreen({ navigation }) {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [results, setResults] = useState([]);
  const [browseData, setBrowseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({ anime: true, movies: true, manga: true, comics: true, novels: true });

  const browsePageRef = useRef(1);
  const browseHasMoreRef = useRef(true);
  const loadingRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      getSettings().then(setSettings);
    }, [])
  );

  const TABS = ALL_TABS.filter((t) => !t.setting || settings[t.setting]);

  const fetchBrowse = useCallback(async (type, page, isLoadMore) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    if (!isLoadMore) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      let items = [];
      let hasMore = true;

      if (type === "anime") {
        const res = await getTopAnime(page);
        items = (res.data || []).map((a) => ({
          id: a.mal_id, type: "anime", title: a.title,
          poster: a.images?.jpg?.large_image_url,
          subtitle: a.score ? `★ ${a.score}` : a.type,
        }));
        hasMore = res.pagination?.has_next_page ?? false;
      } else if (type === "movie") {
        const res = await getPopular(page);
        items = (res.results || []).map((m) => ({
          id: m.id, type: "movie", title: m.title,
          poster: img(m.poster_path),
          subtitle: m.vote_average ? `★ ${m.vote_average.toFixed(1)}` : "",
        }));
        hasMore = page < (res.total_pages || 1);
      } else if (type === "manga") {
        const offset = (page - 1) * 20;
        const res = await getPopularManga(offset);
        items = (res.items || []).map((m) => ({
          id: m.id, type: "manga", title: m.title, poster: m.cover,
          subtitle: m.year ? String(m.year) : m.status || "",
        }));
        hasMore = res.hasMore ?? false;
      } else if (type === "comic") {
        const res = await browseComics(page);
        items = (res || []).map((c) => ({
          id: c.id, type: "comic", title: c.title, poster: c.cover,
          subtitle: c.status || "",
        }));
        hasMore = items.length >= 20;
      } else if (type === "novel") {
        const res = await getPopularNovels(page);
        items = (res.items || []).map((n) => ({
          id: n.id, type: "novel", title: n.title, poster: n.image,
          subtitle: n.score ? `★ ${n.score}` : "",
        }));
        hasMore = res.hasNext ?? false;
      }

      browseHasMoreRef.current = hasMore;
      if (isLoadMore) {
        setBrowseData((prev) => [...prev, ...items]);
      } else {
        setBrowseData(items);
      }
    } catch (err) {
      setError(err.message || "Failed to load content");
      if (!isLoadMore) setBrowseData([]);
    }
    setLoading(false);
    setLoadingMore(false);
    loadingRef.current = false;
  }, []);

  useEffect(() => {
    if (pendingSearchRef.current) {
      pendingSearchRef.current = null;
      doSearch();
      return;
    }
    if (tab !== "all" && !query.trim()) {
      browsePageRef.current = 1;
      browseHasMoreRef.current = true;
      fetchBrowse(tab, 1, false);
    }
  }, [tab]);

  const pendingSearchRef = useRef(null);

  const handleTabChange = useCallback((value) => {
    setTab(value);
    setResults([]);
    setSearched(false);
    setError(null);
    if (value === "all") {
      setBrowseData([]);
    }
    if (query.trim()) {
      pendingSearchRef.current = value;
    }
  }, [query]);

  const loadMoreBrowse = useCallback(() => {
    if (loadingRef.current || !browseHasMoreRef.current || query.trim()) return;
    const next = browsePageRef.current + 1;
    browsePageRef.current = next;
    fetchBrowse(tab, next, true);
  }, [tab, query, fetchBrowse]);

  const searchAll = useCallback(async (q) => {
    const [animeRes, movieRes, mangaRes, comicRes, novelRes] = await Promise.allSettled([
      searchAnime(q),
      searchMovies(q),
      searchManga(q),
      searchComics(q),
      searchNovels(q),
    ]);

    const items = [];

    if (animeRes.status === "fulfilled") {
      (animeRes.value.data || []).slice(0, 6).forEach((a) => {
        items.push({
          id: a.mal_id, type: "anime", title: a.title,
          poster: a.images?.jpg?.large_image_url,
          subtitle: a.score ? `★ ${a.score}` : a.type,
        });
      });
    }

    if (movieRes.status === "fulfilled") {
      (movieRes.value.results || []).filter((m) => m.media_type === "movie" || m.media_type === "tv").slice(0, 6).forEach((m) => {
        items.push({
          id: m.id, type: m.media_type === "tv" ? "tv" : "movie",
          title: m.title || m.name, poster: img(m.poster_path),
          subtitle: m.vote_average ? `★ ${m.vote_average.toFixed(1)}` : "",
        });
      });
    }

    if (mangaRes.status === "fulfilled") {
      (mangaRes.value || []).slice(0, 4).forEach((m) => {
        items.push({
          id: m.id, type: "manga", title: m.title, poster: m.cover,
          subtitle: m.year ? String(m.year) : "",
        });
      });
    }

    if (comicRes.status === "fulfilled") {
      (comicRes.value || []).slice(0, 4).forEach((c) => {
        items.push({
          id: c.id, type: "comic", title: c.title, poster: c.cover,
          subtitle: c.status || "",
        });
      });
    }

    if (novelRes.status === "fulfilled") {
      (novelRes.value || []).slice(0, 4).forEach((n) => {
        items.push({
          id: n.id, type: "novel", title: n.title, poster: n.image,
          subtitle: n.score ? `★ ${n.score}` : "",
        });
      });
    }

    return items;
  }, []);

  const doSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setError(null);
    setBrowseData([]);
    try {
      let items = [];
      if (tab === "all") {
        items = await searchAll(query.trim());
      } else if (tab === "anime") {
        const data = await searchAnime(query.trim());
        items = (data.data || []).map((a) => ({
          id: a.mal_id, type: "anime", title: a.title,
          poster: a.images?.jpg?.large_image_url,
          subtitle: a.score ? `★ ${a.score}` : a.type,
        }));
      } else if (tab === "movie") {
        const data = await searchMovies(query.trim());
        items = (data.results || [])
          .filter((m) => m.media_type === "movie" || m.media_type === "tv")
          .map((m) => ({
            id: m.id, type: m.media_type === "tv" ? "tv" : "movie",
            title: m.title || m.name, poster: img(m.poster_path),
            subtitle: m.vote_average ? `★ ${m.vote_average.toFixed(1)}` : "",
          }));
      } else if (tab === "manga") {
        const data = await searchManga(query.trim());
        items = (data || []).map((m) => ({
          id: m.id, type: "manga", title: m.title, poster: m.cover,
          subtitle: m.year ? String(m.year) : "",
        }));
      } else if (tab === "comic") {
        const data = await searchComics(query.trim());
        items = (data || []).map((c) => ({
          id: c.id, type: "comic", title: c.title, poster: c.cover,
          subtitle: c.status || "",
        }));
      } else if (tab === "novel") {
        const data = await searchNovels(query.trim());
        items = (data || []).map((n) => ({
          id: n.id, type: "novel", title: n.title, poster: n.image,
          subtitle: n.score ? `★ ${n.score}` : "",
        }));
      }
      setResults(items);
      if (items.length === 0) setError(null);
    } catch (err) {
      setError(err.message || "Search failed");
      setResults([]);
    }
    setLoading(false);
  }, [query, tab, searchAll]);

  const goDetail = useCallback((item) => {
    if (item.type === "anime") navigation.navigate("AnimeDetail", { id: item.id });
    else if (item.type === "movie") navigation.navigate("MovieDetail", { id: item.id });
    else if (item.type === "tv") navigation.navigate("TVDetail", { id: item.id });
    else if (item.type === "manga") navigation.navigate("MangaDetail", { id: item.id });
    else if (item.type === "comic") navigation.navigate("ComicDetail", { id: item.id, title: item.title });
    else if (item.type === "novel") navigation.navigate("NovelDetail", { id: item.id, title: item.title });
  }, [navigation]);

  const getTypeColor = (type) => {
    switch (type) {
      case "anime": return "#ef4444";
      case "movie": return "#3b82f6";
      case "tv": return "#8b5cf6";
      case "manga": return "#22c55e";
      case "comic": return "#d946ef";
      case "novel": return "#eab308";
      default: return colors.textMuted;
    }
  };

  const displayData = query.trim() && searched ? results : browseData;
  const isBrowsing = !query.trim() && tab !== "all" && browseData.length > 0;
  const showEmpty = !loading && !query.trim() && tab === "all";
  const showNoResults = !loading && searched && query.trim() && results.length === 0 && !error;

  const TAB_LABELS = { anime: "Anime", movie: "Movies", manga: "Manga", comic: "Comics", novel: "Novels" };

  const renderItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={{ width: CARD_W }}
      activeOpacity={0.7}
      onPress={() => goDetail(item)}
    >
      {item.poster && item.poster.includes("comick") ? (
        <ExpoImage
          source={{ uri: item.poster, headers: { Referer: "https://comick.art/" } }}
          style={[styles.poster, { backgroundColor: colors.card }]}
          contentFit="cover"
        />
      ) : (
        <RNImage
          source={{ uri: item.poster || "https://via.placeholder.com/300x450?text=?" }}
          style={[styles.poster, { backgroundColor: colors.card }]}
        />
      )}
      {(tab === "all" || isBrowsing) && item.type ? (
        <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
          <Text style={styles.typeBadgeText}>{item.type.toUpperCase()}</Text>
        </View>
      ) : null}
      <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
        {item.title}
      </Text>
      {item.subtitle ? (
        <Text style={[styles.cardSub, { color: colors.textMuted }]}>{item.subtitle}</Text>
      ) : null}
    </TouchableOpacity>
  ), [tab, isBrowsing, colors, goDetail]);

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
            onChangeText={(text) => {
              setQuery(text);
              if (!text.trim()) {
                setSearched(false);
                setResults([]);
                setError(null);
                if (tab !== "all") {
                  browsePageRef.current = 1;
                  fetchBrowse(tab, 1, false);
                }
              }
            }}
            onSubmitEditing={doSearch}
            returnKeyType="search"
          />
          {query ? (
            <TouchableOpacity onPress={() => {
              setQuery("");
              setResults([]);
              setSearched(false);
              setError(null);
              if (tab !== "all") {
                browsePageRef.current = 1;
                fetchBrowse(tab, 1, false);
              }
            }}>
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
              onPress={() => handleTabChange(t.value)}
            >
              <Text style={[styles.tabText, { color: colors.textSecondary }, isActive && { color: "#fff" }]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading && displayData.length === 0 ? (
        <SkeletonGrid count={9} />
      ) : error && displayData.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={[styles.emptyText, { color: colors.text }]}>Something went wrong</Text>
          <Text style={[styles.errorDetail, { color: colors.textMuted }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.accent }]}
            onPress={() => {
              if (query.trim()) doSearch();
              else if (tab !== "all") fetchBrowse(tab, 1, false);
            }}
          >
            <Ionicons name="refresh" size={16} color="#fff" />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : showNoResults ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>No results found</Text>
          <Text style={[styles.errorDetail, { color: colors.textMuted }]}>Try a different search term</Text>
        </View>
      ) : showEmpty ? (
        <View style={styles.emptyState}>
          <Ionicons name="sparkles-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Search or pick a category to browse</Text>
        </View>
      ) : (
        <FlatList
          data={displayData}
          numColumns={COLS}
          keyExtractor={(item, i) => `${item.type}-${item.id}-${i}`}
          contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: 100 }}
          columnWrapperStyle={{ gap: GAP, marginBottom: GAP }}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          maxToRenderPerBatch={12}
          windowSize={7}
          onEndReached={isBrowsing ? loadMoreBrowse : undefined}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            isBrowsing ? (
              <Text style={[styles.browseTitle, { color: colors.textMuted }]}>
                Popular {TAB_LABELS[tab] || tab}
              </Text>
            ) : null
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.accent} />
              </View>
            ) : null
          }
          renderItem={renderItem}
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
  tabText: { fontSize: 11, fontWeight: "600" },
  poster: {
    width: CARD_W,
    height: CARD_W * 1.45,
    borderRadius: RADIUS.md,
  },
  typeBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: { color: "#fff", fontSize: 8, fontWeight: "800" },
  cardTitle: { fontSize: 12, fontWeight: "500", marginTop: 4 },
  cardSub: { fontSize: 11 },
  browseTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 80 },
  emptyText: { fontSize: 16, fontWeight: "600", marginTop: SPACING.md },
  errorDetail: { fontSize: 13, marginTop: SPACING.xs, textAlign: "center", paddingHorizontal: SPACING.xl },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  retryText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  footerLoader: { paddingVertical: SPACING.lg, alignItems: "center" },
});
