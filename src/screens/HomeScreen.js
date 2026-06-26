import React, { useEffect, useState, useCallback } from "react";
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
import { getSeasonNow, getTopAnime } from "../api/jikan";
import { getTrending, getPopular, getTrendingTV, img } from "../api/tmdb";
import { getPopularManga } from "../api/mangadex";
import { getPopularNovels } from "../api/novels";
import { getContinueWatching, removeContinueWatching } from "../utils/watchlist";
import { COLORS, RADIUS, SPACING } from "../utils/theme";

const { width } = Dimensions.get("window");
const CW_CARD_W = width * 0.38;

export default function HomeScreen({ navigation }) {
  const [featured, setFeatured] = useState([]);
  const [topAnime, setTopAnime] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularManga, setPopularManga] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [novels, setNovels] = useState([]);
  const [continueItems, setContinueItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getContinueWatching().then(setContinueItems);
    }, [])
  );

  const load = async () => {
    try {
      const [season, top, movies, manga, tv, nov] = await Promise.all([
        getSeasonNow(1),
        getTopAnime(1),
        getTrending(),
        getPopularManga(0),
        getTrendingTV(),
        getPopularNovels(1).catch(() => ({ items: [] })),
      ]);

      setFeatured(
        season.data.slice(0, 6).map((a) => ({
          id: a.mal_id,
          type: "anime",
          title: a.title,
          poster: a.images?.jpg?.large_image_url,
          subtitle: `${a.score ? `★ ${a.score}` : ""} ${a.type || ""}`.trim(),
          tags: a.genres?.map((g) => g.name).slice(0, 3) || [],
        }))
      );

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

      const cw = await getContinueWatching();
      setContinueItems(cw);
    } catch (err) {
      console.log("Home load error:", err.message);
    }
  };

  useEffect(() => { load(); }, []);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const goDetail = (item) => {
    if (item.type === "anime") navigation.navigate("AnimeDetail", { id: item.id });
    else if (item.type === "movie") navigation.navigate("MovieDetail", { id: item.id });
    else if (item.type === "manga") navigation.navigate("MangaDetail", { id: item.id });
    else if (item.type === "tv") navigation.navigate("TVDetail", { id: item.id });
    else if (item.type === "novel") navigation.navigate("NovelDetail", { id: item.id, title: item.title });
  };

  return (
    <ScreenWrapper>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={COLORS.accent}
          />
        }
      >
        <FeaturedCarousel items={featured} onPress={goDetail} />

        {continueItems.length > 0 && (
          <View style={styles.cwSection}>
            <Text style={styles.cwSectionTitle}>Continue Watching</Text>
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
                    style={styles.cwPoster}
                  />
                  <View style={styles.cwOverlay}>
                    <Ionicons name="play-circle" size={30} color="rgba(255,255,255,0.9)" />
                  </View>
                  <Text style={styles.cwTitle} numberOfLines={2}>{item.title}</Text>
                  {item.episodeInfo ? (
                    <Text style={styles.cwEpisode}>{item.episodeInfo}</Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <ContentRow
          title="Top Anime"
          data={topAnime}
          onPressItem={goDetail}
          badge={(item) => item.subtitle?.includes("★") ? item.subtitle : null}
        />

        <ContentRow
          title="Trending Movies"
          data={trendingMovies}
          onPressItem={goDetail}
        />

        <ContentRow
          title="Popular Manga"
          data={popularManga}
          onPressItem={goDetail}
        />

        <ContentRow
          title="TV Series"
          data={tvShows}
          onPressItem={goDetail}
        />

        <ContentRow
          title="Light Novels"
          data={novels}
          onPressItem={goDetail}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  cwSection: {
    marginTop: SPACING.lg,
  },
  cwSectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  cwCard: {
    width: CW_CARD_W,
    marginRight: SPACING.md,
  },
  cwPoster: {
    width: CW_CARD_W,
    height: CW_CARD_W * 0.56,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.card,
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
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  cwEpisode: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: "500",
  },
});
