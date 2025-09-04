import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { ScannedProduct } from '@/contexts/ScannedProductsContext';

interface ScannedProductCardProps {
  product: ScannedProduct;
  onPress?: () => void;
  onRemove?: () => void;
}

export const ScannedProductCard: React.FC<ScannedProductCardProps> = ({ 
  product, 
  onPress,
  onRemove 
}) => {
  const getScoreColor = (grade?: string) => {
    switch (grade?.toLowerCase()) {
      case 'a':
        return 'text-grade-a bg-green-100 border-grade-a';
      case 'b':
        return 'text-grade-b bg-green-50 border-grade-b';
      case 'c':
        return 'text-grade-c bg-yellow-50 border-grade-c';
      case 'd':
        return 'text-grade-d bg-orange-50 border-grade-d';
      case 'e':
        return 'text-grade-e bg-red-50 border-grade-e';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-400';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <Pressable 
      className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100"
      onPress={onPress}
    >
      <View className="flex-row items-start space-x-4">
        {/* Product Image */}
        <View className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
          {product.imageUrl ? (
            <Image
              source={{ uri: product.imageUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full bg-gray-200 items-center justify-center">
              <Text className="text-gray-500 text-xs text-center px-1">
                {product.name?.substring(0, 15) || 'No Image'}
              </Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-bold text-gray-900 flex-1 mr-2" numberOfLines={2}>
              {product.name || 'Unknown Product'}
            </Text>
            {onRemove && (
              <Pressable 
                className="p-2"
                onPress={onRemove}
              >
                <Text className="text-red-500 text-lg">×</Text>
              </Pressable>
            )}
          </View>

          {product.brand && (
            <Text className="text-gray-600 text-sm mb-1">
              {product.brand}
            </Text>
          )}

          {/* Score and Categories */}
          <View className="flex-row items-center space-x-2 mb-2">
            <View className={`px-3 py-1 rounded-full border ${getScoreColor(product.nutriscore?.grade || product.nutritionGrade)}`}>
              <Text className={`text-sm font-bold ${getScoreColor(product.nutriscore?.grade || product.nutritionGrade).split(' ')[0]}`}>
                {(product.nutriscore?.grade || product.nutritionGrade || 'N/A').toUpperCase()}
              </Text>
            </View>
            
            {product.categories && product.categories.length > 0 && (
              <Text className="text-gray-500 text-xs">
                {product.categories[0]}
              </Text>
            )}
          </View>

          {/* Nutrition Info */}
          {product.nutriments && (
            <View className="flex-row space-x-4">
              {product.nutriments.energy_kcal_100g && (
                <View className="items-center">
                  <Text className="text-gray-900 font-semibold text-sm">
                    {Math.round(product.nutriments.energy_kcal_100g)}
                  </Text>
                  <Text className="text-gray-500 text-xs">kcal</Text>
                </View>
              )}
              {product.nutriments.proteins_100g && (
                <View className="items-center">
                  <Text className="text-gray-900 font-semibold text-sm">
                    {product.nutriments.proteins_100g.toFixed(1)}g
                  </Text>
                  <Text className="text-gray-500 text-xs">Protein</Text>
                </View>
              )}
              {product.nutriments.carbohydrates_100g && (
                <View className="items-center">
                  <Text className="text-gray-900 font-semibold text-sm">
                    {product.nutriments.carbohydrates_100g.toFixed(1)}g
                  </Text>
                  <Text className="text-gray-500 text-xs">Carbs</Text>
                </View>
              )}
            </View>
          )}

          {/* Scan Time */}
          <Text className="text-gray-400 text-xs mt-2">
            Scanned {formatDate(product.scannedAt)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};
