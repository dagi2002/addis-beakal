import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import type { BusinessCardData } from "@/features/businesses/types";
import { useAppState } from "@mobile/src/providers/app-provider";
import { fonts, palette } from "@mobile/src/theme/tokens";
import { formatRating } from "@mobile/src/lib/format";

type BusinessCardProps = {
  business: BusinessCardData;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function BusinessCard({
  business,
  compact = false,
  style
}: BusinessCardProps) {
  const router = useRouter();
  const { toggleSaved } = useAppState();

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/business/[slug]",
          params: { slug: business.slug }
        })
      }
      style={[styles.card, compact ? styles.compactCard : null, style]}
    >
      <LinearGradient
        colors={[business.coverFrom, business.coverTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.cover, compact ? styles.compactCover : null]}
      >
        <View style={styles.coverShade} />
        <View style={styles.coverTopRow}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillText}>{business.category}</Text>
          </View>
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              toggleSaved(business.id);
            }}
            style={styles.saveButton}
          >
            <Ionicons
              color={business.isSaved ? palette.accentStrong : palette.mutedStrong}
              name={business.isSaved ? "bookmark" : "bookmark-outline"}
              size={18}
            />
          </Pressable>
        </View>
        <View style={styles.coverBottom}>
          <Text style={styles.neighborhoodLabel}>{business.neighborhood}</Text>
          <View style={styles.ratingRow}>
            <Ionicons color={palette.gold} name="star" size={14} />
            <Text style={styles.ratingText}>{formatRating(business.rating)}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.title}>{business.name}</Text>
          <Text style={styles.priceTier}>{business.priceTier}</Text>
        </View>
        <Text numberOfLines={compact ? 2 : 3} style={styles.description}>
          {business.shortDescription}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaCopy}>{business.reviewCount} reviews</Text>
          <Text style={styles.metaCopy}>{business.saveCount} saves</Text>
        </View>
        <View style={styles.tagsRow}>
          {business.tags.slice(0, compact ? 2 : 3).map((tag) => (
            <View key={tag} style={styles.tagPill}>
              <Text numberOfLines={1} style={styles.tagText}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderRadius: 28,
    backgroundColor: "rgba(255, 252, 247, 0.94)",
    borderWidth: 1,
    borderColor: palette.line,
    shadowColor: "#412d1c",
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4
  },
  compactCard: {
    width: 288
  },
  cover: {
    height: 184,
    padding: 16,
    justifyContent: "space-between"
  },
  compactCover: {
    height: 164
  },
  coverShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(27, 16, 9, 0.16)"
  },
  coverTopRow: {
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  categoryPill: {
    borderRadius: 999,
    backgroundColor: "rgba(255, 248, 239, 0.92)",
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  categoryPillText: {
    color: palette.accentStrong,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.8,
    textTransform: "uppercase"
  },
  saveButton: {
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "rgba(255, 248, 239, 0.92)"
  },
  coverBottom: {
    zIndex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12
  },
  neighborhoodLabel: {
    flex: 1,
    color: palette.white,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.6,
    textTransform: "uppercase"
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: "rgba(27, 16, 9, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  ratingText: {
    color: palette.white,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: "700"
  },
  body: {
    gap: 12,
    padding: 18
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12
  },
  title: {
    flex: 1,
    color: palette.inkStrong,
    fontFamily: fonts.heading,
    fontSize: 28,
    lineHeight: 28
  },
  priceTier: {
    color: palette.moss,
    backgroundColor: "rgba(54, 88, 71, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: "700"
  },
  description: {
    color: palette.muted,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22
  },
  metaRow: {
    flexDirection: "row",
    gap: 14
  },
  metaCopy: {
    color: palette.mutedStrong,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: "600"
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  tagPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.cream,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  tagText: {
    color: palette.mutedStrong,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    maxWidth: 120,
    textTransform: "uppercase"
  }
});
