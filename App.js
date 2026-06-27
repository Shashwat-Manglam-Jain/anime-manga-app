import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, LogBox } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ErrorBoundary from "./src/components/ErrorBoundary";
import Navigation from "./src/navigation";
import { ThemeProvider } from "./src/utils/ThemeContext";

let SplashScreen = null;
try {
  SplashScreen = require("expo-splash-screen");
  SplashScreen.preventAutoHideAsync().catch(() => {});
} catch (e) {}

LogBox.ignoreLogs(["Non-serializable values"]);

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTimeout(() => setReady(true), 800);
  }, []);

  const onLayout = useCallback(() => {
    if (ready && SplashScreen) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <View style={styles.root} onLayout={onLayout}>
            <Navigation />
          </View>
        </ErrorBoundary>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
