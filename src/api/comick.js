const COMICK_API = "https://comick.art/api";

function comickCoverUrl(key) {
  if (!key) return null;
  if (key.startsWith("http")) return key;
  return `https://meo.comick.pictures/${key}`;
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

function stripHtml(html) {
  if (!html || typeof html !== "string") return null;
  return html.replace(/<[^>]*>/g, "").trim() || null;
}

export async function browseComics(page = 1) {
  const res = await fetch(`${COMICK_API}/v1.0/search?page=${page}&limit=30&type=comic&t=false`);
  if (!res.ok) throw new Error("ComicK browse failed");
  const data = await res.json();
  const items = (Array.isArray(data) ? data : data.data || []).map((c) => ({
    id: c.slug || c.hid,
    title: c.title || c.slug || "Untitled",
    cover: comickCoverUrl(c.md_covers?.[0]?.b2key),
    status: comickStatus(c.status),
  }));
  return items;
}

export async function searchComics(query) {
  const res = await fetch(`${COMICK_API}/v1.0/search?q=${encodeURIComponent(query)}&limit=30&t=false`);
  if (!res.ok) throw new Error("ComicK search failed");
  const data = await res.json();
  const list = Array.isArray(data) ? data : data.data || [];
  return list.map((c) => ({
    id: c.slug || c.hid,
    title: c.title || c.slug || "Untitled",
    cover: comickCoverUrl(c.md_covers?.[0]?.b2key),
    status: comickStatus(c.status),
  }));
}

export async function getComicInfo(slug) {
  const res = await fetch(`${COMICK_API}/comic/${slug}`);
  if (!res.ok) throw new Error("ComicK info failed");
  const data = await res.json();
  const comic = data.comic || data;

  return {
    id: comic.slug || slug,
    title: comic.title || slug,
    cover: comickCoverUrl(comic.md_covers?.[0]?.b2key),
    description: stripHtml(comic.parsed || comic.desc),
    genres: (comic.md_comic_md_genres || []).map((g) => g.md_genres?.name).filter(Boolean),
    status: comickStatus(comic.status),
    authors: (comic.md_comic_md_authors || []).map((a) => a.md_authors?.name).filter(Boolean),
    year: comic.year,
    lastChapter: comic.last_chapter,
  };
}

export async function getComicChapters(slug, page = 1) {
  const res = await fetch(`${COMICK_API}/comic/${slug}/chapters?page=${page}&lang=en`);
  if (!res.ok) throw new Error("ComicK chapters failed");
  const data = await res.json();
  const chapters = (data.chapters || []).map((ch) => ({
    id: ch.hid,
    chapterNumber: ch.chap,
    title: ch.title || null,
    volume: ch.vol,
    date: ch.created_at,
    slug: slug,
  }));
  const hasMore = data.total ? page * 50 < data.total : chapters.length >= 50;
  return { chapters, hasMore };
}

export async function readComicChapter(hid) {
  const res = await fetch(`${COMICK_API}/chapter/${hid}`);
  if (!res.ok) throw new Error("ComicK reader failed");
  const data = await res.json();
  const images = data.chapter?.md_images || [];
  return images.map((img, i) => {
    let url = img.b2key;
    if (url && !url.startsWith("http")) {
      url = `https://meo.comick.pictures/${url}`;
    }
    return { img: url, page: i };
  });
}
