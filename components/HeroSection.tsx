import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Dimensions, FlatList, Image, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

interface HeroSectionProps {
  autoSlideInterval?: number;
}

interface CarouselItem {
  id: number;
  text: string;
  showMascot: boolean;
  key: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ 
  autoSlideInterval = 5000
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const flatListRef = useRef<FlatList>(null);
  const autoSlideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Original data
  const carouselData: CarouselItem[] = useMemo(() => [
    { id: 1, text: "Ingredient labels got you confused?\nScan it. We'll translate the nutrition nonsense.", showMascot: true, key: "item-1" },
    { id: 2, text: "\"E150d\"? \"Stabilizer (INS 452)\"??\nJust scan it. Edible speaks food fluently.", showMascot: true, key: "item-2" },
    { id: 3, text: "Don't panic, just scan it.\nEdible will tell you whether it's actually edible.", showMascot: true, key: "item-3" },
  ], []);

  // Large fake length to simulate infinity
  const VIRTUAL_DATA_LENGTH = 10000;
  const startIndex = Math.floor(VIRTUAL_DATA_LENGTH / 2);

  // Auto-slide effect
  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, [currentIndex]);

  const startAutoSlide = useCallback((): void => {
    stopAutoSlide();
    autoSlideRef.current = setTimeout(() => {
      scrollToIndex(currentIndex + 1);
    }, autoSlideInterval);
  }, [currentIndex, autoSlideInterval]);

  const stopAutoSlide = useCallback((): void => {
    if (autoSlideRef.current) {
      clearTimeout(autoSlideRef.current);
      autoSlideRef.current = null;
    }
  }, []);

  const scrollToIndex = useCallback((index: number): void => {
    if (!flatListRef.current) return;

    flatListRef.current.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5,
    });
    setCurrentIndex(index);
  }, []);

  const handleScroll = useCallback((event: any): void => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    if (index !== currentIndex && index >= 0 && index < VIRTUAL_DATA_LENGTH) {
      setCurrentIndex(index);
    }
  }, [currentIndex]);

  const renderItem = useCallback(
    ({ index }: { index: number }) => {
      const item = carouselData[index % carouselData.length];

      return (
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
                  source={
                    item.id === 1 ? require("../assets/images/mascot/confusedDog.png") :
                    item.id === 3 ? require("../assets/images/mascot/HappyDog.png") :
                    require("../assets/images/mascot/daboo-walking-winking.png")
                  }
                  style={{ width: 120, height: 120, resizeMode: 'contain' }}
                />
              </View>
            )}

            {/* Text */}
            <View className={`flex-1 justify-center items-start px-6 ${
              item.id === 2 ? 'w-3/5 ml-auto' : 'w-3/5'
            }`}>
              <Text
                className="text-primary font-bold leading-tight text-center mb-4"
                style={{
                  fontFamily: "LeagueSpartan",
                  fontSize: 18,
                  textShadowColor: 'rgba(0, 0, 0, 0.2)',
                  textShadowOffset: { width: 0.5, height: 0.5 },
                  textShadowRadius: 1,
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
                  textShadowRadius: 1,
                }}
              >
                {item.id === 1 ? "Scan it. We'll translate the nutrition nonsense." : 
                 item.id === 2 ? "Just scan it. Edible speaks food fluently." :
                 "Edible will tell you whether it's actually edible."}
              </Text>
            </View>
          </View>
        </View>
      );
    }, [carouselData]
  );

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: width,
    offset: width * index,
    index,
  }), []);

  return (
    <View className="relative" style={{ height: width * 0.4 }}>
      <FlatList
        ref={flatListRef}
        data={Array.from({ length: VIRTUAL_DATA_LENGTH })}
        renderItem={renderItem}
        keyExtractor={(_, index) => `virtual-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={width}
        snapToAlignment="center"
        decelerationRate="fast"
        getItemLayout={getItemLayout}
        onScrollBeginDrag={stopAutoSlide}
        onScrollEndDrag={startAutoSlide}
        initialScrollIndex={startIndex}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={3}
      />
    </View>
  );
};

export default HeroSection;
