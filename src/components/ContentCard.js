import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { COLORS, RADIUS, SPACING } from "../utils/theme";

const { width } = Dimensions.get("window");
const CARD_W = width * 0.36;
const CARD_H = CARD_W * 1.45;

export default function ContentCard({ poster, title, subtitle, onPress, badge }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imgWrap}>
        <Image
          source={{ uri: poster || "https://via.placeholder.com/300x450?text=No+Image" }}
          style={styles.img}
        />
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { width: CARD_W, marginRight: SPACING.md },
  imgWrap: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: RADIUS.md,
    overflow: "hidden",
    backgroundColor: COLORS.card,
  },
  img: { width: "100%", height: "100%", resizeMode: "cover" },
  badge: {
    position: "absolute",
    top: SPACING.xs,
    left: SPACING.xs,
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  title: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
    marginTop: SPACING.sm,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
});
