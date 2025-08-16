import TopBar from "@/components/TopBar";
import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Image, Text, View } from "react-native";

const { width: screenWidth } = Dimensions.get('window');

const heroCards = [
  {
    id: 1,
    image: require("../../assets/images/section-1-card-1.png"),
  },
  {
    id: 2,
    image: require("../../assets/images/section-1-card-2.png"),
  },
];

export default function Index() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % heroCards.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Initial entrance animation
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Smooth scale and opacity transitions
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      }),
    ]).start();
  }, [currentIndex, scaleAnim, opacityAnim]);



  const renderCard = (card: any, index: number) => {
    const isActive = currentIndex === index;
    
    return (
      <Animated.View
        key={card.id}
        className="absolute inset-0"
        style={{
          transform: [
            { 
              scale: isActive 
                ? scaleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1],
                  })
                : 0.95 
            },
          ],
          opacity: isActive 
            ? opacityAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              })
            : 0.3,
          zIndex: isActive ? 10 : 1,
        }}
      >
        <View
          className="flex-1 rounded-3xl overflow-hidden"
        >
          <Image
            source={card.image}
            className="w-full h-full"
            resizeMode="contain"
            style={{ 
              width: '100%', 
              height: '100%',
              flex: 1,
            }}
            onLoad={() => console.log('Image loaded successfully')}
            onError={(error) => console.log('Image loading error:', error)}
          />
        </View>
      </Animated.View>
    );
  };

  return (
    <View className="flex-1">
      <TopBar />
      
      <View className="flex-1 px-2.5 pt-0">
        
        <View className="h-48 mb-4 px-3 -mt-2 relative">
          {heroCards.map((card, index) => renderCard(card, index))}
        </View>

        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-gray-600 text-center">
            Start scanning to discover your food
          </Text>
        </View>
      </View>
    </View>
  );
}
