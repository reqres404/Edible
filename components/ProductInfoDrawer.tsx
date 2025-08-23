import React, { useEffect, useRef } from 'react';
import { View, Text, Image, ScrollView, Pressable, Dimensions, Animated } from 'react-native';
import { ScannedProduct } from '@/contexts/ScannedProductsContext';

interface ProductInfoDrawerProps {
  product: ScannedProduct | null;
  isVisible: boolean;
  onClose: () => void;
}

const { height: screenHeight } = Dimensions.get('window');

export const ProductInfoDrawer: React.FC<ProductInfoDrawerProps> = ({ 
  product, 
  isVisible, 
  onClose 
}) => {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const imageScaleAnim = useRef(new Animated.Value(0.8)).current;
  const headerSlideAnim = useRef(new Animated.Value(30)).current;
  const nutritionSlideAnim = useRef(new Animated.Value(40)).current;
  const categoriesSlideAnim = useRef(new Animated.Value(50)).current;
  const ingredientsSlideAnim = useRef(new Animated.Value(60)).current;
  const allergensSlideAnim = useRef(new Animated.Value(70)).current;
  const additionalSlideAnim = useRef(new Animated.Value(80)).current;
  const buttonScaleAnim = useRef(new Animated.Value(0.9)).current;
  const handleScaleAnim = useRef(new Animated.Value(0.8)).current;
  const handleOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Reset all animations
      contentAnim.setValue(0);
      imageScaleAnim.setValue(0.8);
      headerSlideAnim.setValue(30);
      nutritionSlideAnim.setValue(40);
      categoriesSlideAnim.setValue(50);
      ingredientsSlideAnim.setValue(60);
      allergensSlideAnim.setValue(70);
      additionalSlideAnim.setValue(80);
      buttonScaleAnim.setValue(0.9);
      handleScaleAnim.setValue(0.8);
      handleOpacityAnim.setValue(0);

      // Main slide up animation
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();

      // Backdrop fade in
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Staggered content animations
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(imageScaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(headerSlideAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.parallel([
            Animated.spring(handleScaleAnim, {
              toValue: 1,
              tension: 120,
              friction: 6,
              useNativeDriver: true,
            }),
            Animated.timing(handleOpacityAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      }, 100);

      setTimeout(() => {
        Animated.timing(contentAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 200);

      // Staggered section animations
      setTimeout(() => {
        Animated.spring(nutritionSlideAnim, {
          toValue: 0,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }).start();
      }, 300);

      setTimeout(() => {
        Animated.spring(categoriesSlideAnim, {
          toValue: 0,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }).start();
      }, 400);

      setTimeout(() => {
        Animated.spring(ingredientsSlideAnim, {
          toValue: 0,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }).start();
      }, 500);

      setTimeout(() => {
        Animated.spring(allergensSlideAnim, {
          toValue: 0,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }).start();
      }, 600);

      setTimeout(() => {
        Animated.spring(additionalSlideAnim, {
          toValue: 0,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }).start();
      }, 700);

      setTimeout(() => {
        Animated.spring(buttonScaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }).start();
      }, 800);

    } else {
      // Slide down animation
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
  }, [isVisible]);

  // Safety check - don't render if no product
  if (!product) return null;

  const getScoreColor = (grade?: string) => {
    switch (grade?.toLowerCase()) {
      case 'a': return 'text-green-500';
      case 'b': return 'text-blue-500';
      case 'c': return 'text-yellow-500';
      case 'd': return 'text-orange-500';
      case 'e': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getScoreBackground = (grade?: string) => {
    switch (grade?.toLowerCase()) {
      case 'a': return 'bg-green-100';
      case 'b': return 'bg-blue-100';
      case 'c': return 'bg-yellow-100';
      case 'd': return 'bg-orange-100';
      case 'e': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <Animated.View 
        className="absolute inset-0 bg-black z-40"
        style={{ opacity: backdropAnim }}
      >
        <Pressable 
          onPress={onClose}
          className="w-full h-full"
        />
      </Animated.View>
      
      {/* Drawer */}
      <Animated.View 
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50"
        style={{
          transform: [{ translateY: slideAnim }],
          maxHeight: screenHeight * 0.8,
        }}
      >
        {/* Handle */}
        <Animated.View 
          style={{
            transform: [{ scale: handleScaleAnim }],
            opacity: handleOpacityAnim,
          }}
        >
          <View className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-4" />
        </Animated.View>
        
        {/* Product Header */}
        <Animated.View 
          style={{
            transform: [{ translateY: headerSlideAnim }],
            opacity: contentAnim,
          }}
        >
          <View className="px-6 pb-4 border-b border-gray-200">
            <View className="flex-row items-start space-x-4">
              {/* Product Image */}
              <Animated.View 
                style={{
                  transform: [{ scale: imageScaleAnim }],
                  opacity: contentAnim,
                }}
              >
                <View className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                  {product.imageUrl ? (
                    <Image
                      source={{ uri: product.imageUrl, cache: 'force-cache' }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-full items-center justify-center">
                      <Text className="text-white text-xs font-bold text-center">
                        {product.name?.substring(0, 4) || 'SCAN'}
                      </Text>
                    </View>
                  )}
                </View>
              </Animated.View>
              
              {/* Product Info */}
              <Animated.View 
                style={{
                  transform: [{ translateY: headerSlideAnim }],
                  opacity: contentAnim,
                }}
              >
                <View className="flex-1">
                  <Text className="text-xl font-bold text-gray-900 mb-1">
                    {product.name || 'Unknown Product'}
                  </Text>
                  {product.brand && (
                    <Text className="text-gray-600 text-sm mb-2">
                      {product.brand}
                    </Text>
                  )}
                  
                  {/* Score Badge */}
                  <View className={`px-3 py-1 rounded-full ${getScoreBackground(product.nutriscore?.grade || product.nutritionGrade)}`}>
                    <Text className={`text-sm font-bold ${getScoreColor(product.nutriscore?.grade || product.nutritionGrade)}`}>
                      {product.nutriscore?.grade || product.nutritionGrade || '⏳'}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            </View>
          </View>
        </Animated.View>

        {/* Product Details */}
        <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
          {/* Nutrition Information */}
          <Animated.View 
            style={{
              transform: [{ translateY: nutritionSlideAnim }],
              opacity: contentAnim,
            }}
          >
            {product.nutriments && (
              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-900 mb-3">Nutrition Facts</Text>
                <View className="space-y-2">
                  {product.nutriments.energy_kcal_100g && (
                    <View className="flex-row justify-between">
                      <Text className="text-gray-600">Energy</Text>
                      <Text className="font-medium">{product.nutriments.energy_kcal_100g} kcal</Text>
                    </View>
                  )}
                  {product.nutriments.proteins_100g && (
                    <View className="flex-row justify-between">
                      <Text className="text-gray-600">Protein</Text>
                      <Text className="font-medium">{product.nutriments.proteins_100g}g</Text>
                    </View>
                  )}
                  {product.nutriments.carbohydrates_100g && (
                    <View className="flex-row justify-between">
                      <Text className="text-gray-600">Carbohydrates</Text>
                      <Text className="font-medium">{product.nutriments.carbohydrates_100g}g</Text>
                    </View>
                  )}
                  {product.nutriments.fat_100g && (
                    <View className="flex-row justify-between">
                      <Text className="text-gray-600">Fat</Text>
                      <Text className="font-medium">{product.nutriments.fat_100g}g</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </Animated.View>

          {/* Categories */}
          <Animated.View 
            style={{
              transform: [{ translateY: categoriesSlideAnim }],
              opacity: contentAnim,
            }}
          >
            {product.categories && product.categories.length > 0 && (
              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-900 mb-3">Categories</Text>
                <View className="flex-row flex-wrap">
                  {product.categories.map((category, index) => (
                    <View key={index} className="bg-gray-100 px-3 py-1 rounded-full mr-2 mb-2">
                      <Text className="text-sm text-gray-700">{category}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Animated.View>

          {/* Ingredients */}
          <Animated.View 
            style={{
              transform: [{ translateY: ingredientsSlideAnim }],
              opacity: contentAnim,
            }}
          >
            {product.ingredients && (
              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-900 mb-3">Ingredients</Text>
                <Text className="text-gray-700 leading-6">
                  {product.ingredients}
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Allergens */}
          <Animated.View 
            style={{
              transform: [{ translateY: allergensSlideAnim }],
              opacity: contentAnim,
            }}
          >
            {product.allergens && product.allergens.length > 0 && (
              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-900 mb-3">Allergens</Text>
                <View className="flex-row flex-wrap">
                  {product.allergens.map((allergen, index) => (
                    <View key={index} className="bg-red-100 px-3 py-1 rounded-full mr-2 mb-2">
                      <Text className="text-sm text-red-700">{allergen}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Animated.View>

          {/* Additional Info */}
          <Animated.View 
            style={{
              transform: [{ translateY: additionalSlideAnim }],
              opacity: contentAnim,
            }}
          >
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">Additional Information</Text>
              <View className="space-y-2">
                {product.novaGroup && (
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">NOVA Group</Text>
                    <Text className="font-medium">{product.novaGroup}</Text>
                  </View>
                )}
                {product.ecoscore && (
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">Eco Score</Text>
                    <Text className="font-medium">{product.ecoscore.grade || product.ecoscore.score}</Text>
                  </View>
                )}
                {product.scannedAt && (
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">Scanned</Text>
                    <Text className="font-medium">
                      {product.scannedAt.toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Close Button */}
        <Animated.View 
          style={{
            transform: [{ scale: buttonScaleAnim }],
            opacity: contentAnim,
          }}
        >
          <View className="px-6 py-4 border-t border-gray-200">
            <Pressable 
              onPress={onClose}
              className="bg-primary py-3 rounded-2xl items-center"
            >
              <Text className="text-white font-semibold text-lg">Close</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </>
  );
};
