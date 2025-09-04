import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { ScannedProductsProvider } from "../contexts/ScannedProductsContext";
import LoadingScreen from "../components/LoadingScreen";
import "./globals.css";

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Add a small delay to ensure proper mounting
    const timer = setTimeout(() => {
      const inAuthGroup = segments[0] === 'auth' as any;

      if (!user && !inAuthGroup) {
        // Redirect to sign in if not authenticated
        router.replace('/auth/signin' as any);
      } else if (user && inAuthGroup) {
        // Redirect to main app if authenticated
        router.replace('/(tabs)' as any);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, segments, isLoading, router]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Don't render anything until we know the user's authentication status
  if (user === null && segments[0] !== 'auth') {
    return <LoadingScreen />;
  }

  return (
    <Stack>
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="scan" options={{ headerShown: false, presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ LeagueSpartan: require("../assets/fonts/LeagueSpartan-ExtraBold.ttf") });
  
  useEffect(() => {}, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ScannedProductsProvider>
          <SafeAreaProvider>
            <RootLayoutNav />
          </SafeAreaProvider>
        </ScannedProductsProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}