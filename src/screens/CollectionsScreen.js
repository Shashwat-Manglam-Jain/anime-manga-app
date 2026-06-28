import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { SkeletonGrid } from "../components/SkeletonLoader";
import { RADIUS, SPACING } from "../utils/theme";
import { useTheme } from "../utils/ThemeContext";

const { width } = Dimensions.get("window");
const POSTER_W = 90;
const PAGE_SIZE = 6;
const API_KEY = "9ddf857ee8f82fa2061543abd1018cc4";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

const COLLECTION_IDS = [
  1241,    // Harry Potter
  119,     // LOTR
  263,     // Dark Knight
  404609,  // John Wick
  531241,  // Spider-Man MCU
  2344,    // Matrix
  86311,   // Avengers
  573436,  // Spider-Verse
  726871,  // Dune
  230,     // Godfather
  8945,    // Mad Max
  10,      // Star Wars
  87359,   // Mission Impossible
  9485,    // Fast & Furious
  748,     // X-Men
  131296,  // Iron Man
  529892,  // Guardians of Galaxy
  528,     // Terminator
  2326,    // Pirates of Caribbean
  1570,    // Die Hard
  295,     // Transformers
  328,     // Jurassic Park
  84,      // Indiana Jones
  645,     // James Bond
  656,     // Saw
  1733,    // Mummy
  8650,    // Alien
  2806,    // Bourne
  87096,   // Hunger Games
  1022790, // Kung Fu Panda
  10194,   // Toy Story
  137697,  // Finding Nemo
  468552,  // Wonder Woman
  618529,  // DC Extended Universe
  422834,  // Fantastic Beasts
  9743,    // Shrek
  404825,  // Deadpool
  735325,  // Despicable Me
  386382,  // Maze Runner
  264,     // Back to the Future
];

async function fetchCollection(id) {
  const res = await fetch(`${BASE_URL}/collection/${id}?api_key=${API_KEY}`);
  if (!res.ok) return null;
  return res.json();
}

export default function CollectionsScreen({ navigation }) {
  const { colors } = useTheme();
  const [collections, setCollections] = useState([]);
  const [page, setPage] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingRef = useRef(false);

  const hasMore = page * PAGE_SIZE < COLLECTION_IDS.length;

  const loadPage = useCallback(async (pageNum) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    const start = pageNum * PAGE_SIZE;
    const ids = COLLECTION_IDS.slice(start, start + PAGE_SIZE);
    if (ids.length === 0) {
      loadingRef.current = false;
      return;
    }

    const results = await Promise.all(ids.map(fetchCollection));
    const valid = results.filter(Boolean);

    setCollections((prev) => [...prev, ...valid]);
    setPage(pageNum + 1);
    loadingRef.current = false;
  }, []);

  useEffect(() => {
    (async () => {
      await loadPage(0);
      setInitialLoading(false);
    })();
  }, [loadPage]);

  const handleEndReached = useCallback(() => {
    if (!hasMore || loadingMore || loadingRef.current) return;
    setLoadingMore(true);
    loadPage(page).finally(() => setLoadingMore(false));
  }, [hasMore, loadingMore, page, loadPage]);

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.accent} />
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.heading, { color: colors.text }]}>Collections</Text>
      </View>

      {initialLoading ? (
        <View style={{ paddingHorizontal: SPACING.lg }}>
          <SkeletonGrid count={9} />
        </View>
      ) : (
        <FlatList
          data={collections}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: 100 }}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          renderItem={({ item: collection }) => (
            <View style={[styles.collectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.collectionName, { color: colors.text }]}>{collection.name}</Text>
              <Text style={[styles.movieCount, { color: colors.textMuted }]}>{collection.parts?.length || 0} movies</Text>
              <FlatList
                horizontal
                data={collection.parts}
                keyExtractor={(m) => String(m.id)}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: SPACING.sm, marginTop: SPACING.sm }}
                renderItem={({ item: movie }) => (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate("MovieDetail", { id: movie.id })}
                  >
                    <Image
                      source={
                        movie.poster_path
                          ? { uri: `${IMG_BASE}${movie.poster_path}` }
                          : undefined
                      }
                      style={[styles.poster, { backgroundColor: colors.surface }]}
                    />
                    <Text style={[styles.movieTitle, { color: colors.text }]} numberOfLines={1}>
                      {movie.title}
                    </Text>
                    <Text style={[styles.movieYear, { color: colors.textMuted }]}>
                      {movie.release_date ? movie.release_date.slice(0, 4) : ""}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.md,
  },
  heading: { fontSize: 22, fontWeight: "800" },
  collectionCard: {
    marginBottom: SPACING.xl,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
  },
  collectionName: { fontSize: 18, fontWeight: "700" },
  movieCount: { fontSize: 13, marginTop: 2 },
  poster: {
    width: POSTER_W,
    height: POSTER_W * 1.5,
    borderRadius: RADIUS.sm,
  },
  movieTitle: { fontSize: 11, fontWeight: "500", marginTop: 4, width: POSTER_W },
  movieYear: { fontSize: 10, width: POSTER_W },
  footer: {
    paddingVertical: SPACING.lg,
    alignItems: "center",
  },
});
