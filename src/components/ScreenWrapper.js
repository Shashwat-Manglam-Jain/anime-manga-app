import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../utils/ThemeContext";

export default function ScreenWrapper({ children, style }) {
  const { colors, isDark } = useTheme();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }, style]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
