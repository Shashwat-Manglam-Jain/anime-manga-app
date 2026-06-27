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
import { SPACING, RADIUS } from "../utils/theme";
import { useTheme } from "../utils/ThemeContext";

export default function NovelReaderScreen({ route, navigation }) {
  const { colors } = useTheme();
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
      <View style={[styles.header, { borderColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: SPACING.md }}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{novelTitle}</Text>
          <Text style={[styles.headerSub, { color: colors.textMuted }]} numberOfLines={1}>
            {content?.title || chapterTitle}
          </Text>
        </View>
        <View style={styles.fontControls}>
          <TouchableOpacity onPress={() => setFontSize(Math.max(12, fontSize - 2))}>
            <Text style={[styles.fontBtn, { color: colors.text, backgroundColor: colors.card }]}>A-</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFontSize(Math.min(24, fontSize + 2))}>
            <Text style={[styles.fontBtn, { color: colors.text, backgroundColor: colors.card }]}>A+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <ScrollView
          style={styles.reader}
          contentContainerStyle={styles.readerContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.chapterTitle, { color: colors.text }]}>{content?.title}</Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary, fontSize }]}>{content?.content}</Text>

          <View style={[styles.navRow, { borderColor: colors.border }]}>
            {content?.prevChapter ? (
              <TouchableOpacity style={[styles.navBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => goChapter(content.prevChapter)}>
                <Ionicons name="chevron-back" size={16} color={colors.text} />
                <Text style={[styles.navText, { color: colors.text }]}>Previous</Text>
              </TouchableOpacity>
            ) : <View />}
            {content?.nextChapter ? (
              <TouchableOpacity style={[styles.navBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => goChapter(content.nextChapter)}>
                <Text style={[styles.navText, { color: colors.text }]}>Next</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.text} />
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
  },
  headerTitle: { fontSize: 14, fontWeight: "600" },
  headerSub: { fontSize: 12 },
  fontControls: { flexDirection: "row", gap: SPACING.sm },
  fontBtn: {
    fontSize: 16,
    fontWeight: "700",
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    overflow: "hidden",
  },
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  reader: { flex: 1 },
  readerContent: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl },
  chapterTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: SPACING.xl,
    textAlign: "center",
  },
  bodyText: {
    lineHeight: 28,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.xxl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  navText: { fontSize: 14, fontWeight: "600" },
});
