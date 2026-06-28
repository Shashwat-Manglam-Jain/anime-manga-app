import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "../components/ScreenWrapper";
import { useTheme } from "../utils/ThemeContext";
import { CHARTS } from "../data/curated";
import { RADIUS, SPACING } from "../utils/theme";

export default function ChartsScreen({ navigation }) {
  const { colors } = useTheme();

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.heading, { color: colors.text }]}>Charts & Browse</Text>
        </View>

        <View style={styles.gridSection}>
          {CHARTS.map((chart) => (
            <TouchableOpacity
              key={chart.key}
              style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.7}
              onPress={() => {
                if (chart.key === "hindi") navigation.navigate("HindiSeries");
                else if (chart.key === "topMovies") navigation.navigate("TopRated");
                else if (chart.key === "topTV") navigation.navigate("TopRated");
                else if (chart.key === "collections") navigation.navigate("Collections");
                else if (chart.key === "anime") navigation.navigate("AnimeTab");
                else if (chart.key === "manga") navigation.navigate("MangaBrowse");
                else if (chart.key === "comics") navigation.navigate("ComicsBrowse");
                else if (chart.key === "novels") navigation.navigate("NovelsBrowse");
              }}
            >
              <View style={[styles.chartIcon, { backgroundColor: chart.color + "20" }]}>
                <Ionicons name={chart.icon} size={24} color={chart.color} />
              </View>
              <View style={styles.chartInfo}>
                <Text style={[styles.chartTitle, { color: colors.text }]}>{chart.title}</Text>
                <Text style={[styles.chartDesc, { color: colors.textMuted }]}>{chart.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

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
    paddingBottom: SPACING.md,
    gap: SPACING.md,
  },
  heading: { fontSize: 22, fontWeight: "800" },
  gridSection: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  chartCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  chartIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  chartInfo: { flex: 1 },
  chartTitle: { fontSize: 15, fontWeight: "600" },
  chartDesc: { fontSize: 12, marginTop: 1 },
});
