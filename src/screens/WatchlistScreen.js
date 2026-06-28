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
import { getDownloads, removeDownload } from "../utils/downloads";
import { RADIUS, SPACING } from "../utils/theme";
import { useTheme } from "../utils/ThemeContext";

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
  const { colors } = useTheme();
  const [items, setItems] = useState([]);
  const [continueItems, setContinueItems] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [tab, setTab] = useState("all");
  const [section, setSection] = useState("watchlist");

  useFocusEffect(
    useCallback(() => {
      getWatchlist().then(setItems);
      getContinueWatching().then(setContinueItems);
      getDownloads().then(setDownloads);
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

  const handleRemoveDownload = (item) => {
    const label = item.episodeLabel ? `${item.title} — ${item.episodeLabel}` : item.title;
    Alert.alert("Remove Download", `Remove "${label}" from downloads?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          const updated = await removeDownload(item.downloadKey || item.id, item.type);
          setDownloads(updated);
        },
      },
    ]);
  };

  const playDownload = (item) => {
    if (item.episode || item.contentType === "tv" || item.isAnime) {
      navigation.navigate("VideoPlayer", {
        title: item.title,
        poster: item.poster || item.localPoster,
        contentId: item.id,
        contentType: item.contentType || item.type,
        episode: item.episode || 1,
        season: item.season || 1,
        totalEpisodes: item.totalEpisodes,
        totalSeasons: item.totalSeasons,
        seasonEpisodeCounts: item.seasonEpisodeCounts,
        isAnime: !!item.isAnime,
      });
    } else if (item.type === "movie") {
      navigation.navigate("VideoPlayer", {
        title: item.title,
        poster: item.poster || item.localPoster,
        contentId: item.id,
        contentType: "movie",
        isAnime: false,
      });
    } else {
      goDetail(item);
    }
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
        <Text style={[styles.cwTitle, { color: colors.text }]}>Continue Watching</Text>
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
                style={[styles.cwPoster, { backgroundColor: colors.card }]}
              />
              <View style={styles.cwOverlay}>
                <Ionicons name="play-circle" size={32} color="rgba(255,255,255,0.9)" />
              </View>
              <Text style={[styles.cwCardTitle, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
              {item.episodeInfo ? (
                <Text style={[styles.cwEpisode, { color: colors.accent }]}>{item.episodeInfo}</Text>
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
        <Text style={[styles.countText, { color: colors.textMuted }]}>
          {filtered.length} item{filtered.length !== 1 ? "s" : ""}
        </Text>
      )}
    </View>
  );

  const filteredDownloads = tab === "all" ? downloads : downloads.filter((d) => d.type === tab);

  const renderDownloadsHeader = () => (
    <View>
      <View style={styles.filterWrap}>
        <FilterTabs tabs={TABS} active={tab} onPress={setTab} />
      </View>
      {filteredDownloads.length > 0 && (
        <Text style={[styles.countText, { color: colors.textMuted }]}>
          {filteredDownloads.length} download{filteredDownloads.length !== 1 ? "s" : ""}
        </Text>
      )}
    </View>
  );

  return (
    <ScreenWrapper>
      <Text style={[styles.heading, { color: colors.text }]}>My Library</Text>

      <View style={styles.sectionToggle}>
        <TouchableOpacity
          style={[styles.sectionBtn, section === "watchlist" && { backgroundColor: colors.accent }]}
          onPress={() => setSection("watchlist")}
        >
          <Ionicons name="bookmark" size={16} color={section === "watchlist" ? "#fff" : colors.textMuted} />
          <Text style={[styles.sectionBtnText, { color: section === "watchlist" ? "#fff" : colors.textMuted }]}>Watchlist</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sectionBtn, section === "downloads" && { backgroundColor: "#22c55e" }]}
          onPress={() => setSection("downloads")}
        >
          <Ionicons name="cloud-download" size={16} color={section === "downloads" ? "#fff" : colors.textMuted} />
          <Text style={[styles.sectionBtnText, { color: section === "downloads" ? "#fff" : colors.textMuted }]}>Downloads</Text>
          {downloads.length > 0 && (
            <View style={styles.downloadBadge}>
              <Text style={styles.downloadBadgeText}>{downloads.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {section === "watchlist" ? (
        items.length === 0 && continueItems.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="bookmark-outline" size={56} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Your library is empty</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
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
                  <Text style={[styles.emptyFilterText, { color: colors.textMuted }]}>
                    No {tab} items bookmarked yet
                  </Text>
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.row, { borderColor: colors.border }]}
                activeOpacity={0.7}
                onPress={() => goDetail(item)}
              >
                <Image
                  source={{ uri: item.poster || "https://via.placeholder.com/200x300?text=?" }}
                  style={[styles.poster, { backgroundColor: colors.card }]}
                />
                <View style={styles.info}>
                  <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
                  <View style={[styles.typeBadge, { backgroundColor: (typeColors[item.type] || colors.accent) + "20" }]}>
                    <Text style={[styles.typeText, { color: typeColors[item.type] || colors.accent }]}>
                      {item.type}
                    </Text>
                  </View>
                  {item.addedAt ? (
                    <Text style={[styles.dateText, { color: colors.textMuted }]}>
                      Added {new Date(item.addedAt).toLocaleDateString()}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => handleRemove(item)}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.red} />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        )
      ) : (
        downloads.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="cloud-download-outline" size={56} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No downloads yet</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Download content from detail pages to access them offline
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredDownloads}
            keyExtractor={(item) => item.downloadKey || `dl-${item.type}-${item.id}`}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListHeaderComponent={renderDownloadsHeader}
            ListEmptyComponent={
              downloads.length > 0 ? (
                <View style={styles.emptyFilter}>
                  <Text style={[styles.emptyFilterText, { color: colors.textMuted }]}>
                    No {tab} downloads
                  </Text>
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.row, { borderColor: colors.border }]}
                activeOpacity={0.7}
                onPress={() => playDownload(item)}
              >
                <Image
                  source={{ uri: item.localPoster || item.poster || "https://via.placeholder.com/200x300?text=?" }}
                  style={[styles.poster, { backgroundColor: colors.card }]}
                />
                <View style={styles.info}>
                  <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
                  {item.episodeLabel ? (
                    <Text style={[styles.epLabel, { color: colors.accent }]}>{item.episodeLabel}</Text>
                  ) : null}
                  <View style={[styles.typeBadge, { backgroundColor: (typeColors[item.type] || colors.accent) + "20" }]}>
                    <Text style={[styles.typeText, { color: typeColors[item.type] || colors.accent }]}>
                      {item.type}
                    </Text>
                  </View>
                  {item.downloadedAt ? (
                    <Text style={[styles.dateText, { color: colors.textMuted }]}>
                      Saved {new Date(item.downloadedAt).toLocaleDateString()}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => handleRemoveDownload(item)}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.red} />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        )
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 26,
    fontWeight: "800",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  cwSection: { marginTop: SPACING.sm },
  cwTitle: {
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
  cwCardTitle: { fontSize: 12, fontWeight: "600", marginTop: 4 },
  cwEpisode: { fontSize: 11, fontWeight: "500" },
  filterWrap: { marginTop: SPACING.md },
  countText: {
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
    fontSize: 18,
    fontWeight: "700",
    marginTop: SPACING.lg,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: SPACING.sm,
  },
  emptyFilter: {
    paddingTop: 40,
    alignItems: "center",
  },
  emptyFilterText: {
    fontSize: 15,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  poster: {
    width: 60,
    height: 85,
    borderRadius: RADIUS.sm,
  },
  info: { flex: 1, marginLeft: SPACING.md },
  title: { fontSize: 15, fontWeight: "600" },
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
  epLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  dateText: {
    fontSize: 11,
    marginTop: 3,
  },
  removeBtn: { padding: SPACING.sm },
  sectionToggle: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  sectionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  sectionBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  downloadBadge: {
    backgroundColor: "#fff",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    marginLeft: 2,
  },
  downloadBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#22c55e",
  },
});
