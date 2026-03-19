import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput
} from "react-native";

import { AuthShell } from "@mobile/src/components/auth-shell";
import { useAppState } from "@mobile/src/providers/app-provider";
import { fonts, palette } from "@mobile/src/theme/tokens";

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAppState();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  return (
    <AuthShell
      eyebrow="Create account"
      subtitle="For the first mobile release, new accounts stay local to the device while we keep the brand and discovery experience feeling complete."
      title="Join the side of the city that remembers where you want to go back."
    >
      <Text style={styles.formTitle}>Start your profile.</Text>
      <Text style={styles.formCopy}>
        Your display name stays visible inside the mobile profile experience and unlocks a personal shortlist.
      </Text>
      <TextInput
        onChangeText={setDisplayName}
        placeholder="Display name"
        placeholderTextColor={palette.muted}
        style={styles.input}
        value={displayName}
      />
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor={palette.muted}
        style={styles.input}
        value={email}
      />
      <TextInput
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor={palette.muted}
        secureTextEntry
        style={styles.input}
        value={password}
      />
      <Pressable
        onPress={async () => {
          const result = await signup(displayName, email, password);
          if (!result.ok) {
            setMessage(result.message ?? "We could not create that profile.");
            return;
          }

          router.replace("/profile");
        }}
        style={styles.primaryButton}
      >
        <Text style={styles.primaryButtonText}>Create account</Text>
      </Pressable>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <Pressable onPress={() => router.push("/auth/login")}>
        <Text style={styles.link}>Already have an account? Sign in</Text>
      </Pressable>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  formTitle: {
    color: palette.inkStrong,
    fontFamily: fonts.heading,
    fontSize: 30
  },
  formCopy: {
    color: palette.muted,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22
  },
  input: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: palette.inkStrong,
    fontFamily: fonts.body,
    fontSize: 14
  },
  primaryButton: {
    borderRadius: 999,
    backgroundColor: palette.gold,
    paddingVertical: 14,
    alignItems: "center"
  },
  primaryButtonText: {
    color: palette.inkStrong,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.4
  },
  message: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.cream,
    padding: 14,
    color: palette.mutedStrong,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 20
  },
  link: {
    color: palette.accentStrong,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: "700"
  }
});
