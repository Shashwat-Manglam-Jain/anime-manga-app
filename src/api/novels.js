import axios from "axios";

const ANILIST_URL = "https://graphql.anilist.co";

const MEDIA_FIELDS = `
  id
  title { english romaji }
  description
  coverImage { large }
  status
  chapters
  genres
  averageScore
`;

async function anilistQuery(query, variables) {
  const { data } = await axios.post(ANILIST_URL, { query, variables });
  if (data.errors) throw new Error(data.errors[0]?.message || "AniList error");
  return data.data;
}

function normalize(media) {
  return {
    id: String(media.id),
    title: media.title.english || media.title.romaji || "Unknown",
    titleAlt: media.title.romaji !== media.title.english ? media.title.romaji : null,
    image: media.coverImage?.large || null,
    score: media.averageScore ? (media.averageScore / 10).toFixed(1) : null,
    chapters: media.chapters,
    status: media.status,
    description: media.description
      ? media.description.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "")
      : null,
    genres: media.genres || [],
  };
}

export async function getPopularNovels(page = 1) {
  const data = await anilistQuery(
    `query ($page: Int) {
      Page(page: $page, perPage: 24) {
        pageInfo { hasNextPage }
        media(type: MANGA, format: NOVEL, sort: POPULARITY_DESC) {
          ${MEDIA_FIELDS}
        }
      }
    }`,
    { page }
  );
  return {
    items: (data.Page.media || []).map(normalize),
    hasNext: data.Page.pageInfo.hasNextPage,
  };
}

export async function searchNovels(query) {
  const data = await anilistQuery(
    `query ($search: String) {
      Page(page: 1, perPage: 20) {
        media(search: $search, type: MANGA, format: NOVEL, sort: SEARCH_MATCH) {
          ${MEDIA_FIELDS}
        }
      }
    }`,
    { search: query }
  );
  return (data.Page.media || []).map(normalize);
}

export async function getNovelInfo(id) {
  const data = await anilistQuery(
    `query ($id: Int) {
      Media(id: $id, type: MANGA, format: NOVEL) {
        ${MEDIA_FIELDS}
      }
    }`,
    { id: Number(id) }
  );
  return data.Media ? normalize(data.Media) : null;
}

const NOVELBIN_BASE = "https://novelbin.me";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

async function fetchHTML(url, xhr = false) {
  const headers = { "User-Agent": UA };
  if (xhr) headers["X-Requested-With"] = "XMLHttpRequest";
  const { data } = await axios.get(url, { headers });
  return data;
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, "").trim();
}

export async function searchNovelBin(query) {
  const html = await fetchHTML(
    `${NOVELBIN_BASE}/ajax/search-novel?keyword=${encodeURIComponent(query)}`,
    true
  );
  const results = [];
  const matches = html.matchAll(
    /href="(?:https:\/\/novelbin\.me)?\/novel-book\/([^"]+)"[^>]*(?:class="list-group-item"[^>]*)?title="([^"]+)"/g
  );
  for (const m of matches) {
    if (m[2].toLowerCase().includes("see more")) continue;
    results.push({
      id: m[1],
      title: m[2].trim(),
      image: `https://images.novelbin.me/novel/${m[1]}.jpg`,
    });
  }
  return results;
}

export async function getNovelBinInfo(slug) {
  const html = await fetchHTML(`${NOVELBIN_BASE}/novel-book/${slug}`);
  const titleMatch = html.match(/<h3[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/h3>/);
  const descMatch = html.match(/class="desc-text"[^>]*>([\s\S]*?)<\/div>/);
  const authorMatch = html.match(/Author[^<]*<\/span>\s*<a[^>]*>([^<]+)/i);
  const statusMatch = html.match(/Status[^<]*<\/span>\s*<a[^>]*>([^<]+)/i);
  return {
    id: slug,
    title: titleMatch ? stripHtml(titleMatch[1]) : slug,
    description: descMatch ? stripHtml(descMatch[1]) : undefined,
    author: authorMatch ? authorMatch[1].trim() : undefined,
    status: statusMatch ? statusMatch[1].trim() : undefined,
  };
}

async function getNovelId(slug) {
  const html = await fetchHTML(`${NOVELBIN_BASE}/novel-book/${slug}`);
  const m = html.match(/data-novel-id="([^"]+)"/) || html.match(/novelId\s*[:=]\s*["']?(\d+)["']?/);
  return m ? m[1] : slug;
}

export async function getNovelBinChapters(slug) {
  const novelId = await getNovelId(slug);
  const html = await fetchHTML(
    `${NOVELBIN_BASE}/ajax/chapter-archive?novelId=${novelId}`,
    true
  );
  const chapters = [];
  const matches = html.matchAll(
    /href="(?:https?:\/\/novelbin\.\w+)?\/(?:novel-book|b)\/([^"]+\/chapter[^"]*)"[^>]*(?:title="([^"]*)"|>([^<]*))/g
  );
  for (const m of matches) {
    const title = (m[2] || m[3] || "").trim() || "Chapter";
    if (title.toLowerCase().includes("see more")) continue;
    chapters.push({ id: m[1], title, url: m[1] });
  }
  return chapters;
}

export async function readNovelBinChapter(chapterId) {
  const html = await fetchHTML(`${NOVELBIN_BASE}/novel-book/${chapterId}`);
  const titleMatch = html.match(/<a[^>]*class="[^"]*chr-title[^"]*"[^>]*>([^<]+)/);
  const contentMatch = html.match(/id="chr-content"[^>]*>([\s\S]*?)<\/div>/);
  if (!contentMatch) return { title: "Chapter", content: "Content not available.", prevChapter: null, nextChapter: null };

  let text = contentMatch[1];
  text = text.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/visit\s+novelbin[.\w]*\s+for\s+(?:the\s+)?(?:latest\s+)?updates?[.!]?/gi, "");
  text = text.replace(/read\s+(?:the\s+)?latest\s+chapters\s+at\s+[\w.]+[.!]?/gi, "");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<\/p>/gi, "\n\n");
  text = text.replace(/<[^>]+>/g, "");
  text = text.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  text = text.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
  text = text.replace(/\n{3,}/g, "\n\n").trim();

  const prevMatch = html.match(/class="[^"]*prev[^"]*"[^>]*href="[^"]*\/(?:novel-book|b)\/([^"]+)"/i);
  const nextMatch = html.match(/class="[^"]*next[^"]*"[^>]*href="[^"]*\/(?:novel-book|b)\/([^"]+)"/i);

  return {
    title: titleMatch?.[1]?.trim() || "Chapter",
    content: text,
    prevChapter: prevMatch?.[1] || null,
    nextChapter: nextMatch?.[1] || null,
  };
}
