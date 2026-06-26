import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "../components/ScreenWrapper";
import { readNovelBinChapter } from "../api/novels";
import { COLORS, SPACING, RADIUS } from "../utils/theme";

export default function NovelReaderScreen({ route, navigation }) {
  const { chapterId, chapterTitle, novelTitle } = route.params;
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(16);

  const loadChapter = async (id) => {
    setLoading(true);
    try {
      const data = await readNovelBinChapter(id);
      setContent(data);
    } catch (err) {
      setContent({ title: "Error", content: "Failed to load chapter. " + err.message, prevChapter: null, nextChapter: null });
    }
    setLoading(false);
  };

  useEffect(() => { loadChapter(chapterId); }, [chapterId]);

  const goChapter = (id) => {
    navigation.replace("NovelReader", {
      chapterId: id,
      chapterTitle: "",
      novelTitle,
    });
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: SPACING.md }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{novelTitle}</Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {content?.title || chapterTitle}
          </Text>
        </View>
        <View style={styles.fontControls}>
          <TouchableOpacity onPress={() => setFontSize(Math.max(12, fontSize - 2))}>
            <Text style={styles.fontBtn}>A-</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFontSize(Math.min(24, fontSize + 2))}>
            <Text style={styles.fontBtn}>A+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : (
        <ScrollView
          style={styles.reader}
          contentContainerStyle={styles.readerContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.chapterTitle]}>{content?.title}</Text>
          <Text style={[styles.bodyText, { fontSize }]}>{content?.content}</Text>

          <View style={styles.navRow}>
            {content?.prevChapter ? (
              <TouchableOpacity style={styles.navBtn} onPress={() => goChapter(content.prevChapter)}>
                <Ionicons name="chevron-back" size={16} color={COLORS.text} />
                <Text style={styles.navText}>Previous</Text>
              </TouchableOpacity>
            ) : <View />}
            {content?.nextChapter ? (
              <TouchableOpacity style={styles.navBtn} onPress={() => goChapter(content.nextChapter)}>
                <Text style={styles.navText}>Next</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.text} />
              </TouchableOpacity>
            ) : <View />}
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: { color: COLORS.text, fontSize: 14, fontWeight: "600" },
  headerSub: { color: COLORS.textMuted, fontSize: 12 },
  fontControls: { flexDirection: "row", gap: SPACING.sm },
  fontBtn: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    overflow: "hidden",
  },
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  reader: { flex: 1 },
  readerContent: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl },
  chapterTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: SPACING.xl,
    textAlign: "center",
  },
  bodyText: {
    color: COLORS.textSecondary,
    lineHeight: 28,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.xxl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  navText: { color: COLORS.text, fontSize: 14, fontWeight: "600" },
});
