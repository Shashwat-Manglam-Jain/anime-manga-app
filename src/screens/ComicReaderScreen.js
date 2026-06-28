import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "../components/ScreenWrapper";
import { readComicChapter } from "../api/comick";
import { SPACING } from "../utils/theme";
import { useTheme } from "../utils/ThemeContext";

const { width } = Dimensions.get("window");

export default function ComicReaderScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { chapterId, chapterNumber, chapterLang = "en", comicSlug, chapterTitle, comicTitle } = route.params;
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const result = await readComicChapter(chapterId, comicSlug, chapterNumber, chapterLang);
        setPages(result);
      } catch (err) {
        console.log("ComicK reader error:", err.message);
      }
      setLoading(false);
    })();
  }, [chapterId]);

  if (loading)
    return (
      <ScreenWrapper style={{ justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={{ color: colors.textMuted, marginTop: 12 }}>Loading pages...</Text>
      </ScreenWrapper>
    );

  return (
    <ScreenWrapper>
      <View style={[styles.header, { borderColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: SPACING.md }}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{comicTitle}</Text>
          <Text style={[styles.headerSub, { color: colors.textMuted }]} numberOfLines={1}>{chapterTitle}</Text>
        </View>
        <Text style={[styles.pageCount, { color: colors.textMuted }]}>{pages.length} pages</Text>
      </View>

      <FlatList
        data={pages}
        keyExtractor={(item) => String(item.page)}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={12}
        windowSize={7}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item.img, headers: { Referer: "https://comick.art/" } }}
            style={[styles.pageImage, { backgroundColor: colors.card, height: item.h && item.w ? width * (item.h / item.w) : width * 1.4 }]}
            contentFit="contain"
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No pages found</Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 14, fontWeight: "700" },
  headerSub: { fontSize: 12 },
  pageCount: { fontSize: 12 },
  pageImage: {
    width,
    height: width * 1.4,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
  },
  emptyText: { fontSize: 16, marginTop: SPACING.md },
});
