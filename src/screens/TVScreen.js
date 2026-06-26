import React, { useEffect, useState } from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import ContentRow from "../components/ContentRow";
import FeaturedCarousel from "../components/FeaturedCarousel";
import { getTrendingTV, getPopularTV, getTopRatedTV, img } from "../api/tmdb";
import { COLORS, SPACING } from "../utils/theme";

function mapShows(list) {
  return (list || []).map((s) => ({
    id: s.id,
    type: "tv",
    title: s.name || s.title,
    poster: img(s.poster_path),
    subtitle: s.vote_average ? `★ ${s.vote_average.toFixed(1)}` : "",
  }));
}

export default function TVScreen({ navigation }) {
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [tr, pop, top] = await Promise.all([
          getTrendingTV(),
          getPopularTV(),
          getTopRatedTV(),
        ]);
        setTrending(mapShows(tr.results));
        setPopular(mapShows(pop.results));
        setTopRated(mapShows(top.results));
      } catch (err) {
        console.log(err.message);
      }
    })();
  }, []);

  const go = (item) => navigation.navigate("TVDetail", { id: item.id });

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>TV Series</Text>
        <FeaturedCarousel
          items={trending.slice(0, 6).map((s) => ({ ...s, tags: [] }))}
          onPress={go}
        />
        <ContentRow title="Popular" data={popular} onPressItem={go} />
        <ContentRow title="Top Rated" data={topRated} onPressItem={go} />
      </ScrollView>
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
