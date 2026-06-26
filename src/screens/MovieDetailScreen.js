import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "../components/ScreenWrapper";
import ContentRow from "../components/ContentRow";
import { getMovieDetails, getMovieCredits, getMovieSimilar, img } from "../api/tmdb";
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from "../utils/watchlist";
import { MOVIE_PROVIDERS } from "../api/providers";
import { COLORS, RADIUS, SPACING } from "../utils/theme";

const { width, height } = Dimensions.get("window");

export default function MovieDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [inList, setInList] = useState(false);
  const [showFullOverview, setShowFullOverview] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [m, cr, sim] = await Promise.all([
          getMovieDetails(id),
          getMovieCredits(id),
          getMovieSimilar(id),
        ]);
        setMovie(m);
        setCast(cr.cast?.slice(0, 20) || []);
        setSimilar(
          sim.results?.slice(0, 12).map((s) => ({
            id: s.id,
            type: "movie",
            title: s.title,
            poster: img(s.poster_path),
          })) || []
        );
        setInList(await isInWatchlist(id, "movie"));
      } catch (err) {
        console.log(err.message);
      }
    })();
  }, [id]);

  const toggleWatchlist = async () => {
    if (inList) {
      await removeFromWatchlist(id, "movie");
      setInList(false);
    } else {
      await addToWatchlist({
        id,
        type: "movie",
        title: movie.title,
        poster: img(movie.poster_path),
      });
      setInList(true);
    }
  };

  if (!movie)
    return (
      <ScreenWrapper style={{ justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </ScreenWrapper>
    );

  const overview = movie.overview || "No overview available.";
  const shortOverview = overview.length > 200 ? overview.slice(0, 200) + "..." : overview;
  const backdrop = img(movie.backdrop_path, "w780") || img(movie.poster_path);

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.bannerWrap}>
          <Image source={{ uri: backdrop }} style={styles.banner} />
          <LinearGradient
            colors={["transparent", COLORS.bg]}
            style={styles.gradient}
          />
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{movie.title}</Text>
          {movie.tagline ? (
            <Text style={styles.tagline}>"{movie.tagline}"</Text>
          ) : null}

          <View style={styles.metaRow}>
            {movie.vote_average ? (
              <View style={styles.scoreBadge}>
                <Ionicons name="star" size={14} color={COLORS.yellow} />
                <Text style={styles.scoreText}>
                  {movie.vote_average.toFixed(1)}
                </Text>
              </View>
            ) : null}
            {movie.release_date ? (
              <Text style={styles.meta}>{movie.release_date.split("-")[0]}</Text>
            ) : null}
            {movie.runtime ? (
              <Text style={styles.meta}>{movie.runtime} min</Text>
            ) : null}
          </View>

          <View style={styles.genreRow}>
            {movie.genres?.map((g) => (
              <View key={g.id} style={styles.genreTag}>
                <Text style={styles.genreText}>{g.name}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.watchBtn}
              onPress={() => {
                navigation.navigate("VideoPlayer", {
                  title: movie.title,
                  poster: img(movie.poster_path),
                  contentId: id,
                  contentType: "movie",
                  providers: MOVIE_PROVIDERS,
                  episode: 1,
                  totalEpisodes: 1,
                  totalSeasons: 1,
                  episodeInfo: movie.title,
                  isAnime: false,
                });
              }}
            >
              <Ionicons name="play" size={18} color="#fff" />
              <Text style={styles.watchBtnText}>Watch Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, inList && styles.actionBtnActive]}
              onPress={toggleWatchlist}
            >
              <Ionicons
                name={inList ? "bookmark" : "bookmark-outline"}
                size={20}
                color={inList ? COLORS.accent : COLORS.text}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.overview}>
            {showFullOverview ? overview : shortOverview}
          </Text>
          {overview.length > 200 ? (
            <TouchableOpacity onPress={() => setShowFullOverview(!showFullOverview)}>
              <Text style={styles.readMore}>
                {showFullOverview ? "Show less" : "Read more"}
              </Text>
            </TouchableOpacity>
          ) : null}

          {cast.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Cast</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {cast.map((c) => (
                  <View key={c.id} style={styles.castCard}>
                    <Image
                      source={{
                        uri: c.profile_path
                          ? img(c.profile_path, "w185")
                          : "https://via.placeholder.com/100x100?text=?",
                      }}
                      style={styles.castImg}
                    />
                    <Text style={styles.castName} numberOfLines={1}>
                      {c.name}
                    </Text>
                    <Text style={styles.castChar} numberOfLines={1}>
                      {c.character}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </>
          ) : null}
        </View>

        {similar.length > 0 ? (
          <ContentRow
            title="Similar Movies"
            data={similar}
            onPressItem={(item) =>
              navigation.push("MovieDetail", { id: item.id })
            }
          />
        ) : null}

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  bannerWrap: { width, height: height * 0.35 },
  banner: { width: "100%", height: "100%", resizeMode: "cover" },
  gradient: { position: "absolute", bottom: 0, left: 0, right: 0, height: "60%" },
  backBtn: {
    position: "absolute",
    top: 44,
    left: SPACING.lg,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: RADIUS.full,
    padding: SPACING.sm,
  },
  content: { paddingHorizontal: SPACING.lg, marginTop: -30 },
  title: { color: "#fff", fontSize: 24, fontWeight: "800" },
  tagline: { color: COLORS.textMuted, fontSize: 13, fontStyle: "italic", marginTop: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: SPACING.md, gap: SPACING.sm },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(234,179,8,0.15)",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  scoreText: { color: COLORS.yellow, fontSize: 13, fontWeight: "700" },
  meta: {
    color: COLORS.textSecondary,
    fontSize: 13,
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    overflow: "hidden",
  },
  genreRow: { flexDirection: "row", flexWrap: "wrap", marginTop: SPACING.md, gap: SPACING.xs },
  genreTag: {
    backgroundColor: "rgba(139,92,246,0.15)",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  genreText: { color: COLORS.accentLight, fontSize: 12, fontWeight: "600" },
  actionRow: { flexDirection: "row", marginTop: SPACING.lg, gap: SPACING.md },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionBtnActive: { borderColor: COLORS.accent, backgroundColor: "rgba(139,92,246,0.1)" },
  watchBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: COLORS.accent, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.md },
  watchBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: "700", marginTop: SPACING.xl, marginBottom: SPACING.sm },
  overview: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 22 },
  readMore: { color: COLORS.accent, fontWeight: "600", marginTop: SPACING.xs },
  castCard: { width: 80, marginRight: SPACING.md, alignItems: "center" },
  castImg: { width: 70, height: 70, borderRadius: 35, backgroundColor: COLORS.card },
  castName: { color: COLORS.text, fontSize: 11, fontWeight: "600", marginTop: 4, textAlign: "center" },
  castChar: { color: COLORS.textMuted, fontSize: 10, textAlign: "center" },
});
