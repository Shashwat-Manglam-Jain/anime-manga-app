import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "../components/ScreenWrapper";
import { readComicChapter } from "../api/comick";
import { COLORS, SPACING } from "../utils/theme";

const { width } = Dimensions.get("window");

export default function ComicReaderScreen({ route, navigation }) {
  const { chapterId, chapterTitle, comicTitle } = route.params;
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const result = await readComicChapter(chapterId);
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
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={{ color: COLORS.textMuted, marginTop: 12 }}>Loading pages...</Text>
      </ScreenWrapper>
    );

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: SPACING.md }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{comicTitle}</Text>
          <Text style={styles.headerSub} numberOfLines={1}>{chapterTitle}</Text>
        </View>
        <Text style={styles.pageCount}>{pages.length} pages</Text>
      </View>

      <FlatList
        data={pages}
        keyExtractor={(item) => String(item.page)}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item.img }}
            style={styles.pageImage}
            resizeMode="contain"
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="alert-circle-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No pages found</Text>
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
    borderColor: COLORS.border,
  },
  headerTitle: { color: COLORS.text, fontSize: 14, fontWeight: "700" },
  headerSub: { color: COLORS.textMuted, fontSize: 12 },
  pageCount: { color: COLORS.textMuted, fontSize: 12 },
  pageImage: {
    width,
    height: width * 1.4,
    backgroundColor: COLORS.card,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
  },
  emptyText: { color: COLORS.textMuted, fontSize: 16, marginTop: SPACING.md },
});
