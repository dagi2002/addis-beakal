import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";

import { Screen } from "@mobile/src/components/screen";
import { fonts, gradients, palette } from "@mobile/src/theme/tokens";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children
}: AuthShellProps) {
  return (
    <Screen contentContainerStyle={styles.content}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        <LinearGradient colors={gradients.darkHero} style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Ionicons color={palette.goldSoft} name="sparkles" size={14} />
            <Text style={styles.heroBadgeText}>{eyebrow}</Text>
          </View>
          <Text style={styles.heroTitle}>{title}</Text>
          <Text style={styles.heroSubtitle}>{subtitle}</Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Saved</Text>
              <Text style={styles.heroStatValue}>Synced later</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Reviews</Text>
              <Text style={styles.heroStatValue}>Local trust</Text>
            </View>
          </View>
        </LinearGradient>
        <View style={styles.formCard}>{children}</View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 48
  },
  keyboard: {
    gap: 18
  },
  heroCard: {
    borderRadius: 34,
    padding: 24,
    gap: 16
  },
  heroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  heroBadgeText: {
    color: "rgba(255,255,255,0.84)",
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.8,
    textTransform: "uppercase"
  },
  heroTitle: {
    color: palette.white,
    fontFamily: fonts.heading,
    fontSize: 42,
    lineHeight: 41
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.86)",
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 24
  },
  heroStats: {
    flexDirection: "row",
    gap: 12
  },
  heroStat: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 16,
    gap: 6
  },
  heroStatLabel: {
    color: "rgba(255,255,255,0.68)",
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.8,
    textTransform: "uppercase"
  },
  heroStatValue: {
    color: palette.white,
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: "600"
  },
  formCard: {
    borderRadius: 34,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "rgba(255, 252, 247, 0.96)",
    padding: 22,
    gap: 16,
    shadowColor: "#412d1c",
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4
  }
});
