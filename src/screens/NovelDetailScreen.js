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
import { SkeletonDetail, SkeletonChapterList } from "../components/SkeletonLoader";
import {
  getNovelInfo,
  searchNovelBin,
  getNovelBinChapters,
} from "../api/novels";
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from "../utils/watchlist";
import { RADIUS, SPACING } from "../utils/theme";
import { useTheme } from "../utils/ThemeContext";

const { width, height } = Dimensions.get("window");

export default function NovelDetailScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { id, title: paramTitle } = route.params;
  const [novel, setNovel] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [inList, setInList] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chaptersLoading, setChaptersLoading] = useState(true);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showAllChapters, setShowAllChapters] = useState(false);
  const [scrapeError, setScrapeError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const info = await getNovelInfo(id);
        setNovel(info);
        setLoading(false);

        const searchTitle = info?.title || paramTitle || id;
        try {
          const nbResults = await searchNovelBin(searchTitle);
          if (nbResults.length > 0) {
            const slug = nbResults[0].id;
            const ch = await getNovelBinChapters(slug);
            setChapters(ch);
          } else {
            const altTitle = info?.titleAlt || searchTitle;
            if (altTitle !== searchTitle) {
              const altResults = await searchNovelBin(altTitle);
              if (altResults.length > 0) {
                const slug = altResults[0].id;
                const ch = await getNovelBinChapters(slug);
                setChapters(ch);
              } else {
                setScrapeError(true);
              }
            } else {
              setScrapeError(true);
            }
          }
        } catch (e) {
          console.log("Chapter scrape error:", e.message);
          setScrapeError(true);
        }

        setInList(await isInWatchlist(id, "novel"));
      } catch (err) {
        console.log(err.message);
      }
      setChaptersLoading(false);
    })();
  }, [id]);

  const toggleWatchlist = async () => {
    if (inList) {
      await removeFromWatchlist(id, "novel");
      setInList(false);
    } else {
      await addToWatchlist({
        id, type: "novel", title: novel?.title || paramTitle, poster: novel?.image,
      });
      setInList(true);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <SkeletonDetail />
      </ScreenWrapper>
    );
  }

  const desc = novel?.description || "";
  const shortDesc = desc.length > 200 ? desc.slice(0, 200) + "..." : desc;
  const displayChapters = showAllChapters ? chapters : chapters.slice(0, 50);

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.bannerWrap}>
          {novel?.image ? (
            <Image source={{ uri: novel.image }} style={styles.banner} />
          ) : (
            <View style={[styles.banner, { backgroundColor: colors.card }]} />
          )}
          <LinearGradient colors={["transparent", colors.bg]} style={styles.gradient} />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{novel?.title || paramTitle}</Text>
          {novel?.titleAlt ? <Text style={[styles.altTitle, { color: colors.textSecondary }]}>{novel.titleAlt}</Text> : null}

          <View style={styles.metaRow}>
            {novel?.score ? (
              <View style={styles.scoreBadge}>
                <Ionicons name="star" size={14} color={colors.yellow} />
                <Text style={[styles.scoreText, { color: colors.yellow }]}>{novel.score}</Text>
              </View>
            ) : null}
            {novel?.status ? <Text style={[styles.meta, { color: colors.textSecondary, backgroundColor: colors.card }]}>{novel.status}</Text> : null}
            {novel?.chapters ? <Text style={[styles.meta, { color: colors.textSecondary, backgroundColor: colors.card }]}>{novel.chapters} ch</Text> : null}
            {chapters.length > 0 ? (
              <Text style={[styles.meta, { color: colors.textSecondary, backgroundColor: colors.card }]}>{chapters.length} available</Text>
            ) : null}
          </View>

          <View style={styles.genreRow}>
            {novel?.genres?.slice(0, 6).map((g, i) => (
              <View key={i} style={styles.genreTag}>
                <Text style={[styles.genreText, { color: colors.accentLight }]}>{g}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }, inList && { borderColor: colors.accent, backgroundColor: "rgba(139,92,246,0.1)" }]}
              onPress={toggleWatchlist}
            >
              <Ionicons name={inList ? "bookmark" : "bookmark-outline"} size={20}
                color={inList ? colors.accent : colors.text} />
              <Text style={[styles.actionText, { color: colors.text }, inList && { color: colors.accent }]}>
                {inList ? "Saved" : "Save"}
              </Text>
            </TouchableOpacity>
            {chapters.length > 0 ? (
              <TouchableOpacity
                style={[styles.readBtn, { backgroundColor: colors.accent }]}
                onPress={() => navigation.navigate("NovelReader", {
                  chapterId: chapters[0].id,
                  chapterTitle: chapters[0].title,
                  novelTitle: novel?.title || paramTitle,
                })}
              >
                <Ionicons name="book" size={18} color="#fff" />
                <Text style={styles.readBtnText}>Start Reading</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {desc ? (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Synopsis</Text>
              <Text style={[styles.desc, { color: colors.textSecondary }]}>{showFullDesc ? desc : shortDesc}</Text>
              {desc.length > 200 ? (
                <TouchableOpacity onPress={() => setShowFullDesc(!showFullDesc)}>
                  <Text style={[styles.readMore, { color: colors.accent }]}>{showFullDesc ? "Show less" : "Read more"}</Text>
                </TouchableOpacity>
              ) : null}
            </>
          ) : null}

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Chapters {chapters.length > 0 ? `(${chapters.length})` : ""}
          </Text>
        </View>

        {chaptersLoading ? (
          <SkeletonChapterList count={8} />
        ) : scrapeError || chapters.length === 0 ? (
          <View style={styles.noChapters}>
            <Ionicons name="book-outline" size={32} color={colors.textMuted} />
            <Text style={[styles.noChaptersText, { color: colors.textMuted }]}>
              {scrapeError ? "Chapters not available from source" : "No chapters found"}
            </Text>
            <Text style={[styles.noChaptersSub, { color: colors.textMuted }]}>
              Try searching with the original title
            </Text>
          </View>
        ) : (
          <>
            {displayChapters.map((ch, i) => (
              <TouchableOpacity
                key={ch.id || i}
                style={[styles.chapterItem, { borderColor: colors.border }]}
                onPress={() => navigation.navigate("NovelReader", {
                  chapterId: ch.id,
                  chapterTitle: ch.title,
                  novelTitle: novel?.title || paramTitle,
                })}
              >
                <View style={[styles.chNumWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.chNum, { color: colors.textMuted }]}>{i + 1}</Text>
                </View>
                <Text style={[styles.chTitle, { color: colors.text }]} numberOfLines={1}>{ch.title}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
            {chapters.length > 50 && !showAllChapters ? (
              <TouchableOpacity
                style={styles.showMoreBtn}
                onPress={() => setShowAllChapters(true)}
              >
                <Text style={[styles.showMoreText, { color: colors.accent }]}>
                  Show all {chapters.length} chapters
                </Text>
                <Ionicons name="chevron-down" size={16} color={colors.accent} />
              </TouchableOpacity>
            ) : null}
          </>
        )}

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
  altTitle: { fontSize: 13, marginTop: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: SPACING.md, gap: SPACING.sm, flexWrap: "wrap" },
  scoreBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(234,179,8,0.15)", paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.sm, gap: 4 },
  scoreText: { fontSize: 13, fontWeight: "700" },
  meta: { fontSize: 13, paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.sm, overflow: "hidden" },
  genreRow: { flexDirection: "row", flexWrap: "wrap", marginTop: SPACING.md, gap: SPACING.xs },
  genreTag: { backgroundColor: "rgba(139,92,246,0.15)", paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.sm },
  genreText: { fontSize: 12, fontWeight: "600" },
  actionRow: { flexDirection: "row", marginTop: SPACING.lg, gap: SPACING.md },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1 },
  actionText: { fontWeight: "600", fontSize: 14 },
  readBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderRadius: RADIUS.md },
  readBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginTop: SPACING.xl, marginBottom: SPACING.sm },
  desc: { fontSize: 14, lineHeight: 22 },
  readMore: { fontWeight: "600", marginTop: SPACING.xs },
  chapterItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1, gap: SPACING.md },
  chNumWrap: { width: 30, height: 30, borderRadius: RADIUS.sm, justifyContent: "center", alignItems: "center", borderWidth: 1 },
  chNum: { fontSize: 12, fontWeight: "700" },
  chTitle: { fontSize: 14, fontWeight: "500", flex: 1 },
  noChapters: { alignItems: "center", paddingVertical: SPACING.xl * 2, paddingHorizontal: SPACING.lg },
  noChaptersText: { fontSize: 15, fontWeight: "600", marginTop: SPACING.md },
  noChaptersSub: { fontSize: 13, marginTop: SPACING.xs },
  showMoreBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: SPACING.lg },
  showMoreText: { fontWeight: "600", fontSize: 14 },
});
