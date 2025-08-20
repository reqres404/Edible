import React, { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Image, View, NativeSyntheticEvent, NativeScrollEvent } from "react-native";

const { width } = Dimensions.get("window");

interface InfoCarouselProps {
  autoSlideInterval?: number;
}

interface CarouselItem {
  id: number;
  backgroundImage: any;
}

const InfoCarousel: React.FC<InfoCarouselProps> = ({
  autoSlideInterval = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const flatListRef = useRef<FlatList<number>>(null);
  const autoSlideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ✅ Only 3 unique images
  const baseData: CarouselItem[] = [
    { id: 1, backgroundImage: require("../assets/images/sections/section-3-bg-1.png") },
    { id: 2, backgroundImage: require("../assets/images/sections/section-3-bg-2.png") },
    { id: 3, backgroundImage: require("../assets/images/sections/section-3-bg-3.png") },
  ];

  // ✅ Fake big index space (not big array, just numbers)
  const TOTAL_VIRTUAL_ITEMS = 10000;
  const START_INDEX = Math.floor(TOTAL_VIRTUAL_ITEMS / 2);

  useEffect(() => {
    // Start at the middle
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: START_INDEX,
        animated: false,
      });
      setCurrentIndex(START_INDEX);
    }, 0);

    return () => stopAutoSlide();
  }, []);

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
    if (!flatListRef.current) return;

    flatListRef.current.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5,
    });
    setCurrentIndex(index);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  // ✅ Memoized card so FlatList doesn’t re-render unnecessarily
  const CarouselCard = React.memo(({ itemIndex }: { itemIndex: number }) => {
    const actualIndex = itemIndex % baseData.length;
    const item = baseData[actualIndex];
    return (
      <View className="justify-center items-center px-4" style={{ width }}>
        <View
          className="rounded-3xl overflow-hidden relative"
          style={{ width: width * 0.92, height: width * 0.6 }}
        >
          <Image
            source={item.backgroundImage}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
            resizeMode="stretch"
          />
        </View>
      </View>
    );
  });

  return (
    <View className="relative" style={{ height: width * 0.6 }}>
      <FlatList
        ref={flatListRef}
        data={Array.from({ length: TOTAL_VIRTUAL_ITEMS }, (_, i) => i)}
        renderItem={({ item }) => <CarouselCard itemIndex={item} />}
        keyExtractor={(item) => item.toString()}
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
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        initialScrollIndex={START_INDEX}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={3}
        removeClippedSubviews
      />
    </View>
  );
};

export default InfoCarousel;
