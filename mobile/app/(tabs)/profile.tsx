import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@mobile/src/components/screen";
import { getProfileSnapshot } from "@mobile/src/data/catalog";
import { useAppState } from "@mobile/src/providers/app-provider";
import { fonts, gradients, palette } from "@mobile/src/theme/tokens";
import { LinearGradient } from "expo-linear-gradient";

export default function ProfileScreen() {
  const router = useRouter();
  const { logout, ready, savedIds, session } = useAppState();
  const snapshot = getProfileSnapshot(savedIds, session);

  if (!ready) {
    return (
      <Screen>
        <Text style={styles.loadingCopy}>Loading your mobile profile...</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <LinearGradient colors={gradients.darkHero} style={styles.hero}>
        <Text style={styles.heroEyebrow}>Profile</Text>
        <Text style={styles.heroTitle}>
          {session ? `Welcome back, ${session.displayName}.` : "Make the app feel like yours."}
        </Text>
        <Text style={styles.heroSubtitle}>
          {session
            ? "Your saved places and mobile-first preferences live here."
            : "Sign in to keep a local profile, save places, and carry your shortlist with you."}
        </Text>
      </LinearGradient>

      <View style={styles.statsRow}>
        {[
          ["Saved", String(snapshot.savedCount)],
          ["Places", String(snapshot.businessCount)],
          ["Reviews", String(snapshot.publishedReviewCount)]
        ].map(([label, value]) => (
          <View key={label} style={styles.statCard}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
          </View>
        ))}
      </View>

      {session ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Signed in as</Text>
          <Text style={styles.panelValue}>{session.email}</Text>
          <View style={styles.actionRow}>
            <Pressable onPress={() => router.push("/saved")} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Open saved places</Text>
            </Pressable>
            <Pressable onPress={() => void logout()} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Sign out</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Demo access</Text>
          <Text style={styles.panelCopy}>
            Member: demo@addisbeakal.test / demo12345{"\n"}
            Admin: admin@addisbeakal.test / admin12345
          </Text>
          <View style={styles.actionRow}>
            <Pressable onPress={() => router.push("/auth/login")} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Sign in</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/auth/signup")} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Create account</Text>
            </Pressable>
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingCopy: {
    color: palette.mutedStrong,
    fontFamily: fonts.body,
    fontSize: 15,
    paddingTop: 24
  },
  hero: {
    borderRadius: 34,
    padding: 24,
    gap: 10
  },
  heroEyebrow: {
    color: palette.goldSoft,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase"
  },
  heroTitle: {
    color: palette.white,
    fontFamily: fonts.heading,
    fontSize: 42,
    lineHeight: 40
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.86)",
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 24
  },
  statsRow: {
    flexDirection: "row",
    gap: 12
  },
  statCard: {
    flex: 1,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "rgba(255, 252, 247, 0.96)",
    padding: 16,
    alignItems: "center",
    gap: 6
  },
  statLabel: {
    color: palette.muted,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.8,
    textTransform: "uppercase"
  },
  statValue: {
    color: palette.inkStrong,
    fontFamily: fonts.heading,
    fontSize: 26
  },
  panel: {
    borderRadius: 30,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "rgba(255, 252, 247, 0.96)",
    padding: 22,
    gap: 10
  },
  panelTitle: {
    color: palette.inkStrong,
    fontFamily: fonts.heading,
    fontSize: 28,
    lineHeight: 28
  },
  panelValue: {
    color: palette.mutedStrong,
    fontFamily: fonts.body,
    fontSize: 15
  },
  panelCopy: {
    color: palette.mutedStrong,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 24
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingTop: 6
  },
  primaryButton: {
    borderRadius: 999,
    backgroundColor: palette.accentStrong,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  primaryButtonText: {
    color: palette.white,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: "700"
  },
  secondaryButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.cream,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  secondaryButtonText: {
    color: palette.inkStrong,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: "700"
  }
});
