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

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAppState();
  const [email, setEmail] = useState("demo@addisbeakal.test");
  const [password, setPassword] = useState("demo12345");
  const [message, setMessage] = useState("");

  return (
    <AuthShell
      eyebrow="Mobile access"
      subtitle="Browse stays public, but mobile profiles let people keep a local shortlist and return to the places that mattered."
      title="Sign in and step into the trusted side of Addis discovery."
    >
      <Text style={styles.formTitle}>Welcome back.</Text>
      <Text style={styles.formCopy}>
        Use a demo account or a profile you created on this device.
      </Text>
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
          const result = await login(email, password);
          if (!result.ok) {
            setMessage(result.message ?? "We could not sign you in.");
            return;
          }

          router.replace("/profile");
        }}
        style={styles.primaryButton}
      >
        <Text style={styles.primaryButtonText}>Sign in</Text>
      </Pressable>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <Pressable onPress={() => router.push("/auth/signup")}>
        <Text style={styles.link}>Need an account? Create one</Text>
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
    backgroundColor: palette.inkStrong,
    paddingVertical: 14,
    alignItems: "center"
  },
  primaryButtonText: {
    color: palette.white,
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
