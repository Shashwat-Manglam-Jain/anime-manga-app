import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import FilterTabs from "../components/FilterTabs";
import GridView from "../components/GridView";
import { getTopAnime, getSeasonNow } from "../api/jikan";
import { COLORS, SPACING } from "../utils/theme";

const FILTERS = [
  { label: "Airing", value: "airing" },
  { label: "Top Rated", value: "top" },
  { label: "TV Series", value: "tv" },
  { label: "Movies", value: "movie" },
  { label: "OVA", value: "ova" },
];

export default function AnimeScreen({ navigation }) {
  const [filter, setFilter] = useState("airing");
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchData = useCallback(async (f, p) => {
    if (loading) return;
    setLoading(true);
    try {
      let result;
      if (f === "airing") {
        result = await getSeasonNow(p);
      } else {
        const type = f === "top" ? undefined : f;
        result = await getTopAnime(p, type);
      }
      const items = result.data.map((a) => ({
        id: a.mal_id,
        title: a.title,
        poster: a.images?.jpg?.large_image_url,
        score: a.score,
      }));
      setData((prev) => (p === 1 ? items : [...prev, ...items]));
      setHasMore(result.pagination?.has_next_page ?? false);
    } catch (err) {
      console.log(err.message);
    }
    setLoading(false);
  }, [loading]);

  useEffect(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    fetchData(filter, 1);
  }, [filter]);

  const loadMore = () => {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    fetchData(filter, next);
  };

  return (
    <ScreenWrapper>
      <Text style={styles.heading}>Anime</Text>
      <GridView
        data={data}
        loading={loading}
        onEndReached={loadMore}
        badge={(item) => item.score ? `★ ${item.score}` : null}
        onPressItem={(item) =>
          navigation.navigate("AnimeDetail", { id: item.id })
        }
        ListHeaderComponent={
          <FilterTabs tabs={FILTERS} active={filter} onPress={setFilter} />
        }
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
  },
});
