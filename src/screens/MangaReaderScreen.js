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
import { getChapterPages } from "../api/mangadex";
import { COLORS, SPACING, RADIUS } from "../utils/theme";

const { width } = Dimensions.get("window");

export default function MangaReaderScreen({ route, navigation }) {
  const { chapterId, chapterNum, mangaTitle } = route.params;
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const p = await getChapterPages(chapterId);
        setPages(p);
      } catch (err) {
        console.log(err.message);
      }
      setLoading(false);
    })();
  }, [chapterId]);

  if (loading)
    return (
      <ScreenWrapper style={{ justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </ScreenWrapper>
    );

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: SPACING.md }}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {mangaTitle}
          </Text>
          <Text style={styles.headerSub}>Chapter {chapterNum}</Text>
        </View>
        <Text style={styles.pageCount}>{pages.length} pages</Text>
      </View>
      <FlatList
        data={pages}
        keyExtractor={(_, i) => String(i)}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <View style={styles.pageWrap}>
            <Image
              source={{ uri: item }}
              style={styles.page}
              resizeMode="contain"
            />
            <Text style={styles.pageNum}>{index + 1}/{pages.length}</Text>
          </View>
        )}
      />
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
  pageCount: { color: COLORS.textMuted, fontSize: 12 },
  pageWrap: { alignItems: "center", marginBottom: 2 },
  page: { width, height: width * 1.5 },
  pageNum: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
    marginBottom: SPACING.sm,
  },
});
