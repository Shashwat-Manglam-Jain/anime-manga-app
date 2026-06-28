// Strategy: NovelFire (primary) → FreeWebNovel (fallback) → NovelBin (fallback)
// In-memory cache to avoid re-fetching same data

const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function cacheGet(key) {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.ts > CACHE_TTL) { cache.delete(key); return undefined; }
  return entry.data;
}

function cacheSet(key, data) {
  if (cache.size > 500) {
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
  }
  cache.set(key, { data, ts: Date.now() });
}

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
  const res = await fetch(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const data = await res.json();
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
  const key = `popular_${page}`;
  const cached = cacheGet(key);
  if (cached) return cached;
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
  const result = {
    items: (data.Page.media || []).map(normalize),
    hasNext: data.Page.pageInfo.hasNextPage,
  };
  cacheSet(key, result);
  return result;
}

export async function searchNovels(query) {
  const key = `search_al_${query}`;
  const cached = cacheGet(key);
  if (cached) return cached;
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
  const result = (data.Page.media || []).map(normalize);
  cacheSet(key, result);
  return result;
}

export async function getNovelInfo(id) {
  const key = `info_al_${id}`;
  const cached = cacheGet(key);
  if (cached) return cached;
  const data = await anilistQuery(
    `query ($id: Int) {
      Media(id: $id, type: MANGA, format: NOVEL) {
        ${MEDIA_FIELDS}
      }
    }`,
    { id: Number(id) }
  );
  const result = data.Media ? normalize(data.Media) : null;
  if (result) cacheSet(key, result);
  return result;
}

