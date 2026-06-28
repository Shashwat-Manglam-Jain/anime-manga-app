import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "../components/ScreenWrapper";
import { useTheme } from "../utils/ThemeContext";
import { getPersonDetails, getPersonCredits, img } from "../api/tmdb";
import { getCharacterById } from "../api/jikan";
import { RADIUS, SPACING } from "../utils/theme";

const { width } = Dimensions.get("window");
const CREDIT_W = 100;

export default function CharacterDetailScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { id, type } = route.params;
  const [data, setData] = useState(null);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFullBio, setShowFullBio] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (type === "anime") {
          const char = await getCharacterById(id);
          setData({
            name: char.name,
            image: char.images?.jpg?.image_url,
            biography: char.about || "",
            knownFor: char.nicknames?.length ? `Also known as: ${char.nicknames.join(", ")}` : "",
            extra: {
              favorites: char.favorites,
            },
          });
          const animeList = (char.anime || []).slice(0, 20).map((a) => ({
            id: a.anime.mal_id,
            type: "anime",
            title: a.anime.title,
            poster: a.anime.images?.jpg?.large_image_url,
            role: a.role,
          }));
          setCredits(animeList);
        } else {
          const [person, creds] = await Promise.all([
            getPersonDetails(id),
            getPersonCredits(id),
          ]);
          setData({
            name: person.name,
            image: person.profile_path ? img(person.profile_path) : null,
            biography: person.biography || "",
            knownFor: person.known_for_department || "",
            extra: {
              birthday: person.birthday,
              deathday: person.deathday,
              placeOfBirth: person.place_of_birth,
              popularity: person.popularity,
            },
          });
          const castCredits = (creds.cast || [])
            .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
            .slice(0, 30)
            .map((c) => ({
              id: c.id,
              type: c.media_type === "tv" ? "tv" : "movie",
              title: c.title || c.name,
              poster: img(c.poster_path),
              role: c.character,
              year: (c.release_date || c.first_air_date || "").split("-")[0],
            }));
          setCredits(castCredits);
        }
      } catch (err) {
        console.log("Character detail error:", err.message);
      }
      setLoading(false);
    })();
  }, [id, type]);

  if (loading) {
    return (
      <ScreenWrapper style={{ justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </ScreenWrapper>
    );
  }

  if (!data) {
    return (
      <ScreenWrapper style={{ justifyContent: "center", alignItems: "center" }}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
        <Text style={{ color: colors.textMuted, marginTop: SPACING.md }}>Failed to load</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: SPACING.lg }}>
          <Text style={{ color: colors.accent, fontWeight: "600" }}>Go Back</Text>
        </TouchableOpacity>
      </ScreenWrapper>
    );
  }

  const bio = data.biography || "";
  const shortBio = bio.length > 300 ? bio.slice(0, 300) + "..." : bio;

  const handleCreditPress = (item) => {
    if (item.type === "anime") navigation.push("AnimeDetail", { id: item.id });
    else if (item.type === "movie") navigation.push("MovieDetail", { id: item.id });
    else if (item.type === "tv") navigation.push("TVDetail", { id: item.id });
  };

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerArea}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <Image
            source={{ uri: data.image || "https://via.placeholder.com/200x300?text=?" }}
            style={[styles.profileImage, { backgroundColor: colors.card }]}
          />
          <Text style={[styles.name, { color: colors.text }]}>{data.name}</Text>
          {data.knownFor ? (
            <Text style={[styles.knownFor, { color: colors.textSecondary }]}>{data.knownFor}</Text>
          ) : null}

          {data.extra?.birthday || data.extra?.placeOfBirth || data.extra?.favorites ? (
            <View style={styles.infoRow}>
              {data.extra.birthday ? (
                <View style={[styles.infoBadge, { backgroundColor: colors.card }]}>
                  <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
                  <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    {data.extra.birthday}
                    {data.extra.deathday ? ` — ${data.extra.deathday}` : ""}
                  </Text>
                </View>
              ) : null}
              {data.extra.placeOfBirth ? (
                <View style={[styles.infoBadge, { backgroundColor: colors.card }]}>
                  <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                  <Text style={[styles.infoText, { color: colors.textSecondary }]} numberOfLines={1}>
                    {data.extra.placeOfBirth}
                  </Text>
                </View>
              ) : null}
              {data.extra.favorites ? (
                <View style={[styles.infoBadge, { backgroundColor: colors.card }]}>
                  <Ionicons name="heart" size={14} color="#ef4444" />
                  <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    {data.extra.favorites.toLocaleString()} favorites
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        {bio ? (
          <View style={styles.bioSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Biography</Text>
            <Text style={[styles.bioText, { color: colors.textSecondary }]}>
              {showFullBio ? bio : shortBio}
            </Text>
            {bio.length > 300 ? (
              <TouchableOpacity onPress={() => setShowFullBio(!showFullBio)}>
                <Text style={[styles.readMore, { color: colors.accent }]}>
                  {showFullBio ? "Show less" : "Read more"}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        {credits.length > 0 ? (
          <View style={styles.creditsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {type === "anime" ? "Anime Appearances" : "Known For"}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.creditsScroll}>
              {credits.map((c, i) => (
                <TouchableOpacity
                  key={`${c.id}-${i}`}
                  style={styles.creditCard}
                  activeOpacity={0.7}
                  onPress={() => handleCreditPress(c)}
                >
                  <Image
                    source={{ uri: c.poster || "https://via.placeholder.com/100x150?text=?" }}
                    style={[styles.creditPoster, { backgroundColor: colors.card }]}
                  />
                  <Text style={[styles.creditTitle, { color: colors.text }]} numberOfLines={2}>
                    {c.title}
                  </Text>
                  {c.role ? (
                    <Text style={[styles.creditRole, { color: colors.textMuted }]} numberOfLines={1}>
                      {c.role}
                    </Text>
                  ) : null}
                  {c.year ? (
                    <Text style={[styles.creditYear, { color: colors.textMuted }]}>{c.year}</Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headerArea: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    justifyContent: "center",
    alignItems: "center",
  },
  profileSection: {
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
  },
  profileImage: {
    width: 150,
    height: 200,
    borderRadius: RADIUS.lg,
  },
  name: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: SPACING.md,
    textAlign: "center",
  },
  knownFor: {
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  infoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  infoText: { fontSize: 12 },
  bioSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: SPACING.sm,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 22,
  },
  readMore: {
    fontWeight: "600",
    marginTop: SPACING.xs,
  },
  creditsSection: {
    marginTop: SPACING.xl,
    paddingLeft: SPACING.lg,
  },
  creditsScroll: {
    paddingRight: SPACING.lg,
    gap: SPACING.md,
  },
  creditCard: {
    width: CREDIT_W,
  },
  creditPoster: {
    width: CREDIT_W,
    height: CREDIT_W * 1.5,
    borderRadius: RADIUS.md,
  },
  creditTitle: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
  creditRole: {
    fontSize: 10,
    marginTop: 1,
  },
  creditYear: {
    fontSize: 10,
    marginTop: 1,
  },
});
