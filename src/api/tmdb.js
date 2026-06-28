import axios from "axios";

const KEY = "9ddf857ee8f82fa2061543abd1018cc4";
const BASE = "https://api.themoviedb.org/3";

const get = (path, params = {}) =>
  axios.get(`${BASE}${path}`, {
    params: { api_key: KEY, ...params },
    headers: { Referer: "" },
  }).then((r) => r.data);

export const img = (path, size = "w500") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

export const getTrending = (page = 1) => get("/trending/movie/week", { page });
export const getPopular = (page = 1) => get("/movie/popular", { page });
export const getTopRated = (page = 1) => get("/movie/top_rated", { page });
export const getNowPlaying = (page = 1) => get("/movie/now_playing", { page });
export const getUpcoming = (page = 1) => get("/movie/upcoming", { page });

export const getMovieDetails = (id) => get(`/movie/${id}`);
export const getMovieCredits = (id) => get(`/movie/${id}/credits`);
export const getMovieSimilar = (id) => get(`/movie/${id}/similar`);

export const getTrendingTV = () => get("/trending/tv/week");
export const getPopularTV = (page = 1) => get("/tv/popular", { page });
export const getTopRatedTV = (page = 1) => get("/tv/top_rated", { page });

export const getTVDetails = (id) => get(`/tv/${id}`);
export const getTVCredits = (id) => get(`/tv/${id}/credits`);
export const getTVSimilar = (id) => get(`/tv/${id}/similar`);

export const searchMovies = (query) =>
  get(`/search/multi?query=${encodeURIComponent(query)}`);

export const discoverMovies = (page = 1, params = {}) =>
  get("/discover/movie", { page, sort_by: "popularity.desc", ...params });

export const discoverTV = (page = 1, params = {}) =>
  get("/discover/tv", { page, sort_by: "popularity.desc", ...params });

export const getPersonDetails = (id) => get(`/person/${id}`);
export const getPersonCredits = (id) => get(`/person/${id}/combined_credits`);
