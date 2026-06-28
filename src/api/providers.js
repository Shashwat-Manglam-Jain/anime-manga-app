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

export const ANIME_PROVIDERS = MOVIE_PROVIDERS;
