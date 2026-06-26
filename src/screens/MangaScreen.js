import React, { useEffect, useState, useCallback } from "react";
import { Text, StyleSheet } from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import GridView from "../components/GridView";
import { getPopularManga } from "../api/mangadex";
import { COLORS, SPACING } from "../utils/theme";

export default function MangaScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchData = useCallback(async (off) => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await getPopularManga(off);
      const items = result.items.map((m) => ({
        id: m.id,
        title: m.title,
        poster: m.cover,
        year: m.year,
        tags: m.tags,
      }));
      setData((prev) => (off === 0 ? items : [...prev, ...items]));
      setHasMore(off + 24 < result.total);
    } catch (err) {
      console.log(err.message);
    }
    setLoading(false);
  }, [loading]);

  useEffect(() => { fetchData(0); }, []);

  const loadMore = () => {
    if (!hasMore || loading) return;
    const next = offset + 24;
    setOffset(next);
    fetchData(next);
  };

  return (
    <ScreenWrapper>
      <Text style={styles.heading}>Manga</Text>
      <GridView
        data={data}
        loading={loading}
        onEndReached={loadMore}
        onPressItem={(item) =>
          navigation.navigate("MangaDetail", { id: item.id })
        }
        badge={(item) => item.tags?.[0] || null}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "800",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
});
