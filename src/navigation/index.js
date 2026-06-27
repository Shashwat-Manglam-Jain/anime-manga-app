import React from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../utils/ThemeContext";

import HomeScreen from "../screens/HomeScreen";
import AnimeScreen from "../screens/AnimeScreen";
import AnimeDetailScreen from "../screens/AnimeDetailScreen";
import MangaScreen from "../screens/MangaScreen";
import MangaDetailScreen from "../screens/MangaDetailScreen";
import MangaReaderScreen from "../screens/MangaReaderScreen";
import ComicsScreen from "../screens/ComicsScreen";
import ComicDetailScreen from "../screens/ComicDetailScreen";
import ComicReaderScreen from "../screens/ComicReaderScreen";
import MoviesScreen from "../screens/MoviesScreen";
import MovieDetailScreen from "../screens/MovieDetailScreen";
import TVScreen from "../screens/TVScreen";
import TVDetailScreen from "../screens/TVDetailScreen";
import NovelsScreen from "../screens/NovelsScreen";
import NovelDetailScreen from "../screens/NovelDetailScreen";
import NovelReaderScreen from "../screens/NovelReaderScreen";
import SearchScreen from "../screens/SearchScreen";
import WatchlistScreen from "../screens/WatchlistScreen";
import VideoPlayerScreen from "../screens/VideoPlayerScreen";
import CollectionsScreen from "../screens/CollectionsScreen";
import TopRatedScreen from "../screens/TopRatedScreen";
import ChartsScreen from "../screens/ChartsScreen";
import HindiSeriesScreen from "../screens/HindiSeriesScreen";
import MoreScreen from "../screens/MoreScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS = {
  HomeTab: { focused: "home", unfocused: "home-outline" },
  AnimeTab: { focused: "flash", unfocused: "flash-outline" },
  MoviesTab: { focused: "film", unfocused: "film-outline" },
  SearchTab: { focused: "search", unfocused: "search-outline" },
  MoreTab: { focused: "grid", unfocused: "grid-outline" },
};

function TabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
          elevation: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
        tabBarIcon: ({ focused, color }) => {
          const icons = TAB_ICONS[route.name];
          return (
            <Ionicons
              name={focused ? icons.focused : icons.unfocused}
              size={22}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: "Home" }} />
      <Tab.Screen name="AnimeTab" component={AnimeScreen} options={{ tabBarLabel: "Anime" }} />
      <Tab.Screen name="MoviesTab" component={MoviesScreen} options={{ tabBarLabel: "Movies" }} />
      <Tab.Screen name="SearchTab" component={SearchScreen} options={{ tabBarLabel: "Search" }} />
      <Tab.Screen name="MoreTab" component={MoreScreen} options={{ tabBarLabel: "More" }} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const { isDark, colors } = useTheme();

  const navTheme = {
    dark: isDark,
    colors: {
      primary: colors.accent,
      background: colors.bg,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.accent,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="AnimeDetail" component={AnimeDetailScreen} />
        <Stack.Screen name="MangaBrowse" component={MangaScreen} />
        <Stack.Screen name="MangaDetail" component={MangaDetailScreen} />
        <Stack.Screen name="MangaReader" component={MangaReaderScreen} />
        <Stack.Screen name="ComicsBrowse" component={ComicsScreen} />
        <Stack.Screen name="ComicDetail" component={ComicDetailScreen} />
        <Stack.Screen name="ComicReader" component={ComicReaderScreen} />
        <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
        <Stack.Screen name="TVBrowse" component={TVScreen} />
        <Stack.Screen name="TVDetail" component={TVDetailScreen} />
        <Stack.Screen name="NovelsBrowse" component={NovelsScreen} />
        <Stack.Screen name="NovelDetail" component={NovelDetailScreen} />
        <Stack.Screen name="NovelReader" component={NovelReaderScreen} />
        <Stack.Screen name="Watchlist" component={WatchlistScreen} />
        <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
        <Stack.Screen name="Collections" component={CollectionsScreen} />
        <Stack.Screen name="TopRated" component={TopRatedScreen} />
        <Stack.Screen name="Charts" component={ChartsScreen} />
        <Stack.Screen name="HindiSeries" component={HindiSeriesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
