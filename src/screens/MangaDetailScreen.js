import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "../components/ScreenWrapper";
import { getMangaDetails, getMangaChapters } from "../api/mangadex";
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from "../utils/watchlist";
import { RADIUS, SPACING } from "../utils/theme";
import { useTheme } from "../utils/ThemeContext";

const { width, height } = Dimensions.get("window");

export default function MangaDetailScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { id } = route.params;
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [inList, setInList] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [m, ch] = await Promise.all([
          getMangaDetails(id),
          getMangaChapters(id),
        ]);
        setManga(m);
        setChapters(ch.items);
        setInList(await isInWatchlist(id, "manga"));
      } catch (err) {
        console.log(err.message);
      }
    })();
  }, [id]);

  const toggleWatchlist = async () => {
    if (inList) {
      await removeFromWatchlist(id, "manga");
      setInList(false);
    } else {
      await addToWatchlist({
        id,
        type: "manga",
        title: manga.title,
        poster: manga.cover,
      });
      setInList(true);
    }
  };

  if (!manga)
    return (
      <ScreenWrapper style={{ justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </ScreenWrapper>
    );

  const desc = manga.description || "";
  const shortDesc = desc.length > 200 ? desc.slice(0, 200) + "..." : desc;

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.bannerWrap}>
          <Image source={{ uri: manga.cover }} style={styles.banner} />
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
          <Text style={styles.title}>{manga.title}</Text>
          <Text style={[styles.author, { color: colors.textSecondary }]}>by {manga.author}</Text>

          <View style={styles.metaRow}>
            {manga.status ? (
              <View style={styles.statusBadge}>
                <Text style={[styles.statusText, { color: colors.green }]}>{manga.status}</Text>
              </View>
            ) : null}
            {manga.year ? <Text style={[styles.meta, { color: colors.textSecondary, backgroundColor: colors.card }]}>{manga.year}</Text> : null}
            <Text style={[styles.meta, { color: colors.textSecondary, backgroundColor: colors.card }]}>{chapters.length} chapters</Text>
          </View>

          <View style={styles.genreRow}>
            {manga.tags?.slice(0, 6).map((t, i) => (
              <View key={i} style={styles.genreTag}>
                <Text style={[styles.genreText, { color: colors.accentLight }]}>{t}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }, inList && styles.actionBtnActive, inList && { borderColor: colors.accent }]}
              onPress={toggleWatchlist}
            >
              <Ionicons
                name={inList ? "bookmark" : "bookmark-outline"}
                size={20}
                color={inList ? colors.accent : colors.text}
              />
              <Text style={[styles.actionText, { color: colors.text }, inList && { color: colors.accent }]}>
                {inList ? "Saved" : "Watchlist"}
              </Text>
            </TouchableOpacity>
            {chapters.length > 0 ? (
              <TouchableOpacity
                style={[styles.readBtn, { backgroundColor: colors.accent }]}
                onPress={() =>
                  navigation.navigate("MangaReader", {
                    chapterId: chapters[0].id,
                    chapterNum: chapters[0].chapter,
                    mangaTitle: manga.title,
                  })
                }
              >
                <Ionicons name="book" size={18} color="#fff" />
                <Text style={styles.readBtnText}>Start Reading</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {desc ? (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Synopsis</Text>
              <Text style={[styles.desc, { color: colors.textSecondary }]}>
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

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Chapters</Text>
        </View>

        {chapters.map((ch) => (
          <TouchableOpacity
            key={ch.id}
            style={[styles.chapterItem, { borderColor: colors.border }]}
            onPress={() =>
              navigation.navigate("MangaReader", {
                chapterId: ch.id,
                chapterNum: ch.chapter,
                mangaTitle: manga.title,
              })
            }
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.chTitle, { color: colors.text }]}>Chapter {ch.chapter}</Text>
              {ch.title !== `Chapter ${ch.chapter}` ? (
                <Text style={[styles.chSubtitle, { color: colors.textMuted }]} numberOfLines={1}>
                  {ch.title}
                </Text>
              ) : null}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  bannerWrap: { width, height: height * 0.4 },
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
  author: { fontSize: 14, marginTop: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: SPACING.md, gap: SPACING.sm },
  statusBadge: {
    backgroundColor: "rgba(34,197,94,0.15)",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  statusText: { fontSize: 12, fontWeight: "600", textTransform: "capitalize" },
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
  actionRow: { flexDirection: "row", marginTop: SPACING.lg, gap: SPACING.md },
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
  actionText: { fontWeight: "600", fontSize: 14 },
  readBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  readBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginTop: SPACING.xl, marginBottom: SPACING.sm },
  desc: { fontSize: 14, lineHeight: 22 },
  readMore: { fontWeight: "600", marginTop: SPACING.xs },
  chapterItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  chTitle: { fontSize: 14, fontWeight: "600" },
  chSubtitle: { fontSize: 12, marginTop: 2 },
});
