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
import { COLORS, RADIUS, SPACING } from "../utils/theme";

const { width } = Dimensions.get("window");
const POSTER_W = 90;

export default function CollectionsScreen({ navigation }) {
  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.heading}>Collections</Text>
      </View>

      <FlatList
        data={MOVIE_COLLECTIONS}
        keyExtractor={(item) => item.name}
        contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: 100 }}
        renderItem={({ item: collection }) => (
          <View style={styles.collectionCard}>
            <Text style={styles.collectionName}>{collection.name}</Text>
            <Text style={styles.movieCount}>{collection.movies.length} movies</Text>
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
                  <Image source={{ uri: movie.poster }} style={styles.poster} />
                  <Text style={styles.movieTitle} numberOfLines={1}>{movie.title}</Text>
                  <Text style={styles.movieYear}>{movie.year}</Text>
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
  heading: { color: COLORS.text, fontSize: 22, fontWeight: "800" },
  collectionCard: {
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  collectionName: { color: COLORS.text, fontSize: 18, fontWeight: "700" },
  movieCount: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  poster: {
    width: POSTER_W,
    height: POSTER_W * 1.5,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
  },
  movieTitle: { color: COLORS.text, fontSize: 11, fontWeight: "500", marginTop: 4, width: POSTER_W },
  movieYear: { color: COLORS.textMuted, fontSize: 10, width: POSTER_W },
});
