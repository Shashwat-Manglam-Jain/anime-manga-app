import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function App() {
  return (
    <View style={styles.root}>
      <Text style={styles.text}>SmjStreamz Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0a0a0f", justifyContent: "center", alignItems: "center" },
  text: { color: "#fff", fontSize: 24 },
});
