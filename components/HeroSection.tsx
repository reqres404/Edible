import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

interface HeroSectionProps {
  autoSlideInterval?: number;
}

const HeroSection: React.FC<HeroSectionProps> = ({ 
  autoSlideInterval = 5000
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const flatListRef = useRef<FlatList>(null);
  const autoSlideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Base carousel data
  const baseData = [
    { 
      id: 1, 
      text: "Ingredient labels got you confused?\nScan it. We'll translate the nutrition nonsense.",
      showMascot: true 
    },
    { 
      id: 2, 
      text: "\"E150d\"? \"Stabilizer (INS 452)\"??\nJust scan it. Edible speaks food fluently.",
      showMascot: true 
    },
    { 
      id: 3, 
      text: "Don't panic, just scan it.\nEdible will tell you whether it's actually edible.",
      showMascot: true 
    },
  ];

  // Infinite dataset
  const loopFactor = 50;
  const carouselData = Array.from({ length: loopFactor }).flatMap(() => baseData);
  const initialIndex = baseData.length * Math.floor(loopFactor / 2);

  // Set initial index on mount
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index: initialIndex, animated: false });
      setCurrentIndex(initialIndex);
    }
    startAutoSlide();
    return () => stopAutoSlide();
  }, []);

  // Restart auto slide on index change
  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, [currentIndex]);

  const startAutoSlide = (): void => {
    stopAutoSlide();
    autoSlideRef.current = setTimeout(() => {
      scrollToIndex(currentIndex + 1);
    }, autoSlideInterval);
  };

  const stopAutoSlide = (): void => {
    if (autoSlideRef.current) {
      clearTimeout(autoSlideRef.current);
      autoSlideRef.current = null;
    }
  };

  const scrollToIndex = (index: number): void => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5
      });
      setCurrentIndex(index);
    }
  };

  const handleScroll = (event: any): void => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    if (index !== currentIndex && index >= 0 && index < carouselData.length) {
      setCurrentIndex(index);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View className="justify-center items-center px-4" style={{ width }}>
      <View 
        className="rounded-3xl overflow-hidden relative"
        style={{ width: width * 0.92, height: width * 0.4 }}
      >
        {/* Background Image */}
        <Image
          source={require("../assets/images/bg.png")}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          resizeMode="cover"
        />
        
        {/* Mascot */}
        {item.showMascot && (
          <View className={`absolute top-0 h-full justify-center items-center ${
            item.id === 2 ? 'left-0 w-2/5' : 'right-0 w-2/5'
          }`}>
            <Image
              source={require("../assets/images/mascot/daboo-walking-winking.png")}
              style={{ width: 120, height: 120, resizeMode: 'contain' }}
            />
          </View>
        )}
        
        {/* Text Overlay */}
        <View className={`flex-1 justify-center items-start px-6 ${
          item.id === 2 ? 'w-3/5 ml-auto' : 'w-3/5'
        }`}>
          {item.showMascot ? (
            <>
              <Text 
                className="text-primary font-bold leading-tight text-center mb-4"
                style={{ 
                  fontFamily: "LeagueSpartan",
                  fontSize: 18,
                  textShadowColor: 'rgba(0, 0, 0, 0.2)',
                  textShadowOffset: { width: 0.5, height: 0.5 },
                  textShadowRadius: 1
                }}
              >
                {item.id === 1 ? "Ingredient labels got you confused?" : 
                 item.id === 2 ? "\"E150d\"? \"Stabilizer (INS 452)\"??" :
                 "Don't panic, just scan it."}
              </Text>
              <Text 
                className="text-primary font-semibold leading-tight text-center"
                style={{ 
                  fontFamily: "LeagueSpartan",
                  fontSize: 14,
                  width: '100%',
                  textShadowColor: 'rgba(0, 0, 0, 0.2)',
                  textShadowOffset: { width: 0.5, height: 0.5 },
                  textShadowRadius: 1
                }}
              >
                {item.id === 1 ? "Scan it. We'll translate the nutrition nonsense." : 
                 item.id === 2 ? "Just scan it. Edible speaks food fluently." :
                 "Edible will tell you whether it's actually edible."}
              </Text>
            </>
          ) : (
            <Text 
              className="text-center text-primary font-bold leading-tight"
              style={{ 
                fontFamily: "LeagueSpartan",
                fontSize: 48,
                textShadowColor: 'rgba(0, 0, 0, 0.3)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 2
              }}
            >
              {item.text}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View className="relative" style={{ height: width * 0.4 }}>
      <FlatList
        ref={flatListRef}
        data={carouselData}
        renderItem={renderItem}
        keyExtractor={(_, idx) => idx.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={width}
        snapToAlignment="center"
        decelerationRate="fast"
        onScrollBeginDrag={stopAutoSlide}
        onScrollEndDrag={startAutoSlide}
        initialScrollIndex={initialIndex}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index
        })}
      />
    </View>
  );
};

export default HeroSection;
