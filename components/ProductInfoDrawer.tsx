import React, { useEffect, useRef } from 'react';
import { View, Text, Image, ScrollView, Pressable, Dimensions, Animated } from 'react-native';
import { ScannedProduct } from '@/contexts/ScannedProductsContext';

interface ProductInfoDrawerProps {
  product: ScannedProduct | null;
  isVisible: boolean;
  onClose: () => void;
}

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

export const ProductInfoDrawer: React.FC<ProductInfoDrawerProps> = ({ 
  product, 
  isVisible, 
  onClose 
}) => {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible && product) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();

      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, product]);

  // Don't render if no product or not visible
  if (!product || !isVisible) {
    return null;
  }

  // Don't render if no nutrition data
  if (!product.nutriments || Object.keys(product.nutriments).length === 0) {
    return (
      <>
        <Animated.View 
          className="absolute inset-0 bg-black/60 z-40"
          style={{ opacity: backdropAnim }}
        >
          <Pressable onPress={onClose} className="w-full h-full" />
        </Animated.View>
        
        <Animated.View 
          className="absolute bottom-0 left-0 right-0 bg-[#0F172A] rounded-t-3xl z-50"
          style={{
            transform: [{ translateY: slideAnim }],
            maxHeight: screenHeight * 0.85,
          }}
        >
          <View className="w-12 h-1 bg-gray-400 rounded-full mx-auto mt-3 mb-4" />
          
          <View className="px-6 py-4">
            <Text className="text-white text-lg font-bold mb-4">Content Overview</Text>
            <View className="bg-[#1E293B] rounded-2xl p-8 items-center justify-center">
              <Text className="text-gray-300 text-center">No nutrition data available</Text>
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
        className="absolute inset-0 bg-black/60 z-40"
        style={{ opacity: backdropAnim }}
      >
        <Pressable onPress={onClose} className="w-full h-full" />
      </Animated.View>
      
      <Animated.View 
        className="absolute bottom-0 left-0 right-0 bg-[#0F172A] rounded-t-3xl z-50"
        style={{
          transform: [{ translateY: slideAnim }],
          maxHeight: screenHeight * 0.85,
        }}
      >
        <View className="w-12 h-1 bg-gray-400 rounded-full mx-auto mt-3 mb-4" />
        
        <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
          
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




