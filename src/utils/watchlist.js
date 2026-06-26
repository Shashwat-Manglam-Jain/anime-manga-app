import AsyncStorage from "@react-native-async-storage/async-storage";

const WATCHLIST_KEY = "watchlist_v2";
const CONTINUE_KEY = "continue_watching";
const SERVER_KEY = "preferred_server";

// ── Watchlist ──

export async function getWatchlist() {
  const raw = await AsyncStorage.getItem(WATCHLIST_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function addToWatchlist(item) {
  const list = await getWatchlist();
  if (list.some((i) => i.id === item.id && i.type === item.type)) return list;
  const updated = [{ ...item, addedAt: Date.now() }, ...list];
  await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
  return updated;
}

export async function removeFromWatchlist(id, type) {
  const list = await getWatchlist();
  const updated = list.filter((i) => !(i.id === id && i.type === type));
  await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
  return updated;
}

export async function isInWatchlist(id, type) {
  const list = await getWatchlist();
  return list.some((i) => i.id === id && i.type === type);
}

// ── Continue Watching ──

export async function getContinueWatching() {
  const raw = await AsyncStorage.getItem(CONTINUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function updateContinueWatching(item) {
  const list = await getContinueWatching();
  const filtered = list.filter((i) => !(i.id === item.id && i.type === item.type));
  const updated = [{ ...item, lastWatchedAt: Date.now() }, ...filtered];
  if (updated.length > 50) updated.length = 50;
  await AsyncStorage.setItem(CONTINUE_KEY, JSON.stringify(updated));
  return updated;
}

export async function removeContinueWatching(id, type) {
  const list = await getContinueWatching();
  const updated = list.filter((i) => !(i.id === id && i.type === type));
  await AsyncStorage.setItem(CONTINUE_KEY, JSON.stringify(updated));
  return updated;
}

// ── Preferred Server ──

export async function getPreferredServer(type) {
  const raw = await AsyncStorage.getItem(SERVER_KEY);
  if (!raw) return null;
  const prefs = JSON.parse(raw);
  return prefs[type] || null;
}

export async function setPreferredServer(type, providerId) {
  const raw = await AsyncStorage.getItem(SERVER_KEY);
  const prefs = raw ? JSON.parse(raw) : {};
  prefs[type] = providerId;
  await AsyncStorage.setItem(SERVER_KEY, JSON.stringify(prefs));
}
