import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { fonts, palette } from "@mobile/src/theme/tokens";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.accentStrong,
        tabBarInactiveTintColor: "#7d7066",
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 18,
          height: 78,
          paddingTop: 10,
          paddingBottom: 10,
          borderTopWidth: 0,
          borderRadius: 28,
          backgroundColor: "rgba(255, 252, 247, 0.98)",
          shadowColor: "#412d1c",
          shadowOpacity: 0.16,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 8
        },
        tabBarLabelStyle: {
          fontFamily: fonts.body,
          fontSize: 12,
          fontWeight: "700"
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons color={color} name={focused ? "home" : "home-outline"} size={22} />
          )
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons color={color} name={focused ? "compass" : "compass-outline"} size={22} />
          )
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons color={color} name={focused ? "bookmark" : "bookmark-outline"} size={22} />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons color={color} name={focused ? "person" : "person-outline"} size={22} />
          )
        }}
      />
    </Tabs>
  );
}
