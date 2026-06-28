import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "../components/ScreenWrapper";
import { getComicInfo, getComicChapters } from "../api/comick";
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from "../utils/watchlist";
import { RADIUS, SPACING } from "../utils/theme";
import { useTheme } from "../utils/ThemeContext";

const { width, height } = Dimensions.get("window");

export default function ComicDetailScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { id, title: navTitle } = route.params;
  const [comic, setComic] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [chapterPage, setChapterPage] = useState(1);
  const [hasMoreChapters, setHasMoreChapters] = useState(true);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [inList, setInList] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [info, saved] = await Promise.all([
          getComicInfo(id),
          isInWatchlist(id, "comic"),
        ]);
        setComic(info);
        setInList(saved);
        loadChapters(1);
      } catch (err) {
        console.log("ComicK info error:", err.message);
      }
    })();
  }, [id]);

  const loadChapters = async (page) => {
    if (loadingChapters) return;
    setLoadingChapters(true);
    try {
      const result = await getComicChapters(id, page);
      setChapters((prev) => page === 1 ? result.chapters : [...prev, ...result.chapters]);
      setHasMoreChapters(result.hasMore);
      setChapterPage(page);
    } catch (err) {
      console.log("ComicK chapters error:", err.message);
    }
    setLoadingChapters(false);
  };

  const toggleWatchlist = async () => {
    if (inList) {
      await removeFromWatchlist(id, "comic");
      setInList(false);
    } else {
      await addToWatchlist({
        id,
        type: "comic",
        title: comic?.title || navTitle,
        poster: comic?.cover,
      });
      setInList(true);
    }
  };

  const openChapter = (chapter) => {
    navigation.navigate("ComicReader", {
      chapterId: chapter.id,
      chapterNumber: chapter.chapterNumber,
      chapterLang: chapter.lang || "en",
      comicSlug: chapter.slug || id,
      chapterTitle: chapter.title || `Chapter ${chapter.chapterNumber}`,
      comicTitle: comic?.title || navTitle,
    });
  };

  if (!comic)
    return (
      <ScreenWrapper style={{ justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </ScreenWrapper>
    );

  const desc = comic.description || "";
  const shortDesc = desc.length > 200 ? desc.slice(0, 200) + "..." : desc;

  return (
    <ScreenWrapper edges={["left", "right", "bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.bannerWrap}>
          <Image
            source={{ uri: comic.cover || "https://via.placeholder.com/400x600?text=?", headers: { Referer: "https://comick.art/" } }}
            style={styles.banner}
            contentFit="cover"
          />
          <LinearGradient colors={["transparent", colors.bg]} style={styles.gradient} />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{comic.title}</Text>

          <View style={styles.metaRow}>
            {comic.status ? <Text style={[styles.meta, { color: colors.textSecondary, backgroundColor: colors.card }]}>{comic.status}</Text> : null}
            {comic.year ? <Text style={[styles.meta, { color: colors.textSecondary, backgroundColor: colors.card }]}>{comic.year}</Text> : null}
            {comic.lastChapter ? <Text style={[styles.meta, { color: colors.textSecondary, backgroundColor: colors.card }]}>{comic.lastChapter} chapters</Text> : null}
          </View>

          {comic.authors?.length > 0 ? (
            <Text style={[styles.authors, { color: colors.textMuted }]}>By {comic.authors.join(", ")}</Text>
          ) : null}

          <View style={styles.genreRow}>
            {comic.genres?.map((g) => (
              <View key={g} style={styles.genreTag}>
                <Text style={[styles.genreText, { color: colors.pink }]}>{g}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actionRow}>
            {chapters.length > 0 && (
              <TouchableOpacity
                style={[styles.readBtn, { backgroundColor: colors.accent }]}
                onPress={() => openChapter(chapters[chapters.length - 1])}
              >
                <Ionicons name="book" size={18} color="#fff" />
                <Text style={styles.readBtnText}>Read Ch.1</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }, inList && { borderColor: colors.accent, backgroundColor: "rgba(139,92,246,0.1)" }]}
              onPress={toggleWatchlist}
            >
              <Ionicons
                name={inList ? "bookmark" : "bookmark-outline"}
                size={20}
                color={inList ? colors.accent : colors.text}
              />
            </TouchableOpacity>
          </View>

          {desc ? (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                {showFullDesc ? desc : shortDesc}
              </Text>
              {desc.length > 200 ? (
                <TouchableOpacity onPress={() => setShowFullDesc(!showFullDesc)}>
                  <Text style={[styles.readMore, { color: colors.accent }]}>
                    {showFullDesc ? "Show less" : "Read more"}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </>
          ) : null}

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Chapters ({chapters.length}{hasMoreChapters ? "+" : ""})
          </Text>
        </View>

        {chapters.map((ch) => (
          <TouchableOpacity
            key={ch.id}
            style={[styles.chapterItem, { borderColor: colors.border }]}
            onPress={() => openChapter(ch)}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.chapterTitle, { color: colors.text }]}>
                Chapter {ch.chapterNumber}
                {ch.title ? ` — ${ch.title}` : ""}
              </Text>
              {ch.date ? (
                <Text style={[styles.chapterDate, { color: colors.textMuted }]}>
                  {new Date(ch.date).toLocaleDateString()}
                </Text>
              ) : null}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ))}

        {hasMoreChapters && (
          <TouchableOpacity
            style={[styles.loadMoreBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => loadChapters(chapterPage + 1)}
          >
            {loadingChapters ? (
              <ActivityIndicator color={colors.accent} />
            ) : (
              <Text style={[styles.loadMoreText, { color: colors.accent }]}>Load More Chapters</Text>
            )}
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  bannerWrap: { width, height: height * 0.4 },
  banner: { width: "100%", height: "100%" },
  gradient: { position: "absolute", bottom: 0, left: 0, right: 0, height: "60%" },
  backBtn: { position: "absolute", top: 44, left: SPACING.lg, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: RADIUS.full, padding: SPACING.sm },
  content: { paddingHorizontal: SPACING.lg, marginTop: -30 },
  title: { color: "#fff", fontSize: 22, fontWeight: "800" },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: SPACING.md, gap: SPACING.sm, flexWrap: "wrap" },
  meta: { fontSize: 13, paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.sm, overflow: "hidden" },
  authors: { fontSize: 13, marginTop: SPACING.sm },
  genreRow: { flexDirection: "row", flexWrap: "wrap", marginTop: SPACING.md, gap: SPACING.xs },
  genreTag: { backgroundColor: "rgba(217,70,239,0.15)", paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.sm },
  genreText: { fontSize: 12, fontWeight: "600" },
  actionRow: { flexDirection: "row", marginTop: SPACING.lg, gap: SPACING.md },
  readBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.md },
  readBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  actionBtn: { padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginTop: SPACING.xl, marginBottom: SPACING.sm },
  description: { fontSize: 14, lineHeight: 22 },
  readMore: { fontWeight: "600", marginTop: SPACING.xs },
  chapterItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  chapterTitle: { fontSize: 14, fontWeight: "500" },
  chapterDate: { fontSize: 11, marginTop: 2 },
  loadMoreBtn: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: "center",
  },
  loadMoreText: { fontWeight: "600", fontSize: 14 },
});
