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
import { getTVDetails, getTVCredits, getTVSimilar, img } from "../api/tmdb";
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from "../utils/watchlist";
import { COLORS, RADIUS, SPACING } from "../utils/theme";

const { width, height } = Dimensions.get("window");

export default function TVDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [show, setShow] = useState(null);
  const [cast, setCast] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [inList, setInList] = useState(false);

  useEffect(() => {
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
            id: x.id,
            type: "tv",
            title: x.name || x.title,
            poster: img(x.poster_path),
          })) || []
        );
        setInList(await isInWatchlist(id, "tv"));
      } catch (err) {
        console.log(err.message);
      }
    })();
  }, [id]);

  const toggleWatchlist = async () => {
    if (inList) {
      await removeFromWatchlist(id, "tv");
      setInList(false);
    } else {
      await addToWatchlist({
        id, type: "tv", title: show.name, poster: img(show.poster_path),
      });
      setInList(true);
    }
  };

  const buildSeasonEpisodeCounts = () => {
    const counts = {};
    if (show?.seasons) {
      show.seasons.forEach((s) => {
        if (s.season_number > 0) {
          counts[s.season_number] = s.episode_count || 10;
        }
      });
    }
    return counts;
  };

  const handleWatch = (season = 1, episode = 1) => {
    const totalSeasons = show.number_of_seasons || 1;
    const counts = buildSeasonEpisodeCounts();
    const epsInSeason = counts[season] || 10;
    navigation.navigate("VideoPlayer", {
      title: show.name,
      poster: img(show.poster_path),
      contentId: id,
      contentType: "tv",
      season,
      episode,
      totalEpisodes: epsInSeason,
      totalSeasons,
      seasonEpisodeCounts: counts,
      episodeInfo: `S${season} E${episode}`,
      isAnime: false,
    });
  };

  if (!show)
    return (
      <ScreenWrapper style={{ justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </ScreenWrapper>
    );

  const backdrop = img(show.backdrop_path, "w780") || img(show.poster_path);
  const overview = show.overview || "";

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.bannerWrap}>
          <Image source={{ uri: backdrop }} style={styles.banner} />
          <LinearGradient colors={["transparent", COLORS.bg]} style={styles.gradient} />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{show.name}</Text>
          {show.tagline ? <Text style={styles.tagline}>"{show.tagline}"</Text> : null}

          <View style={styles.metaRow}>
            {show.vote_average ? (
              <View style={styles.scoreBadge}>
                <Ionicons name="star" size={14} color={COLORS.yellow} />
                <Text style={styles.scoreText}>{show.vote_average.toFixed(1)}</Text>
              </View>
            ) : null}
            {show.first_air_date ? <Text style={styles.meta}>{show.first_air_date.split("-")[0]}</Text> : null}
            {show.number_of_seasons ? <Text style={styles.meta}>{show.number_of_seasons} Seasons</Text> : null}
            {show.status ? <Text style={styles.meta}>{show.status}</Text> : null}
          </View>

          <View style={styles.genreRow}>
            {show.genres?.map((g) => (
              <View key={g.id} style={styles.genreTag}>
                <Text style={styles.genreText}>{g.name}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.watchBtn} onPress={() => handleWatch(1, 1)}>
              <Ionicons name="play" size={18} color="#fff" />
              <Text style={styles.watchBtnText}>Watch S1 E1</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, inList && styles.actionBtnActive]}
              onPress={toggleWatchlist}
            >
              <Ionicons name={inList ? "bookmark" : "bookmark-outline"} size={20}
                color={inList ? COLORS.accent : COLORS.text} />
            </TouchableOpacity>
          </View>

          {overview ? (
            <>
              <Text style={styles.sectionTitle}>Overview</Text>
              <Text style={styles.overview}>{overview}</Text>
            </>
          ) : null}

          <Text style={styles.sectionTitle}>Seasons</Text>
          {show.seasons?.filter((s) => s.season_number > 0).map((s) => (
            <TouchableOpacity
              key={s.id}
              style={styles.seasonItem}
              onPress={() => handleWatch(s.season_number, 1)}
            >
              {s.poster_path ? (
                <Image source={{ uri: img(s.poster_path, "w92") }} style={styles.seasonPoster} />
              ) : (
                <View style={[styles.seasonPoster, { justifyContent: "center", alignItems: "center" }]}>
                  <Ionicons name="image-outline" size={20} color={COLORS.textMuted} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.seasonTitle}>{s.name}</Text>
                <Text style={styles.seasonSub}>{s.episode_count} episodes</Text>
                {s.air_date ? (
                  <Text style={styles.seasonDate}>{s.air_date.split("-")[0]}</Text>
                ) : null}
              </View>
              <Ionicons name="play-circle" size={28} color={COLORS.accent} />
            </TouchableOpacity>
          ))}

          {cast.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Cast</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {cast.map((c) => (
                  <View key={c.id} style={styles.castCard}>
                    <Image
                      source={{ uri: c.profile_path ? img(c.profile_path, "w185") : "https://via.placeholder.com/100?text=?" }}
                      style={styles.castImg}
                    />
                    <Text style={styles.castName} numberOfLines={1}>{c.name}</Text>
                    <Text style={styles.castChar} numberOfLines={1}>{c.character}</Text>
                  </View>
                ))}
              </ScrollView>
            </>
          ) : null}
        </View>

        {similar.length > 0 ? (
          <ContentRow title="Similar Shows" data={similar}
            onPressItem={(item) => navigation.push("TVDetail", { id: item.id })} />
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
  tagline: { color: COLORS.textMuted, fontSize: 13, fontStyle: "italic", marginTop: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: SPACING.md, gap: SPACING.sm, flexWrap: "wrap" },
  scoreBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(234,179,8,0.15)", paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.sm, gap: 4 },
  scoreText: { color: COLORS.yellow, fontSize: 13, fontWeight: "700" },
  meta: { color: COLORS.textSecondary, fontSize: 13, backgroundColor: COLORS.card, paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.sm, overflow: "hidden" },
  genreRow: { flexDirection: "row", flexWrap: "wrap", marginTop: SPACING.md, gap: SPACING.xs },
  genreTag: { backgroundColor: "rgba(139,92,246,0.15)", paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.sm },
  genreText: { color: COLORS.accentLight, fontSize: 12, fontWeight: "600" },
  actionRow: { flexDirection: "row", marginTop: SPACING.lg, gap: SPACING.md, alignItems: "center" },
  watchBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: COLORS.accent, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.md },
  watchBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  actionBtn: { backgroundColor: COLORS.card, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  actionBtnActive: { borderColor: COLORS.accent },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: "700", marginTop: SPACING.xl, marginBottom: SPACING.sm },
  overview: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 22 },
  seasonItem: { flexDirection: "row", alignItems: "center", paddingVertical: SPACING.md, borderBottomWidth: 1, borderColor: COLORS.border, gap: SPACING.md },
  seasonPoster: { width: 50, height: 75, borderRadius: RADIUS.sm, backgroundColor: COLORS.card },
  seasonTitle: { color: COLORS.text, fontSize: 15, fontWeight: "600" },
  seasonSub: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  seasonDate: { color: COLORS.textMuted, fontSize: 11, marginTop: 1 },
  castCard: { width: 80, marginRight: SPACING.md, alignItems: "center" },
  castImg: { width: 70, height: 70, borderRadius: 35, backgroundColor: COLORS.card },
  castName: { color: COLORS.text, fontSize: 11, fontWeight: "600", marginTop: 4, textAlign: "center" },
  castChar: { color: COLORS.textMuted, fontSize: 10, textAlign: "center" },
});
