export const ANIME_PROVIDERS = [
  {
    id: "megaplay",
    name: "MegaPlay",
    buildMalUrl: (malId, episode, lang) =>
      `https://megaplay.buzz/stream/mal/${malId}/${episode}/${lang}`,
    buildEmbedUrl: (embedId, lang) =>
      `https://megaplay.buzz/stream/s-2/${embedId}/${lang}`,
    buildAnilistUrl: (anilistId, episode, lang) =>
      `https://megaplay.buzz/stream/ani/${anilistId}/${episode}/${lang}`,
  },
  {
    id: "animplay",
    name: "AnimPlay",
    buildMalUrl: (malId, episode, lang) =>
      `https://animeplay.cfd/stream/mal/${malId}/${episode}/${lang}`,
    buildEmbedUrl: (embedId, lang) =>
      `https://animeplay.cfd/stream/s-2/${embedId}/${lang}`,
    buildAnilistUrl: (anilistId, episode, lang) =>
      `https://animeplay.cfd/stream/ani/${anilistId}/${episode}/${lang}`,
  },
  {
    id: "megaplay2",
    name: "MegaPlay S1",
    buildMalUrl: (malId, episode, lang) =>
      `https://megaplay.buzz/stream/mal/${malId}/${episode}/${lang}`,
    buildEmbedUrl: (embedId, lang) =>
      `https://megaplay.buzz/stream/s-1/${embedId}/${lang}`,
    buildAnilistUrl: (anilistId, episode, lang) =>
      `https://megaplay.buzz/stream/ani/${anilistId}/${episode}/${lang}`,
  },
  {
    id: "videasy-anime",
    name: "Videasy",
    buildMalUrl: (malId, episode, lang) =>
      `https://player.videasy.to/anime/mal/${malId}/${episode}/${lang}`,
  },
];

export const MOVIE_PROVIDERS = [
  {
    id: "videasy",
    name: "Videasy",
    buildMovieUrl: (tmdbId) => `https://player.videasy.to/movie/${tmdbId}`,
    buildTvUrl: (tmdbId, season, episode) =>
      `https://player.videasy.to/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidsrc",
    name: "VidSrc",
    buildMovieUrl: (tmdbId) => `https://vidsrc.pm/embed/movie/${tmdbId}`,
    buildTvUrl: (tmdbId, season, episode) =>
      `https://vidsrc.pm/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidlink",
    name: "VidLink Pro",
    buildMovieUrl: (tmdbId) => `https://vidlink.pro/movie/${tmdbId}`,
    buildTvUrl: (tmdbId, season, episode) =>
      `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "autoembed",
    name: "AutoEmbed",
    buildMovieUrl: (tmdbId) => `https://autoembed.co/movie/tmdb/${tmdbId}`,
    buildTvUrl: (tmdbId, season, episode) =>
      `https://autoembed.co/tv/tmdb/${tmdbId}-${season}-${episode}`,
  },
];
