import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../utils/ThemeContext";
import { RADIUS, SPACING } from "../utils/theme";

function ErrorFallback({ error, onReset }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.text }]}>Something went wrong</Text>
      <Text style={[styles.message, { color: colors.textMuted }]}>
        {error?.message || "Unknown error"}
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.accent }]}
        onPress={onReset}
      >
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

export default class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          onReset={() => this.setState({ hasError: false, error: null })}
        />
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: SPACING.md,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
