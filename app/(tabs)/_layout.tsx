import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from 'expo-haptics';
import { Tabs, useRouter } from "expo-router";
import { Image, Pressable, View } from "react-native";

import { icons } from "@/constants/icons";

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const router = useRouter();
  // Read theme colors from tailwind config so Image tintColor can match tokens
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const tailwindConfig = require("../../tailwind.config.js");
  const twColors = tailwindConfig?.theme?.extend?.colors ?? {};
  const activeTintColor: string = twColors?.secondary ?? "#160455";
  const inactiveTintColor: string = "#FFFFFF";

  const getIconForRoute = (name: string) => {
    switch (name) {
      case "index":
        return icons.home;
      case "search":
        return icons.search;
      case "save":
        return icons.history;
      case "profile":
        return icons.profile;
      default:
        return icons.home;
    }
  };

  const onPressRoute = (routeKey: string, routeName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const event = navigation.emit({
      type: "tabPress",
      target: routeKey,
      canPreventDefault: true,
    });
    if (!event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  // Filter out any routes that should not be shown in the tab bar (like a center action screen)
  const visibleRoutes = state.routes.filter((r) => r.name !== "scan");

  return (
    <View className="absolute left-0 right-0 bottom-2 mx-5">
      <View className="flex-row items-center justify-between bg-primary rounded-full h-16 px-8 mb-4 overflow-hidden">
        {/* Distribute icons with an invisible spacer to reserve the center area */}
        {(() => {
          const routesForBar = visibleRoutes;
          const renderIcon = (route: typeof visibleRoutes[number], originalIndex: number) => {
            const isFocused = state.index === originalIndex;
            const routeName = route?.name || 'index';
            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={() => onPressRoute(route.key, routeName)}
                className="items-center justify-center"
              >
                <Image source={getIconForRoute(routeName)} style={{ width: 28, height: 28, tintColor: isFocused ? activeTintColor : inactiveTintColor }} />
              </Pressable>
            );
          };

          // Get original indices from state.routes
          const getOriginalIndex = (routeName: string) => state.routes.findIndex(r => r.name === routeName);

          return (
            <>
              {renderIcon(routesForBar[0], getOriginalIndex(routesForBar[0].name))}
              {renderIcon(routesForBar[1], getOriginalIndex(routesForBar[1].name))}
              <View className="w-24" />
              {renderIcon(routesForBar[2], getOriginalIndex(routesForBar[2].name))}
              {renderIcon(routesForBar[3], getOriginalIndex(routesForBar[3].name))}
            </>
          );
        })()}
      </View>

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push("/scan");
        }}
        className="absolute self-center -top-6 w-20 h-20 rounded-full items-center justify-center bg-deep shadow-2xl"
      >
        <View className="w-20 h-20 rounded-full border-4 border-white items-center justify-center">
          <Image source={icons.scan} className="w-9 h-9 tint-white" />
        </View>
      </Pressable>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="search" options={{ title: "Info" }} />
      <Tabs.Screen 
        name="scan" 
        options={{ 
          title: "Scan",
          href: null, // Hide from tab bar but allow navigation
        }} 
      />
      <Tabs.Screen name="save" options={{ title: "History" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}