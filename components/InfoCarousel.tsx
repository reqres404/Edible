import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, View } from 'react-native';

const { width } = Dimensions.get('window');

interface InfoCarouselProps {
  autoSlideInterval?: number;
}

const InfoCarousel: React.FC<InfoCarouselProps> = ({ 
  autoSlideInterval = 5000
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const flatListRef = useRef<FlatList>(null);
  const autoSlideRef = useRef<ReturnType<typeof setTimeout> | null>(null);  

  // Original data
  const baseData = [
    { id: 1, backgroundImage: require("../assets/images/sections/section-3-bg-1.png") },
    { id: 2, backgroundImage: require("../assets/images/sections/section-3-bg-2.png") },
    { id: 3, backgroundImage: require("../assets/images/sections/section-3-bg-3.png") },
  ];

  // Make infinite dataset by repeating it
  const loopFactor = 50; // can increase if user scrolls a lot
  const carouselData = Array.from({ length: loopFactor })
    .flatMap(() => baseData);

  // Start in the "middle"
  const initialIndex = baseData.length * Math.floor(loopFactor / 2);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index: initialIndex, animated: false });
      setCurrentIndex(initialIndex);
    }
    startAutoSlide();
    return () => stopAutoSlide();
  }, []);

  useEffect(() => {
    // Restart auto-slide whenever index changes
    startAutoSlide();
    return () => stopAutoSlide();
  }, [currentIndex]);

  const startAutoSlide = (): void => {
    stopAutoSlide();
    autoSlideRef.current = setTimeout(() => {
      scrollToIndex(currentIndex + 1); // move forward by 1
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
        style={{ width: width * 0.92, height: width * 0.6 }}
      >
        <Image
          source={item.backgroundImage}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          resizeMode="stretch"
        />
      </View>
    </View>
  );

  return (
    <View className="relative" style={{ height: width * 0.6 }}>
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

export default InfoCarousel;