// ── Shared helpers ──────────────────────────────────────────────────

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function decodeEntities(text) {
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#x27;/g, "'");
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&#8220;/g, "“");
  text = text.replace(/&#8221;/g, "”");
  text = text.replace(/&#8216;/g, "‘");
  text = text.replace(/&#8217;/g, "’");
  text = text.replace(/&#8211;/g, "–");
  text = text.replace(/&#8212;/g, "—");
  text = text.replace(/&#8230;/g, "…");
  text = text.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
  text = text.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  return text;
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, "").trim();
}

function cleanWatermarks(text) {
  text = text.replace(/visit\s+novel\w*[.\w]*\s+for\s+(?:the\s+)?(?:latest\s+)?updates?[.!]?/gi, "");
  text = text.replace(/read\s+(?:the\s+)?latest\s+(?:chapter|chapters)\s+at\s+[\w.]+[.!]?/gi, "");
  text = text.replace(/(?:please\s+)?(?:visit|check\s+out|go\s+to)\s+(?:novel|free)\w*[.\w]*[^.\n]*[.!]?/gi, "");
  text = text.replace(/this\s+(?:chapter|novel|content)\s+(?:is\s+)?(?:uploaded|updated|available|taken|made)\s+(?:by|at|on|from)\s+[\w.]+[.!]?/gi, "");
  text = text.replace(/(?:search|find)\s+["'\w]*novel\w*["'\w]*\s+[^.\n]*[.!]?/gi, "");
  text = text.replace(/source\s*:\s*[\w.]+/gi, "");
  return text;
}

function htmlToText(html) {
  let text = html;
  text = text.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<\/p>/gi, "\n\n");
  text = text.replace(/<[^>]+>/g, "");
  text = decodeEntities(text);
  text = cleanWatermarks(text);
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.replace(/[ \t]+$/gm, "");
  return text.trim();
}

async function fetchWithTimeout(url, headers = {}, timeout = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, ...headers },
      redirect: "follow",
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    const text = await res.text();
    if (text.includes("Just a moment") && text.includes("challenge")) {
      throw new Error("Cloudflare challenge");
    }
    return text;
  } finally {
    clearTimeout(timer);
  }
}

// ═══════════════════════════════════════════════════════════════════
// Strategy 1: NovelFire (primary)
// ═══════════════════════════════════════════════════════════════════

const NF_BASE = "https://novelfire.net";

async function nfSearch(query) {
  const html = await fetchWithTimeout(
    `${NF_BASE}/search?keyword=${encodeURIComponent(query)}`
  );
  const results = [];
  let match;

  const itemRegex = /<a[^>]*title="([^"]+)"[^>]*href="\/book\/([^"]+)"/gi;
  while ((match = itemRegex.exec(html)) !== null) {
    const title = match[1].trim();
    const slug = match[2];
    if (results.some((r) => r.id === slug)) continue;
    results.push({
      id: slug,
      title,
      image: `${NF_BASE}/server-1/${slug}.jpg`,
    });
  }

  if (results.length === 0) {
    const slug = query.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    try {
      const pageHtml = await fetchWithTimeout(`${NF_BASE}/book/${slug}`);
      const titleMatch = pageHtml.match(/<h1[^>]*>([^<]+)<\/h1>/);
      if (titleMatch) {
        results.push({ id: slug, title: stripHtml(titleMatch[1]), image: `${NF_BASE}/server-1/${slug}.jpg` });
      }
    } catch {}
  }

  return results;
}

async function nfGetChapters(slug) {
  const html = await fetchWithTimeout(`${NF_BASE}/book/${slug}/chapters`);
  const chapters = [];
  let match;

  const chapterRegex = /<a[^>]*href="\/book\/[^"]*\/(chapter-\d+[^"]*)"[^>]*title="([^"]*)"/gi;
  while ((match = chapterRegex.exec(html)) !== null) {
    const chPath = match[1];
    const title = match[2].trim() || chPath.replace(/-/g, " ");
    const chId = `${slug}/${chPath}`;
    if (chapters.some((c) => c.id === chId)) continue;
    chapters.push({ id: chId, title, url: chId, source: "novelfire" });
  }

  if (chapters.length === 0) {
    const altRegex = /href="\/book\/[^"]*\/(chapter-\d+)"[^>]*>[\s\S]*?<strong[^>]*>([^<]*)/gi;
    while ((match = altRegex.exec(html)) !== null) {
      const chPath = match[1];
      const title = match[2].trim() || chPath.replace(/-/g, " ");
      const chId = `${slug}/${chPath}`;
      if (chapters.some((c) => c.id === chId)) continue;
      chapters.push({ id: chId, title, url: chId, source: "novelfire" });
    }
  }

  chapters.sort((a, b) => {
    const numA = parseInt(a.id.match(/chapter-(\d+)/)?.[1] || "0", 10);
    const numB = parseInt(b.id.match(/chapter-(\d+)/)?.[1] || "0", 10);
    return numA - numB;
  });

  return chapters;
}

async function nfReadChapter(chapterId) {
  const html = await fetchWithTimeout(`${NF_BASE}/book/${chapterId}`);

  const h4Match = html.match(/<h4[^>]*>([^<]+)<\/h4>/);

  // Extract content from d-chapter-content using depth tracking
  let rawContent = null;
  const idx = html.indexOf("d-chapter-content");
  if (idx !== -1) {
    const startIdx = html.indexOf(">", idx) + 1;
    let depth = 1;
    let i = startIdx;
    while (i < html.length && depth > 0) {
      if (html[i] === "<") {
        if (html.substring(i, i + 4) === "<div") depth++;
        else if (html.substring(i, i + 6) === "</div>") {
          depth--;
          if (depth === 0) { rawContent = html.substring(startIdx, i); break; }
        }
      }
      i++;
    }
  }

  if (!rawContent) return { title: "Chapter", content: "Content not available.", prevChapter: null, nextChapter: null, source: "novelfire" };

  // Remove ad divs and scripts
  rawContent = rawContent.replace(/<div class="nf-ads[\s\S]*?<\/div>/gi, "");
  rawContent = rawContent.replace(/<div class="text-center[\s\S]*?<\/div>/gi, "");

  const text = htmlToText(rawContent);

  // Nav links: class="button prevchap" / class="button nextchap"
  const prevMatch = html.match(/class="[^"]*prevchap[^"]*"\s*href="\/book\/([^"]+)"/i)
    || html.match(/class="[^"]*prev[^"]*"\s*href="\/book\/([^"]+)"/i);
  const nextMatch = html.match(/class="[^"]*nextchap[^"]*"\s*href="\/book\/([^"]+)"/i)
    || html.match(/class="[^"]*next[^"]*"\s*href="\/book\/([^"]+)"/i);

  const prevChapter = prevMatch ? prevMatch[1] : null;
  const nextChapter = nextMatch ? nextMatch[1] : null;

  const chTitle = h4Match?.[1]?.trim()
    || html.match(/<title>([^<]+)/)?.[1]?.replace(/ - NovelFire.*/, "").trim()
    || "Chapter";

  return {
    title: chTitle,
    content: text,
    prevChapter: prevChapter && !prevChapter.includes("javascript") ? prevChapter : null,
    nextChapter: nextChapter && !nextChapter.includes("javascript") ? nextChapter : null,
    source: "novelfire",
  };
}

