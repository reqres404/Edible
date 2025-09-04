import React, { useEffect, useRef } from 'react';
import { View, Text, Image, ScrollView, Pressable, Dimensions, Animated, Easing } from 'react-native';
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';
import { ScannedProduct } from '@/contexts/ScannedProductsContext';

interface ProductInfoDrawerProps {
  product: ScannedProduct | null;
  isVisible: boolean;
  onClose: () => void;
  onSwitchProduct?: (direction: 'left' | 'right') => void;
  hasNextProduct?: boolean;
  hasPreviousProduct?: boolean;
}

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

export const ProductInfoDrawer: React.FC<ProductInfoDrawerProps> = ({ 
  product, 
  isVisible, 
  onClose,
  onSwitchProduct,
  hasNextProduct = false,
  hasPreviousProduct = false
}) => {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (isVisible) {
      // Optimized animation timing for smoother drawer opening
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 220, // Slightly increased for smoother motion
          easing: Easing.out(Easing.cubic), // Smooth deceleration
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 170, // Slightly increased for smoother fade
          easing: Easing.out(Easing.quad), // Gentle fade in
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Optimized animation timing for smoother drawer closing
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 200, // Increased for smoother motion
          easing: Easing.inOut(Easing.cubic), // Smoother acceleration and deceleration
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 150, // Increased for smoother fade
          easing: Easing.in(Easing.quad), // Quick fade out
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  // Enhanced handler for horizontal swipe gestures only
  const isSwipeInProgress = useRef(false);
  
  const handlePanGesture = (event: any) => {
    const { translationX, velocityX, state } = event.nativeEvent;
    
    // Only process gestures in END state to avoid duplicate triggers
    if (state === State.END) {
      // If a swipe is already in progress, don't trigger another
      if (isSwipeInProgress.current) {
        return;
      }
      
      // Swipe left to go to next product (more sensitive)
      if (translationX < -50 && velocityX < -120) {
        console.log('Left swipe detected - switching to next product');
        if (hasNextProduct && onSwitchProduct) {
          isSwipeInProgress.current = true;
          onSwitchProduct('right');
          // Reset the flag after a short delay
          setTimeout(() => {
            isSwipeInProgress.current = false;
          }, 500);
        }
        return;
      }
      
      // Swipe right to go to previous product (more sensitive)
      if (translationX > 50 && velocityX > 120) {
        console.log('Right swipe detected - switching to previous product');
        if (hasPreviousProduct && onSwitchProduct) {
          isSwipeInProgress.current = true;
          onSwitchProduct('left');
          // Reset the flag after a short delay
          setTimeout(() => {
            isSwipeInProgress.current = false;
          }, 500);
        }
        return;
      }
    }
  };

  // Always render the drawer container to maintain consistent height
  if (!isVisible) {
    return null;
  }

  // Handle case when no product is selected or no nutrition data
  if (!product || !product.nutriments || Object.keys(product.nutriments).length === 0) {
    return (
      <>
        <Animated.View 
          className="absolute inset-0 bg-black/60 z-45"
          style={{ opacity: backdropAnim }}
        >
          <Pressable onPress={onClose} className="w-full h-full" />
        </Animated.View>
        
        <Animated.View 
          className="absolute bottom-0 left-0 right-0 bg-[#0F172A] rounded-t-3xl z-50"
          style={{
            transform: [{ translateY: slideAnim }],
            height: screenHeight * 0.75, // Further reduced height to show more camera view
          }}
        >
          <PanGestureHandler
            onHandlerStateChange={handlePanGesture}
            onGestureEvent={handlePanGesture}
            activeOffsetX={[-10, 10]}
            shouldCancelWhenOutside={false}
          >
            <View className="w-12 h-8 bg-transparent rounded-full mx-auto mt-3 mb-4 items-center justify-center">
              <View className="w-12 h-1 bg-gray-400 rounded-full" />
            </View>
          </PanGestureHandler>
            
            <View className="px-6 py-4">
              <Text className="text-white text-lg font-bold mb-4">Content Overview</Text>
              <View className="bg-[#1E293B] rounded-2xl p-8 items-center justify-center" style={{ height: 200 }}>
                <Text className="text-gray-300 text-center">
                  {!product ? 'Select a product to view details' : 'No nutrition data available'}
                </Text>
              </View>
            </View>

            <View className="px-6 py-4 border-t border-gray-700">
              <Pressable onPress={onClose} className="bg-blue-600 py-3 rounded-2xl items-center">
                <Text className="text-white font-semibold text-lg">Close</Text>
              </Pressable>
            </View>
          </Animated.View>
        </>
      );
    }

  // Safe product data
  const productName = product.name || 'Unknown Product';
  const productBrand = product.brand || 'Unknown Brand';
  const nutritionGrade = product.nutriscore?.grade || product.nutritionGrade || 'N/A';
  const novaGroup = product.novaGroup;
  const ecoScore = product.ecoscore?.grade || 'N/A';

  // Score color functions
  const getScoreColor = (grade: string) => {
    const gradeLower = grade.toLowerCase();
    switch (gradeLower) {
      case 'a': return '#10B981';
      case 'b': return '#3B82F6';
      case 'c': return '#F59E0B';
      case 'd': return '#F97316';
      case 'e': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getScoreBackground = (grade: string) => {
    const gradeLower = grade.toLowerCase();
    switch (gradeLower) {
      case 'a': return '#D1FAE5';
      case 'b': return '#DBEAFE';
      case 'c': return '#FEF3C7';
      case 'd': return '#FED7AA';
      case 'e': return '#FEE2E2';
      default: return '#F3F4F6';
    }
  };

  // Simple nutrition display
  const renderNutritionInfo = () => {
    const nutritionItems = [
      { label: 'Energy', value: product.nutriments?.energy_kcal_100g, unit: 'kcal' },
      { label: 'Protein', value: product.nutriments?.proteins_100g, unit: 'g' },
      { label: 'Carbs', value: product.nutriments?.carbohydrates_100g, unit: 'g' },
      { label: 'Fat', value: product.nutriments?.fat_100g, unit: 'g' },
      { label: 'Fiber', value: product.nutriments?.fiber_100g, unit: 'g' },
      { label: 'Sugars', value: product.nutriments?.sugars_100g, unit: 'g' },
      { label: 'Salt', value: product.nutriments?.salt_100g, unit: 'g' },
    ];

    return (
      <View className="space-y-3">
        {nutritionItems.map((item, index) => {
          if (!item.value || isNaN(Number(item.value))) return null;
          
          const value = Number(item.value);
          const displayValue = value.toFixed(1);
          
          return (
            <View key={index} className="space-y-1">
              <View className="flex-row justify-between items-center">
                <Text className="text-white text-sm font-medium">{item.label}</Text>
                <Text className="text-white text-sm">{displayValue}{item.unit}</Text>
              </View>
              <View className="h-2 bg-gray-600 rounded-full overflow-hidden">
                <View 
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: '50%' }}
                />
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <>
      <Animated.View 
        className="absolute inset-0 bg-black/60 z-45"
        style={{ opacity: backdropAnim }}
      >
        <Pressable onPress={onClose} className="w-full h-full" />
      </Animated.View>
      
      <Animated.View 
        className="absolute bottom-0 left-0 right-0 bg-[#0F172A] rounded-t-3xl z-50"
        style={{
          transform: [{ translateY: slideAnim }],
          height: screenHeight * 0.85, // Reduced height to leave some camera view
        }}
      >
        <PanGestureHandler
          onHandlerStateChange={handlePanGesture}
          onGestureEvent={handlePanGesture}
          activeOffsetX={[-10, 10]}
          shouldCancelWhenOutside={false}
        >
          <View className="w-12 h-8 bg-transparent rounded-full mx-auto mt-3 mb-4 items-center justify-center">
            <View className="w-12 h-1 bg-gray-400 rounded-full" />
          </View>
        </PanGestureHandler>
        
        {/* Main content with horizontal swipe detection */}
        <PanGestureHandler
          onHandlerStateChange={handlePanGesture}
          onGestureEvent={handlePanGesture}
          activeOffsetX={[-10, 10]}
          shouldCancelWhenOutside={false}
        >
          <Animated.View style={{flex: 1}}>
            <ScrollView ref={scrollViewRef} className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
          
          {/* Product Overview */}
          <View className="bg-[#1E293B] rounded-2xl p-4 mb-4">
            <Text className="text-white text-lg font-bold mb-4">Product Overview</Text>
            <View className="flex-row items-start space-x-4">
              <View className="w-24 h-24 rounded-2xl overflow-hidden">
                {product.imageUrl ? (
                  <Image
                    source={{ uri: product.imageUrl, cache: 'force-cache' }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center">
                    <Text className="text-white text-xs font-bold text-center">
                      {productName.substring(0, 4)}
                    </Text>
                  </View>
                )}
              </View>
              
              <View className="flex-1 space-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-gray-300 text-sm">Product Name:</Text>
                  <Text className="text-white text-sm font-medium">{productName}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-300 text-sm">Brand:</Text>
                  <Text className="text-white text-sm font-medium">{productBrand}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-300 text-sm">Score Grade:</Text>
                  <View 
                    className="px-2 py-1 rounded-full"
                    style={{ backgroundColor: getScoreBackground(nutritionGrade) }}
                  >
                    <Text 
                      className="text-xs font-bold"
                      style={{ color: getScoreColor(nutritionGrade) }}
                    >
                      {nutritionGrade}
                    </Text>
                  </View>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-300 text-sm">NOVA Group:</Text>
                  <Text className="text-white text-sm font-medium">
                    {novaGroup ? 'Group ' + novaGroup : 'N/A'}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-300 text-sm">Eco Score:</Text>
                  <Text className="text-white text-sm font-medium">{ecoScore}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Nutrition Chart */}
          <View className="bg-[#1E293B] rounded-2xl p-4 mb-4">
            <Text className="text-white text-lg font-bold mb-4">Nutrition Overview</Text>
            <View className="items-center justify-center">
              {renderNutritionInfo()}
            </View>
          </View>

          {/* Ingredients */}
          <View className="bg-[#1E293B] rounded-2xl p-4 mb-4">
            <Text className="text-white text-lg font-bold mb-4">Ingredients</Text>
            <View className="space-y-3">
              {product.ingredients ? (
                <View>
                  <Text className="text-gray-300 text-sm mb-2">Ingredients:</Text>
                  <Text className="text-white text-sm leading-5">{product.ingredients}</Text>
                </View>
              ) : (
                <Text className="text-gray-300 text-sm">No ingredient information available.</Text>
              )}
              
              {product.categories && product.categories.length > 0 && (
                <View>
                  <Text className="text-gray-300 text-sm mb-2">Categories:</Text>
                  <View className="flex-row flex-wrap">
                    {product.categories.map((category, index) => (
                      <View key={index} className="bg-blue-600/20 px-3 py-1 rounded-full mr-2 mb-2">
                        <Text className="text-blue-300 text-xs">{category}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              {product.allergens && product.allergens.length > 0 && (
                <View>
                  <Text className="text-gray-300 text-sm mb-2">Allergens:</Text>
                  <View className="flex-row flex-wrap">
                    {product.allergens.map((allergen, index) => (
                      <View key={index} className="bg-red-600/20 px-3 py-1 rounded-full mr-2 mb-2">
                        <Text className="text-red-300 text-xs">{allergen}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
          </Animated.View>
        </PanGestureHandler>

        {/* Close Button */}
        <View className="px-6 py-4 border-t border-gray-700">
          <Pressable onPress={onClose} className="bg-blue-600 py-3 rounded-2xl items-center">
            <Text className="text-white font-semibold text-lg">Close</Text>
          </Pressable>
        </View>
        </Animated.View>
    </>
  );
};




