import React, { useEffect, useState } from 'react';
import { View, Text, Image, Dimensions, Animated } from 'react-native';
import { ScannedProduct } from '@/contexts/ScannedProductsContext';

interface ScannedProductIconProps {
  product: ScannedProduct;
  position?: 'left' | 'center' | 'right' | 'center-left' | 'center-right';
  index?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export const ScannedProductIcon: React.FC<ScannedProductIconProps> = ({ 
  product, 
  position = 'left',
  index = 0
}) => {
  const fadeAnim = new Animated.Value(1); // Start visible immediately
  const scaleAnim = new Animated.Value(1); // Start at full size
  const slideAnim = new Animated.Value(0); // Start at final position
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);

  useEffect(() => {
    // Simple entrance animation - no delay to ensure visibility
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, // Keep at full opacity
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1, // Keep at full size
        tension: 150,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0, // Keep at final position
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  // Reset image states when product changes
  useEffect(() => {
    if (product.imageUrl) {
      setImageLoading(false);
      setImageError(false);
      setShowLoadingIndicator(false);
    }
  }, [product.imageUrl]);

  const getScoreColor = (grade?: string) => {
    switch (grade?.toLowerCase()) {
      case 'a':
        return 'text-green-500';
      case 'b':
        return 'text-blue-500';
      case 'c':
        return 'text-yellow-500';
      case 'd':
        return 'text-orange-500';
      case 'e':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  const getScoreBackground = (grade?: string) => {
    switch (grade?.toLowerCase()) {
      case 'a':
        return 'bg-green-100';
      case 'b':
        return 'bg-blue-100';
      case 'c':
        return 'bg-yellow-100';
      case 'd':
        return 'bg-orange-100';
      case 'e':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <Animated.View 
      className="items-center mx-3"
      style={{
        opacity: fadeAnim, // Use animated opacity
        transform: [{ scale: scaleAnim }, { translateX: slideAnim }],
      }}
    >
      {/* Product Image Square */}
      <View className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg border-4 border-white">
        {product.imageUrl ? (
          <Image
            source={{ 
              uri: product.imageUrl,
              // Add cache policy for better image loading
              cache: 'force-cache'
            }}
            className="w-full h-full"
            resizeMode="cover"
            onLoadStart={() => {
              setImageLoading(true);
              setImageError(false);
              // Show loading indicator after 300ms to avoid flickering
              setTimeout(() => {
                if (imageLoading) {
                  setShowLoadingIndicator(true);
                }
              }, 300);
            }}
            onLoad={() => {
              setImageLoading(false);
              setImageError(false);
              setShowLoadingIndicator(false);
            }}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
              console.log('❌ Image failed to load:', product.imageUrl);
            }}
            // Keep image fully opaque at all times
            style={{
              opacity: 1,
            }}
            // Force image to reload when URL changes
            key={product.imageUrl}
          />
        ) : (
          <View className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center">
            <Text className="text-white text-xs text-center font-bold">
              {product.name?.substring(0, 4) || 'SCAN'}
            </Text>
          </View>
        )}
        
        {/* Loading indicator */}
        {showLoadingIndicator && product.imageUrl && (
          <View className="absolute inset-0 bg-gray-800 bg-opacity-50 items-center justify-center">
            <Text className="text-white text-xs">Loading...</Text>
          </View>
        )}
        
        {/* Error indicator */}
        {imageError && product.imageUrl && (
          <View className="absolute inset-0 bg-red-800 bg-opacity-50 items-center justify-center">
            <Text className="text-white text-xs">Failed</Text>
          </View>
        )}
      </View>
      
      {/* Score Badge - Smaller to match icon size */}
      <View className="mt-1 px-1 py-0.5 rounded-full bg-black bg-opacity-80 border border-white border-opacity-30">
        <Text className={`text-xs font-bold text-white`}>
          {product.nutriscore?.grade || product.nutritionGrade || '⏳'}
        </Text>
      </View>
    </Animated.View>
  );
};
