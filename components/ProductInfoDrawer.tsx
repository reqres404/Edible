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

  // Enhanced pie chart component with detailed breakdown
  const renderPieChart = () => {
    const nutriments = product.nutriments || {};
    
    // Define pie chart item type
    type PieChartItem = {
      label: string;
      key: string;
      value?: number;
      color: string;
      category: string;
      subItem?: boolean;
      isSalt?: boolean;
    };
    
    // Enhanced nutrition items with detailed breakdown
    const nutritionItems: PieChartItem[] = [
      { 
        label: 'Protein', 
        key: 'proteins_100g', 
        value: nutriments.proteins_100g, 
        color: '#FF6B6B',
        category: 'macros'
      },
      { 
        label: 'Total Carbs', 
        key: 'carbohydrates_100g', 
        value: nutriments.carbohydrates_100g, 
        color: '#4ECDC4',
        category: 'carbs'
      },
      { 
        label: 'Dietary Fiber', 
        key: 'dietary_fiber_100g', 
        value: nutriments.dietary_fiber_100g, 
        color: '#96CEB4',
        category: 'carbs',
        subItem: true
      },
      { 
        label: 'Fiber', 
        key: 'fiber_100g', 
        value: nutriments.fiber_100g, 
        color: '#96CEB4',
        category: 'carbs',
        subItem: true
      },
      { 
        label: 'Sugars', 
        key: 'sugars_100g', 
        value: nutriments.sugars_100g, 
        color: '#F39C12',
        category: 'carbs',
        subItem: true
      },
      { 
        label: 'Added Sugars', 
        key: 'added_sugars_100g', 
        value: nutriments.added_sugars_100g, 
        color: '#E74C3C',
        category: 'carbs',
        subItem: true
      },
      { 
        label: 'Starch', 
        key: 'starch_100g', 
        value: nutriments.starch_100g, 
        color: '#9B59B6',
        category: 'carbs',
        subItem: true
      },
      { 
        label: 'Total Fat', 
        key: 'fat_100g', 
        value: nutriments.fat_100g, 
        color: '#45B7D1',
        category: 'fats'
      },
      { 
        label: 'Saturated Fat', 
        key: 'saturated_fat_100g', 
        value: nutriments.saturated_fat_100g, 
        color: '#E67E22',
        category: 'fats',
        subItem: true
      },
      { 
        label: 'Trans Fat', 
        key: 'trans_fat_100g', 
        value: nutriments.trans_fat_100g, 
        color: '#C0392B',
        category: 'fats',
        subItem: true
      },
      { 
        label: 'Salt', 
        key: 'salt_100g', 
        value: nutriments.salt_100g, 
        color: '#FFEAA7',
        isSalt: true,
        category: 'minerals'
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

  // Enhanced nutrition display with composite bars for carbs and fats
  const renderNutritionInfo = () => {
    // Get all available nutrition data
    const nutriments = product.nutriments || {};
    
    // Define nutrition item type
    type NutritionItem = {
      label: string;
      key: string;
      value?: number;
      unit: string;
      showDV: boolean;
      color: string;
      isMain?: boolean;
      subItem?: boolean;
      isSalt?: boolean;
    };

    // Helper function to create composite bar for carbs
    const renderCompositeCarbBar = () => {
      const totalCarbs = Number(nutriments.carbohydrates_100g) || 0;
      const fiber = Number(nutriments.fiber_100g) || Number(nutriments.dietary_fiber_100g) || 0;
      const sugars = Number(nutriments.sugars_100g) || 0;
      const addedSugars = Number(nutriments.added_sugars_100g) || 0;
      const starch = Number(nutriments.starch_100g) || 0;
      const polyols = Number(nutriments.polyols_100g) || 0;
      
      // Calculate DV for total carbs
      const dvInfo = calculateDailyValue('carbohydrates_100g', totalCarbs);
      const barWidth = dvInfo?.hasDV ? Math.min(dvInfo.percentage || 0, 100) : 30;
      
      // Calculate percentages for each component
      const components = [
        { label: 'Fiber', value: fiber, color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.15)' },
        { label: 'Sugars', value: sugars, color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.15)' },
        { label: 'Added Sugars', value: addedSugars, color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.15)' },
        { label: 'Starch', value: starch, color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.15)' },
        { label: 'Polyols', value: polyols, color: '#06B6D4', bgColor: 'rgba(6, 182, 212, 0.15)' }
      ].filter(comp => comp.value > 0);
      
      const totalComponents = components.reduce((sum, comp) => sum + comp.value, 0);
      
      return (
        <View className="space-y-4">
          {/* Header with improved styling and bullet point */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View 
                className="w-2 h-2 rounded-full mr-3"
                style={{ backgroundColor: '#10B981' }}
              />
              <Text className="text-white text-xl font-bold">Carbohydrates</Text>
            </View>
            <View className="flex-row items-center space-x-4">
              {dvInfo?.hasDV && (
                <View 
                  className="px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
                >
                  <Text 
                    className="text-sm font-bold"
                    style={{ color: '#10B981' }}
                  >
                    {dvInfo.percentage}% DV
                  </Text>
                </View>
              )}
              <Text className="text-white text-xl font-bold min-w-[60px] text-right">{totalCarbs.toFixed(1)}g</Text>
            </View>
          </View>
          
          {/* Segmented Progress Bar showing component breakdown */}
          <View className="relative">
            <View className="h-5 bg-gray-800 rounded-full overflow-hidden shadow-inner">
              {totalComponents > 0 ? (
                <View className="h-full flex-row">
                  {components.map((comp, index) => {
                    const componentWidth = (comp.value / totalComponents) * barWidth;
                    const isLast = index === components.length - 1;
                    return (
                      <View
                        key={index}
                        className="h-full"
                        style={{
                          width: `${componentWidth}%`,
                          backgroundColor: comp.color,
                          borderTopRightRadius: isLast ? 12 : 0,
                          borderBottomRightRadius: isLast ? 12 : 0,
                          borderTopLeftRadius: index === 0 ? 12 : 0,
                          borderBottomLeftRadius: index === 0 ? 12 : 0,
                          marginRight: isLast ? 0 : 1,
                        }}
                      />
                    );
                  })}
                </View>
              ) : (
                <View 
                  className="h-full rounded-full"
                  style={{ 
                    width: `${barWidth}%`,
                    backgroundColor: '#10B981',
                  }}
                />
              )}
            </View>
            {/* Progress bar glow effect */}
            <View 
              className="absolute top-0 h-5 rounded-full opacity-20"
              style={{ 
                width: `${barWidth}%`,
                backgroundColor: '#10B981',
                shadowColor: '#10B981',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 8,
              }}
            />
          </View>
          
          {/* Enhanced Component Breakdown */}
          {components.length > 0 && (
            <View className="bg-gray-800/50 rounded-xl p-4 space-y-3">
              <Text className="text-gray-300 text-sm font-semibold uppercase tracking-wide">Breakdown</Text>
              <View className="space-y-2">
                {components.map((comp, index) => {
                  const percentage = totalComponents > 0 ? (comp.value / totalComponents) * 100 : 0;
                  return (
                    <View key={index} className="flex-row items-center justify-between p-2 rounded-lg" style={{ backgroundColor: comp.bgColor }}>
                      <View className="flex-row items-center flex-1">
                        <View 
                          className="w-4 h-4 rounded-full mr-3 shadow-sm"
                          style={{ 
                            backgroundColor: comp.color,
                            shadowColor: comp.color,
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.3,
                            shadowRadius: 2,
                          }}
                        />
                        <Text className="text-white text-sm font-medium">{comp.label}</Text>
                      </View>
                      <View className="flex-row items-center space-x-2">
                        <Text className="text-white text-sm font-bold">{comp.value.toFixed(1)}g</Text>
                        <View 
                          className="px-2 py-1 rounded-full"
                          style={{ backgroundColor: comp.color + '20' }}
                        >
                          <Text 
                            className="text-xs font-bold"
                            style={{ color: comp.color }}
                          >
                            {percentage.toFixed(0)}%
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      );
    };

    // Helper function to create composite bar for fats
    const renderCompositeFatBar = () => {
      const totalFat = Number(nutriments.fat_100g) || 0;
      const saturatedFat = Number(nutriments.saturated_fat_100g) || 0;
      const transFat = Number(nutriments.trans_fat_100g) || 0;
      const unsaturatedFat = totalFat - saturatedFat - transFat; // Calculate unsaturated fat
      
      // Calculate DV for total fat
      const dvInfo = calculateDailyValue('fat_100g', totalFat);
      const barWidth = dvInfo?.hasDV ? Math.min(dvInfo.percentage || 0, 100) : 30;
      
      // Calculate percentages for each component
      const components = [
        { label: 'Saturated', value: saturatedFat, color: '#F97316', bgColor: 'rgba(249, 115, 22, 0.15)' },
        { label: 'Unsaturated', value: Math.max(0, unsaturatedFat), color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.15)' },
        { label: 'Trans', value: transFat, color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.15)' }
      ].filter(comp => comp.value > 0);
      
      const totalComponents = components.reduce((sum, comp) => sum + comp.value, 0);
      
      return (
        <View className="space-y-4">
          {/* Header with improved styling and bullet point */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View 
                className="w-2 h-2 rounded-full mr-3"
                style={{ backgroundColor: '#3B82F6' }}
              />
              <Text className="text-white text-xl font-bold">Fats</Text>
            </View>
            <View className="flex-row items-center space-x-4">
              {dvInfo?.hasDV && (
                <View 
                  className="px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}
                >
                  <Text 
                    className="text-sm font-bold"
                    style={{ color: '#3B82F6' }}
                  >
                    {dvInfo.percentage}% DV
                  </Text>
                </View>
              )}
              <Text className="text-white text-xl font-bold min-w-[60px] text-right">{totalFat.toFixed(1)}g</Text>
            </View>
          </View>
          
          {/* Segmented Progress Bar showing component breakdown */}
          <View className="relative">
            <View className="h-5 bg-gray-800 rounded-full overflow-hidden shadow-inner">
              {totalComponents > 0 ? (
                <View className="h-full flex-row">
                  {components.map((comp, index) => {
                    const componentWidth = (comp.value / totalComponents) * barWidth;
                    const isLast = index === components.length - 1;
                    return (
                      <View
                        key={index}
                        className="h-full"
                        style={{
                          width: `${componentWidth}%`,
                          backgroundColor: comp.color,
                          borderTopRightRadius: isLast ? 12 : 0,
                          borderBottomRightRadius: isLast ? 12 : 0,
                          borderTopLeftRadius: index === 0 ? 12 : 0,
                          borderBottomLeftRadius: index === 0 ? 12 : 0,
                          marginRight: isLast ? 0 : 1,
                        }}
                      />
                    );
                  })}
                </View>
              ) : (
                <View 
                  className="h-full rounded-full"
                  style={{ 
                    width: `${barWidth}%`,
                    backgroundColor: '#3B82F6',
                  }}
                />
              )}
            </View>
            {/* Progress bar glow effect */}
            <View 
              className="absolute top-0 h-5 rounded-full opacity-20"
              style={{ 
                width: `${barWidth}%`,
                backgroundColor: '#3B82F6',
                shadowColor: '#3B82F6',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 8,
              }}
            />
          </View>
          
          {/* Enhanced Component Breakdown */}
          {components.length > 0 && (
            <View className="bg-gray-800/50 rounded-xl p-4 space-y-3">
              <Text className="text-gray-300 text-sm font-semibold uppercase tracking-wide">Breakdown</Text>
              <View className="space-y-2">
                {components.map((comp, index) => {
                  const percentage = totalComponents > 0 ? (comp.value / totalComponents) * 100 : 0;
                  return (
                    <View key={index} className="flex-row items-center justify-between p-2 rounded-lg" style={{ backgroundColor: comp.bgColor }}>
                      <View className="flex-row items-center flex-1">
                        <View 
                          className="w-4 h-4 rounded-full mr-3 shadow-sm"
                          style={{ 
                            backgroundColor: comp.color,
                            shadowColor: comp.color,
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.3,
                            shadowRadius: 2,
                          }}
                        />
                        <Text className="text-white text-sm font-medium">{comp.label}</Text>
                      </View>
                      <View className="flex-row items-center space-x-2">
                        <Text className="text-white text-sm font-bold">{comp.value.toFixed(1)}g</Text>
                        <View 
                          className="px-2 py-1 rounded-full"
                          style={{ backgroundColor: comp.color + '20' }}
                        >
                          <Text 
                            className="text-xs font-bold"
                            style={{ color: comp.color }}
                          >
                            {percentage.toFixed(0)}%
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      );
    };

    // Main nutrition categories with simplified structure
    const nutritionCategories: Array<{
      title: string;
      items: NutritionItem[];
    }> = [
      {
        title: 'Energy',
        items: [
          { 
            label: 'Calories', 
            key: 'energy_kcal_100g', 
            value: nutriments.energy_kcal_100g, 
            unit: 'kcal',
            showDV: false,
            color: '#6B7280'
          }
        ]
      },
      {
        title: 'Protein & Minerals',
        items: [
          { 
            label: 'Protein', 
            key: 'proteins_100g', 
            value: nutriments.proteins_100g, 
            unit: 'g',
            showDV: true,
            color: '#FF6B6B'
          },
          { 
            label: 'Salt', 
            key: 'salt_100g', 
            value: nutriments.salt_100g, 
            unit: 'g',
            showDV: true,
            isSalt: true,
            color: '#FFEAA7'
          },
          { 
            label: 'Sodium', 
            key: 'sodium_100g', 
            value: nutriments.sodium_100g, 
            unit: 'mg',
            showDV: true,
            color: '#F39C12'
          }
        ]
      }
    ];

    return (
      <View className="space-y-6">
        {/* Individual Nutrition Items */}
        {nutritionCategories.map((category, categoryIndex) => {
          // Filter out categories with no available data
          const availableItems = category.items.filter(item => 
            item.value !== undefined && !isNaN(Number(item.value))
          );
          
          if (availableItems.length === 0) return null;
          
          return (
            <View key={categoryIndex} className="space-y-4">
              {/* Category Items */}
              <View className="space-y-4">
                {availableItems.map((item, itemIndex) => {
                  const value = Number(item.value);
                  const displayValue = value.toFixed(1);
                  
                  // Calculate Daily Value if applicable
                  let dvInfo = null;
                  if (item.showDV) {
                    if (item.isSalt) {
                      const sodiumValue = convertSaltToSodium(value);
                      dvInfo = calculateDailyValue('sodium_100g', sodiumValue);
                    } else {
                      dvInfo = calculateDailyValue(item.key, value);
                    }
                  }
                  
                  return (
                    <View key={itemIndex} className="space-y-3">
                      {/* Enhanced Item Header with consistent alignment */}
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                          <View 
                            className="w-2 h-2 rounded-full mr-3"
                            style={{ backgroundColor: item.color }}
                          />
                          <Text className="text-white text-xl font-bold">
                              {item.label}
                            </Text>
                        </View>
                        
                        <View className="flex-row items-center space-x-4">
                          {dvInfo?.hasDV && (
                            <View 
                              className="px-3 py-1.5 rounded-full"
                              style={{ backgroundColor: item.color + '20' }}
                            >
                              <Text 
                                className="text-sm font-bold"
                                style={{ color: item.color }}
                              >
                                {dvInfo.percentage}% DV
                              </Text>
                            </View>
                          )}
                          <Text className="text-white text-xl font-bold min-w-[60px] text-right">
                            {displayValue}{item.unit}
                          </Text>
                        </View>
                      </View>
                      
                      {/* Enhanced Progress Bar */}
                      <View className="relative">
                        <View className="h-5 bg-gray-800 rounded-full overflow-hidden shadow-inner">
                        {dvInfo?.hasDV ? (
                          <View 
                              className="h-full rounded-full shadow-lg"
                            style={{ 
                              width: `${Math.min(dvInfo.percentage || 0, 100)}%`,
                                backgroundColor: item.color,
                                shadowColor: item.color,
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.3,
                                shadowRadius: 4,
                                elevation: 4,
                            }}
                          />
                        ) : (
                          <View 
                            className="h-full rounded-full"
                            style={{ 
                              width: '30%',
                              backgroundColor: item.color,
                              opacity: 0.6
                              }}
                            />
                          )}
                        </View>
                        {/* Progress bar glow effect for DV items */}
                        {dvInfo?.hasDV && (
                          <View 
                            className="absolute top-0 h-5 rounded-full opacity-30"
                            style={{ 
                              width: `${Math.min(dvInfo.percentage || 0, 100)}%`,
                              backgroundColor: item.color,
                              shadowColor: item.color,
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.8,
                              shadowRadius: 8,
                            }}
                          />
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        {/* Carbohydrates Section with Composite Bar */}
        {nutriments.carbohydrates_100g && !isNaN(Number(nutriments.carbohydrates_100g)) && (
          <View className="space-y-4">
            {renderCompositeCarbBar()}
          </View>
        )}

        {/* Fats Section with Composite Bar */}
        {nutriments.fat_100g && !isNaN(Number(nutriments.fat_100g)) && (
          <View className="space-y-4">
            {renderCompositeFatBar()}
          </View>
        )}
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




