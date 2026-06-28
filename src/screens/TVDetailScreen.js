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
import { getTVDetails, getTVCredits, getTVSimilar, img } from "../api/tmdb";
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from "../utils/watchlist";
import { RADIUS, SPACING } from "../utils/theme";

const { width, height } = Dimensions.get("window");

export default function TVDetailScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { id } = route.params;
  const [show, setShow] = useState(null);
  const [cast, setCast] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [inList, setInList] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);

  useEffect(() => {
    setLoading(true);
    setShow(null);

    (async () => {
      try {
        const [s, cr, sim] = await Promise.all([
          getTVDetails(id),
          getTVCredits(id),
          getTVSimilar(id),
        ]);
        setShow(s);
        setCast(cr.cast?.slice(0, 20) || []);
        setSimilar(
          sim.results?.slice(0, 12).map((x) => ({
            id: x.id, type: "tv", title: x.name || x.title, poster: img(x.poster_path),
          })) || []
        );
        setInList(await isInWatchlist(id, "tv"));
      } catch (err) {
        console.log(err.message);
      }
      setLoading(false);
    })();
  }, [id]);

  const toggleWatchlist = async () => {
    if (inList) {
      await removeFromWatchlist(id, "tv");
      setInList(false);
    } else {
      await addToWatchlist({ id, type: "tv", title: show.name, poster: img(show.poster_path) });
      setInList(true);
    }
  };

  const buildSeasonEpisodeCounts = () => {
    const counts = {};
    if (show?.seasons) {
      show.seasons.forEach((s) => {
        if (s.season_number > 0) counts[s.season_number] = s.episode_count || 10;
      });
    }
    return counts;
  };

  const handleWatch = (season = 1, episode = 1) => {
    const totalSeasons = show.number_of_seasons || 1;
    const counts = buildSeasonEpisodeCounts();
    navigation.navigate("VideoPlayer", {
      title: show.name, poster: img(show.poster_path),
      contentId: id, contentType: "tv",
      season, episode,
      totalEpisodes: counts[season] || 10, totalSeasons,
      seasonEpisodeCounts: counts,
      episodeInfo: `S${season} E${episode}`, isAnime: false,
    });
  };

  if (loading) return <ScreenWrapper><SkeletonDetail /></ScreenWrapper>;

  if (!show) {
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

  const backdrop = img(show.backdrop_path, "w780") || img(show.poster_path);
  const overview = show.overview || "";

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
          <Text style={styles.title}>{show.name}</Text>
          {show.tagline ? <Text style={[styles.tagline, { color: colors.textMuted }]}>"{show.tagline}"</Text> : null}

          <View style={styles.metaRow}>
            {show.vote_average ? (
              <View style={styles.scoreBadge}>
                <Ionicons name="star" size={14} color="#eab308" />
                <Text style={styles.scoreText}>{show.vote_average.toFixed(1)}</Text>
              </View>
            ) : null}
            {show.first_air_date ? <Text style={[styles.meta, { color: colors.textSecondary, backgroundColor: colors.card }]}>{show.first_air_date.split("-")[0]}</Text> : null}
            {show.number_of_seasons ? <Text style={[styles.meta, { color: colors.textSecondary, backgroundColor: colors.card }]}>{show.number_of_seasons} Seasons</Text> : null}
            {show.status ? <Text style={[styles.meta, { color: colors.textSecondary, backgroundColor: colors.card }]}>{show.status}</Text> : null}
          </View>

          <View style={styles.genreRow}>
            {show.genres?.map((g) => (
              <View key={g.id} style={[styles.genreTag, { backgroundColor: `${colors.accent}20` }]}>
                <Text style={[styles.genreText, { color: colors.accentLight }]}>{g.name}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.watchBtn, { backgroundColor: colors.accent }]} onPress={() => handleWatch(selectedSeason, 1)}>
              <Ionicons name="play" size={18} color="#fff" />
              <Text style={styles.watchBtnText}>Watch Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }, inList && { borderColor: colors.accent }]}
              onPress={toggleWatchlist}
            >
              <Ionicons name={inList ? "bookmark" : "bookmark-outline"} size={20} color={inList ? colors.accent : colors.text} />
            </TouchableOpacity>
          </View>

          {overview ? (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Overview</Text>
              <Text style={[styles.overview, { color: colors.textSecondary }]}>{overview}</Text>
            </>
          ) : null}

          {(() => {
            const seasons = show.seasons?.filter((s) => s.season_number > 0) || [];
            const totalSeasons = seasons.length;
            const currentSeasonData = seasons.find((s) => s.season_number === selectedSeason);
            const episodeCount = currentSeasonData?.episode_count || show.number_of_episodes || 10;

            return (
              <>
                {totalSeasons > 1 && (
                  <>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Season</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.seasonPillRow}>
                      {seasons.map((s) => (
                        <TouchableOpacity
                          key={s.id}
                          style={[
                            styles.seasonPill,
                            { backgroundColor: colors.card, borderColor: colors.border },
                            selectedSeason === s.season_number && { backgroundColor: colors.accent, borderColor: colors.accent },
                          ]}
                          onPress={() => setSelectedSeason(s.season_number)}
                        >
                          <Text
                            style={[
                              styles.seasonPillText,
                              { color: colors.textSecondary },
                              selectedSeason === s.season_number && { color: "#fff" },
                            ]}
                          >
                            S{s.season_number}
                          </Text>
                          <Text
                            style={[
                              styles.seasonPillSub,
                              { color: colors.textMuted },
                              selectedSeason === s.season_number && { color: "rgba(255,255,255,0.7)" },
                            ]}
                          >
                            {s.episode_count} eps
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </>
                )}

                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Episodes{totalSeasons > 1 ? ` — Season ${selectedSeason}` : ""} ({episodeCount})
                </Text>
                <View style={styles.epGrid}>
                  {Array.from({ length: episodeCount }, (_, i) => i + 1).map((ep) => (
                    <TouchableOpacity
                      key={ep}
                      style={[styles.epGridBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                      onPress={() => handleWatch(selectedSeason, ep)}
                    >
                      <Text style={[styles.epGridText, { color: colors.textSecondary }]}>{ep}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            );
          })()}

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
                      source={{ uri: c.profile_path ? img(c.profile_path, "w185") : "https://via.placeholder.com/100?text=?" }}
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
          <ContentRow title="Similar Shows" data={similar} onPressItem={(item) => navigation.push("TVDetail", { id: item.id })} />
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
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: SPACING.md, gap: SPACING.sm, flexWrap: "wrap" },
  scoreBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(234,179,8,0.15)", paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.sm, gap: 4 },
  scoreText: { color: "#eab308", fontSize: 13, fontWeight: "700" },
  meta: { fontSize: 13, paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.sm, overflow: "hidden" },
  genreRow: { flexDirection: "row", flexWrap: "wrap", marginTop: SPACING.md, gap: SPACING.xs },
  genreTag: { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.sm },
  genreText: { fontSize: 12, fontWeight: "600" },
  actionRow: { flexDirection: "row", marginTop: SPACING.lg, gap: SPACING.md, alignItems: "center" },
  watchBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.md },
  watchBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  actionBtn: { padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginTop: SPACING.xl, marginBottom: SPACING.sm },
  overview: { fontSize: 14, lineHeight: 22 },
  seasonPillRow: { gap: SPACING.sm },
  seasonPill: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: "center",
  },
  seasonPillText: { fontSize: 14, fontWeight: "700" },
  seasonPillSub: { fontSize: 10, marginTop: 2 },
  epGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.xs },
  epGridBtn: {
    width: 48,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  epGridText: { fontSize: 13, fontWeight: "600" },
  castCard: { width: 80, marginRight: SPACING.md, alignItems: "center" },
  castImg: { width: 70, height: 70, borderRadius: 35 },
  castName: { fontSize: 11, fontWeight: "600", marginTop: 4, textAlign: "center" },
  castChar: { fontSize: 10, textAlign: "center" },
});
