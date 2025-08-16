import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, View } from 'react-native';

const { width } = Dimensions.get('window');

interface HeroSectionProps {
  images?: any[];
  autoSlideInterval?: number;
}

const HeroSection: React.FC<HeroSectionProps> = ({ 
  images = [
    require("../assets/images/section-1-card-1.png"),
    require("../assets/images/section-1-card-3.png"),
  ],
  autoSlideInterval = 3000
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const flatListRef = useRef<FlatList>(null);
  const autoSlideRef = useRef<number | null>(null);

  // Auto-slide functionality
  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, [currentIndex]);

  const startAutoSlide = (): void => {
    stopAutoSlide();
    autoSlideRef.current = setTimeout(() => {
      const nextIndex = (currentIndex + 1) % images.length;
      scrollToIndex(nextIndex);
    }, autoSlideInterval);
  };

  const stopAutoSlide = (): void => {
    if (autoSlideRef.current) {
      clearTimeout(autoSlideRef.current);
      autoSlideRef.current = null;
    }
  };

  const scrollToIndex = (index: number): void => {
    if (flatListRef.current && index !== currentIndex) {
      stopAutoSlide();
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
    if (index !== currentIndex && index >= 0 && index < images.length) {
      setCurrentIndex(index);
    }
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <View 
      className="justify-center items-center px-4" 
      style={{ width }}
    >
      <View 
        className="rounded-3xl overflow-hidden"
        style={{ 
          width: width * 0.92, 
          height: width * 0.5,
        }}
      >
        <Image
          source={item}
          style={{ width: '100%', height: '100%' }}
          resizeMode="contain"
        />
      </View>
    </View>
  );

  return (
    <View className="relative" style={{ height: width * 0.5, marginTop: -20 }}>
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
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
      />


    </View>
  );
};

export default HeroSection;