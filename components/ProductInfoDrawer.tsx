import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, ScrollView, Pressable, Dimensions, Animated, Easing } from 'react-native';
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';
import { ScannedProduct } from '@/contexts/ScannedProductsContext';
import { calculateDailyValue, convertSaltToSodium } from '@/utils/nutritionCalculator';
import { FontAwesome5 } from '@expo/vector-icons';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

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
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

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
  const nutriScore = product.nutriscore?.score || 'N/A'
  const category = product.categories?.[0] || 'N/A'
  const allergens = product.allergens || [];
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

  // Chart toggle icons using FontAwesome
  const BarChartIcon = ({ isActive }: { isActive: boolean }) => (
    <FontAwesome5 
      name="chart-bar" 
      size={18} 
      color={isActive ? '#ffffff' : '#9CA3AF'} 
    />
  );

  const PieChartIcon = ({ isActive }: { isActive: boolean }) => (
    <FontAwesome5 
      name="chart-pie" 
      size={18} 
      color={isActive ? '#ffffff' : '#9CA3AF'} 
    />
  );

  // Chart toggle component
  const ChartToggle = () => (
    <View className="flex-row bg-gray-700 rounded-full p-1">
      <Pressable
        onPress={() => setChartType('bar')}
        className={`p-2 rounded-full ${chartType === 'bar' ? 'bg-gray-600' : ''}`}
      >
        <BarChartIcon isActive={chartType === 'bar'} />
      </Pressable>
      <Pressable
        onPress={() => setChartType('pie')}
        className={`p-2 rounded-full ${chartType === 'pie' ? 'bg-gray-600' : ''}`}
      >
        <PieChartIcon isActive={chartType === 'pie'} />
      </Pressable>
    </View>
  );

  // Pie chart component based on Daily Values
  const renderPieChart = () => {
    const nutritionItems = [
      { 
        label: 'Protein', 
        key: 'proteins_100g', 
        value: product.nutriments?.proteins_100g, 
        color: '#FF6B6B'
      },
      { 
        label: 'Carbs', 
        key: 'carbohydrates_100g', 
        value: product.nutriments?.carbohydrates_100g, 
        color: '#4ECDC4'
      },
      { 
        label: 'Fat', 
        key: 'fat_100g', 
        value: product.nutriments?.fat_100g, 
        color: '#45B7D1'
      },
      { 
        label: 'Fiber', 
        key: 'fiber_100g', 
        value: product.nutriments?.fiber_100g, 
        color: '#96CEB4'
      },
      { 
        label: 'Salt', 
        key: 'salt_100g', 
        value: product.nutriments?.salt_100g, 
        color: '#FFEAA7',
        isSalt: true
      },
    ];

    // Calculate DV percentages for each nutrient
    const nutrientsWithDV = nutritionItems.map(item => {
      if (!item.value || isNaN(Number(item.value))) return null;
      
      let dvInfo;
      if (item.isSalt) {
        // Convert salt to sodium for DV calculation
        const sodiumValue = convertSaltToSodium(Number(item.value));
        dvInfo = calculateDailyValue('sodium_100g', sodiumValue);
      } else {
        dvInfo = calculateDailyValue(item.key, Number(item.value));
      }
      
      return {
        ...item,
        dvPercentage: dvInfo.hasDV ? dvInfo.percentage || 0 : 0,
        hasDV: dvInfo.hasDV
      };
    }).filter(item => item && item.hasDV && item.dvPercentage > 1);

    // Calculate total DV percentage for proportional display
    const totalDVPercentage = nutrientsWithDV.reduce((sum, item) => sum + (item?.dvPercentage || 0), 0);
    const averageDV = nutrientsWithDV.length > 0 ? totalDVPercentage / nutrientsWithDV.length : 0;

    const size = 240;
    const strokeWidth = 35;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    
    let cumulativePercentage = 0;
    
    return (
      <View className="items-center justify-center py-4">
        {/* Main Chart Container */}
        <View className="relative mb-6">
          {/* Outer glow effect */}
          <View className="absolute inset-0 rounded-full" style={{
            shadowColor: '#98B9F2',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 8,
          }} />
          
          <Svg width={size} height={size}>
            {/* Background circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#2D3748"
              strokeWidth={strokeWidth}
              fill="transparent"
              opacity={0.3}
            />
            
            {/* DV-based segments */}
            {nutrientsWithDV.map((item, index) => {
              if (!item) return null;
              
              const segmentPercentage = totalDVPercentage > 0 ? (item.dvPercentage / totalDVPercentage) * 100 : 0;
              
              if (segmentPercentage < 5) return null; // Skip very small segments
              
              const strokeDasharray = `${(segmentPercentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -cumulativePercentage * circumference / 100;
              
              cumulativePercentage += segmentPercentage;
              
              return (
                <Circle
                  key={index}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                  opacity={0.9}
                />
              );
            })}
          </Svg>
          
          {/* Center content */}
          <View className="absolute inset-0 items-center justify-center">
            <Text className="text-white text-4xl font-bold mb-1">
              {Math.round(averageDV)}%
            </Text>
            <Text className="text-gray-300 text-base font-medium">
              Avg Daily Value
            </Text>
          </View>
        </View>
        
        {/* Minimal Legend with Better Spacing */}
        <View className="flex-row flex-wrap justify-center" style={{ gap: 16 }}>
          {nutrientsWithDV.map((item, index) => {
            if (!item) return null;
            
            return (
              <View key={index} className="flex-row items-center space-x-2 mb-3">
                <View 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <Text className="text-white text-sm font-medium">
                  {item.label} {item.dvPercentage.toFixed(0)}%
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // Enhanced nutrition display with Daily Value calculations
  const renderNutritionInfo = () => {
    const nutritionItems = [
      { 
        label: 'Energy', 
        key: 'energy_kcal_100g', 
        value: product.nutriments?.energy_kcal_100g, 
        unit: 'kcal',
        showDV: false, // Energy doesn't have a DV
        color: '#6B7280' // Gray for no DV
      },
      { 
        label: 'Protein', 
        key: 'proteins_100g', 
        value: product.nutriments?.proteins_100g, 
        unit: 'g',
        showDV: true,
        color: '#FF6B6B' // Red - same as pie chart
      },
      { 
        label: 'Total Carbs', 
        key: 'carbohydrates_100g', 
        value: product.nutriments?.carbohydrates_100g, 
        unit: 'g',
        showDV: true,
        color: '#4ECDC4' // Teal - same as pie chart
      },
      { 
        label: 'Total Fat', 
        key: 'fat_100g', 
        value: product.nutriments?.fat_100g, 
        unit: 'g',
        showDV: true,
        color: '#45B7D1' // Blue - same as pie chart
      },
      { 
        label: 'Saturated Fat', 
        key: 'saturated-fat_100g', 
        value: product.nutriments ? (product.nutriments as any)['saturated-fat_100g'] : undefined, 
        unit: 'g',
        showDV: true,
        color: '#96CEB4' // Green - same as pie chart
      },
      { 
        label: 'Fiber', 
        key: 'fiber_100g', 
        value: product.nutriments?.fiber_100g, 
        unit: 'g',
        showDV: true,
        color: '#96CEB4' // Green - same as pie chart
      },
      { 
        label: 'Sugars', 
        key: 'sugars_100g', 
        value: product.nutriments?.sugars_100g, 
        unit: 'g',
        showDV: false, // Sugars don't have a DV
        color: '#6B7280' // Gray for no DV
      },
      { 
        label: 'Salt', 
        key: 'salt_100g', 
        value: product.nutriments?.salt_100g, 
        unit: 'g',
        showDV: true,
        isSalt: true, // Special handling for salt to sodium conversion
        color: '#FFEAA7' // Yellow - same as pie chart
      },
    ];

    return (
      <View className="space-y-20">
        {nutritionItems.map((item, index) => {
          if (!item.value || isNaN(Number(item.value))) return null;
          
          const value = Number(item.value);
          const displayValue = value.toFixed(1);
          
          // Calculate Daily Value if applicable
          let dvInfo = null;
          if (item.showDV) {
            if (item.isSalt) {
              // Convert salt to sodium for DV calculation
              const sodiumValue = convertSaltToSodium(value);
              dvInfo = calculateDailyValue('sodium_100g', sodiumValue);
            } else {
              dvInfo = calculateDailyValue(item.key, value);
            }
          }
          
          return (
            <View key={index} className="space-y-6">
              {/* Header with label, DV, and values */}
              <View className="flex-row items-center">
                <View className="flex-1">
                  <Text className="text-white text-lg font-semibold">{item.label}</Text>
                </View>
                <View className="flex-1 items-center">
                  {dvInfo?.hasDV && (
                    <View 
                      className="px-3 py-1 rounded-full"
                      style={{ backgroundColor: 'rgba(152, 185, 242, 0.2)' }}
                    >
                      <Text 
                        className="text-sm font-bold"
                        style={{ color: '#98B9F2' }}
                      >
                        {dvInfo.percentage}% DV
                      </Text>
                    </View>
                  )}
                </View>
                <View className="flex-1 items-end">
                  <Text className="text-white text-xl font-bold">
                    {displayValue}{item.unit}
                  </Text>
                </View>
              </View>
              
              {/* Progress bar with extra bottom margin */}
              {dvInfo?.hasDV ? (
                <View className="h-4 bg-gray-700 rounded-full overflow-hidden mb-8">
                  <View 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${Math.min(dvInfo.percentage || 0, 100)}%`,
                      backgroundColor: item.color
                    }}
                  />
                </View>
              ) : (
                <View className="h-4 bg-gray-700 rounded-full overflow-hidden mb-8">
                  <View 
                    className="h-full rounded-full"
                    style={{ 
                      width: '30%',
                      backgroundColor: item.color
                    }}
                  />
                </View>
              )}
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
            <ScrollView ref={scrollViewRef} className="flex-1 px-8 py-6" showsVerticalScrollIndicator={false}>
          
          {/* Product Overview */}
          <View className="bg-[#1E293B] rounded-2xl p-4 mb-4">
            <Text className="text-white  text-lg font-bold mb-4">Product Overview</Text>
            <View className="flex-row items-center justify-center space-x-6">
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
              
              <View className="flex-1 items-center">
                <Text className="text-white text-2xl font-semibold text-center" numberOfLines={2}>
                  {productName}
                </Text>
                <Text className="text-gray-300 text-base font-medium text-center mb-2" numberOfLines={2}>
                  {productBrand}
                </Text>
                <View className="flex-row items-center justify-center mb-2">
                  <View 
                    className="px-4 py-2 rounded-full"
                    style={{ backgroundColor: getScoreBackground(nutritionGrade) }}
                  >
                    <Text 
                      className="text-sm font-bold"
                      style={{ color: getScoreColor(nutritionGrade) }}
                    >
                      {nutritionGrade?.toUpperCase() || 'N/A'}
                    </Text>
                  </View>
                  <View style={{ width: 24 }} />
                  <Text className="text-gray-300 text-lg text-base font-medium text-center">
                    {nutriScore}/100
                  </Text>
                </View>
                <View className="bg-gray-600/20 px-4 py-2 rounded-full">
                  <Text className="text-gray-100 text-sm font-semibold text-center">
                    {category}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Nutrition Chart */}
          <View className="bg-[#1E293B] rounded-2xl p-6 mb-4">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-white text-xl font-bold">Nutrition Overview</Text>
              <ChartToggle />
            </View>
            <View className="w-full">
              {chartType === 'bar' ? renderNutritionInfo() : renderPieChart()}
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
        <View className="px-8 py-6 border-t border-gray-700">
          <Pressable 
            onPress={onClose} 
            className="py-4 rounded-2xl items-center"
            style={{ backgroundColor: '#98B9F2' }}
          >
            <Text className="text-white font-semibold text-lg">Close</Text>
          </Pressable>
        </View>
        </Animated.View>
    </>
  );
};




