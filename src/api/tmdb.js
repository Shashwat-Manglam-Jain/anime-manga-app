import axios from "axios";

const KEY = "9ddf857ee8f82fa2061543abd1018cc4";
const BASE = "https://api.themoviedb.org/3";

const get = (path) => axios.get(`${BASE}${path}`, { params: { api_key: KEY } }).then((r) => r.data);

export const img = (path, size = "w500") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

export const getTrending = () => get("/trending/movie/week");
export const getPopular = () => get("/movie/popular");
export const getTopRated = () => get("/movie/top_rated");
export const getNowPlaying = () => get("/movie/now_playing");
export const getUpcoming = () => get("/movie/upcoming");

export const getMovieDetails = (id) => get(`/movie/${id}`);
export const getMovieCredits = (id) => get(`/movie/${id}/credits`);
export const getMovieSimilar = (id) => get(`/movie/${id}/similar`);

export const getTrendingTV = () => get("/trending/tv/week");
export const getPopularTV = () => get("/tv/popular");
export const getTopRatedTV = () => get("/tv/top_rated");

export const getTVDetails = (id) => get(`/tv/${id}`);
export const getTVCredits = (id) => get(`/tv/${id}/credits`);
export const getTVSimilar = (id) => get(`/tv/${id}/similar`);

export const searchMovies = (query) =>
  get(`/search/multi?query=${encodeURIComponent(query)}`);