// ═══════════════════════════════════════════════════════════════════
// Strategy 2: FreeWebNovel (fallback)
// ═══════════════════════════════════════════════════════════════════

const FWN_BASE = "https://freewebnovel.com";

async function fwnSearch(query) {
  const html = await fetchWithTimeout(
    `${FWN_BASE}/search/?searchkey=${encodeURIComponent(query)}`,
    { "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9", "Accept-Language": "en-US,en;q=0.5" },
    15000
  );
  const results = [];
  let match;

  const itemRegex = /<li>[\s\S]*?<a[^>]*href="\/novel\/([^"]+)"[\s\S]*?(?:<img[^>]*src="([^"]*)")?[\s\S]*?class="tit"><a[^>]*title="([^"]+)"/gi;
  while ((match = itemRegex.exec(html)) !== null) {
    const slug = match[1];
    const img = match[2] || null;
    const title = match[3].trim();
    if (results.some((r) => r.id === slug)) continue;
    results.push({
      id: slug,
      title,
      image: img ? (img.startsWith("http") ? img : `${FWN_BASE}${img}`) : null,
    });
  }

  if (results.length === 0) {
    const altRegex = /<h3 class="tit"><a[^>]*href="\/novel\/([^"]+)"[^>]*title="([^"]+)"/gi;
    while ((match = altRegex.exec(html)) !== null) {
      const slug = match[1];
      const title = match[2].trim();
      if (results.some((r) => r.id === slug)) continue;
      results.push({ id: slug, title, image: null });
    }
  }

  if (results.length === 0) {
    const slug = query.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    try {
      const pageHtml = await fetchWithTimeout(`${FWN_BASE}/novel/${slug}`);
      const titleMatch = pageHtml.match(/<h1[^>]*>([^<]+)<\/h1>/);
      if (titleMatch) {
        results.push({ id: slug, title: stripHtml(titleMatch[1]), image: null });
      }
    } catch {}
  }

  return results;
}

async function fwnGetChapters(slug) {
  const html = await fetchWithTimeout(`${FWN_BASE}/novel/${slug}`);
  const chapters = [];
  let match;

  const chapterRegex = /<a[^>]*href="\/novel\/[^"]*\/chapter-(\d+)"[^>]*title="([^"]*)"[^>]*class="con"[^>]*>[^<]*<\/a>/gi;
  while ((match = chapterRegex.exec(html)) !== null) {
    const num = match[1];
    const title = match[2].trim() || `Chapter ${num}`;
    const chId = `${slug}/chapter-${num}`;
    if (chapters.some((c) => c.id === chId)) continue;
    chapters.push({ id: chId, title, url: chId, source: "freewebnovel" });
  }

  if (chapters.length === 0) {
    const altRegex = /href="\/novel\/([^"]*chapter-\d+[^"]*)"[^>]*(?:title="([^"]*)"|>([^<]*))/gi;
    while ((match = altRegex.exec(html)) !== null) {
      const path = match[1];
      const title = (match[2] || match[3] || "").trim() || path.split("/").pop()?.replace(/-/g, " ") || "Chapter";
      const chId = path;
      if (chapters.some((c) => c.id === chId)) continue;
      chapters.push({ id: chId, title, url: chId, source: "freewebnovel" });
    }
  }

  const seen = new Set();
  const unique = chapters.filter((ch) => {
    if (seen.has(ch.id)) return false;
    seen.add(ch.id);
    return true;
  });
  unique.sort((a, b) => {
    const numA = parseInt(a.id.match(/chapter-(\d+)/)?.[1] || "0", 10);
    const numB = parseInt(b.id.match(/chapter-(\d+)/)?.[1] || "0", 10);
    return numA - numB;
  });

  return unique;
}

