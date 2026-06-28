import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "../components/ScreenWrapper";
import ContentRow from "../components/ContentRow";
import { SkeletonDetail } from "../components/SkeletonLoader";
import { useTheme } from "../utils/ThemeContext";
import { getMovieDetails, getMovieCredits, getMovieSimilar, img } from "../api/tmdb";
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from "../utils/watchlist";
import { RADIUS, SPACING } from "../utils/theme";

const { width, height } = Dimensions.get("window");

export default function MovieDetailScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { id } = route.params;
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [inList, setInList] = useState(false);
  const [showFullOverview, setShowFullOverview] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setMovie(null);

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
      setLoading(false);
    })();
  }, [id]);

  const toggleWatchlist = async () => {
    if (inList) {
      await removeFromWatchlist(id, "movie");
      setInList(false);
    } else {
      await addToWatchlist({
        id, type: "movie", title: movie.title, poster: img(movie.poster_path),
      });
      setInList(true);
    }
  };

  if (loading) {
    return <ScreenWrapper><SkeletonDetail /></ScreenWrapper>;
  }

  if (!movie) {
    return (
      <ScreenWrapper style={{ justifyContent: "center", alignItems: "center" }}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
        <Text style={{ color: colors.textMuted, marginTop: SPACING.md }}>Failed to load</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: SPACING.lg }}>
          <Text style={{ color: colors.accent, fontWeight: "600" }}>Go Back</Text>
        </TouchableOpacity>
      </ScreenWrapper>
    );
  }

  const overview = movie.overview || "No overview available.";
  const shortOverview = overview.length > 200 ? overview.slice(0, 200) + "..." : overview;
  const backdrop = img(movie.backdrop_path, "w780") || img(movie.poster_path);

  return (
    <ScreenWrapper edges={["left", "right", "bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.bannerWrap}>
          <Image source={{ uri: backdrop }} style={styles.banner} />
          <LinearGradient colors={["transparent", colors.bg]} style={styles.gradient} />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{movie.title}</Text>
          {movie.tagline ? <Text style={[styles.tagline, { color: colors.textMuted }]}>"{movie.tagline}"</Text> : null}

          <View style={styles.metaRow}>
            {movie.vote_average ? (
              <View style={styles.scoreBadge}>
                <Ionicons name="star" size={14} color="#eab308" />
                <Text style={styles.scoreText}>{movie.vote_average.toFixed(1)}</Text>
              </View>
            ) : null}
            {movie.release_date ? <Text style={[styles.meta, { color: colors.textSecondary, backgroundColor: colors.card }]}>{movie.release_date.split("-")[0]}</Text> : null}
            {movie.runtime ? <Text style={[styles.meta, { color: colors.textSecondary, backgroundColor: colors.card }]}>{movie.runtime} min</Text> : null}
          </View>

          <View style={styles.genreRow}>
            {movie.genres?.map((g) => (
              <View key={g.id} style={[styles.genreTag, { backgroundColor: `${colors.accent}20` }]}>
                <Text style={[styles.genreText, { color: colors.accentLight }]}>{g.name}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.watchBtn, { backgroundColor: colors.accent }]}
              onPress={() => {
                navigation.navigate("VideoPlayer", {
                  title: movie.title, poster: img(movie.poster_path),
                  contentId: id, contentType: "movie",
                  episode: 1, totalEpisodes: 1, totalSeasons: 1,
                  episodeInfo: movie.title, isAnime: false,
                });
              }}
            >
              <Ionicons name="play" size={18} color="#fff" />
              <Text style={styles.watchBtnText}>Watch Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }, inList && { borderColor: colors.accent, backgroundColor: `${colors.accent}15` }]}
              onPress={toggleWatchlist}
            >
              <Ionicons name={inList ? "bookmark" : "bookmark-outline"} size={20} color={inList ? colors.accent : colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Overview</Text>
          <Text style={[styles.overview, { color: colors.textSecondary }]}>
            {showFullOverview ? overview : shortOverview}
          </Text>
          {overview.length > 200 ? (
            <TouchableOpacity onPress={() => setShowFullOverview(!showFullOverview)}>
              <Text style={[styles.readMore, { color: colors.accent }]}>{showFullOverview ? "Show less" : "Read more"}</Text>
            </TouchableOpacity>
          ) : null}

          {cast.length > 0 ? (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Cast</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {cast.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.castCard}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate("CharacterDetail", { id: c.id, type: "tmdb" })}
                  >
                    <Image
                      source={{ uri: c.profile_path ? img(c.profile_path, "w185") : "https://via.placeholder.com/100x100?text=?" }}
                      style={[styles.castImg, { backgroundColor: colors.card }]}
                    />
                    <Text style={[styles.castName, { color: colors.text }]} numberOfLines={1}>{c.name}</Text>
                    <Text style={[styles.castChar, { color: colors.textMuted }]} numberOfLines={1}>{c.character}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          ) : null}
        </View>

        {similar.length > 0 ? (
          <ContentRow title="Similar Movies" data={similar} onPressItem={(item) => navigation.push("MovieDetail", { id: item.id })} />
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
  backBtn: { position: "absolute", top: 44, left: SPACING.lg, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: RADIUS.full, padding: SPACING.sm },
  content: { paddingHorizontal: SPACING.lg, marginTop: -30 },
  title: { color: "#fff", fontSize: 24, fontWeight: "800" },
  tagline: { fontSize: 13, fontStyle: "italic", marginTop: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: SPACING.md, gap: SPACING.sm },
  scoreBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(234,179,8,0.15)", paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.sm, gap: 4 },
  scoreText: { color: "#eab308", fontSize: 13, fontWeight: "700" },
  meta: { fontSize: 13, paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.sm, overflow: "hidden" },
  genreRow: { flexDirection: "row", flexWrap: "wrap", marginTop: SPACING.md, gap: SPACING.xs },
  genreTag: { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.sm },
  genreText: { fontSize: 12, fontWeight: "600" },
  actionRow: { flexDirection: "row", marginTop: SPACING.lg, gap: SPACING.md, alignItems: "center" },
  actionBtn: { padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1 },
  watchBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.md },
  watchBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginTop: SPACING.xl, marginBottom: SPACING.sm },
  overview: { fontSize: 14, lineHeight: 22 },
  readMore: { fontWeight: "600", marginTop: SPACING.xs },
  castCard: { width: 80, marginRight: SPACING.md, alignItems: "center" },
  castImg: { width: 70, height: 70, borderRadius: 35 },
  castName: { fontSize: 11, fontWeight: "600", marginTop: 4, textAlign: "center" },
  castChar: { fontSize: 10, textAlign: "center" },
});
