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
import { COLORS, RADIUS, SPACING } from "../utils/theme";

const { width, height } = Dimensions.get("window");

export default function MangaDetailScreen({ route, navigation }) {
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
        <ActivityIndicator size="large" color={COLORS.accent} />
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
          <Text style={styles.title}>{manga.title}</Text>
          <Text style={styles.author}>by {manga.author}</Text>

          <View style={styles.metaRow}>
            {manga.status ? (
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{manga.status}</Text>
              </View>
            ) : null}
            {manga.year ? <Text style={styles.meta}>{manga.year}</Text> : null}
            <Text style={styles.meta}>{chapters.length} chapters</Text>
          </View>

          <View style={styles.genreRow}>
            {manga.tags?.slice(0, 6).map((t, i) => (
              <View key={i} style={styles.genreTag}>
                <Text style={styles.genreText}>{t}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, inList && styles.actionBtnActive]}
              onPress={toggleWatchlist}
            >
              <Ionicons
                name={inList ? "bookmark" : "bookmark-outline"}
                size={20}
                color={inList ? COLORS.accent : COLORS.text}
              />
              <Text style={[styles.actionText, inList && { color: COLORS.accent }]}>
                {inList ? "Saved" : "Watchlist"}
              </Text>
            </TouchableOpacity>
            {chapters.length > 0 ? (
              <TouchableOpacity
                style={styles.readBtn}
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
              <Text style={styles.sectionTitle}>Synopsis</Text>
              <Text style={styles.desc}>
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

          <Text style={styles.sectionTitle}>Chapters</Text>
        </View>

        {chapters.map((ch) => (
          <TouchableOpacity
            key={ch.id}
            style={styles.chapterItem}
            onPress={() =>
              navigation.navigate("MangaReader", {
                chapterId: ch.id,
                chapterNum: ch.chapter,
                mangaTitle: manga.title,
              })
            }
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.chTitle}>Chapter {ch.chapter}</Text>
              {ch.title !== `Chapter ${ch.chapter}` ? (
                <Text style={styles.chSubtitle} numberOfLines={1}>
                  {ch.title}
                </Text>
              ) : null}
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
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
  author: { color: COLORS.textSecondary, fontSize: 14, marginTop: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: SPACING.md, gap: SPACING.sm },
  statusBadge: {
    backgroundColor: "rgba(34,197,94,0.15)",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  statusText: { color: COLORS.green, fontSize: 12, fontWeight: "600", textTransform: "capitalize" },
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
  actionRow: { flexDirection: "row", marginTop: SPACING.lg, gap: SPACING.md },
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
  actionText: { color: COLORS.text, fontWeight: "600", fontSize: 14 },
  readBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  readBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: "700", marginTop: SPACING.xl, marginBottom: SPACING.sm },
  desc: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 22 },
  readMore: { color: COLORS.accent, fontWeight: "600", marginTop: SPACING.xs },
  chapterItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  chTitle: { color: COLORS.text, fontSize: 14, fontWeight: "600" },
  chSubtitle: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
});
