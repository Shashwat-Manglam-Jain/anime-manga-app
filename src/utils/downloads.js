import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

const DOWNLOADS_KEY = "offline_downloads";
const DOWNLOAD_DIR = FileSystem.documentDirectory + "downloads/";

async function ensureDir() {
  const info = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
  if (!info.exists) await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, { intermediates: true });
}

function makeDownloadKey(item) {
  if (item.downloadKey) return item.downloadKey;
  const id = item.contentId || item.id;
  if (item.isAnime || item.type === "anime") return `anime-${id}-ep${item.episode || 1}`;
  if (item.contentType === "tv" || item.type === "tv") return `tv-${id}-S${item.season || 1}E${item.episode || 1}`;
  return `movie-${id}`;
}

export async function getDownloads() {
  const raw = await AsyncStorage.getItem(DOWNLOADS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function downloadEpisode(info) {
  await ensureDir();
  const key = makeDownloadKey(info);

  let localPoster = null;
  if (info.poster) {
    try {
      const ext = info.poster.includes(".png") ? ".png" : ".jpg";
      const filename = `${key.replace(/[^a-z0-9-]/gi, "_")}${ext}`;
      const localPath = DOWNLOAD_DIR + filename;
      const download = await FileSystem.downloadAsync(info.poster, localPath);
      localPoster = download.uri;
    } catch {
      localPoster = info.poster;
    }
  }

  const saved = {
    downloadKey: key,
    id: info.contentId || info.id,
    type: info.isAnime ? "anime" : info.contentType || info.type || "movie",
    title: info.title,
    poster: info.poster,
    localPoster,
    episode: info.episode || null,
    season: info.season || null,
    episodeLabel: info.episodeLabel || null,
    contentType: info.contentType || (info.isAnime ? "anime" : "movie"),
    isAnime: !!info.isAnime,
    totalEpisodes: info.totalEpisodes || null,
    totalSeasons: info.totalSeasons || null,
    seasonEpisodeCounts: info.seasonEpisodeCounts || null,
    streamUrl: info.streamUrl || null,
    downloadedAt: Date.now(),
  };

  const list = await getDownloads();
  const filtered = list.filter((d) => d.downloadKey !== key);
  const updated = [saved, ...filtered];
  await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(updated));
  return updated;
}

export async function downloadContent(item) {
  return downloadEpisode({
    contentId: item.id,
    type: item.type,
    contentType: item.type,
    title: item.title,
    poster: item.poster,
    isAnime: item.type === "anime",
  });
}

export async function removeDownload(idOrKey, type) {
  const list = await getDownloads();
  const item = list.find((d) => d.downloadKey === idOrKey || (d.id === idOrKey && d.type === type));
  if (item?.localPoster && item.localPoster.startsWith("file://")) {
    try { await FileSystem.deleteAsync(item.localPoster, { idempotent: true }); } catch {}
  }
  const updated = list.filter((d) => d.downloadKey !== (item?.downloadKey || idOrKey));
  await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(updated));
  return updated;
}

export async function isDownloaded(idOrKey, type) {
  const list = await getDownloads();
  return list.some((d) => d.downloadKey === idOrKey || (d.id === idOrKey && d.type === type));
}

export async function isEpisodeDownloaded(contentId, type, season, episode) {
  const key = makeDownloadKey({ contentId, type, contentType: type, isAnime: type === "anime", season, episode });
  const list = await getDownloads();
  return list.some((d) => d.downloadKey === key);
}
