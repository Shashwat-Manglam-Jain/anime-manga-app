import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import ScreenWrapper from "../components/ScreenWrapper";
import FilterTabs from "../components/FilterTabs";
import {
  getWatchlist,
  removeFromWatchlist,
  getContinueWatching,
  removeContinueWatching,
} from "../utils/watchlist";
import { COLORS, RADIUS, SPACING } from "../utils/theme";

const { width } = Dimensions.get("window");
const CW_CARD_W = width * 0.38;

const TABS = [
  { label: "All", value: "all" },
  { label: "Anime", value: "anime" },
  { label: "Movies", value: "movie" },
  { label: "TV", value: "tv" },
  { label: "Manga", value: "manga" },
  { label: "Comics", value: "comic" },
  { label: "Novels", value: "novel" },
];

export default function WatchlistScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [continueItems, setContinueItems] = useState([]);
  const [tab, setTab] = useState("all");

  useFocusEffect(
    useCallback(() => {
      getWatchlist().then(setItems);
      getContinueWatching().then(setContinueItems);
    }, [])
  );

  const filtered = tab === "all" ? items : items.filter((i) => i.type === tab);

  const handleRemove = (item) => {
    Alert.alert("Remove", `Remove "${item.title}" from watchlist?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          const updated = await removeFromWatchlist(item.id, item.type);
          setItems(updated);
        },
      },
    ]);
  };

  const handleRemoveContinue = (item) => {
    Alert.alert("Remove", `Remove "${item.title}" from continue watching?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          const updated = await removeContinueWatching(item.id, item.type);
          setContinueItems(updated);
        },
      },
    ]);
  };

  const goDetail = (item) => {
    if (item.type === "anime") navigation.navigate("AnimeDetail", { id: item.id });
    else if (item.type === "movie") navigation.navigate("MovieDetail", { id: item.id });
    else if (item.type === "manga") navigation.navigate("MangaDetail", { id: item.id });
    else if (item.type === "tv") navigation.navigate("TVDetail", { id: item.id });
    else if (item.type === "comic") navigation.navigate("ComicDetail", { id: item.id, title: item.title });
    else if (item.type === "novel") navigation.navigate("NovelDetail", { id: item.id, title: item.title });
  };

  const typeColors = {
    anime: "#8b5cf6",
    movie: "#3b82f6",
    tv: "#22c55e",
    manga: "#ef4444",
    novel: "#eab308",
    comic: "#d946ef",
  };

  const renderContinueWatching = () => {
    if (continueItems.length === 0) return null;
    return (
      <View style={styles.cwSection}>
        <Text style={styles.cwTitle}>Continue Watching</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SPACING.lg }}
        >
          {continueItems.map((item) => (
            <TouchableOpacity
              key={`cw-${item.type}-${item.id}`}
              style={styles.cwCard}
              activeOpacity={0.7}
              onPress={() => goDetail(item)}
              onLongPress={() => handleRemoveContinue(item)}
            >
              <Image
                source={{ uri: item.poster || "https://via.placeholder.com/200x300?text=?" }}
                style={styles.cwPoster}
              />
              <View style={styles.cwOverlay}>
                <Ionicons name="play-circle" size={32} color="rgba(255,255,255,0.9)" />
              </View>
              <Text style={styles.cwCardTitle} numberOfLines={2}>{item.title}</Text>
              {item.episodeInfo ? (
                <Text style={styles.cwEpisode}>{item.episodeInfo}</Text>
              ) : null}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderHeader = () => (
    <View>
      {renderContinueWatching()}
      <View style={styles.filterWrap}>
        <FilterTabs tabs={TABS} active={tab} onPress={setTab} />
      </View>
      {filtered.length > 0 && (
        <Text style={styles.countText}>
          {filtered.length} item{filtered.length !== 1 ? "s" : ""}
        </Text>
      )}
    </View>
  );

  return (
    <ScreenWrapper>
      <Text style={styles.heading}>My Library</Text>

      {items.length === 0 && continueItems.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="bookmark-outline" size={56} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>Your library is empty</Text>
          <Text style={styles.emptyText}>
            Bookmark anime, movies, manga and more to access them here
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            items.length > 0 ? (
              <View style={styles.emptyFilter}>
                <Text style={styles.emptyFilterText}>
                  No {tab} items bookmarked yet
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={() => goDetail(item)}
            >
              <Image
                source={{ uri: item.poster || "https://via.placeholder.com/200x300?text=?" }}
                style={styles.poster}
              />
              <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                <View style={[styles.typeBadge, { backgroundColor: (typeColors[item.type] || COLORS.accent) + "20" }]}>
                  <Text style={[styles.typeText, { color: typeColors[item.type] || COLORS.accent }]}>
                    {item.type}
                  </Text>
                </View>
                {item.addedAt ? (
                  <Text style={styles.dateText}>
                    Added {new Date(item.addedAt).toLocaleDateString()}
                  </Text>
                ) : null}
              </View>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => handleRemove(item)}
              >
                <Ionicons name="trash-outline" size={20} color={COLORS.red} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "800",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  cwSection: { marginTop: SPACING.sm },
  cwTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "700",
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  cwCard: {
    width: CW_CARD_W,
    marginRight: SPACING.md,
  },
  cwPoster: {
    width: CW_CARD_W,
    height: CW_CARD_W * 0.56,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.card,
  },
  cwOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: CW_CARD_W,
    height: CW_CARD_W * 0.56,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  cwCardTitle: { color: COLORS.text, fontSize: 12, fontWeight: "600", marginTop: 4 },
  cwEpisode: { color: COLORS.accent, fontSize: 11, fontWeight: "500" },
  filterWrap: { marginTop: SPACING.md },
  countText: {
    color: COLORS.textMuted,
    fontSize: 13,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
    marginTop: SPACING.lg,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginTop: SPACING.sm,
  },
  emptyFilter: {
    paddingTop: 40,
    alignItems: "center",
  },
  emptyFilterText: {
    color: COLORS.textMuted,
    fontSize: 15,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  poster: {
    width: 60,
    height: 85,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.card,
  },
  info: { flex: 1, marginLeft: SPACING.md },
  title: { color: COLORS.text, fontSize: 15, fontWeight: "600" },
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.xs,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  dateText: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 3,
  },
  removeBtn: { padding: SPACING.sm },
});
