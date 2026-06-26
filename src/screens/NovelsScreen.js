import React, { useEffect, useState, useCallback } from "react";
import { Text, StyleSheet } from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import GridView from "../components/GridView";
import { getPopularNovels } from "../api/novels";
import { COLORS, SPACING } from "../utils/theme";

export default function NovelsScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchData = useCallback(async (p) => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await getPopularNovels(p);
      const items = result.items.map((n) => ({
        id: n.id,
        title: n.title,
        poster: n.image,
        score: n.score,
        genres: n.genres,
      }));
      setData((prev) => (p === 1 ? items : [...prev, ...items]));
      setHasMore(result.hasNext);
    } catch (err) {
      console.log(err.message);
    }
    setLoading(false);
  }, [loading]);

  useEffect(() => { fetchData(1); }, []);

  const loadMore = () => {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    fetchData(next);
  };

  return (
    <ScreenWrapper>
      <Text style={styles.heading}>Light Novels</Text>
      <GridView
        data={data}
        loading={loading}
        onEndReached={loadMore}
        onPressItem={(item) => navigation.navigate("NovelDetail", { id: item.id, title: item.title })}
        badge={(item) => item.score ? `★ ${item.score}` : null}
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
