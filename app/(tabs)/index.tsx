import TopBar from "@/components/TopBar";
import { Text, View } from "react-native";
export default function Index() {
  return (
    <View className="flex-1">
      <TopBar />
      <View className="flex-1 items-center justify-center">
        <Text className="text-3xl font-bold">Welcome</Text>
      </View>
    </View>
  );
}
