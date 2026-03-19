import { Pressable, StyleSheet, Text, View } from "react-native";

import { fonts, palette } from "@mobile/src/theme/tokens";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  actionLabel?: string;
  onPress?: () => void;
  inverse?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  actionLabel,
  onPress,
  inverse = false
}: SectionHeadingProps) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={[styles.eyebrow, inverse ? styles.inverseEyebrow : null]}>{eyebrow}</Text>
        <Text style={[styles.title, inverse ? styles.inverseTitle : null]}>{title}</Text>
      </View>
      {actionLabel && onPress ? (
        <Pressable onPress={onPress}>
          <Text style={[styles.action, inverse ? styles.inverseAction : null]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12
  },
  copy: {
    flex: 1,
    gap: 6
  },
  eyebrow: {
    color: palette.accent,
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.4,
    textTransform: "uppercase"
  },
  title: {
    color: palette.inkStrong,
    fontFamily: fonts.heading,
    fontSize: 30,
    lineHeight: 31
  },
  inverseEyebrow: {
    color: palette.goldSoft
  },
  inverseTitle: {
    color: palette.white
  },
  action: {
    color: palette.accentStrong,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: "700"
  },
  inverseAction: {
    color: palette.white
  }
});
