import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { COLORS } from "../utils/theme";

export default function ScreenWrapper({ children, style }) {
  return (
    <SafeAreaView style={[styles.container, style]}>
      <StatusBar style="light" />
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
});
