import axios from "axios";

const BASE = "https://api.jikan.moe/v4";

export async function searchAnime(query, page = 1) {
  const { data } = await axios.get(
    `${BASE}/anime?q=${encodeURIComponent(query)}&page=${page}&limit=24&sfw=true`
  );
  return data;
}

export async function getTopAnime(page = 1, filter) {
  let url = `${BASE}/top/anime?page=${page}&limit=24&sfw=true`;
  if (filter) url += `&type=${filter}`;
  const { data } = await axios.get(url);
  return data;
}

export async function getSeasonNow(page = 1) {
  const { data } = await axios.get(
    `${BASE}/seasons/now?page=${page}&limit=24&sfw=true`
  );
  return data;
}

export async function getAnimeById(id) {
  const { data } = await axios.get(`${BASE}/anime/${id}/full`);
  return data.data;
}

export async function getAnimeEpisodes(id, page = 1) {
  const { data } = await axios.get(
    `${BASE}/anime/${id}/episodes?page=${page}`
  );
  return data;
}

export async function getAnimeRecommendations(id) {
  const { data } = await axios.get(`${BASE}/anime/${id}/recommendations`);
  return data.data?.slice(0, 12) || [];
}

export async function getAnimeCharacters(id) {
  const { data } = await axios.get(`${BASE}/anime/${id}/characters`);
  return data.data?.slice(0, 20) || [];
}
