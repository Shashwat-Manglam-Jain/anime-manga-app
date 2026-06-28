import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "../components/ScreenWrapper";
import { MOVIE_PROVIDERS } from "../api/providers";
import { mapMalToTmdb } from "../api/jikan";
import {
  updateContinueWatching,
  getPreferredServer,
  setPreferredServer,
} from "../utils/watchlist";
import { downloadEpisode, isEpisodeDownloaded, removeDownload } from "../utils/downloads";
import { RADIUS, SPACING } from "../utils/theme";
import { useTheme } from "../utils/ThemeContext";

function buildStreamUrl(provider, contentType, tmdbId, season, episode) {
  try {
    if (contentType === "tv") return provider.buildTvUrl?.(tmdbId, season, episode) || "";
    return provider.buildMovieUrl?.(tmdbId) || "";
  } catch {
    return "";
  }
}

const AD_KEYWORDS = [
  "doubleclick","googlesyndication","googleadservices","adservice.google",
  "popads","popcash","propellerads","exoclick","exosrv","clickadu",
  "hilltopads","adnxs","adsrvr","taboola","outbrain","revcontent",
  "monetag","adsterra","onesignal","popunder","clickaine","admaven",
  "ad-maven","juicyads","trafficjunky","richpush","tsyndicate",
  "mgid","marketgid","bidvertiser","pubmatic","criteo","rubiconproject",
  "openx.net","smartadserver","smaato","serving-sys","casalemedia",
  "amazon-adsystem","media.net","moatads","doubleverify","adsafeprotected",
  "integralads","popunderjs","popmyads","onclickads","onclicktop",
  "revenuehits","adbooth","zedo","tradedoubler","valueclickmedia",
  "go.onclasrv","onclkds","shorte.st","adf.ly",
  "bongacams","chaturbate","livejasmin",
];

