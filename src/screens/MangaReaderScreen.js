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
import { SPACING, RADIUS } from "../utils/theme";
import { useTheme } from "../utils/ThemeContext";

const { width } = Dimensions.get("window");

export default function MangaReaderScreen({ route, navigation }) {
  const { colors } = useTheme();
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
        <ActivityIndicator size="large" color={colors.accent} />
      </ScreenWrapper>
    );

  return (
    <ScreenWrapper>
      <View style={[styles.header, { borderColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: SPACING.md }}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {mangaTitle}
          </Text>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>Chapter {chapterNum}</Text>
        </View>
        <Text style={[styles.pageCount, { color: colors.textMuted }]}>{pages.length} pages</Text>
      </View>
      <FlatList
        data={pages}
        keyExtractor={(_, i) => String(i)}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={12}
        windowSize={7}
        renderItem={({ item, index }) => (
          <View style={styles.pageWrap}>
            <Image
              source={{ uri: item }}
              style={styles.page}
              resizeMode="contain"
            />
            <Text style={[styles.pageNum, { color: colors.textMuted }]}>{index + 1}/{pages.length}</Text>
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
  },
  headerTitle: { fontSize: 14, fontWeight: "600" },
  headerSub: { fontSize: 12 },
  pageCount: { fontSize: 12 },
  pageWrap: { alignItems: "center", marginBottom: 2 },
  page: { width, height: width * 1.5 },
  pageNum: {
    fontSize: 11,
    marginTop: 2,
    marginBottom: SPACING.sm,
  },
});
