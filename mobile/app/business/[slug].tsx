import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { BusinessCard } from "@mobile/src/components/business-card";
import { Chip } from "@mobile/src/components/chip";
import { Screen } from "@mobile/src/components/screen";
import { SectionHeading } from "@mobile/src/components/section-heading";
import { getBusinessDetailBySlug, getPriceTierSummary } from "@mobile/src/data/catalog";
import { formatReviewDate } from "@mobile/src/lib/format";
import { useAppState } from "@mobile/src/providers/app-provider";
import { fonts, palette } from "@mobile/src/theme/tokens";
import { LinearGradient } from "expo-linear-gradient";

export default function BusinessDetailScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const { savedIds, toggleSaved } = useAppState();
  const data = typeof slug === "string" ? getBusinessDetailBySlug(slug, savedIds) : null;

  if (!data) {
    return (
      <Screen>
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>We could not find that place.</Text>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go back</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.hero}>
        <Image contentFit="cover" source={{ uri: data.detail.heroImageUrl }} style={styles.heroImage} />
        <LinearGradient colors={["rgba(15,10,8,0.08)", "rgba(15,10,8,0.42)"]} style={styles.heroShade} />
        <View style={styles.heroTopRow}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons color={palette.white} name="arrow-back" size={18} />
          </Pressable>
          <Pressable onPress={() => toggleSaved(data.business.id)} style={styles.iconButton}>
            <Ionicons
              color={palette.white}
              name={data.business.isSaved ? "bookmark" : "bookmark-outline"}
              size={18}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.badgeRow}>
          <Chip active label={data.detail.category} />
          <Chip label={data.business.neighborhood} />
        </View>
        <Text style={styles.title}>{data.business.name}</Text>
        <Text style={styles.meta}>
          {data.business.rating.toFixed(1)} stars · {data.business.reviewCount} reviews ·{" "}
          {getPriceTierSummary(data.business.priceTier)}
        </Text>
        <Text style={styles.description}>{data.detail.longDescription}</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Open today</Text>
            <Text style={styles.infoValue}>{data.detail.openToday}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>{data.detail.address}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Saves</Text>
            <Text style={styles.infoValue}>{data.business.saveCount}</Text>
          </View>
        </View>
        <View style={styles.actionRow}>
          <Pressable
            onPress={() => {
              void Linking.openURL(data.detail.mapUrl);
            }}
            style={styles.primaryAction}
          >
            <Text style={styles.primaryActionText}>Open directions</Text>
          </Pressable>
          <Pressable onPress={() => toggleSaved(data.business.id)} style={styles.secondaryAction}>
            <Text style={styles.secondaryActionText}>
              {data.business.isSaved ? "Remove save" : "Save place"}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeading eyebrow="Highlights" title="Signals that shape the vibe" />
        <View style={styles.tagRow}>
          {data.detail.tags.map((tag) => (
            <Chip key={tag} label={tag} subtle />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeading eyebrow="Services" title="What people typically come here for" />
        <View style={styles.listPanel}>
          {data.detail.services.map((service) => (
            <View key={service.name} style={styles.serviceRow}>
              <View style={styles.serviceCopy}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
              </View>
              <Text style={styles.servicePrice}>{service.priceEtb} ETB</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeading eyebrow="Hours" title="Plan the visit" />
        <View style={styles.listPanel}>
          {data.detail.openingHours.map(([day, hours]) => (
            <View key={day} style={styles.hourRow}>
              <Text style={styles.hourDay}>{day}</Text>
              <Text style={styles.hourValue}>{hours}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeading eyebrow="Reviews" title="What locals are saying" />
        <View style={styles.reviewStack}>
          {data.reviews.length ? (
            data.reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewCopy}>
                    <Text style={styles.reviewAuthor}>{review.authorName}</Text>
                    <Text style={styles.reviewDate}>{formatReviewDate(review.createdAt)}</Text>
                  </View>
                  <Text style={styles.reviewRating}>{review.rating.toFixed(1)}</Text>
                </View>
                <Text style={styles.reviewTitle}>{review.title}</Text>
                <Text style={styles.reviewBody}>{review.body}</Text>
              </View>
            ))
          ) : (
            <View style={styles.listPanel}>
              <Text style={styles.emptyReview}>No published reviews yet.</Text>
            </View>
          )}
        </View>
      </View>

      {data.relatedBusinesses.length ? (
        <View style={styles.section}>
          <SectionHeading eyebrow="Related Places" title="Same category, same city energy" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.relatedRow}>
              {data.relatedBusinesses.map((business) => (
                <BusinessCard key={business.id} business={business} compact />
              ))}
            </View>
          </ScrollView>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    position: "relative",
    height: 260,
    overflow: "hidden",
    borderRadius: 34
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18
  },
  iconButton: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "rgba(20, 12, 8, 0.26)"
  },
  summaryCard: {
    marginTop: -42,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "rgba(255, 252, 247, 0.98)",
    padding: 22,
    gap: 14
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  title: {
    color: palette.inkStrong,
    fontFamily: fonts.heading,
    fontSize: 40,
    lineHeight: 38
  },
  meta: {
    color: palette.mutedStrong,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22
  },
  description: {
    color: palette.muted,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 24
  },
  infoGrid: {
    gap: 10
  },
  infoCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.cream,
    padding: 16,
    gap: 6
  },
  infoLabel: {
    color: palette.muted,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.8,
    textTransform: "uppercase"
  },
  infoValue: {
    color: palette.inkStrong,
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: "600"
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  primaryAction: {
    borderRadius: 999,
    backgroundColor: palette.accentStrong,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  primaryActionText: {
    color: palette.white,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: "700"
  },
  secondaryAction: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.white,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  secondaryActionText: {
    color: palette.inkStrong,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: "700"
  },
  section: {
    gap: 14
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  listPanel: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "rgba(255, 252, 247, 0.96)",
    padding: 18,
    gap: 14
  },
  serviceRow: {
    flexDirection: "row",
    gap: 14,
    justifyContent: "space-between"
  },
  serviceCopy: {
    flex: 1,
    gap: 6
  },
  serviceName: {
    color: palette.inkStrong,
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: "700"
  },
  serviceDescription: {
    color: palette.muted,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22
  },
  servicePrice: {
    color: palette.accentStrong,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: "700"
  },
  hourRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  hourDay: {
    color: palette.inkStrong,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: "700"
  },
  hourValue: {
    color: palette.mutedStrong,
    fontFamily: fonts.body,
    fontSize: 14
  },
  reviewStack: {
    gap: 12
  },
  reviewCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "rgba(255, 252, 247, 0.96)",
    padding: 18,
    gap: 10
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  reviewCopy: {
    flex: 1,
    gap: 4
  },
  reviewAuthor: {
    color: palette.inkStrong,
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: "700"
  },
  reviewDate: {
    color: palette.muted,
    fontFamily: fonts.body,
    fontSize: 12
  },
  reviewRating: {
    color: palette.accentStrong,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: "700"
  },
  reviewTitle: {
    color: palette.inkStrong,
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: "700"
  },
  reviewBody: {
    color: palette.muted,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22
  },
  emptyReview: {
    color: palette.mutedStrong,
    fontFamily: fonts.body,
    fontSize: 14
  },
  relatedRow: {
    flexDirection: "row",
    gap: 14,
    paddingRight: 20
  },
  notFound: {
    borderRadius: 30,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "rgba(255, 252, 247, 0.96)",
    padding: 24,
    gap: 14
  },
  notFoundTitle: {
    color: palette.inkStrong,
    fontFamily: fonts.heading,
    fontSize: 30
  },
  backButton: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: palette.accentStrong,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  backButtonText: {
    color: palette.white,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: "700"
  }
});
