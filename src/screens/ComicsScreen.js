import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "../components/ScreenWrapper";
import { SkeletonGrid } from "../components/SkeletonLoader";
import { browseComics, searchComics } from "../api/comick";
import { RADIUS, SPACING } from "../utils/theme";
import { useTheme } from "../utils/ThemeContext";

const { width } = Dimensions.get("window");
const COLS = 3;
const GAP = SPACING.sm;
const CARD_W = (width - SPACING.lg * 2 - GAP * (COLS - 1)) / COLS;

export default function ComicsScreen({ navigation }) {
  const { colors } = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [page, setPage] = useState(1);

  const loadBrowse = async (p = 1) => {
    if (p === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const items = await browseComics(p);
      setData((prev) => (p === 1 ? items : [...prev, ...items]));
    } catch (err) {
      console.log("ComicK browse error:", err.message);
    }
    setLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => { loadBrowse(1); }, []);

  const doSearch = useCallback(async () => {
    if (!query.trim()) {
      setSearching(false);
      setPage(1);
      loadBrowse(1);
      return;
    }
    setSearching(true);
    setLoading(true);
    try {
      const items = await searchComics(query.trim());
      setData(items);
    } catch (err) {
      console.log("ComicK search error:", err.message);
    }
    setLoading(false);
  }, [query]);

  const loadMore = () => {
    if (loading || loadingMore || searching) return;
    const next = page + 1;
    setPage(next);
    loadBrowse(next);
  };

  return (
    <ScreenWrapper>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.heading, { color: colors.text }]}>Comics</Text>
      </View>

      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Search comics..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={doSearch}
          returnKeyType="search"
        />
        {query ? (
          <TouchableOpacity onPress={() => { setQuery(""); setSearching(false); setPage(1); loadBrowse(1); }}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {loading && data.length === 0 ? (
        <SkeletonGrid count={12} />
      ) : (
        <FlatList
          data={data}
          numColumns={COLS}
          keyExtractor={(item, i) => `${item.id}-${i}`}
          contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: 100, paddingTop: SPACING.sm }}
          columnWrapperStyle={{ gap: GAP, marginBottom: GAP }}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          removeClippedSubviews={true}
          maxToRenderPerBatch={12}
          windowSize={7}
          ListFooterComponent={loadingMore ? <SkeletonGrid count={3} /> : null}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{ width: CARD_W }}
              activeOpacity={0.7}
              onPress={() => navigation.navigate("ComicDetail", { id: item.id, title: item.title })}
            >
              <Image
                source={{ uri: item.cover || "https://via.placeholder.com/300x450?text=?" }}
                style={[styles.poster, { backgroundColor: colors.card }]}
              />
              <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
              {item.status ? (
                <Text style={[styles.cardSub, { color: colors.textMuted }]}>{item.status}</Text>
              ) : null}
            </TouchableOpacity>
          )}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    gap: SPACING.md,
  },
  heading: { fontSize: 22, fontWeight: "800" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    height: 42,
    gap: SPACING.sm,
  },
  input: { flex: 1, fontSize: 14 },
  poster: {
    width: CARD_W,
    height: CARD_W * 1.45,
    borderRadius: RADIUS.md,
  },
  cardTitle: { fontSize: 12, fontWeight: "500", marginTop: 4 },
  cardSub: { fontSize: 11 },
});
