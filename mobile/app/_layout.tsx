import "react-native-reanimated";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AppProvider } from "@mobile/src/providers/app-provider";
import { palette } from "@mobile/src/theme/tokens";

export const unstable_settings = {
  initialRouteName: "(tabs)"
};

export default function RootLayout() {
  return (
    <AppProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: palette.background
          }
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="business/[slug]" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/signup" />
      </Stack>
      <StatusBar style="dark" />
    </AppProvider>
  );
}
