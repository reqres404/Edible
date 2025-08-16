import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { icons } from "@/constants/icons";

export default function TopBar() {
  const router = useRouter();

  return (
    <SafeAreaView edges={["top"]} className="bg-primary">
      <StatusBar style="light" />
      <View className="w-full px-5 py-3 flex-row items-center justify-between">
        <View className="flex-row items-end">
          <Text
            className="text-secondary"
            style={{ fontSize: 30, fontWeight: "800", fontFamily: "LeagueSpartan" }}
          >
            e
          </Text>
          <Text
            className="text-white"
            style={{ fontSize: 30, fontWeight: "800", fontFamily: "LeagueSpartan" }}
          >
            dibl
          </Text>
          <Text
            className="text-secondary"
            style={{ fontSize: 30, fontWeight: "800", fontFamily: "LeagueSpartan" }}
          >
            e
          </Text>
        </View>

        <Pressable onPress={() => router.push("/scan")} hitSlop={10} className="p-1">
          <Image source={icons.scan} className="w-7 h-7" style={{ tintColor: "#FFFFFF" }} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}


