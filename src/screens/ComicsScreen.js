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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "../components/ScreenWrapper";
import { browseComics, searchComics } from "../api/comick";
import { COLORS, RADIUS, SPACING } from "../utils/theme";

const { width } = Dimensions.get("window");
const COLS = 3;
const GAP = SPACING.sm;
const CARD_W = (width - SPACING.lg * 2 - GAP * (COLS - 1)) / COLS;

export default function ComicsScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [page, setPage] = useState(1);

  const loadBrowse = async (p = 1) => {
    setLoading(true);
    try {
      const items = await browseComics(p);
      setData(p === 1 ? items : (prev) => [...prev, ...items]);
    } catch (err) {
      console.log("ComicK browse error:", err.message);
    }
    setLoading(false);
  };

  useEffect(() => { loadBrowse(1); }, []);

  const doSearch = useCallback(async () => {
    if (!query.trim()) {
      setSearching(false);
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
    if (loading || searching) return;
    const next = page + 1;
    setPage(next);
    loadBrowse(next);
  };

  return (
    <ScreenWrapper>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.heading}>Comics</Text>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="Search comics..."
          placeholderTextColor={COLORS.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={doSearch}
          returnKeyType="search"
        />
        {query ? (
          <TouchableOpacity onPress={() => { setQuery(""); setSearching(false); setPage(1); loadBrowse(1); }}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {loading && data.length === 0 ? (
        <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={data}
          numColumns={COLS}
          keyExtractor={(item, i) => `${item.id}-${i}`}
          contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: 100, paddingTop: SPACING.sm }}
          columnWrapperStyle={{ gap: GAP, marginBottom: GAP }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loading ? <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 20 }} /> : null}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{ width: CARD_W }}
              activeOpacity={0.7}
              onPress={() => navigation.navigate("ComicDetail", { id: item.id, title: item.title })}
            >
              <Image
                source={{ uri: item.cover || "https://via.placeholder.com/300x450?text=?" }}
                style={styles.poster}
              />
              <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
              {item.status ? (
                <Text style={styles.cardSub}>{item.status}</Text>
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
  heading: { color: COLORS.text, fontSize: 22, fontWeight: "800" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 42,
    gap: SPACING.sm,
  },
  input: { flex: 1, color: COLORS.text, fontSize: 14 },
  poster: {
    width: CARD_W,
    height: CARD_W * 1.45,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.card,
  },
  cardTitle: { color: COLORS.text, fontSize: 12, fontWeight: "500", marginTop: 4 },
  cardSub: { color: COLORS.textMuted, fontSize: 11 },
});