function isAdUrl(url) {
  if (!url) return false;
  try {
    const host = new URL(url).hostname;
    if (AD_KEYWORDS.some((kw) => host.includes(kw))) return true;
    const path = new URL(url).pathname + new URL(url).search;
    if (/[?&](ad|ads|click|track|pop|redirect)=/i.test(path)) return true;
    if (/^\/(ads?|pop|click|track|redirect)\//i.test(new URL(url).pathname)) return true;
  } catch {}
  return false;
}

// Runs BEFORE page content — blocks popups and ad globals only
const INJECT_BEFORE_LOAD = `(function(){
  window.open=function(){return null};
  window.popunder=undefined;window.pop=undefined;
  window.ExoLoader=undefined;window.ad_open=undefined;

  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition=function(s,e){if(e)e({code:1,message:'denied'})};
    navigator.geolocation.watchPosition=function(s,e){if(e)e({code:1,message:'denied'});return 0};
  }

  // Only block string-based eval in setTimeout (rare, used by old ad scripts)
  var _origST=window.setTimeout;
  var _origSI=window.setInterval;
  window.setTimeout=function(fn,delay){
    if(typeof fn==='string'&&/window\\.open|popunder|exoclick/i.test(fn))return 0;
    return _origST.apply(window,arguments);
  };
  window.setInterval=function(fn,delay){
    if(typeof fn==='string'&&/window\\.open|popunder|exoclick/i.test(fn))return 0;
    return _origSI.apply(window,arguments);
  };

  window.addEventListener('beforeunload',function(e){e.stopImmediatePropagation()},true);
  true;
})();`;

// Runs AFTER page loads — CSS hiding + remove ad iframes/scripts
const INJECT_AFTER_LOAD = `(function(){
  document.querySelectorAll('meta[http-equiv="refresh"]').forEach(function(m){m.remove()});

  var s=document.createElement('style');
  s.textContent=
    '[id*="ad-"],[id*="ads-"],[id*="ad_"],[class*="ad-container"],[class*="ad-wrap"],[class*="ad_wrap"],' +
    '[class*="banner-ad"],[class*="banner_ad"],[data-ad],[data-ads],' +
    '[class*="adsbygoogle"],[class*="adsterra"],[class*="monetag"],' +
    'a[target="_blank"][rel*="nofollow"],a[target="_blank"][rel*="sponsored"]' +
    '{display:none!important;pointer-events:none!important;' +
    'width:0!important;height:0!important;position:absolute!important;left:-9999px!important}';
  (document.head||document.documentElement).appendChild(s);

  var adRx=/doubleclick|googlesyndication|popads|popcash|propellerads|exoclick|clickadu|adsterra|monetag|onesignal|popunder|admaven|juicyads|mgid|tsyndicate|trafficjunky/i;
  function cleanAds(){
    document.querySelectorAll('iframe').forEach(function(f){
      var src=f.src||'';
      if(src&&adRx.test(src)&&!/player|stream|video|embed/i.test(src)){f.remove();}
    });
    document.querySelectorAll('script[src]').forEach(function(sc){
      if(adRx.test(sc.src)){sc.remove();}
    });
  }
  cleanAds();

  var obs=new MutationObserver(function(muts){
    muts.forEach(function(m){
      m.addedNodes.forEach(function(n){
        if(n.nodeType!==1)return;
        var tag=n.tagName;
        if(tag==='IFRAME'){
          var src=n.src||'';
          if(adRx.test(src)&&!/player|stream|video|embed/i.test(src)){n.remove();return;}
        }
        if(tag==='SCRIPT'&&n.src&&adRx.test(n.src)){n.remove();return;}
      });
    });
  });
  obs.observe(document.documentElement,{childList:true,subtree:true});

  true;
})();`;

export default function VideoPlayerScreen({ route, navigation }) {
  const { colors } = useTheme();
  const {
    title = "",
    poster,
    contentId,
    contentType = "movie",
    season,
    episode,
    totalEpisodes,
    totalSeasons,
    seasonEpisodeCounts,
    isAnime = false,
  } = route.params || {};

  const providers = MOVIE_PROVIDERS;
  const [providerIdx, setProviderIdx] = useState(0);
  const [currentSeason, setCurrentSeason] = useState(season || 1);
  const [currentEpisode, setCurrentEpisode] = useState(episode || 1);
  const [loading, setLoading] = useState(true);
  const [screenDims, setScreenDims] = useState(Dimensions.get("window"));
  const [episodeSaved, setEpisodeSaved] = useState(false);
  const [webViewKey, setWebViewKey] = useState(0);
  const [tmdbId, setTmdbId] = useState(isAnime ? null : contentId);
  const [animeSeason, setAnimeSeason] = useState(1);
  const [mappingError, setMappingError] = useState(false);
  const webViewRef = useRef(null);
  const initialLoadDone = useRef(false);
  const loadingTimer = useRef(null);
  const streamUrlRef = useRef("");
  const settledUrl = useRef("");
  const hijackCount = useRef(0);

  useEffect(() => {
    if (isAnime && contentId) {
      mapMalToTmdb(contentId).then((result) => {
        if (result) {
          setTmdbId(result.tmdbId);
          setAnimeSeason(result.season);
        } else {
          setMappingError(true);
          setLoading(false);
        }
      });
    }
  }, [contentId, isAnime]);

  useEffect(() => {
    isEpisodeDownloaded(contentId, isAnime ? "anime" : contentType, currentSeason, currentEpisode)
      .then(setEpisodeSaved).catch(() => {});
  }, [contentId, currentSeason, currentEpisode]);

  const toggleEpisodeDownload = async () => {
    const type = isAnime ? "anime" : contentType;
    if (episodeSaved) {
      const key = isAnime
        ? `anime-${contentId}-ep${currentEpisode}`
        : contentType === "tv"
          ? `tv-${contentId}-S${currentSeason}E${currentEpisode}`
          : `movie-${contentId}`;
      await removeDownload(key, type);
      setEpisodeSaved(false);
    } else {
      const epLabel = isAnime
        ? `Episode ${currentEpisode}`
        : (totalSeasons || 1) > 1
          ? `S${currentSeason} E${currentEpisode}`
          : contentType === "tv"
            ? `Episode ${currentEpisode}`
            : null;
      await downloadEpisode({
        contentId, title, poster,
        episode: currentEpisode, season: currentSeason,
        episodeLabel: epLabel, contentType, isAnime,
        totalEpisodes, totalSeasons, seasonEpisodeCounts,
        streamUrl: streamUrl,
      });
      setEpisodeSaved(true);
    }
  };

  useEffect(() => {
    const sub = Dimensions.addEventListener("change", ({ window }) => setScreenDims(window));
    return () => sub?.remove();
  }, []);

  const startLoadingWithTimeout = useCallback(() => {
    setLoading(true);
    initialLoadDone.current = false;
    settledUrl.current = "";
    hijackCount.current = 0;
    if (loadingTimer.current) clearTimeout(loadingTimer.current);
    loadingTimer.current = setTimeout(() => {
      setLoading(false);
      initialLoadDone.current = true;
    }, 6000);
  }, []);

  const finishLoading = useCallback(() => {
    setLoading(false);
    initialLoadDone.current = true;
    hijackCount.current = 0;
    if (loadingTimer.current) {
      clearTimeout(loadingTimer.current);
      loadingTimer.current = null;
    }
  }, []);

  useEffect(() => () => { if (loadingTimer.current) clearTimeout(loadingTimer.current); }, []);

  useEffect(() => {
    (async () => {
      try {
        const type = contentType === "tv" || isAnime ? "tv" : "movie";
        const pref = await getPreferredServer(type);
        if (pref) {
          const idx = providers.findIndex((p) => p.id === pref);
          if (idx >= 0) setProviderIdx(idx);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (contentId) {
      updateContinueWatching({
        id: contentId,
        type: contentType || (isAnime ? "anime" : "movie"),
        title, poster,
        episodeInfo: isAnime
          ? `Episode ${currentEpisode}`
          : totalSeasons > 1
            ? `S${currentSeason} E${currentEpisode}`
            : undefined,
      }).catch(() => {});
    }
  }, [currentEpisode, currentSeason]);

  const currentProvider = providers[providerIdx] || providers[0];
  const effectiveType = isAnime ? "tv" : contentType;
  const effectiveSeason = isAnime ? animeSeason : currentSeason;
  const streamUrl = tmdbId
    ? buildStreamUrl(currentProvider, effectiveType, tmdbId, effectiveSeason, currentEpisode)
    : "";
  streamUrlRef.current = streamUrl;

  const epsCount = seasonEpisodeCounts
    ? (seasonEpisodeCounts[currentSeason] || totalEpisodes || 24)
    : (totalEpisodes || 24);
  const seasonsCount = totalSeasons || 1;

  const reloadStream = () => {
    initialLoadDone.current = false;
    settledUrl.current = "";
    hijackCount.current = 0;
    startLoadingWithTimeout();
    setWebViewKey((k) => k + 1);
  };

  const handleProviderChange = async (idx) => {
    setProviderIdx(idx);
    reloadStream();
    try {
      await setPreferredServer(contentType === "tv" || isAnime ? "tv" : "movie", providers[idx].id);
    } catch {}
  };

  const handleSeasonChange = (s) => {
    setCurrentSeason(s);
    setCurrentEpisode(1);
    initialLoadDone.current = false;
    startLoadingWithTimeout();
  };

  const handleEpisodeChange = (ep) => {
    setCurrentEpisode(ep);
    initialLoadDone.current = false;
    startLoadingWithTimeout();
  };

  const getBaseDomain = (url) => {
    try {
      const parts = new URL(url).hostname.replace("www.", "").split(".");
      return parts.slice(-2).join(".");
    } catch {
      return "";
    }
  };

  // Network-level blocking — only block known ad domains
  const handleRequest = useCallback((request) => {
    const url = request.url || "";
    if (!url || url === "about:blank" || url.startsWith("blob:") || url.startsWith("data:")) return true;

    if (isAdUrl(url)) return false;

    // Allow everything else — the player needs to navigate freely
    return true;
  }, []);

  // Catch ad hijacks that redirect to a completely different domain
  const handleNavStateChange = useCallback((navState) => {
    const url = navState.url;
    if (!url) return;

    if (!initialLoadDone.current) {
      settledUrl.current = url;
      return;
    }

    if (url === settledUrl.current || url === streamUrlRef.current) return;
    if (url.startsWith("about:") || url.startsWith("blob:") || url.startsWith("data:")) return;

    // Same base domain is fine — player internal navigation
    const navDomain = getBaseDomain(url);
    const provDomain = getBaseDomain(streamUrlRef.current);
    const settledDomain = getBaseDomain(settledUrl.current);
    if (navDomain && (navDomain === provDomain || navDomain === settledDomain)) {
      settledUrl.current = url;
      return;
    }

    // Different domain — only block if it's a known ad domain
    if (isAdUrl(url)) {
      hijackCount.current++;
      webViewRef.current?.stopLoading();
      if (hijackCount.current >= 3) {
        hijackCount.current = 0;
        setWebViewKey((k) => k + 1);
      } else {
        const target = streamUrlRef.current;
        webViewRef.current?.injectJavaScript(`window.stop();window.location.href="${target}";true;`);
      }
      return;
    }

    // Unknown domain but not a known ad — allow it (could be CDN, video source, etc.)
    settledUrl.current = url;
  }, []);

  const playerWidth = screenDims.width;
  const playerHeight = Math.round(playerWidth * 9 / 16);

  return (
    <ScreenWrapper>
      <View style={[styles.header, { borderColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: SPACING.md }}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{title}</Text>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>
            {seasonsCount > 1 ? `S${currentSeason} E${currentEpisode}` : epsCount > 1 ? `Episode ${currentEpisode}` : title}
          </Text>
        </View>
        <TouchableOpacity onPress={reloadStream} hitSlop={8} style={{ marginRight: SPACING.md }}>
          <Ionicons name="reload" size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleEpisodeDownload} hitSlop={8}>
          <Ionicons
            name={episodeSaved ? "cloud-done" : "cloud-download-outline"}
            size={22}
            color={episodeSaved ? "#22c55e" : colors.text}
          />
        </TouchableOpacity>
      </View>

      <View style={[styles.playerWrap, { width: playerWidth, height: playerHeight }]}>
        {(loading || !tmdbId) && (
          <View style={styles.loadingOverlay} pointerEvents="none">
            {mappingError ? (
              <Text style={[styles.loadingText, { color: "#f87171" }]}>Could not find this anime</Text>
            ) : (
              <>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading...</Text>
              </>
            )}
          </View>
        )}
        {streamUrl ? (
          <WebView
            key={webViewKey}
            ref={webViewRef}
            source={{ uri: streamUrl }}
            style={styles.webview}
            originWhitelist={["*"]}
            allowsFullscreenVideo
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            domStorageEnabled
            javaScriptEnabled
            cacheEnabled
            cacheMode="LOAD_DEFAULT"
            injectedJavaScriptBeforeContentLoaded={INJECT_BEFORE_LOAD}
            injectedJavaScript={INJECT_AFTER_LOAD}
            injectedJavaScriptForMainFrameOnly
            scrollEnabled={false}
            bounces={false}
            overScrollMode="never"
            nestedScrollEnabled={false}
            setBuiltInZoomControls={false}
            setSupportMultipleWindows={false}
            javaScriptCanOpenWindowsAutomatically={false}
            allowsBackForwardNavigationGestures={false}
            thirdPartyCookiesEnabled
            incognito={false}
            geolocationEnabled={false}
            mixedContentMode="compatibility"
            androidLayerType="hardware"
            renderToHardwareTextureAndroid
            onLoadEnd={finishLoading}
            onLoadStart={() => { if (!initialLoadDone.current) startLoadingWithTimeout(); }}
            onError={finishLoading}
            onHttpError={finishLoading}
            onShouldStartLoadWithRequest={handleRequest}
            onNavigationStateChange={handleNavStateChange}
            onOpenWindow={() => false}
          />
        ) : null}
      </View>

      <ScrollView style={styles.controls} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Server</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.serverRow}>
          {providers.map((p, i) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.serverBtn, { backgroundColor: colors.card, borderColor: colors.border }, providerIdx === i && { backgroundColor: colors.accent, borderColor: colors.accent }]}
              onPress={() => handleProviderChange(i)}
            >
              <Text style={[styles.serverText, { color: colors.textSecondary }, providerIdx === i && { color: "#fff" }]}>{p.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {seasonsCount > 1 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Season</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.serverRow}>
              {Array.from({ length: seasonsCount }, (_, i) => i + 1).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.seasonBtn, { backgroundColor: colors.card, borderColor: colors.border }, currentSeason === s && { backgroundColor: colors.accent, borderColor: colors.accent }]}
                  onPress={() => handleSeasonChange(s)}
                >
                  <Text style={[styles.seasonText, { color: colors.textSecondary }, currentSeason === s && { color: "#fff" }]}>Season {s}</Text>
                  {seasonEpisodeCounts?.[s] ? (
                    <Text style={[styles.seasonEpCount, { color: colors.textMuted }, currentSeason === s && { color: "rgba(255,255,255,0.7)" }]}>
                      {seasonEpisodeCounts[s]} eps
                    </Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {epsCount > 1 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Episodes{seasonsCount > 1 ? ` — Season ${currentSeason}` : ""} ({epsCount})
            </Text>
            <View style={styles.epGrid}>
              {Array.from({ length: epsCount }, (_, i) => i + 1).map((ep) => (
                <TouchableOpacity
                  key={ep}
                  style={[styles.epBtn, { backgroundColor: colors.card, borderColor: colors.border }, currentEpisode === ep && { backgroundColor: colors.accent, borderColor: colors.accent }]}
                  onPress={() => handleEpisodeChange(ep)}
                >
                  <Text style={[styles.epText, { color: colors.textSecondary }, currentEpisode === ep && { color: "#fff" }]}>{ep}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.navRow}>
              {currentEpisode > 1 && (
                <TouchableOpacity
                  style={[styles.navBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => handleEpisodeChange(currentEpisode - 1)}
                >
                  <Ionicons name="play-skip-back" size={16} color={colors.text} />
                  <Text style={[styles.navText, { color: colors.text }]}>Prev</Text>
                </TouchableOpacity>
              )}
              <View style={{ flex: 1 }} />
              {currentEpisode < epsCount && (
                <TouchableOpacity
                  style={[styles.navBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => handleEpisodeChange(currentEpisode + 1)}
                >
                  <Text style={[styles.navText, { color: colors.text }]}>Next</Text>
                  <Ionicons name="play-skip-forward" size={16} color={colors.text} />
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 15, fontWeight: "700" },
  headerSub: { fontSize: 12 },
  playerWrap: {
    backgroundColor: "#000",
    overflow: "hidden",
  },
  webview: {
    flex: 1,
    backgroundColor: "#000",
    opacity: 0.99,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    zIndex: 10,
  },
  loadingText: { marginTop: SPACING.sm, fontSize: 13 },
  controls: { flex: 1, paddingHorizontal: SPACING.lg },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  serverRow: { gap: SPACING.sm },
  serverBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  serverText: { fontSize: 13, fontWeight: "600" },
  seasonBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: "center",
  },
  seasonText: { fontSize: 13, fontWeight: "600" },
  seasonEpCount: { fontSize: 10, marginTop: 2 },
  epGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.xs },
  epBtn: {
    width: 44,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  epText: { fontSize: 13, fontWeight: "600" },
  navRow: { flexDirection: "row", marginTop: SPACING.lg, gap: SPACING.md },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  navText: { fontSize: 13, fontWeight: "600" },
});
