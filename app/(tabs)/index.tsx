import GridSection from "@/components/GridSection";
import HeroSection from "@/components/HeroSection";
import TopBar from "@/components/TopBar";
import { View } from "react-native";

const heroCards = [
  { id: 1, image: require("../../assets/images/section-1-card-1.png") },
  { id: 2, image: require("../../assets/images/section-1-card-3.png") },
];

export default function Index() {
  return (
    <View className="flex-1 bg-offwhite">
      <TopBar />
      <View className="flex-1 px-2.5 pt-0">
        <View className="mb-0 mt-2">
          <HeroSection/>
        </View>

        <View className="mb-4">
          <GridSection />
        </View>
      </View>
    </View>
  );
}
