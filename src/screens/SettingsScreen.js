import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "../components/ScreenWrapper";
import { useTheme } from "../utils/ThemeContext";
import { getSettings, updateSetting, resetSettings } from "../utils/settings";
import { RADIUS, SPACING } from "../utils/theme";

const CONTENT_TOGGLES = [
  { key: "anime", label: "Anime", icon: "flash-outline", color: "#ef4444", desc: "Jikan / MyAnimeList API" },
  { key: "movies", label: "Movies & TV", icon: "film-outline", color: "#3b82f6", desc: "TMDB API" },
  { key: "manga", label: "Manga", icon: "book-outline", color: "#22c55e", desc: "MangaDex API" },
  { key: "comics", label: "Comics", icon: "layers-outline", color: "#d946ef", desc: "ComicK API" },
  { key: "novels", label: "Light Novels", icon: "library-outline", color: "#eab308", desc: "AniList + NovelBin" },
];

const PLAYER_TOGGLES = [
  { key: "autoplay", label: "Autoplay Video", icon: "play-circle-outline", color: "#8b5cf6", desc: "Auto-start video when player opens" },
  { key: "adBlock", label: "Ad Blocker", icon: "shield-checkmark-outline", color: "#06b6d4", desc: "Block popup ads in video player" },
];

export default function SettingsScreen({ navigation }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const handleToggle = async (key) => {
    const updated = await updateSetting(key, !settings[key]);
    setSettings({ ...updated });
  };

  const handleReset = () => {
    Alert.alert("Reset Settings", "Reset all settings to defaults?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: async () => {
          const defaults = await resetSettings();
          setSettings({ ...defaults });
        },
      },
    ]);
  };

  if (!settings) return <ScreenWrapper />;

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.heading, { color: colors.text }]}>Settings</Text>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Appearance</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: (isDark ? "#6d28d9" : "#f59e0b") + "20" }]}>
              <Ionicons name={isDark ? "moon" : "sunny"} size={20} color={isDark ? "#a78bfa" : "#f59e0b"} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Dark Mode</Text>
              <Text style={[styles.rowDesc, { color: colors.textMuted }]}>
                {isDark ? "Dark theme active" : "Light theme active"}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: "#d1d5db", true: "#6d28d9" }}
              thumbColor={isDark ? "#a78bfa" : "#f59e0b"}
            />
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Content Sources</Text>
        <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
          Enable or disable content sources. Disabled sources won't appear in search or home.
        </Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {CONTENT_TOGGLES.map((item, i) => (
            <View key={item.key}>
              <View style={styles.row}>
                <View style={[styles.iconWrap, { backgroundColor: item.color + "20" }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowLabel, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[styles.rowDesc, { color: colors.textMuted }]}>{item.desc}</Text>
                </View>
                <Switch
                  value={settings[item.key]}
                  onValueChange={() => handleToggle(item.key)}
                  trackColor={{ false: "#d1d5db", true: item.color }}
                  thumbColor={settings[item.key] ? "#fff" : "#f4f4f5"}
                />
              </View>
              {i < CONTENT_TOGGLES.length - 1 ? (
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              ) : null}
            </View>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Player</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {PLAYER_TOGGLES.map((item, i) => (
            <View key={item.key}>
              <View style={styles.row}>
                <View style={[styles.iconWrap, { backgroundColor: item.color + "20" }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowLabel, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[styles.rowDesc, { color: colors.textMuted }]}>{item.desc}</Text>
                </View>
                <Switch
                  value={settings[item.key]}
                  onValueChange={() => handleToggle(item.key)}
                  trackColor={{ false: "#d1d5db", true: item.color }}
                  thumbColor={settings[item.key] ? "#fff" : "#f4f4f5"}
                />
              </View>
              {i < PLAYER_TOGGLES.length - 1 ? (
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              ) : null}
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.resetBtn, { borderColor: "#ef4444" + "40" }]}
          onPress={handleReset}
        >
          <Ionicons name="refresh-outline" size={18} color="#ef4444" />
          <Text style={styles.resetText}>Reset to Defaults</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
    gap: SPACING.md,
  },
  heading: { fontSize: 22, fontWeight: "800" },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    marginBottom: SPACING.xs,
  },
  sectionHint: {
    fontSize: 12,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  card: {
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    gap: SPACING.md,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  rowLabel: { fontSize: 15, fontWeight: "600" },
  rowDesc: { fontSize: 12, marginTop: 1 },
  divider: { height: 1, marginLeft: 62 },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  resetText: { color: "#ef4444", fontWeight: "600", fontSize: 14 },
});
