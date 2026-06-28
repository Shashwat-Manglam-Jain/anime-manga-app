import axios from "axios";

const BASE = "https://api.jikan.moe/v4";
const ANIKOTO = "https://anikotoapi.site";
const ARM = "https://arm.haglund.dev/api/v2";

const tmdbCache = {};

export async function mapMalToTmdb(malId) {
  if (tmdbCache[malId]) return tmdbCache[malId];
  try {
    const res = await fetch(`${ARM}/ids?source=myanimelist&id=${malId}`);
    if (!res.ok) return null;
    const data = await res.json();
    const result = {
      tmdbId: data.themoviedb,
      season: data["themoviedb-season"] || 1,
    };
    if (result.tmdbId) tmdbCache[malId] = result;
    return result.tmdbId ? result : null;
  } catch {
    return null;
  }
}

export async function getRecentAnime(page = 1) {
  const res = await fetch(`${ANIKOTO}/recent-anime?page=${page}&per_page=24`);
  if (!res.ok) throw new Error(`Anikoto ${res.status}`);
  const json = await res.json();
  const items = json.data || [];
  return {
    data: items.map((a) => ({
      mal_id: Number(a.mal_id) || a.id,
      title: a.title,
      images: { jpg: { large_image_url: a.poster || a.background_image } },
      score: a.score ? Number(a.score) : null,
      episodes: a.episodes ? Number(a.episodes) : null,
      status: a.status,
      type: a.terms_by_type?.type?.[0] || null,
    })),
    pagination: { has_next_page: json.pagination?.has_next_page ?? items.length >= 24 },
  };
}

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

export async function getCharacterById(id) {
  const { data } = await axios.get(`${BASE}/characters/${id}/full`);
  return data.data;
}