async function fwnReadChapter(chapterId) {
  const html = await fetchWithTimeout(`${FWN_BASE}/novel/${chapterId}`);

  const h4Match = html.match(/<h4>([^<]+)<\/h4>/);

  let rawContent = null;
  const txtIdx = html.indexOf('class="txt');
  if (txtIdx !== -1) {
    const startIdx = html.indexOf(">", txtIdx);
    if (startIdx !== -1) {
      let depth = 1;
      let i = startIdx + 1;
      while (i < html.length && depth > 0) {
        if (html[i] === "<") {
          if (html.substring(i, i + 4) === "<div") depth++;
          else if (html.substring(i, i + 6) === "</div>") {
            depth--;
            if (depth === 0) { rawContent = html.substring(startIdx + 1, i); break; }
          }
        }
        i++;
      }
    }
  }
  if (!rawContent) return { title: "Chapter", content: "Content not available.", prevChapter: null, nextChapter: null, source: "freewebnovel" };

  rawContent = rawContent.replace(/<div[^>]*>/gi, "");
  rawContent = rawContent.replace(/<\/div>/gi, "");
  rawContent = rawContent.replace(/<h4>[^<]*<\/h4>/gi, "");

  const text = htmlToText(rawContent);

  function extractNavSlug(pattern) {
    const m = html.match(pattern);
    if (!m) return null;
    const url = m[1];
    const pathMatch = url.match(/\/novel\/(.+)/);
    return pathMatch ? pathMatch[1] : null;
  }

  const prevChapter = extractNavSlug(/href="([^"]+)"[^>]*id="prev_url"/i)
    || extractNavSlug(/id="prev_url"[^>]*href="([^"]+)"/i);
  const nextChapter = extractNavSlug(/href="([^"]+)"[^>]*id="next_url"/i)
    || extractNavSlug(/id="next_url"[^>]*href="([^"]+)"/i);

  const chTitle = h4Match?.[1]?.trim()
    || html.match(/<title>([^<]+)/)?.[1]?.replace(/ - FreeWebNovel.*/, "").trim()
    || "Chapter";

  return {
    title: chTitle,
    content: text,
    prevChapter,
    nextChapter,
    source: "freewebnovel",
  };
}

// ═══════════════════════════════════════════════════════════════════
// Strategy 3: NovelBin (fallback)
// ═══════════════════════════════════════════════════════════════════

const NOVELBIN_BASES = ["https://novelbin.me", "https://novelbin.com", "https://novelbin.net"];
let activeNBBase = null;

async function nbFetchHTML(url, xhr = false) {
  const headers = { "User-Agent": UA };
  if (xhr) headers["X-Requested-With"] = "XMLHttpRequest";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, { headers, redirect: "follow", signal: controller.signal });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    const text = await res.text();
    if (text.includes("window.location.replace") || text.includes("Just a moment")) {
      throw new Error("JS challenge detected");
    }
    return text;
  } finally {
    clearTimeout(timer);
  }
}

async function nbFetchWithFallback(path, xhr = false) {
  if (activeNBBase) {
    try {
      return await nbFetchHTML(`${activeNBBase}${path}`, xhr);
    } catch {}
  }
  for (const base of NOVELBIN_BASES) {
    try {
      const html = await nbFetchHTML(`${base}${path}`, xhr);
      activeNBBase = base;
      return html;
    } catch {}
  }
  throw new Error("All NovelBin mirrors failed");
}

