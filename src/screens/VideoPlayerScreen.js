import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "../components/ScreenWrapper";
import { ANIME_PROVIDERS, MOVIE_PROVIDERS } from "../api/providers";
import {
  updateContinueWatching,
  getPreferredServer,
  setPreferredServer,
} from "../utils/watchlist";
import { COLORS, RADIUS, SPACING } from "../utils/theme";

const { width } = Dimensions.get("window");

function getProviders(isAnime) {
  return isAnime ? ANIME_PROVIDERS : MOVIE_PROVIDERS;
}

function buildStreamUrl(provider, contentType, isAnime, contentId, season, episode, lang) {
  try {
    if (isAnime) {
      return provider.buildMalUrl?.(contentId, episode, lang) || "";
    }
    if (contentType === "tv") {
      return provider.buildTvUrl?.(contentId, season, episode) || "";
    }
    return provider.buildMovieUrl?.(contentId) || "";
  } catch (e) {
    return "";
  }
}

export default function VideoPlayerScreen({ route, navigation }) {
  const {
    title = "",
    poster,
    contentId,
    contentType = "movie",
    episodeInfo,
    season,
    episode,
    totalEpisodes,
    totalSeasons,
    seasonEpisodeCounts,
    isAnime = false,
  } = route.params || {};

  const providers = getProviders(isAnime);
  const [providerIdx, setProviderIdx] = useState(0);
  const [currentSeason, setCurrentSeason] = useState(season || 1);
  const [currentEpisode, setCurrentEpisode] = useState(episode || 1);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("sub");

  useEffect(() => {
    const loadPref = async () => {
      try {
        const type = isAnime ? "anime" : contentType === "tv" ? "tv" : "movie";
        const pref = await getPreferredServer(type);
        if (pref) {
          const idx = providers.findIndex((p) => p.id === pref);
          if (idx >= 0) setProviderIdx(idx);
        }
      } catch (e) {}
    };
    loadPref();
  }, []);

  useEffect(() => {
    if (contentId) {
      updateContinueWatching({
        id: contentId,
        type: contentType || (isAnime ? "anime" : "movie"),
        title,
        poster,
        episodeInfo: isAnime
          ? `Episode ${currentEpisode}`
          : totalSeasons > 1
            ? `S${currentSeason} E${currentEpisode}`
            : undefined,
      }).catch(() => {});
    }
  }, [currentEpisode, currentSeason]);

  const currentProvider = providers[providerIdx] || providers[0];
  const streamUrl = buildStreamUrl(
    currentProvider, contentType, isAnime, contentId,
    currentSeason, currentEpisode, lang
  );

  const epsCount = seasonEpisodeCounts
    ? (seasonEpisodeCounts[currentSeason] || totalEpisodes || 24)
    : (totalEpisodes || 24);
  const seasonsCount = totalSeasons || 1;

  const handleProviderChange = async (idx) => {
    setProviderIdx(idx);
    setLoading(true);
    try {
      const type = isAnime ? "anime" : contentType === "tv" ? "tv" : "movie";
      await setPreferredServer(type, providers[idx].id);
    } catch (e) {}
  };

  const handleSeasonChange = (s) => {
    setCurrentSeason(s);
    setCurrentEpisode(1);
    setLoading(true);
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: SPACING.md }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.headerSub}>
            {seasonsCount > 1 ? `S${currentSeason} E${currentEpisode}` : epsCount > 1 ? `Episode ${currentEpisode}` : title}
          </Text>
        </View>
      </View>

      <View style={styles.playerWrap}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={styles.loadingText}>Loading player...</Text>
          </View>
        )}
        {streamUrl ? (
          <WebView
            source={{ uri: streamUrl }}
            style={styles.webview}
            allowsFullscreenVideo
            allowsInlineMediaPlayback
            onLoadEnd={() => setLoading(false)}
            onLoadStart={() => setLoading(true)}
            onError={() => setLoading(false)}
          />
        ) : null}
      </View>

      <ScrollView style={styles.controls} showsVerticalScrollIndicator={false}>
        {isAnime && (
          <>
            <Text style={styles.sectionTitle}>Audio</Text>
            <View style={styles.langRow}>
              <TouchableOpacity
                style={[styles.langBtn, lang === "sub" && styles.langBtnActive]}
                onPress={() => { setLang("sub"); setLoading(true); }}
              >
                <Text style={[styles.langText, lang === "sub" && styles.langTextActive]}>SUB</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.langBtn, lang === "dub" && styles.langBtnActive]}
                onPress={() => { setLang("dub"); setLoading(true); }}
              >
                <Text style={[styles.langText, lang === "dub" && styles.langTextActive]}>DUB</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Server</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.serverRow}>
          {providers.map((p, i) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.serverBtn, providerIdx === i && styles.serverBtnActive]}
              onPress={() => handleProviderChange(i)}
            >
              <Text style={[styles.serverText, providerIdx === i && styles.serverTextActive]}>
                {p.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {seasonsCount > 1 && (
          <>
            <Text style={styles.sectionTitle}>Season</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.serverRow}>
              {Array.from({ length: seasonsCount }, (_, i) => i + 1).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.seasonBtn, currentSeason === s && styles.seasonBtnActive]}
                  onPress={() => handleSeasonChange(s)}
                >
                  <Text style={[styles.seasonText, currentSeason === s && styles.seasonTextActive]}>
                    Season {s}
                  </Text>
                  {seasonEpisodeCounts && seasonEpisodeCounts[s] ? (
                    <Text style={[styles.seasonEpCount, currentSeason === s && { color: "rgba(255,255,255,0.7)" }]}>
                      {seasonEpisodeCounts[s]} eps
                    </Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {epsCount > 1 && (
          <>
            <Text style={styles.sectionTitle}>
              Episodes{seasonsCount > 1 ? ` — Season ${currentSeason}` : ""} ({epsCount})
            </Text>
            <View style={styles.epGrid}>
              {Array.from({ length: epsCount }, (_, i) => i + 1).map((ep) => (
                <TouchableOpacity
                  key={ep}
                  style={[styles.epBtn, currentEpisode === ep && styles.epBtnActive]}
                  onPress={() => { setCurrentEpisode(ep); setLoading(true); }}
                >
                  <Text style={[styles.epText, currentEpisode === ep && styles.epTextActive]}>
                    {ep}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.navRow}>
              {currentEpisode > 1 && (
                <TouchableOpacity
                  style={styles.navBtn}
                  onPress={() => { setCurrentEpisode(currentEpisode - 1); setLoading(true); }}
                >
                  <Ionicons name="play-skip-back" size={16} color={COLORS.text} />
                  <Text style={styles.navText}>Prev</Text>
                </TouchableOpacity>
              )}
              <View style={{ flex: 1 }} />
              {currentEpisode < epsCount && (
                <TouchableOpacity
                  style={styles.navBtn}
                  onPress={() => { setCurrentEpisode(currentEpisode + 1); setLoading(true); }}
                >
                  <Text style={styles.navText}>Next</Text>
                  <Ionicons name="play-skip-forward" size={16} color={COLORS.text} />
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: { color: COLORS.text, fontSize: 15, fontWeight: "700" },
  headerSub: { color: COLORS.textMuted, fontSize: 12 },
  playerWrap: {
    width,
    height: width * 0.5625,
    backgroundColor: "#000",
  },
  webview: { flex: 1, backgroundColor: "#000" },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    zIndex: 10,
  },
  loadingText: { color: COLORS.textMuted, marginTop: SPACING.sm, fontSize: 13 },
  controls: { flex: 1, paddingHorizontal: SPACING.lg },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  langRow: { flexDirection: "row", gap: SPACING.sm },
  langBtn: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  langBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  langText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: "700" },
  langTextActive: { color: "#fff" },
  serverRow: { gap: SPACING.sm },
  serverBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  serverBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  serverText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: "600" },
  serverTextActive: { color: "#fff" },
  seasonBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  seasonBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  seasonText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: "600" },
  seasonTextActive: { color: "#fff" },
  seasonEpCount: { color: COLORS.textMuted, fontSize: 10, marginTop: 2 },
  epGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.xs },
  epBtn: {
    width: 44,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  epBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  epText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: "600" },
  epTextActive: { color: "#fff" },
  navRow: { flexDirection: "row", marginTop: SPACING.lg, gap: SPACING.md },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  navText: { color: COLORS.text, fontSize: 13, fontWeight: "600" },
});
