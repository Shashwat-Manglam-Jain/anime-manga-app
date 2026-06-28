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
import { SkeletonDetail } from "../components/SkeletonLoader";
import { getAnimeById, getAnimeRecommendations, getAnimeCharacters, getAnimeEpisodes } from "../api/jikan";
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from "../utils/watchlist";
import { RADIUS, SPACING } from "../utils/theme";
import { useTheme } from "../utils/ThemeContext";

const { width, height } = Dimensions.get("window");

export default function AnimeDetailScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { id } = route.params;
  const [anime, setAnime] = useState(null);
  const [recs, setRecs] = useState([]);
  const [chars, setChars] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [totalEps, setTotalEps] = useState(0);
  const [inList, setInList] = useState(false);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [loading, setLoading] = useState(true);
  const [epRangeIdx, setEpRangeIdx] = useState(0);

  useEffect(() => {
    setLoading(true);
    setAnime(null);
    setRecs([]);
    setChars([]);
    setEpisodes([]);

    (async () => {
      try {
        const a = await getAnimeById(id);
        setAnime(a);

        const computedEps = a.episodes || 24;
        setTotalEps(computedEps);
        setLoading(false);

        const [r, c, ep] = await Promise.allSettled([
          getAnimeRecommendations(id),
          getAnimeCharacters(id),
          getAnimeEpisodes(id, 1),
        ]);

        if (r.status === "fulfilled") setRecs(r.value);
        if (c.status === "fulfilled") setChars(c.value);
        if (ep.status === "fulfilled") {
          const epData = ep.value.data || [];
          setEpisodes(epData);
          if (epData.length > 0) {
            const lastPage = ep.value.pagination?.last_visible_page || 1;
            const betterTotal = a.episodes || lastPage * 100 || epData.length;
            setTotalEps(betterTotal);
          }
        }

        setInList(await isInWatchlist(id, "anime"));
      } catch (err) {
        console.log(err.message);
        setLoading(false);
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
      episode: ep,
      totalEpisodes: totalEps,
      totalSeasons: 1,
      episodeInfo: `Episode ${ep}`,
      isAnime: true,
      lang,
    });
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <SkeletonDetail />
      </ScreenWrapper>
    );
  }

  if (!anime) {
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

  const RELATION_PRIORITY = ["Prequel", "Sequel", "Parent Story", "Full Story", "Alternative Version", "Spin-Off", "Side Story"];
  const relatedAnime = (anime.relations || [])
    .filter((r) => RELATION_PRIORITY.includes(r.relation))
    .flatMap((r) => r.entry
      .filter((e) => e.type === "anime")
      .map((e) => ({ mal_id: e.mal_id, name: e.name, relation: r.relation }))
    );

  const synopsis = anime.synopsis || "No synopsis available.";
  const shortSynopsis = synopsis.length > 200 ? synopsis.slice(0, 200) + "..." : synopsis;

  return (
    <ScreenWrapper edges={["left", "right", "bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.bannerWrap}>
          <Image
            source={{ uri: anime.images?.jpg?.large_image_url }}
            style={styles.banner}
          />
          <LinearGradient
            colors={["transparent", colors.bg]}
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
            <Text style={[styles.altTitle, { color: colors.textSecondary }]}>{anime.title_english}</Text>
          ) : null}

          <View style={styles.metaRow}>
            {anime.score ? (
              <View style={styles.scoreBadge}>
                <Ionicons name="star" size={14} color={colors.yellow} />
                <Text style={[styles.scoreText, { color: colors.yellow }]}>{anime.score}</Text>
              </View>
            ) : null}
            {anime.type ? <Text style={[styles.meta, { color: colors.textSecondary, backgroundColor: colors.card }]}>{anime.type}</Text> : null}
            {totalEps > 0 ? (
              <Text style={[styles.meta, { color: colors.textSecondary, backgroundColor: colors.card }]}>{totalEps} eps</Text>
            ) : null}
            {anime.status ? (
              <Text style={[styles.meta, { color: colors.textSecondary, backgroundColor: colors.card }]}>{anime.status}</Text>
            ) : null}
            {anime.aired?.string ? (
              <Text style={[styles.meta, { color: colors.textSecondary, backgroundColor: colors.card }]}>{anime.aired.string}</Text>
            ) : null}
          </View>

          <View style={styles.genreRow}>
            {anime.genres?.map((g) => (
              <View key={g.mal_id} style={styles.genreTag}>
                <Text style={[styles.genreText, { color: colors.accentLight }]}>{g.name}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.watchBtn, { backgroundColor: colors.accent }]} onPress={() => handleWatch(1, "sub")}>
              <Ionicons name="play" size={18} color="#fff" />
              <Text style={styles.watchBtnText}>SUB</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.dubBtn, { backgroundColor: colors.blue }]} onPress={() => handleWatch(1, "dub")}>
              <Ionicons name="play" size={18} color="#fff" />
              <Text style={styles.watchBtnText}>DUB</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }, inList && styles.actionBtnActive, inList && { borderColor: colors.accent }]}
              onPress={toggleWatchlist}
            >
              <Ionicons
                name={inList ? "bookmark" : "bookmark-outline"}
                size={20}
                color={inList ? colors.accent : colors.text}
              />
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Synopsis</Text>
          <Text style={[styles.synopsis, { color: colors.textSecondary }]}>
            {showFullSynopsis ? synopsis : shortSynopsis}
          </Text>
          {synopsis.length > 200 ? (
            <TouchableOpacity onPress={() => setShowFullSynopsis(!showFullSynopsis)}>
              <Text style={[styles.readMore, { color: colors.accent }]}>
                {showFullSynopsis ? "Show less" : "Read more"}
              </Text>
            </TouchableOpacity>
          ) : null}

          {relatedAnime.length > 0 && (
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Seasons & Related</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {relatedAnime.map((rel) => (
                  <TouchableOpacity
                    key={`${rel.relation}-${rel.mal_id}`}
                    style={[styles.relCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                    activeOpacity={0.7}
                    onPress={() => navigation.push("AnimeDetail", { id: rel.mal_id })}
                  >
                    <Text style={[styles.relType, { color: colors.accent }]}>{rel.relation}</Text>
                    <Text style={[styles.relTitle, { color: colors.text }]} numberOfLines={2}>{rel.name}</Text>
                    <Ionicons name="chevron-forward" size={14} color={colors.textMuted} style={{ marginTop: 4 }} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {totalEps > 0 && (() => {
            const RANGE_SIZE = 50;
            const ranges = [];
            for (let start = 1; start <= totalEps; start += RANGE_SIZE) {
              const end = Math.min(start + RANGE_SIZE - 1, totalEps);
              ranges.push({ start, end, label: `${start}–${end}` });
            }
            const range = ranges[epRangeIdx] || ranges[0];
            const rangeStart = range.start;
            const rangeEnd = range.end;
            const rangeEpisodes = episodes.filter((ep) => ep.mal_id >= rangeStart && ep.mal_id <= rangeEnd);

            return (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Episodes ({totalEps})</Text>
                {ranges.length > 1 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.md }} contentContainerStyle={{ gap: SPACING.xs }}>
                    {ranges.map((r, i) => (
                      <TouchableOpacity
                        key={r.start}
                        style={[styles.epRangeBtn, { backgroundColor: colors.card, borderColor: colors.border }, epRangeIdx === i && { backgroundColor: colors.accent, borderColor: colors.accent }]}
                        onPress={() => setEpRangeIdx(i)}
                      >
                        <Text style={[styles.epRangeText, { color: colors.textSecondary }, epRangeIdx === i && { color: "#fff" }]}>{r.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
                {rangeEpisodes.length > 0 ? (
                  rangeEpisodes.map((ep) => (
                    <TouchableOpacity
                      key={ep.mal_id}
                      style={[styles.episodeItem, { borderColor: colors.border }]}
                      onPress={() => handleWatch(ep.mal_id, "sub")}
                    >
                      <View style={[styles.epNumWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.epNum, { color: colors.text }]}>{ep.mal_id}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.epTitle, { color: colors.text }]} numberOfLines={1}>
                          {ep.title || `Episode ${ep.mal_id}`}
                        </Text>
                        {ep.aired ? (
                          <Text style={[styles.epDate, { color: colors.textMuted }]}>
                            {new Date(ep.aired).toLocaleDateString()}
                          </Text>
                        ) : null}
                      </View>
                      <Ionicons name="play-circle" size={24} color={colors.accent} />
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.epGrid}>
                    {Array.from({ length: rangeEnd - rangeStart + 1 }, (_, i) => rangeStart + i).map((ep) => (
                      <TouchableOpacity
                        key={ep}
                        style={[styles.epGridBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => handleWatch(ep, "sub")}
                      >
                        <Text style={[styles.epGridText, { color: colors.textSecondary }]}>{ep}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            );
          })()}

          {anime.trailer?.url ? (
            <View style={styles.infoSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Trailer</Text>
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
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Characters</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {chars.map((c) => (
                  <TouchableOpacity
                    key={c.character.mal_id}
                    style={styles.charCard}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate("CharacterDetail", { id: c.character.mal_id, type: "anime" })}
                  >
                    <Image
                      source={{ uri: c.character.images?.jpg?.image_url }}
                      style={[styles.charImg, { backgroundColor: colors.card }]}
                    />
                    <Text style={[styles.charName, { color: colors.text }]} numberOfLines={1}>
                      {c.character.name}
                    </Text>
                    <Text style={[styles.charRole, { color: colors.textMuted }]}>{c.role}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {anime.studios?.length > 0 ? (
            <View style={styles.infoSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Studio</Text>
              <Text style={[styles.studioText, { color: colors.textSecondary }]}>
                {anime.studios.map((s) => s.name).join(", ")}
              </Text>
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
  altTitle: { fontSize: 14, marginTop: 2 },
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
  scoreText: { fontSize: 13, fontWeight: "700" },
  meta: {
    fontSize: 13,
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
  genreText: { fontSize: 12, fontWeight: "600" },
  actionRow: { flexDirection: "row", marginTop: SPACING.lg, gap: SPACING.sm },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  actionBtnActive: { backgroundColor: "rgba(139,92,246,0.1)" },
  watchBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  dubBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  watchBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginTop: SPACING.xl, marginBottom: SPACING.sm },
  synopsis: { fontSize: 14, lineHeight: 22 },
  readMore: { fontWeight: "600", marginTop: SPACING.xs },
  episodeItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    gap: SPACING.md,
  },
  epNumWrap: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  epNum: { fontSize: 13, fontWeight: "700" },
  epTitle: { fontSize: 14, fontWeight: "500" },
  epDate: { fontSize: 11, marginTop: 2 },
  epGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.xs },
  epGridBtn: {
    width: 44,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  epGridText: { fontSize: 13, fontWeight: "600" },
  epRangeBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  epRangeText: { fontSize: 12, fontWeight: "600" },
  infoSection: { marginTop: SPACING.md },
  trailerCard: { borderRadius: RADIUS.md, overflow: "hidden", height: 180 },
  trailerImg: { width: "100%", height: "100%", resizeMode: "cover" },
  trailerOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)" },
  charCard: { width: 80, marginRight: SPACING.md, alignItems: "center" },
  charImg: { width: 70, height: 70, borderRadius: 35 },
  charName: { fontSize: 11, fontWeight: "600", marginTop: 4, textAlign: "center" },
  charRole: { fontSize: 10 },
  studioText: { fontSize: 14 },
  relCard: {
    width: 140,
    padding: SPACING.md,
    marginRight: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  relType: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", marginBottom: 4 },
  relTitle: { fontSize: 13, fontWeight: "600" },
});
