import React, { useEffect, useState } from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import ContentRow from "../components/ContentRow";
import FeaturedCarousel from "../components/FeaturedCarousel";
import { getTrending, getPopular, getTopRated, getNowPlaying, getUpcoming, img } from "../api/tmdb";
import { COLORS, SPACING } from "../utils/theme";

function mapMovies(list) {
  return (list || []).map((m) => ({
    id: m.id,
    type: "movie",
    title: m.title || m.name,
    poster: img(m.poster_path),
    subtitle: m.vote_average ? `★ ${m.vote_average.toFixed(1)}` : "",
  }));
}

export default function MoviesScreen({ navigation }) {
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [upcoming, setUpcoming] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [tr, pop, top, now, up] = await Promise.all([
          getTrending(),
          getPopular(),
          getTopRated(),
          getNowPlaying(),
          getUpcoming(),
        ]);
        setTrending(mapMovies(tr.results?.slice(0, 6)));
        setPopular(mapMovies(pop.results));
        setTopRated(mapMovies(top.results));
        setNowPlaying(mapMovies(now.results));
        setUpcoming(mapMovies(up.results));
      } catch (err) {
        console.log(err.message);
      }
    })();
  }, []);

  const go = (item) => navigation.navigate("MovieDetail", { id: item.id });

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Movies</Text>
        <FeaturedCarousel
          items={trending.map((m) => ({ ...m, tags: [] }))}
          onPress={go}
        />
        <ContentRow title="Popular" data={popular} onPressItem={go} />
        <ContentRow title="Top Rated" data={topRated} onPressItem={go} />
        <ContentRow title="Now Playing" data={nowPlaying} onPressItem={go} />
        <ContentRow title="Upcoming" data={upcoming} onPressItem={go} />
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
