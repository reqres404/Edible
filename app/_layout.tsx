import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./globals.css";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ LeagueSpartan: require("../assets/fonts/LeagueSpartan-ExtraBold.ttf") });
  useEffect(() => {}, [fontsLoaded]);
  return (
    <SafeAreaProvider>
      <Stack initialRouteName="(tabs)">
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="scan" options={{ headerShown: false, presentation: "modal" }} />
      </Stack>
    </SafeAreaProvider>
  );
}