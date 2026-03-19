import { Pressable, StyleSheet, Text } from "react-native";

import { fonts, palette } from "@mobile/src/theme/tokens";

type ChipProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
  subtle?: boolean;
};

export function Chip({ label, active = false, onPress, subtle = false }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.base,
        subtle ? styles.subtle : styles.defaultChip,
        active ? styles.active : styles.inactive
      ]}
    >
      <Text style={[styles.label, active ? styles.activeLabel : styles.inactiveLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  defaultChip: {
    minHeight: 40
  },
  subtle: {
    minHeight: 34,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  active: {
    backgroundColor: "#fff0de",
    borderColor: "#f1b14d"
  },
  inactive: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderColor: palette.line
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: "600"
  },
  activeLabel: {
    color: palette.accentStrong
  },
  inactiveLabel: {
    color: palette.mutedStrong
  }
});
