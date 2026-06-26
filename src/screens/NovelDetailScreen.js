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
import {
  getNovelInfo,
  searchNovelBin,
  getNovelBinInfo,
  getNovelBinChapters,
} from "../api/novels";
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from "../utils/watchlist";
import { COLORS, RADIUS, SPACING } from "../utils/theme";

const { width, height } = Dimensions.get("window");

export default function NovelDetailScreen({ route, navigation }) {
  const { id, title: paramTitle } = route.params;
  const [novel, setNovel] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [inList, setInList] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFullDesc, setShowFullDesc] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const info = await getNovelInfo(id);
        setNovel(info);

        const searchTitle = info?.title || paramTitle || id;
        const nbResults = await searchNovelBin(searchTitle);
        if (nbResults.length > 0) {
          const slug = nbResults[0].id;
          const ch = await getNovelBinChapters(slug);
          setChapters(ch);
        }

        setInList(await isInWatchlist(id, "novel"));
      } catch (err) {
        console.log(err.message);
      }
      setLoading(false);
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

  if (loading)
    return (
      <ScreenWrapper style={{ justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </ScreenWrapper>
    );

  const desc = novel?.description || "";
  const shortDesc = desc.length > 200 ? desc.slice(0, 200) + "..." : desc;

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.bannerWrap}>
          {novel?.image ? (
            <Image source={{ uri: novel.image }} style={styles.banner} />
          ) : (
            <View style={[styles.banner, { backgroundColor: COLORS.card }]} />
          )}
          <LinearGradient colors={["transparent", COLORS.bg]} style={styles.gradient} />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{novel?.title || paramTitle}</Text>
          {novel?.titleAlt ? <Text style={styles.altTitle}>{novel.titleAlt}</Text> : null}

          <View style={styles.metaRow}>
            {novel?.score ? (
              <View style={styles.scoreBadge}>
                <Ionicons name="star" size={14} color={COLORS.yellow} />
                <Text style={styles.scoreText}>{novel.score}</Text>
              </View>
            ) : null}
            {novel?.status ? <Text style={styles.meta}>{novel.status}</Text> : null}
            {novel?.chapters ? <Text style={styles.meta}>{novel.chapters} ch</Text> : null}
            <Text style={styles.meta}>{chapters.length} available</Text>
          </View>

          <View style={styles.genreRow}>
            {novel?.genres?.slice(0, 6).map((g, i) => (
              <View key={i} style={styles.genreTag}>
                <Text style={styles.genreText}>{g}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, inList && styles.actionBtnActive]}
              onPress={toggleWatchlist}
            >
              <Ionicons name={inList ? "bookmark" : "bookmark-outline"} size={20}
                color={inList ? COLORS.accent : COLORS.text} />
              <Text style={[styles.actionText, inList && { color: COLORS.accent }]}>
                {inList ? "Saved" : "Save"}
              </Text>
            </TouchableOpacity>
            {chapters.length > 0 ? (
              <TouchableOpacity
                style={styles.readBtn}
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
              <Text style={styles.sectionTitle}>Synopsis</Text>
              <Text style={styles.desc}>{showFullDesc ? desc : shortDesc}</Text>
              {desc.length > 200 ? (
                <TouchableOpacity onPress={() => setShowFullDesc(!showFullDesc)}>
                  <Text style={styles.readMore}>{showFullDesc ? "Show less" : "Read more"}</Text>
                </TouchableOpacity>
              ) : null}
            </>
          ) : null}

          <Text style={styles.sectionTitle}>Chapters ({chapters.length})</Text>
        </View>

        {chapters.slice(0, 100).map((ch, i) => (
          <TouchableOpacity
            key={ch.id || i}
            style={styles.chapterItem}
            onPress={() => navigation.navigate("NovelReader", {
              chapterId: ch.id,
              chapterTitle: ch.title,
              novelTitle: novel?.title || paramTitle,
            })}
          >
            <Text style={styles.chTitle} numberOfLines={1}>{ch.title}</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        ))}
        {chapters.length > 100 ? (
          <Text style={styles.moreText}>+{chapters.length - 100} more chapters</Text>
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
  altTitle: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: SPACING.md, gap: SPACING.sm, flexWrap: "wrap" },
  scoreBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(234,179,8,0.15)", paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.sm, gap: 4 },
  scoreText: { color: COLORS.yellow, fontSize: 13, fontWeight: "700" },
  meta: { color: COLORS.textSecondary, fontSize: 13, backgroundColor: COLORS.card, paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.sm, overflow: "hidden" },
  genreRow: { flexDirection: "row", flexWrap: "wrap", marginTop: SPACING.md, gap: SPACING.xs },
  genreTag: { backgroundColor: "rgba(139,92,246,0.15)", paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.sm },
  genreText: { color: COLORS.accentLight, fontSize: 12, fontWeight: "600" },
  actionRow: { flexDirection: "row", marginTop: SPACING.lg, gap: SPACING.md },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: COLORS.card, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  actionBtnActive: { borderColor: COLORS.accent, backgroundColor: "rgba(139,92,246,0.1)" },
  actionText: { color: COLORS.text, fontWeight: "600", fontSize: 14 },
  readBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: COLORS.accent, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.md },
  readBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: "700", marginTop: SPACING.xl, marginBottom: SPACING.sm },
  desc: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 22 },
  readMore: { color: COLORS.accent, fontWeight: "600", marginTop: SPACING.xs },
  chapterItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1, borderColor: COLORS.border },
  chTitle: { color: COLORS.text, fontSize: 14, fontWeight: "500", flex: 1 },
  moreText: { color: COLORS.textMuted, textAlign: "center", paddingVertical: SPACING.lg },
});
