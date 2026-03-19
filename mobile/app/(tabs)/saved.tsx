import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { BusinessCard } from "@mobile/src/components/business-card";
import { Screen } from "@mobile/src/components/screen";
import { SectionHeading } from "@mobile/src/components/section-heading";
import { getSavedBusinesses } from "@mobile/src/data/catalog";
import { useAppState } from "@mobile/src/providers/app-provider";
import { fonts, palette } from "@mobile/src/theme/tokens";

export default function SavedScreen() {
  const router = useRouter();
  const { savedIds } = useAppState();
  const savedBusinesses = getSavedBusinesses(savedIds);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Saved</Text>
        <Text style={styles.title}>Keep the places you want to come back to.</Text>
      </View>

      {savedBusinesses.length ? (
        <View style={styles.stack}>
          <SectionHeading eyebrow="Your List" title={`${savedBusinesses.length} places saved`} />
          {savedBusinesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Nothing saved yet.</Text>
          <Text style={styles.emptyCopy}>
            Start bookmarking the places that feel worth a second visit, a meeting, or a proper recommendation.
          </Text>
          <Pressable onPress={() => router.push("/explore")} style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>Browse discovery</Text>
          </Pressable>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8
  },
  eyebrow: {
    color: palette.accent,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.2,
    textTransform: "uppercase"
  },
  title: {
    color: palette.inkStrong,
    fontFamily: fonts.heading,
    fontSize: 38,
    lineHeight: 38
  },
  stack: {
    gap: 16
  },
  emptyCard: {
    borderRadius: 34,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "rgba(255, 252, 247, 0.96)",
    padding: 24,
    gap: 14
  },
  emptyTitle: {
    color: palette.inkStrong,
    fontFamily: fonts.heading,
    fontSize: 30,
    lineHeight: 30
  },
  emptyCopy: {
    color: palette.muted,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 24
  },
  emptyButton: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: palette.accentStrong,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  emptyButtonText: {
    color: palette.white,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: "700"
  }
});
