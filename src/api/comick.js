const COMICK_API = "https://comick.art/api";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function comickFetch(path) {
  const res = await fetch(`${COMICK_API}${path}`, {
    headers: { "User-Agent": UA },
  });
  if (!res.ok) throw new Error(`ComicK ${res.status}`);
  return res.json();
}

function comickStatus(status) {
  switch (status) {
    case 1: return "Ongoing";
    case 2: return "Completed";
    case 3: return "Cancelled";
    case 4: return "Hiatus";
    default: return "Unknown";
  }
}

function mapComic(c) {
  return {
    id: c.slug || c.hid,
    title: c.title || c.slug || "Untitled",
    cover: c.default_thumbnail || null,
    status: comickStatus(c.status),
  };
}

export async function browseComics(page = 1) {
  const data = await comickFetch(`/search?page=${page}&limit=30`);
  const list = data.data || (Array.isArray(data) ? data : []);
  return list.map(mapComic);
}

export async function searchComics(query) {
  const data = await comickFetch(`/search?q=${encodeURIComponent(query)}&limit=30`);
  const list = Array.isArray(data) ? data : data.data || [];
  return list.map(mapComic);
}

export async function getComicInfo(slug) {
  const searchData = await comickFetch(`/search?q=${encodeURIComponent(slug.replace(/-/g, " "))}&limit=10`);
  const list = Array.isArray(searchData) ? searchData : searchData.data || [];
  const comic = list.find((c) => c.slug === slug) || list[0];
  if (!comic) throw new Error("Comic not found");

  return {
    id: comic.slug || slug,
    title: comic.title || slug,
    cover: comic.default_thumbnail || null,
    description: comic.description || null,
    genres: [],
    status: comickStatus(comic.status),
    year: comic.year,
    lastChapter: comic.last_chapter,
  };
}

export async function getComicChapters(slug, page = 1) {
  const data = await comickFetch(`/comics/${slug}/chapter-list?page=${page}&lang=en`);
  const rawChapters = data.data || data.chapters || (Array.isArray(data) ? data : []);
  const chapters = rawChapters.map((ch) => ({
    id: ch.hid,
    chapterNumber: ch.chap,
    title: ch.title || null,
    volume: ch.vol,
    lang: ch.lang || "en",
    date: ch.created_at,
    slug: slug,
  }));
  const hasMore = data.pagination
    ? page < data.pagination.last_page
    : chapters.length >= 30;
  return { chapters, hasMore };
}

export async function readComicChapter(hid, slug, chap, lang = "en") {
  const chapterPath = `${hid}-chapter-${chap}-${lang}`;
  const data = await comickFetch(`/comics/${slug}/${chapterPath}`);
  const images = data.chapter?.images || data.chapter?.md_images || [];
  return images.map((im, i) => {
    let url = im.url || im.b2key || im.val || "";
    if (url && !url.startsWith("http")) {
      url = `https://meo.comick.pictures/${url}`;
    }
    return { img: url, page: i, w: im.w || 0, h: im.h || 0 };
  });
}
