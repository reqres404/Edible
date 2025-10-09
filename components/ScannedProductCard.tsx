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
      className="bg-white rounded-2xl mb-4 shadow-sm border border-gray-100"
      onPress={onPress}
      style={{ elevation: 2 }}
    >
      <View className="p-5">
        <View className="flex-row items-center">
          {/* Product Image */}
          <View className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 mr-4">
            {product.imageUrl ? (
              <Image
                source={{ uri: product.imageUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full bg-gray-200 items-center justify-center">
                <Text className="text-gray-500 text-xs text-center px-2">
                  {product.name?.substring(0, 12) || 'No Image'}
                </Text>
              </View>
            )}
          </View>

          {/* Product Info */}
          <View className="flex-1">
            {/* Header Row with Title and Remove Button */}
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-1 mr-3">
                <Text className="text-xl font-bold text-gray-900 leading-tight" numberOfLines={2}>
                  {product.name || 'Unknown Product'}
                </Text>
                {product.brand && (
                  <Text className="text-gray-600 text-base mt-1">
                    {product.brand}
                  </Text>
                )}
              </View>
              {onRemove && (
                <Pressable 
                  className="p-1 -mt-1 -mr-1"
                  onPress={onRemove}
                >
                  <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
                    <Text className="text-red-500 text-lg font-bold">×</Text>
                  </View>
                </Pressable>
              )}
            </View>

            {/* Score and Category Row */}
            <View className="flex-row items-center mb-4">
              <View className={`px-4 py-2 rounded-full border-2 ${getScoreColor(product.nutriscore?.grade || product.nutritionGrade)}`}>
                <Text className={`text-lg font-bold ${getScoreColor(product.nutriscore?.grade || product.nutritionGrade).split(' ')[0]}`}>
                  {(product.nutriscore?.grade || product.nutritionGrade || 'N/A').toUpperCase()}
                </Text>
              </View>
              
              {product.categories && product.categories.length > 0 && (
                <View className="ml-3 px-3 py-1 bg-gray-100 rounded-full">
                  <Text className="text-gray-600 text-sm font-medium">
                    {product.categories[0]}
                  </Text>
                </View>
              )}
            </View>

            {/* Nutrition Info */}
            {product.nutriments && (
              <View className="bg-gray-50 rounded-xl p-4 mb-4">
                <View className="flex-row justify-around">
                  {product.nutriments.energy_kcal_100g && (
                    <View className="items-center">
                      <Text className="text-gray-900 font-bold text-lg">
                        {Math.round(product.nutriments.energy_kcal_100g)}
                      </Text>
                      <Text className="text-gray-600 text-sm font-medium mt-1">kcal</Text>
                    </View>
                  )}
                  {product.nutriments.proteins_100g && (
                    <View className="items-center">
                      <Text className="text-gray-900 font-bold text-lg">
                        {product.nutriments.proteins_100g.toFixed(1)}g
                      </Text>
                      <Text className="text-gray-600 text-sm font-medium mt-1">Protein</Text>
                    </View>
                  )}
                  {product.nutriments.carbohydrates_100g && (
                    <View className="items-center">
                      <Text className="text-gray-900 font-bold text-lg">
                        {product.nutriments.carbohydrates_100g.toFixed(1)}g
                      </Text>
                      <Text className="text-gray-600 text-sm font-medium mt-1">Carbs</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Scan Time */}
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-500 text-sm">
                Scanned {formatDate(product.scannedAt)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
};