async function nbSearch(query) {
  const html = await nbFetchWithFallback(
    `/ajax/search-novel?keyword=${encodeURIComponent(query)}`,
    true
  );
  const results = [];
  let match;

  const itemRegex = /href="(?:https?:\/\/novelbin\.\w+)?\/novel-book\/([^"]+)"[^>]*class="list-group-item"[^>]*title="([^"]+)"/g;
  while ((match = itemRegex.exec(html)) !== null) {
    if (match[2].toLowerCase().includes("see more")) continue;
    if (results.some((r) => r.id === match[1])) continue;
    results.push({
      id: match[1],
      title: match[2].trim(),
      image: `https://images.novelbin.me/novel/${match[1]}.jpg`,
    });
  }

  if (results.length === 0) {
    const altRegex = /href="(?:https?:\/\/novelbin\.\w+)?\/novel-book\/([^"]+)"[^>]*title="([^"]+)"/g;
    while ((match = altRegex.exec(html)) !== null) {
      if (match[2].toLowerCase().includes("see more")) continue;
      if (results.some((r) => r.id === match[1])) continue;
      results.push({
        id: match[1],
        title: match[2].trim(),
        image: `https://images.novelbin.me/novel/${match[1]}.jpg`,
      });
    }
  }

  if (results.length === 0) {
    const broadRegex = /href="(?:https?:\/\/[^"]*)?\/(?:novel-book|novel|book|b)\/([^"\/]+)"[^>]*(?:title="([^"]*)"|>([^<]*))/g;
    while ((match = broadRegex.exec(html)) !== null) {
      const slug = match[1];
      const title = (match[2] || match[3] || slug.replace(/-/g, " ")).trim();
      if (!title || title.toLowerCase().includes("see more")) continue;
      if (results.some((r) => r.id === slug)) continue;
      results.push({
        id: slug,
        title,
        image: `https://images.novelbin.me/novel/${slug}.jpg`,
      });
    }
  }

  return results;
}

