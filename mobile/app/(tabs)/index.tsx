import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { BusinessCard } from "@mobile/src/components/business-card";
import { Chip } from "@mobile/src/components/chip";
import { Screen } from "@mobile/src/components/screen";
import { SectionHeading } from "@mobile/src/components/section-heading";
import { getHomeScreenData } from "@mobile/src/data/catalog";
import { formatCompactNumber } from "@mobile/src/lib/format";
import { useAppState } from "@mobile/src/providers/app-provider";
import { fonts, gradients, palette } from "@mobile/src/theme/tokens";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  const router = useRouter();
  const { savedIds } = useAppState();
  const [query, setQuery] = useState("");
  const data = getHomeScreenData(savedIds);
  const heroBusiness = data.heroBusiness;

  return (
    <Screen>
      <LinearGradient colors={gradients.darkHero} style={styles.hero}>
        <View style={styles.heroBadge}>
          <Ionicons color={palette.goldSoft} name="sparkles" size={14} />
          <Text style={styles.heroBadgeText}>Addis discovery, reimagined</Text>
        </View>

        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>
            A richer way to find the places that make Addis feel alive.
          </Text>
          <Text style={styles.heroSubtitle}>
            Browse neighborhood favorites, polished destinations, and everyday essentials
            through a warmer city guide designed for mobile first.
          </Text>
        </View>

        <View style={styles.searchShell}>
          <Ionicons color={palette.accent} name="search" size={18} />
          <TextInput
            onChangeText={setQuery}
            onSubmitEditing={() =>
              router.push({
                pathname: "/explore",
                params: query.trim() ? { query: query.trim() } : {}
              })
            }
            placeholder="Search cafes, salons, clinics, bakeries..."
            placeholderTextColor={palette.muted}
            returnKeyType="search"
            style={styles.searchInput}
            value={query}
          />
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/explore",
                params: query.trim() ? { query: query.trim() } : {}
              })
            }
            style={styles.searchButton}
          >
            <Text style={styles.searchButtonText}>Go</Text>
          </Pressable>
        </View>

        {heroBusiness ? (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/business/[slug]",
                params: { slug: heroBusiness.slug }
              })
            }
            style={styles.heroSpotlight}
          >
            <View style={styles.heroSpotlightCopy}>
              <Text style={styles.heroSpotlightLabel}>Pulse</Text>
              <Text style={styles.heroSpotlightTitle}>{heroBusiness.name}</Text>
              <Text style={styles.heroSpotlightMeta}>
                {heroBusiness.category} · {heroBusiness.neighborhood}
              </Text>
            </View>
            <View style={styles.heroSpotlightRating}>
              <Ionicons color={palette.goldSoft} name="star" size={14} />
              <Text style={styles.heroSpotlightRatingText}>{heroBusiness.rating.toFixed(1)}</Text>
            </View>
          </Pressable>
        ) : null}
      </LinearGradient>

      <View style={styles.statsRow}>
        {[
          ["Places", formatCompactNumber(data.stats.businessCount)],
          ["Reviews", formatCompactNumber(data.stats.reviewCount)],
          ["Areas", formatCompactNumber(data.stats.neighborhoodCount)]
        ].map(([label, value]) => (
          <View key={label} style={styles.statCard}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionBlock}>
        <SectionHeading
          actionLabel="See all"
          eyebrow="Browse By Category"
          onPress={() => router.push("/explore")}
          title="What are you looking for?"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoryRow}>
            {data.categoryCards.map((category) => (
              <Pressable
                key={category.id}
                onPress={() =>
                  router.push({
                    pathname: "/explore",
                    params: { category: category.slug }
                  })
                }
                style={styles.categoryCard}
              >
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryDescription}>{category.description}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.sectionBlock}>
        <SectionHeading
          actionLabel="Explore"
          eyebrow="Curated For Addis"
          onPress={() => router.push("/explore")}
          title="Find exactly what you need"
        />
        <View style={styles.featureRow}>
          {data.curatedFeatures.map((feature) => (
            <Chip
              key={feature.value}
              label={feature.label}
              onPress={() =>
                router.push({
                  pathname: "/explore",
                  params: { query: feature.value }
                })
              }
            />
          ))}
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <SectionHeading
          actionLabel="View all"
          eyebrow="Popular Right Now"
          onPress={() => router.push("/explore")}
          title="Trending in Addis"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.horizontalCardRow}>
            {data.pulseBusinesses.map((business) => (
              <BusinessCard key={business.id} business={business} compact />
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.sectionBlock}>
        <SectionHeading eyebrow="Top Rated" title="When quality matters more than novelty" />
        <View style={styles.cardStack}>
          {data.topRatedBusinesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </View>
      </View>

      <LinearGradient colors={gradients.darkHero} style={styles.reviewPanel}>
        <SectionHeading
          eyebrow="Recent Local Signal"
          inverse
          title="Discovery should feel like city knowledge"
        />
        <View style={styles.reviewList}>
          {data.recentReviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <Text style={styles.reviewBusiness}>{review.businessName}</Text>
              <Text style={styles.reviewTitle}>{review.title}</Text>
              <Text numberOfLines={3} style={styles.reviewBody}>
                {review.body}
              </Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 34,
    padding: 22,
    gap: 18
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
  heroCopy: {
    gap: 10
  },
  heroTitle: {
    color: palette.white,
    fontFamily: fonts.heading,
    fontSize: 44,
    lineHeight: 42
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.88)",
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 24
  },
  searchShell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 24,
    backgroundColor: "rgba(255, 247, 239, 0.96)",
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  searchInput: {
    flex: 1,
    color: palette.inkStrong,
    fontFamily: fonts.body,
    fontSize: 14,
    paddingVertical: 8
  },
  searchButton: {
    borderRadius: 18,
    backgroundColor: palette.accent,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  searchButtonText: {
    color: palette.white,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: "700"
  },
  heroSpotlight: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.09)",
    padding: 16
  },
  heroSpotlightCopy: {
    flex: 1,
    gap: 5
  },
  heroSpotlightLabel: {
    color: palette.goldSoft,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.8,
    textTransform: "uppercase"
  },
  heroSpotlightTitle: {
    color: palette.white,
    fontFamily: fonts.heading,
    fontSize: 28,
    lineHeight: 28
  },
  heroSpotlightMeta: {
    color: "rgba(255,255,255,0.82)",
    fontFamily: fonts.body,
    fontSize: 13
  },
  heroSpotlightRating: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  heroSpotlightRatingText: {
    color: palette.white,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: "700"
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
    backgroundColor: "rgba(255, 251, 246, 0.88)",
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
  sectionBlock: {
    gap: 16
  },
  categoryRow: {
    flexDirection: "row",
    gap: 12,
    paddingRight: 20
  },
  categoryCard: {
    width: 168,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "rgba(255, 252, 247, 0.92)",
    padding: 16,
    gap: 10
  },
  categoryEmoji: {
    fontSize: 28
  },
  categoryName: {
    color: palette.inkStrong,
    fontFamily: fonts.body,
    fontSize: 18,
    fontWeight: "700"
  },
  categoryDescription: {
    color: palette.muted,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 20
  },
  featureRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  horizontalCardRow: {
    flexDirection: "row",
    gap: 14,
    paddingRight: 20
  },
  cardStack: {
    gap: 14
  },
  reviewPanel: {
    borderRadius: 34,
    padding: 22,
    gap: 16
  },
  reviewList: {
    gap: 12
  },
  reviewCard: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 16,
    gap: 8
  },
  reviewBusiness: {
    color: "rgba(255,255,255,0.68)",
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.8,
    textTransform: "uppercase"
  },
  reviewTitle: {
    color: palette.white,
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: "700"
  },
  reviewBody: {
    color: "rgba(255,255,255,0.86)",
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22
  }
});
