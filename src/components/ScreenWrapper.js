import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../utils/ThemeContext";

export default function ScreenWrapper({ children, style, noSafeArea, edges }) {
  const { colors } = useTheme();
  if (noSafeArea) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }, style]}>
        <StatusBar style="light" translucent />
        {children}
      </View>
    );
  }
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.bg }, style]}
      edges={edges || ["top", "left", "right", "bottom"]}
    >
      <StatusBar style="light" translucent />
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