async function nbGetNovelId(slug) {
  const html = await nbFetchWithFallback(`/novel-book/${slug}`);
  const m = html.match(/data-novel-id="([^"]+)"/)
    || html.match(/novelId\s*[:=]\s*["']?(\d+)["']?/)
    || html.match(/novel[_-]id\s*[:=]\s*["']?(\d+)["']?/)
    || html.match(/id="rating"\s+data-novel-id="([^"]+)"/)
    || html.match(/\/ajax\/chapter-archive\?novelId=([^"&]+)/)
    || html.match(/data-id="([^"]+)"/);
  return m ? m[1] : slug;
}

async function nbGetChapters(slug) {
  const novelId = await nbGetNovelId(slug);
  const html = await nbFetchWithFallback(
    `/ajax/chapter-archive?novelId=${novelId}`,
    true
  );
  const chapters = [];
  let match;

  const chapterRegex = /href="(?:https?:\/\/novelbin\.\w+)?\/(?:novel-book|b)\/([^"]+\/chapter[^"]*)"[^>]*(?:title="([^"]*)"|>([^<]*))/gi;
  while ((match = chapterRegex.exec(html)) !== null) {
    const chId = match[1];
    const chTitle = (match[2] || match[3] || "").trim()
      || chId.split("/").pop()?.replace(/-/g, " ") || "Chapter";
    if (chTitle.toLowerCase().includes("see more")) continue;
    if (chapters.some((c) => c.id === chId)) continue;
    chapters.push({ id: chId, title: chTitle, url: chId, source: "novelbin" });
  }

  if (chapters.length === 0) {
    const altRegex = /href="([^"]*chapter[^"]*)"[^>]*>([^<]*)/gi;
    while ((match = altRegex.exec(html)) !== null) {
      const url = match[1];
      const title = match[2].trim();
      if (!title || title.toLowerCase().includes("see more")) continue;
      const pathMatch = url.match(/\/(?:novel-book|b)\/(.+)/);
      const chId = pathMatch ? pathMatch[1] : url;
      if (chapters.some((c) => c.id === chId)) continue;
      chapters.push({ id: chId, title, url: chId, source: "novelbin" });
    }
  }

  return chapters;
}

async function nbReadChapter(chapterId) {
  const html = await nbFetchWithFallback(`/novel-book/${chapterId}`);

  const titleMatch = html.match(/<a[^>]*class="[^"]*chr-title[^"]*"[^>]*>([^<]+)/)
    || html.match(/<h2[^>]*>([^<]*chapter[^<]*)<\/h2>/i);

  const contentMatch = html.match(/id="chr-content"[^>]*>([\s\S]*?)<\/div>/);
  if (!contentMatch) return { title: "Chapter", content: "Content not available.", prevChapter: null, nextChapter: null, source: "novelbin" };

  const text = htmlToText(contentMatch[1]);

  function extractChapterSlug(pattern) {
    const m = html.match(pattern);
    if (!m) return null;
    const url = m[1];
    const comMatch = url.match(/novelbin\.com\/b\/([^"]+)/);
    if (comMatch) return comMatch[1];
    const meMatch = url.match(/novelbin\.\w+\/novel-book\/([^"]+)/);
    if (meMatch) return meMatch[1];
    const pathMatch = url.match(/\/(?:novel-book|b)\/([^"]+)/);
    if (pathMatch) return pathMatch[1];
    return url;
  }

  const prevChapter = extractChapterSlug(/class="[^"]*prev[^"]*"[^>]*href="([^"]+)"/i)
    || extractChapterSlug(/prev[^>]*href="([^"]*chapter[^"]*)"/i);
  const nextChapter = extractChapterSlug(/class="[^"]*next[^"]*"[^>]*href="([^"]+)"/i)
    || extractChapterSlug(/next[^>]*href="([^"]*chapter[^"]*)"/i);

  const chTitle = titleMatch?.[1]?.trim()
    || html.match(/class="[^"]*chr-text[^"]*"[^>]*>([^<]+)/)?.[1]?.trim()
    || html.match(/<title>([^#<]+)/)?.[1]?.trim()
    || "Chapter";

  return {
    title: chTitle,
    content: text,
    prevChapter,
    nextChapter,
    source: "novelbin",
  };
}

// ═══════════════════════════════════════════════════════════════════
// Exported functions — NovelFire → FreeWebNovel → NovelBin
// ═══════════════════════════════════════════════════════════════════

export async function searchNovelBin(query) {
  const key = `search_src_${query}`;
  const cached = cacheGet(key);
  if (cached) return cached;
  try {
    const results = await nfSearch(query);
    if (results.length > 0) { cacheSet(key, results); return results; }
  } catch {}
  try {
    const results = await fwnSearch(query);
    if (results.length > 0) { cacheSet(key, results); return results; }
  } catch {}
  try {
    const results = await nbSearch(query);
    if (results.length > 0) { cacheSet(key, results); return results; }
  } catch {}
  return [];
}

export async function getNovelBinChapters(slug) {
  const key = `chapters_${slug}`;
  const cached = cacheGet(key);
  if (cached) return cached;
  try {
    const chapters = await nfGetChapters(slug);
    if (chapters.length > 0) { cacheSet(key, chapters); return chapters; }
  } catch {}
  try {
    const chapters = await fwnGetChapters(slug);
    if (chapters.length > 0) { cacheSet(key, chapters); return chapters; }
  } catch {}
  try {
    const chapters = await nbGetChapters(slug);
    if (chapters.length > 0) { cacheSet(key, chapters); return chapters; }
  } catch {}
  return [];
}

export async function readNovelBinChapter(chapterId) {
  const key = `read_${chapterId}`;
  const cached = cacheGet(key);
  if (cached) return cached;
  try {
    const result = await nfReadChapter(chapterId);
    if (result.content && result.content !== "Content not available.") { cacheSet(key, result); return result; }
  } catch {}
  try {
    const result = await fwnReadChapter(chapterId);
    if (result.content && result.content !== "Content not available.") { cacheSet(key, result); return result; }
  } catch {}
  try {
    const result = await nbReadChapter(chapterId);
    if (result.content && result.content !== "Content not available.") { cacheSet(key, result); return result; }
  } catch {}
  return { title: "Chapter", content: "Content not available from any source.", prevChapter: null, nextChapter: null, source: null };
}
