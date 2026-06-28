import React, { memo } from "react";
import {
  View,
  Text,
  Image as RNImage,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { useTheme } from "../utils/ThemeContext";
import { RADIUS, SPACING } from "../utils/theme";

const { width } = Dimensions.get("window");
const CARD_W = width * 0.36;
const CARD_H = CARD_W * 1.45;

function ContentCard({ poster, title, subtitle, onPress, badge }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.imgWrap, { backgroundColor: colors.card }]}>
        {poster && poster.includes("comick") ? (
          <ExpoImage
            source={{ uri: poster, headers: { Referer: "https://comick.art/" } }}
            style={styles.img}
            contentFit="cover"
          />
        ) : (
          <RNImage
            source={{ uri: poster || "https://via.placeholder.com/300x450?text=No+Image" }}
            style={styles.img}
          />
        )}
        {badge ? (
          <View style={[styles.badge, { backgroundColor: colors.accent }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

export default memo(ContentCard);

const styles = StyleSheet.create({
  card: { width: CARD_W, marginRight: SPACING.md },
  imgWrap: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: RADIUS.md,
    overflow: "hidden",
  },
  img: { width: "100%", height: "100%", resizeMode: "cover" },
  badge: {
    position: "absolute",
    top: SPACING.xs,
    left: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  title: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: SPACING.sm,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
});
