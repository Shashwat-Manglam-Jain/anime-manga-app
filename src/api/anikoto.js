import axios from "axios";

const BASE = "https://anikotoapi.site";

export async function getRecentAnime(page = 1, perPage = 20) {
  const { data } = await axios.get(
    `${BASE}/recent-anime?page=${page}&per_page=${perPage}`
  );
  return data;
}

export async function getSeries(id) {
  const { data } = await axios.get(`${BASE}/series/${id}`);
  return data;
}
