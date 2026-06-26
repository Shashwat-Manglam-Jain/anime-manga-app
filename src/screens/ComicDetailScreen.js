import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "../components/ScreenWrapper";
import { getComicInfo, getComicChapters } from "../api/comick";
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from "../utils/watchlist";
import { COLORS, RADIUS, SPACING } from "../utils/theme";

const { width, height } = Dimensions.get("window");

export default function ComicDetailScreen({ route, navigation }) {
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
      chapterTitle: chapter.title || `Chapter ${chapter.chapterNumber}`,
      comicTitle: comic?.title || navTitle,
    });
  };

  if (!comic)
    return (
      <ScreenWrapper style={{ justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </ScreenWrapper>
    );

  const desc = comic.description || "";
  const shortDesc = desc.length > 200 ? desc.slice(0, 200) + "..." : desc;

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.bannerWrap}>
          <Image
            source={{ uri: comic.cover || "https://via.placeholder.com/400x600?text=?" }}
            style={styles.banner}
          />
          <LinearGradient colors={["transparent", COLORS.bg]} style={styles.gradient} />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{comic.title}</Text>

          <View style={styles.metaRow}>
            {comic.status ? <Text style={styles.meta}>{comic.status}</Text> : null}
            {comic.year ? <Text style={styles.meta}>{comic.year}</Text> : null}
            {comic.lastChapter ? <Text style={styles.meta}>{comic.lastChapter} chapters</Text> : null}
          </View>

          {comic.authors?.length > 0 ? (
            <Text style={styles.authors}>By {comic.authors.join(", ")}</Text>
          ) : null}

          <View style={styles.genreRow}>
            {comic.genres?.map((g) => (
              <View key={g} style={styles.genreTag}>
                <Text style={styles.genreText}>{g}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actionRow}>
            {chapters.length > 0 && (
              <TouchableOpacity
                style={styles.readBtn}
                onPress={() => openChapter(chapters[chapters.length - 1])}
              >
                <Ionicons name="book" size={18} color="#fff" />
                <Text style={styles.readBtnText}>Read Ch.1</Text>
              </TouchableOpacity>
            )}
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

          {desc ? (
            <>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>
                {showFullDesc ? desc : shortDesc}
              </Text>
              {desc.length > 200 ? (
                <TouchableOpacity onPress={() => setShowFullDesc(!showFullDesc)}>
                  <Text style={styles.readMore}>
                    {showFullDesc ? "Show less" : "Read more"}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </>
          ) : null}

          <Text style={styles.sectionTitle}>
            Chapters ({chapters.length}{hasMoreChapters ? "+" : ""})
          </Text>
        </View>

        {chapters.map((ch) => (
          <TouchableOpacity
            key={ch.id}
            style={styles.chapterItem}
            onPress={() => openChapter(ch)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.chapterTitle}>
                Chapter {ch.chapterNumber}
                {ch.title ? ` — ${ch.title}` : ""}
              </Text>
              {ch.date ? (
                <Text style={styles.chapterDate}>
                  {new Date(ch.date).toLocaleDateString()}
                </Text>
              ) : null}
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        ))}

        {hasMoreChapters && (
          <TouchableOpacity
            style={styles.loadMoreBtn}
            onPress={() => loadChapters(chapterPage + 1)}
          >
            {loadingChapters ? (
              <ActivityIndicator color={COLORS.accent} />
            ) : (
              <Text style={styles.loadMoreText}>Load More Chapters</Text>
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
  banner: { width: "100%", height: "100%", resizeMode: "cover" },
  gradient: { position: "absolute", bottom: 0, left: 0, right: 0, height: "60%" },
  backBtn: { position: "absolute", top: 44, left: SPACING.lg, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: RADIUS.full, padding: SPACING.sm },
  content: { paddingHorizontal: SPACING.lg, marginTop: -30 },
  title: { color: "#fff", fontSize: 22, fontWeight: "800" },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: SPACING.md, gap: SPACING.sm, flexWrap: "wrap" },
  meta: { color: COLORS.textSecondary, fontSize: 13, backgroundColor: COLORS.card, paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.sm, overflow: "hidden" },
  authors: { color: COLORS.textMuted, fontSize: 13, marginTop: SPACING.sm },
  genreRow: { flexDirection: "row", flexWrap: "wrap", marginTop: SPACING.md, gap: SPACING.xs },
  genreTag: { backgroundColor: "rgba(217,70,239,0.15)", paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.sm },
  genreText: { color: COLORS.pink, fontSize: 12, fontWeight: "600" },
  actionRow: { flexDirection: "row", marginTop: SPACING.lg, gap: SPACING.md },
  readBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: COLORS.accent, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.md },
  readBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  actionBtn: { backgroundColor: COLORS.card, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  actionBtnActive: { borderColor: COLORS.accent, backgroundColor: "rgba(139,92,246,0.1)" },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: "700", marginTop: SPACING.xl, marginBottom: SPACING.sm },
  description: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 22 },
  readMore: { color: COLORS.accent, fontWeight: "600", marginTop: SPACING.xs },
  chapterItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  chapterTitle: { color: COLORS.text, fontSize: 14, fontWeight: "500" },
  chapterDate: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  loadMoreBtn: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  loadMoreText: { color: COLORS.accent, fontWeight: "600", fontSize: 14 },
});
