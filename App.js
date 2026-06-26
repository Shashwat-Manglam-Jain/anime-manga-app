import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import ErrorBoundary from "./src/components/ErrorBoundary";
import Navigation from "./src/navigation";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        await new Promise((r) => setTimeout(r, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        setReady(true);
      }
    };
    prepare();
  }, []);

  const onLayout = useCallback(async () => {
    if (ready) {
      await SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <View style={styles.root} onLayout={onLayout}>
          <Navigation />
        </View>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0a0a0f" },
});
