import React from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "../components/ScreenWrapper";
import { MOVIE_COLLECTIONS } from "../data/curated";
import { RADIUS, SPACING } from "../utils/theme";
import { useTheme } from "../utils/ThemeContext";

const { width } = Dimensions.get("window");
const POSTER_W = 90;

export default function CollectionsScreen({ navigation }) {
  const { colors } = useTheme();

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.heading, { color: colors.text }]}>Collections</Text>
      </View>

      <FlatList
        data={MOVIE_COLLECTIONS}
        keyExtractor={(item) => item.name}
        contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: 100 }}
        renderItem={({ item: collection }) => (
          <View style={[styles.collectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.collectionName, { color: colors.text }]}>{collection.name}</Text>
            <Text style={[styles.movieCount, { color: colors.textMuted }]}>{collection.movies.length} movies</Text>
            <FlatList
              horizontal
              data={collection.movies}
              keyExtractor={(m) => String(m.tmdbId)}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: SPACING.sm, marginTop: SPACING.sm }}
              renderItem={({ item: movie }) => (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate("MovieDetail", { id: movie.tmdbId })}
                >
                  <Image source={{ uri: movie.poster }} style={[styles.poster, { backgroundColor: colors.surface }]} />
                  <Text style={[styles.movieTitle, { color: colors.text }]} numberOfLines={1}>{movie.title}</Text>
                  <Text style={[styles.movieYear, { color: colors.textMuted }]}>{movie.year}</Text>
                </TouchableOpacity>
              )}
            />
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
});
