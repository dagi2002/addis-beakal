import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
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
import {
  getExploreScreenData,
  type ExploreFilters
} from "@mobile/src/data/catalog";
import { useAppState } from "@mobile/src/providers/app-provider";
import { fonts, palette } from "@mobile/src/theme/tokens";
import type { DiscoverSort } from "@/features/businesses/types";

export default function ExploreScreen() {
  const params = useLocalSearchParams<{
    query?: string;
    category?: string;
    neighborhood?: string;
    sort?: DiscoverSort;
  }>();
  const { savedIds } = useAppState();
  const [query, setQuery] = useState(typeof params.query === "string" ? params.query : "");
  const [category, setCategory] = useState(
    typeof params.category === "string" ? params.category : ""
  );
  const [neighborhood, setNeighborhood] = useState(
    typeof params.neighborhood === "string" ? params.neighborhood : ""
  );
  const [sort, setSort] = useState<DiscoverSort>(
    params.sort && ["recommended", "top-rated", "most-reviewed", "most-saved"].includes(params.sort)
      ? params.sort
      : "recommended"
  );

  useEffect(() => {
    if (typeof params.query === "string") {
      setQuery(params.query);
    }
    if (typeof params.category === "string") {
      setCategory(params.category);
    }
    if (typeof params.neighborhood === "string") {
      setNeighborhood(params.neighborhood);
    }
    if (
      typeof params.sort === "string" &&
      ["recommended", "top-rated", "most-reviewed", "most-saved"].includes(params.sort)
    ) {
      setSort(params.sort as DiscoverSort);
    }
  }, [params.category, params.neighborhood, params.query, params.sort]);

  const filters = useMemo<ExploreFilters>(
    () => ({
      query,
      category,
      neighborhood,
      sort
    }),
    [category, neighborhood, query, sort]
  );
  const data = getExploreScreenData(filters, savedIds);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Explore Addis</Text>
        <Text style={styles.title}>Search by vibe, category, or neighborhood.</Text>
      </View>

      <View style={styles.searchShell}>
        <Ionicons color={palette.accent} name="search" size={18} />
        <TextInput
          onChangeText={setQuery}
          placeholder="Search restaurants, cafes, clinics..."
          placeholderTextColor={palette.muted}
          style={styles.searchInput}
          value={query}
        />
      </View>

      <View style={styles.filterBlock}>
        <SectionHeading eyebrow="Categories" title="What kind of place?" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipRow}>
            <Chip active={!category} label="All" onPress={() => setCategory("")} />
            {data.categories.map((item) => (
              <Chip
                key={item.id}
                active={category === item.slug}
                label={`${item.emoji} ${item.name}`}
                onPress={() => setCategory(category === item.slug ? "" : item.slug)}
              />
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.filterBlock}>
        <SectionHeading eyebrow="Neighborhoods" title="Where in Addis?" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipRow}>
            <Chip active={!neighborhood} label="All areas" onPress={() => setNeighborhood("")} />
            {data.neighborhoods.map((item) => (
              <Chip
                key={item.id}
                active={neighborhood === item.slug}
                label={item.name}
                onPress={() => setNeighborhood(neighborhood === item.slug ? "" : item.slug)}
              />
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.filterBlock}>
        <SectionHeading eyebrow="Sort" title="How should we rank them?" />
        <View style={styles.sortRow}>
          {data.sortOptions.map((option) => (
            <Chip
              key={option.value}
              active={sort === option.value}
              label={option.label}
              onPress={() => setSort(option.value)}
              subtle
            />
          ))}
        </View>
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsEyebrow}>Results</Text>
        <Text style={styles.resultsTitle}>
          {data.businesses.length} places worth looking at
        </Text>
      </View>

      <View style={styles.resultsStack}>
        {data.businesses.length ? (
          data.businesses.map((business) => <BusinessCard key={business.id} business={business} />)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nothing matched that combination.</Text>
            <Text style={styles.emptyCopy}>
              Clear a filter or try a broader search term to pull more of the city back in.
            </Text>
          </View>
        )}
      </View>
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
  searchShell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "rgba(255, 252, 247, 0.96)",
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  searchInput: {
    flex: 1,
    color: palette.inkStrong,
    fontFamily: fonts.body,
    fontSize: 14
  },
  filterBlock: {
    gap: 12
  },
  chipRow: {
    flexDirection: "row",
    gap: 10,
    paddingRight: 20
  },
  sortRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  resultsHeader: {
    gap: 6
  },
  resultsEyebrow: {
    color: palette.muted,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.8,
    textTransform: "uppercase"
  },
  resultsTitle: {
    color: palette.inkStrong,
    fontFamily: fonts.heading,
    fontSize: 30,
    lineHeight: 31
  },
  resultsStack: {
    gap: 14
  },
  emptyState: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "rgba(255, 252, 247, 0.92)",
    padding: 20,
    gap: 8
  },
  emptyTitle: {
    color: palette.inkStrong,
    fontFamily: fonts.body,
    fontSize: 17,
    fontWeight: "700"
  },
  emptyCopy: {
    color: palette.muted,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22
  }
});
