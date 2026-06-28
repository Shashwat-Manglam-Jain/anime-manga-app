import axios from "axios";

const BASE = "https://api.mangadex.org";

function extractTitle(attrs) {
  return attrs.title?.en || attrs.title?.["ja-ro"] || Object.values(attrs.title || {})[0] || "Untitled";
}

function extractCover(manga) {
  const rel = manga.relationships?.find((r) => r.type === "cover_art");
  if (rel?.attributes?.fileName) {
    return `https://uploads.mangadex.org/covers/${manga.id}/${rel.attributes.fileName}.256.jpg`;
  }
  return null;
}

export async function getPopularManga(offset = 0) {
  const { data } = await axios.get(`${BASE}/manga`, {
    params: {
      limit: 24,
      offset,
      order: { followedCount: "desc" },
      "includes[]": ["cover_art"],
      "contentRating[]": ["safe", "suggestive"],
      hasAvailableChapters: true,
    },
  });
  return {
    items: data.data.map((m) => ({
      id: m.id,
      title: extractTitle(m.attributes),
      cover: extractCover(m),
      status: m.attributes.status,
      year: m.attributes.year,
      tags: m.attributes.tags
        ?.filter((t) => t.attributes.group === "genre")
        .map((t) => t.attributes.name.en)
        .slice(0, 3) || [],
    })),
    total: data.total,
    hasMore: offset + 24 < (data.total || 0),
  };
}

export async function searchManga(query) {
  const { data } = await axios.get(`${BASE}/manga`, {
    params: {
      title: query,
      limit: 24,
      "includes[]": ["cover_art"],
      "contentRating[]": ["safe", "suggestive"],
    },
  });
  return data.data.map((m) => ({
    id: m.id,
    title: extractTitle(m.attributes),
    cover: extractCover(m),
    status: m.attributes.status,
    year: m.attributes.year,
  }));
}

export async function getMangaDetails(id) {
  const { data } = await axios.get(`${BASE}/manga/${id}`, {
    params: { "includes[]": ["cover_art", "author", "artist"] },
  });
  const m = data.data;
  const author = m.relationships?.find((r) => r.type === "author");
  return {
    id: m.id,
    title: extractTitle(m.attributes),
    description: m.attributes.description?.en || "",
    cover: extractCover(m),
    status: m.attributes.status,
    year: m.attributes.year,
    author: author?.attributes?.name || "Unknown",
    tags: m.attributes.tags?.map((t) => t.attributes.name.en) || [],
  };
}

export async function getMangaChapters(id, offset = 0) {
  const { data } = await axios.get(`${BASE}/manga/${id}/feed`, {
    params: {
      limit: 50,
      offset,
      "translatedLanguage[]": ["en"],
      order: { chapter: "asc" },
    },
  });
  return {
    items: data.data.map((ch) => ({
      id: ch.id,
      chapter: ch.attributes.chapter || "?",
      title: ch.attributes.title || `Chapter ${ch.attributes.chapter || "?"}`,
      pages: ch.attributes.pages,
    })),
    total: data.total,
  };
}

export async function getChapterPages(chapterId) {
  const { data } = await axios.get(`${BASE}/at-home/server/${chapterId}`);
  const baseUrl = data.baseUrl;
  const hash = data.chapter.hash;
  return data.chapter.data.map((f) => `${baseUrl}/data/${hash}/${f}`);
}
