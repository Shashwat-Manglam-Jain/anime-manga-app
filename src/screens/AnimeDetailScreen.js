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
import { getAnimeById, getAnimeRecommendations, getAnimeCharacters, getAnimeEpisodes } from "../api/jikan";
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from "../utils/watchlist";
import { ANIME_PROVIDERS } from "../api/providers";
import { COLORS, RADIUS, SPACING } from "../utils/theme";

const { width, height } = Dimensions.get("window");

export default function AnimeDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [anime, setAnime] = useState(null);
  const [recs, setRecs] = useState([]);
  const [chars, setChars] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [totalEps, setTotalEps] = useState(0);
  const [inList, setInList] = useState(false);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [a, r, c, ep] = await Promise.all([
          getAnimeById(id),
          getAnimeRecommendations(id),
          getAnimeCharacters(id),
          getAnimeEpisodes(id, 1),
        ]);
        setAnime(a);
        setRecs(r);
        setChars(c);
        const epData = ep.data || [];
        setEpisodes(epData);
        setTotalEps(a.episodes || ep.pagination?.last_visible_page * 100 || epData.length || 24);
        setInList(await isInWatchlist(id, "anime"));
      } catch (err) {
        console.log(err.message);
      }
    })();
  }, [id]);

  const toggleWatchlist = async () => {
    if (inList) {
      await removeFromWatchlist(id, "anime");
      setInList(false);
    } else {
      await addToWatchlist({
        id,
        type: "anime",
        title: anime.title,
        poster: anime.images?.jpg?.large_image_url,
      });
      setInList(true);
    }
  };

  const handleWatch = (ep = 1, lang = "sub") => {
    navigation.navigate("VideoPlayer", {
      title: anime.title,
      poster: anime.images?.jpg?.large_image_url,
      contentId: id,
      contentType: "anime",
      providers: ANIME_PROVIDERS,
      buildUrl: (provider, _s, episode, language) =>
        provider.buildMalUrl(id, episode, language || lang),
      episode: ep,
      totalEpisodes: totalEps,
      totalSeasons: 1,
      episodeInfo: `Episode ${ep}`,
      isAnime: true,
    });
  };

  if (!anime)
    return (
      <ScreenWrapper style={{ justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </ScreenWrapper>
    );

  const synopsis = anime.synopsis || "No synopsis available.";
  const shortSynopsis = synopsis.length > 200 ? synopsis.slice(0, 200) + "..." : synopsis;

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.bannerWrap}>
          <Image
            source={{ uri: anime.images?.jpg?.large_image_url }}
            style={styles.banner}
          />
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
          <Text style={styles.title}>{anime.title}</Text>
          {anime.title_english && anime.title_english !== anime.title ? (
            <Text style={styles.altTitle}>{anime.title_english}</Text>
          ) : null}

          <View style={styles.metaRow}>
            {anime.score ? (
              <View style={styles.scoreBadge}>
                <Ionicons name="star" size={14} color={COLORS.yellow} />
                <Text style={styles.scoreText}>{anime.score}</Text>
              </View>
            ) : null}
            {anime.type ? <Text style={styles.meta}>{anime.type}</Text> : null}
            {totalEps > 0 ? (
              <Text style={styles.meta}>{totalEps} eps</Text>
            ) : null}
            {anime.status ? (
              <Text style={styles.meta}>{anime.status}</Text>
            ) : null}
          </View>

          <View style={styles.genreRow}>
            {anime.genres?.map((g) => (
              <View key={g.mal_id} style={styles.genreTag}>
                <Text style={styles.genreText}>{g.name}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.watchBtn} onPress={() => handleWatch(1, "sub")}>
              <Ionicons name="play" size={18} color="#fff" />
              <Text style={styles.watchBtnText}>SUB</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dubBtn} onPress={() => handleWatch(1, "dub")}>
              <Ionicons name="play" size={18} color="#fff" />
              <Text style={styles.watchBtnText}>DUB</Text>
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

          <Text style={styles.sectionTitle}>Synopsis</Text>
          <Text style={styles.synopsis}>
            {showFullSynopsis ? synopsis : shortSynopsis}
          </Text>
          {synopsis.length > 200 ? (
            <TouchableOpacity onPress={() => setShowFullSynopsis(!showFullSynopsis)}>
              <Text style={styles.readMore}>
                {showFullSynopsis ? "Show less" : "Read more"}
              </Text>
            </TouchableOpacity>
          ) : null}

          {episodes.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Episodes</Text>
              {episodes.slice(0, 20).map((ep) => (
                <TouchableOpacity
                  key={ep.mal_id}
                  style={styles.episodeItem}
                  onPress={() => handleWatch(ep.mal_id, "sub")}
                >
                  <View style={styles.epNumWrap}>
                    <Text style={styles.epNum}>{ep.mal_id}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.epTitle} numberOfLines={1}>
                      {ep.title || `Episode ${ep.mal_id}`}
                    </Text>
                    {ep.aired ? (
                      <Text style={styles.epDate}>
                        {new Date(ep.aired).toLocaleDateString()}
                      </Text>
                    ) : null}
                  </View>
                  <Ionicons name="play-circle" size={24} color={COLORS.accent} />
                </TouchableOpacity>
              ))}
              {totalEps > 20 && (
                <TouchableOpacity
                  style={styles.viewAllBtn}
                  onPress={() => handleWatch(1, "sub")}
                >
                  <Text style={styles.viewAllText}>View All {totalEps} Episodes</Text>
                  <Ionicons name="arrow-forward" size={16} color={COLORS.accent} />
                </TouchableOpacity>
              )}
            </>
          )}

          {anime.trailer?.url ? (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Trailer</Text>
              <TouchableOpacity style={styles.trailerCard}>
                <Image
                  source={{ uri: anime.trailer.images?.maximum_image_url }}
                  style={styles.trailerImg}
                />
                <View style={styles.trailerOverlay}>
                  <Ionicons name="play-circle" size={50} color="rgba(255,255,255,0.9)" />
                </View>
              </TouchableOpacity>
            </View>
          ) : null}

          {chars.length > 0 ? (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Characters</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {chars.map((c) => (
                  <View key={c.character.mal_id} style={styles.charCard}>
                    <Image
                      source={{ uri: c.character.images?.jpg?.image_url }}
                      style={styles.charImg}
                    />
                    <Text style={styles.charName} numberOfLines={1}>
                      {c.character.name}
                    </Text>
                    <Text style={styles.charRole}>{c.role}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>

        {recs.length > 0 ? (
          <ContentRow
            title="Recommendations"
            data={recs.map((r) => ({
              id: r.entry.mal_id,
              type: "anime",
              title: r.entry.title,
              poster: r.entry.images?.jpg?.large_image_url,
            }))}
            onPressItem={(item) =>
              navigation.push("AnimeDetail", { id: item.id })
            }
          />
        ) : null}

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  bannerWrap: { width, height: height * 0.45 },
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
  content: { paddingHorizontal: SPACING.lg, marginTop: -40 },
  title: { color: "#fff", fontSize: 24, fontWeight: "800" },
  altTitle: { color: COLORS.textSecondary, fontSize: 14, marginTop: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: SPACING.md, gap: SPACING.sm, flexWrap: "wrap" },
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
  actionRow: { flexDirection: "row", marginTop: SPACING.lg, gap: SPACING.sm },
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
  watchBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  dubBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.blue,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  watchBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: "700", marginTop: SPACING.xl, marginBottom: SPACING.sm },
  synopsis: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 22 },
  readMore: { color: COLORS.accent, fontWeight: "600", marginTop: SPACING.xs },
  episodeItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  epNumWrap: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  epNum: { color: COLORS.text, fontSize: 13, fontWeight: "700" },
  epTitle: { color: COLORS.text, fontSize: 14, fontWeight: "500" },
  epDate: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  viewAllText: { color: COLORS.accent, fontWeight: "600", fontSize: 14 },
  infoSection: { marginTop: SPACING.md },
  trailerCard: { borderRadius: RADIUS.md, overflow: "hidden", height: 180 },
  trailerImg: { width: "100%", height: "100%", resizeMode: "cover" },
  trailerOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)" },
  charCard: { width: 80, marginRight: SPACING.md, alignItems: "center" },
  charImg: { width: 70, height: 70, borderRadius: 35, backgroundColor: COLORS.card },
  charName: { color: COLORS.text, fontSize: 11, fontWeight: "600", marginTop: 4, textAlign: "center" },
  charRole: { color: COLORS.textMuted, fontSize: 10 },
});
