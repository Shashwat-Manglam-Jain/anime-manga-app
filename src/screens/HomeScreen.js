import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  ScrollView,
  RefreshControl,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import ScreenWrapper from "../components/ScreenWrapper";
import FeaturedCarousel from "../components/FeaturedCarousel";
import ContentRow from "../components/ContentRow";
import { SkeletonCarousel, SkeletonRow } from "../components/SkeletonLoader";
import { useTheme } from "../utils/ThemeContext";
import { getRecentAnime, getTopAnime } from "../api/jikan";
import { getTrending, getPopular, getTrendingTV, getPopularTV, discoverMovies, img } from "../api/tmdb";
import { getPopularManga } from "../api/mangadex";
import { getPopularNovels } from "../api/novels";
import { getContinueWatching } from "../utils/watchlist";
import { getSettings } from "../utils/settings";
import { RADIUS, SPACING } from "../utils/theme";

const { width } = Dimensions.get("window");
const CW_CARD_W = width * 0.38;

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const [featured, setFeatured] = useState([]);
  const [topAnime, setTopAnime] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularManga, setPopularManga] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [novels, setNovels] = useState([]);
  const [hindiMovies, setHindiMovies] = useState([]);
  const [continueItems, setContinueItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState({});
  const [settings, setSettings] = useState({ anime: true, movies: true, manga: true, comics: true, novels: true });

  const animePageRef = useRef(1);
  const moviesPageRef = useRef(1);
  const mangaOffsetRef = useRef(0);
  const tvPageRef = useRef(1);
  const novelsPageRef = useRef(1);
  const hindiPageRef = useRef(1);

  const animeHasMoreRef = useRef(true);
  const moviesHasMoreRef = useRef(true);
  const mangaHasMoreRef = useRef(true);
  const tvHasMoreRef = useRef(true);
  const novelsHasMoreRef = useRef(true);
  const hindiHasMoreRef = useRef(true);

  useFocusEffect(
    useCallback(() => {
      getContinueWatching().then(setContinueItems);
      getSettings().then(setSettings);
    }, [])
  );

  const load = useCallback(async () => {
    try {
      const [season, top, movies, manga, tv, nov, hindiRes] = await Promise.all([
        getRecentAnime(1),
        getTopAnime(1),
        getTrending(),
        getPopularManga(0),
        getTrendingTV(),
        getPopularNovels(1).catch(() => ({ items: [] })),
        discoverMovies(1, { with_original_language: "hi", sort_by: "popularity.desc" }).catch(() => ({ results: [] })),
      ]);

      const MOVIE_GENRE_MAP = {
        28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
        80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
        14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
        9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 53: "Thriller",
        10752: "War", 37: "Western",
      };
      const animeSlice = season.data.slice(0, 5).map((a) => ({
        id: a.mal_id,
        type: "anime",
        title: a.title,
        poster: a.images?.jpg?.large_image_url,
        subtitle: `${a.score ? `★ ${a.score}` : ""} ${a.type || ""}`.trim(),
        tags: a.genres?.map((g) => g.name).slice(0, 3) || [],
      }));
      const movieSlice = movies.results.slice(0, 5).map((m) => ({
        id: m.id,
        type: "movie",
        title: m.title,
        poster: img(m.poster_path, "original"),
        subtitle: m.vote_average ? `★ ${m.vote_average.toFixed(1)}` : "",
        tags: (m.genre_ids || []).map((gid) => MOVIE_GENRE_MAP[gid]).filter(Boolean).slice(0, 3),
      }));
      const tvSlice = (tv.results || []).slice(0, 5).map((s) => ({
        id: s.id,
        type: "tv",
        title: s.name || s.title,
        poster: img(s.poster_path, "original"),
        subtitle: s.vote_average ? `★ ${s.vote_average.toFixed(1)}` : "",
        tags: [],
      }));
      const mangaSlice = (manga.items || []).slice(0, 3).map((m) => ({
        id: m.id,
        type: "manga",
        title: m.title,
        poster: m.cover,
        subtitle: m.year ? String(m.year) : m.status,
        tags: [],
      }));
      const novelSlice = (nov.items || []).slice(0, 2).map((n) => ({
        id: n.id,
        type: "novel",
        title: n.title,
        poster: n.image,
        subtitle: n.score ? `★ ${n.score}` : "",
        tags: [],
      }));
      // Interleave all types for variety
      const mixed = [];
      const pools = [animeSlice, movieSlice, tvSlice, mangaSlice, novelSlice];
      const maxLen = Math.max(...pools.map((p) => p.length));
      for (let i = 0; i < maxLen; i++) {
        for (const pool of pools) {
          if (i < pool.length) mixed.push(pool[i]);
        }
      }
      setFeatured(mixed);

      setTopAnime(
        top.data.map((a) => ({
          id: a.mal_id,
          type: "anime",
          title: a.title,
          poster: a.images?.jpg?.large_image_url,
          subtitle: a.score ? `★ ${a.score}` : a.type,
        }))
      );

      setTrendingMovies(
        movies.results.slice(0, 20).map((m) => ({
          id: m.id,
          type: "movie",
          title: m.title,
          poster: img(m.poster_path),
          subtitle: m.vote_average ? `★ ${m.vote_average.toFixed(1)}` : "",
        }))
      );

      setPopularManga(
        manga.items.map((m) => ({
          id: m.id,
          type: "manga",
          title: m.title,
          poster: m.cover,
          subtitle: m.year ? String(m.year) : m.status,
        }))
      );

      setTvShows(
        (tv.results || []).slice(0, 20).map((s) => ({
          id: s.id,
          type: "tv",
          title: s.name || s.title,
          poster: img(s.poster_path),
          subtitle: s.vote_average ? `★ ${s.vote_average.toFixed(1)}` : "",
        }))
      );

      setNovels(
        (nov.items || []).map((n) => ({
          id: n.id,
          type: "novel",
          title: n.title,
          poster: n.image,
          subtitle: n.score ? `★ ${n.score}` : "",
        }))
      );

      setHindiMovies(
        (hindiRes.results || []).slice(0, 20).map((m) => ({
          id: m.id,
          type: "movie",
          title: m.title,
          poster: img(m.poster_path),
          subtitle: m.vote_average ? `★ ${m.vote_average.toFixed(1)}` : "",
        }))
      );

      const cw = await getContinueWatching();
      setContinueItems(cw);

      // Reset pagination refs on fresh load
      animePageRef.current = 1;
      moviesPageRef.current = 1;
      mangaOffsetRef.current = 0;
      tvPageRef.current = 1;
      novelsPageRef.current = 1;
      hindiPageRef.current = 1;
      animeHasMoreRef.current = true;
      moviesHasMoreRef.current = true;
      mangaHasMoreRef.current = true;
      tvHasMoreRef.current = true;
      novelsHasMoreRef.current = true;
      hindiHasMoreRef.current = true;
    } catch (err) {
      console.log("Home load error:", err.message);
    }
    setInitialLoading(false);
  }, []);

  useEffect(() => { load(); }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const loadMoreAnime = useCallback(async () => {
    if (loadingMore.anime || !animeHasMoreRef.current) return;
    setLoadingMore((prev) => ({ ...prev, anime: true }));
    try {
      const nextPage = animePageRef.current + 1;
      const res = await getTopAnime(nextPage);
      animePageRef.current = nextPage;
      animeHasMoreRef.current = res.pagination?.has_next_page ?? false;
      setTopAnime((prev) => [
        ...prev,
        ...res.data.map((a) => ({
          id: a.mal_id,
          type: "anime",
          title: a.title,
          poster: a.images?.jpg?.large_image_url,
          subtitle: a.score ? `★ ${a.score}` : a.type,
        })),
      ]);
    } catch (e) {
      console.log("Load more anime error:", e.message);
    }
    setLoadingMore((prev) => ({ ...prev, anime: false }));
  }, [loadingMore.anime]);

  const loadMoreMovies = useCallback(async () => {
    if (loadingMore.movies || !moviesHasMoreRef.current) return;
    setLoadingMore((prev) => ({ ...prev, movies: true }));
    try {
      const nextPage = moviesPageRef.current + 1;
      const res = await getPopular(nextPage);
      moviesPageRef.current = nextPage;
      moviesHasMoreRef.current = nextPage < (res.total_pages || 1);
      setTrendingMovies((prev) => [
        ...prev,
        ...res.results.map((m) => ({
          id: m.id,
          type: "movie",
          title: m.title,
          poster: img(m.poster_path),
          subtitle: m.vote_average ? `★ ${m.vote_average.toFixed(1)}` : "",
        })),
      ]);
    } catch (e) {
      console.log("Load more movies error:", e.message);
    }
    setLoadingMore((prev) => ({ ...prev, movies: false }));
  }, [loadingMore.movies]);

  const loadMoreManga = useCallback(async () => {
    if (loadingMore.manga || !mangaHasMoreRef.current) return;
    setLoadingMore((prev) => ({ ...prev, manga: true }));
    try {
      const nextOffset = mangaOffsetRef.current + 20;
      const res = await getPopularManga(nextOffset);
      mangaOffsetRef.current = nextOffset;
      mangaHasMoreRef.current = res.hasMore ?? false;
      setPopularManga((prev) => [
        ...prev,
        ...res.items.map((m) => ({
          id: m.id,
          type: "manga",
          title: m.title,
          poster: m.cover,
          subtitle: m.year ? String(m.year) : m.status,
        })),
      ]);
    } catch (e) {
      console.log("Load more manga error:", e.message);
    }
    setLoadingMore((prev) => ({ ...prev, manga: false }));
  }, [loadingMore.manga]);

  const loadMoreTV = useCallback(async () => {
    if (loadingMore.tv || !tvHasMoreRef.current) return;
    setLoadingMore((prev) => ({ ...prev, tv: true }));
    try {
      const nextPage = tvPageRef.current + 1;
      const res = await getPopularTV(nextPage);
      tvPageRef.current = nextPage;
      tvHasMoreRef.current = nextPage < (res.total_pages || 1);
      setTvShows((prev) => [
        ...prev,
        ...(res.results || []).map((s) => ({
          id: s.id,
          type: "tv",
          title: s.name || s.title,
          poster: img(s.poster_path),
          subtitle: s.vote_average ? `★ ${s.vote_average.toFixed(1)}` : "",
        })),
      ]);
    } catch (e) {
      console.log("Load more TV error:", e.message);
    }
    setLoadingMore((prev) => ({ ...prev, tv: false }));
  }, [loadingMore.tv]);

  const loadMoreNovels = useCallback(async () => {
    if (loadingMore.novels || !novelsHasMoreRef.current) return;
    setLoadingMore((prev) => ({ ...prev, novels: true }));
    try {
      const nextPage = novelsPageRef.current + 1;
      const res = await getPopularNovels(nextPage);
      novelsPageRef.current = nextPage;
      novelsHasMoreRef.current = res.hasNext ?? false;
      setNovels((prev) => [
        ...prev,
        ...(res.items || []).map((n) => ({
          id: n.id,
          type: "novel",
          title: n.title,
          poster: n.image,
          subtitle: n.score ? `★ ${n.score}` : "",
        })),
      ]);
    } catch (e) {
      console.log("Load more novels error:", e.message);
    }
    setLoadingMore((prev) => ({ ...prev, novels: false }));
  }, [loadingMore.novels]);

  const loadMoreHindi = useCallback(async () => {
    if (loadingMore.hindi || !hindiHasMoreRef.current) return;
    setLoadingMore((prev) => ({ ...prev, hindi: true }));
    try {
      const nextPage = hindiPageRef.current + 1;
      const res = await discoverMovies(nextPage, { with_original_language: "hi", sort_by: "popularity.desc" });
      hindiPageRef.current = nextPage;
      hindiHasMoreRef.current = nextPage < (res.total_pages || 1);
      setHindiMovies((prev) => [
        ...prev,
        ...res.results.map((m) => ({
          id: m.id,
          type: "movie",
          title: m.title,
          poster: img(m.poster_path),
          subtitle: m.vote_average ? `★ ${m.vote_average.toFixed(1)}` : "",
        })),
      ]);
    } catch (e) {
      console.log("Load more Hindi movies error:", e.message);
    }
    setLoadingMore((prev) => ({ ...prev, hindi: false }));
  }, [loadingMore.hindi]);

  const goDetail = useCallback((item) => {
    if (item.type === "anime") navigation.navigate("AnimeDetail", { id: item.id });
    else if (item.type === "movie") navigation.navigate("MovieDetail", { id: item.id });
    else if (item.type === "manga") navigation.navigate("MangaDetail", { id: item.id });
    else if (item.type === "tv") navigation.navigate("TVDetail", { id: item.id });
    else if (item.type === "novel") navigation.navigate("NovelDetail", { id: item.id, title: item.title });
  }, [navigation]);

  return (
    <ScreenWrapper edges={["left", "right", "bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.accent} />
        }
      >
        {initialLoading && featured.length === 0 ? (
          <>
            <SkeletonCarousel />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : (
          <>
            <FeaturedCarousel items={featured} onPress={goDetail} />

            {continueItems.length > 0 && (
              <View style={styles.cwSection}>
                <Text style={[styles.cwSectionTitle, { color: colors.text }]}>Continue Watching</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: SPACING.lg }}
                >
                  {continueItems.slice(0, 10).map((item) => (
                    <TouchableOpacity
                      key={`cw-${item.type}-${item.id}`}
                      style={styles.cwCard}
                      activeOpacity={0.7}
                      onPress={() => goDetail(item)}
                    >
                      <Image
                        source={{ uri: item.poster || "https://via.placeholder.com/200x300?text=?" }}
                        style={[styles.cwPoster, { backgroundColor: colors.card }]}
                      />
                      <View style={styles.cwOverlay}>
                        <Ionicons name="play-circle" size={30} color="rgba(255,255,255,0.9)" />
                      </View>
                      <Text style={[styles.cwTitle, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
                      {item.episodeInfo ? (
                        <Text style={[styles.cwEpisode, { color: colors.accent }]}>{item.episodeInfo}</Text>
                      ) : null}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {settings.anime && (
              <ContentRow
                title="Top Anime"
                data={topAnime}
                loading={initialLoading}
                onPressItem={goDetail}
                onSeeAll={() => navigation.navigate("AnimeTab")}
                badge={(item) => item.subtitle?.includes("★") ? item.subtitle : null}
                onLoadMore={loadMoreAnime}
                loadingMore={!!loadingMore.anime}
              />
            )}

            {settings.movies && (
              <ContentRow
                title="Trending Movies"
                data={trendingMovies}
                loading={initialLoading}
                onPressItem={goDetail}
                onSeeAll={() => navigation.navigate("MoviesTab")}
                onLoadMore={loadMoreMovies}
                loadingMore={!!loadingMore.movies}
              />
            )}

            {settings.movies && (
              <ContentRow
                title="Bollywood"
                data={hindiMovies}
                loading={initialLoading}
                onPressItem={goDetail}
                onLoadMore={loadMoreHindi}
                loadingMore={!!loadingMore.hindi}
              />
            )}

            {settings.manga && (
              <ContentRow
                title="Popular Manga"
                data={popularManga}
                loading={initialLoading}
                onPressItem={goDetail}
                onLoadMore={loadMoreManga}
                loadingMore={!!loadingMore.manga}
              />
            )}

            {settings.movies && (
              <ContentRow
                title="TV Series"
                data={tvShows}
                loading={initialLoading}
                onPressItem={goDetail}
                onLoadMore={loadMoreTV}
                loadingMore={!!loadingMore.tv}
              />
            )}

            {settings.novels && (
              <ContentRow
                title="Light Novels"
                data={novels}
                loading={initialLoading}
                onPressItem={goDetail}
                onLoadMore={loadMoreNovels}
                loadingMore={!!loadingMore.novels}
              />
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  cwSection: { marginTop: SPACING.lg, marginBottom: SPACING.md },
  cwSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  cwCard: { width: CW_CARD_W, marginRight: SPACING.md },
  cwPoster: {
    width: CW_CARD_W,
    height: CW_CARD_W * 0.56,
    borderRadius: RADIUS.md,
  },
  cwOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: CW_CARD_W,
    height: CW_CARD_W * 0.56,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  cwTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  cwEpisode: {
    fontSize: 11,
    fontWeight: "500",
  },
});
