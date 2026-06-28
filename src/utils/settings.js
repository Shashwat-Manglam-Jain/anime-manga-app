import AsyncStorage from "@react-native-async-storage/async-storage";

const SETTINGS_KEY = "app_settings";

const DEFAULTS = {
  anime: true,
  movies: true,
  manga: true,
  comics: true,
  novels: true,
  autoplay: true,
  adBlock: true,
};

let cached = null;

export async function getSettings() {
  if (cached) return cached;
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  cached = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  return cached;
}

export async function updateSetting(key, value) {
  const settings = await getSettings();
  settings[key] = value;
  cached = settings;
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  return settings;
}

export async function resetSettings() {
  cached = { ...DEFAULTS };
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(cached));
  return cached;
}
