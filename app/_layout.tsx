import { Stack } from "expo-router";
import "./globals.css";

export default function RootLayout() {
  return (
    <Stack initialRouteName="(tabs)">
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="movies/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)/scan" options={{ headerShown: false, presentation: "modal" }} />
    </Stack>
  );
}