import FeedbackRatingSection from "@/components/FeedbackRatingSection";
import Footer from "@/components/Footer";
import GridSection from "@/components/GridSection";
import HeroSection from "@/components/HeroSection";
import InfoCarousel from "@/components/InfoCarousel";
import TopBar from "@/components/TopBar";
import { ScrollView, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 bg-offwhite">
      <TopBar />
      <ScrollView 
        className="flex-1 px-2.5 pt-0"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="mb-4 mt-4">
          <HeroSection/>
        </View>

        <View className="mb-4">
          <GridSection />
        </View>

        <View className="mb-4">
          <InfoCarousel />
        </View>

        <FeedbackRatingSection />
        <Footer />
      </ScrollView>
    </View>
  );
}
