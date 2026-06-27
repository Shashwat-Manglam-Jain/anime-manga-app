import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DARK_COLORS, LIGHT_COLORS } from "./theme";

const THEME_KEY = "app_theme";
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((val) => {
      if (val === "light") setIsDark(false);
      setLoaded(true);
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(THEME_KEY, next ? "dark" : "light");
      return next;
    });
  }, []);

  const colors = useMemo(() => (isDark ? DARK_COLORS : LIGHT_COLORS), [isDark]);

  const value = useMemo(() => ({ isDark, colors, toggleTheme }), [isDark, colors, toggleTheme]);

  if (!loaded) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) return { isDark: true, colors: DARK_COLORS, toggleTheme: () => {} };
  return ctx;
}
