import React, { useState } from 'react';
import { Text, View, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useScannedProducts } from '@/contexts/ScannedProductsContext';
import { ScannedProductCard } from '@/components/ScannedProductCard';
import { ProductInfoDrawer } from '@/components/ProductInfoDrawer';

const Saved = () => {
  const { scannedProducts, clearScannedProducts, removeScannedProduct } = useScannedProducts();
  const insets = useSafeAreaInsets();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const handleProductPress = (product: any) => {
    setSelectedProduct(product);
    setIsDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerVisible(false);
    setSelectedProduct(null);
  };

  const handleClearAll = () => {
    clearScannedProducts();
  };

  return (
    <View className="flex-1 bg-offwhite">
      {/* Header */}
      <View 
        className="bg-white px-6 py-4 border-b border-gray-200"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-3xl text-dark-500 font-bold">History</Text>
          {scannedProducts.length > 0 && (
            <Pressable 
              onPress={handleClearAll}
              className="px-4 py-2 bg-red-500 rounded-lg"
            >
              <Text className="text-white text-sm font-semibold">Clear All</Text>
            </Pressable>
          )}
        </View>
        <Text className="text-gray-600 text-sm mt-1">
          {scannedProducts.length} product{scannedProducts.length !== 1 ? 's' : ''} scanned
        </Text>
      </View>

      {/* Content */}
      <ScrollView 
        className="flex-1 px-6 py-4"
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100, // Add extra space for bottom navigation + safe area
        }}
        showsVerticalScrollIndicator={false}
      >
        {scannedProducts.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <View className="w-24 h-24 bg-gray-200 rounded-full items-center justify-center mb-4">
              <Text className="text-gray-400 text-4xl">📱</Text>
            </View>
            <Text className="text-gray-500 text-lg font-medium text-center mb-2">
              No products scanned yet
            </Text>
            <Text className="text-gray-400 text-sm text-center px-8">
              Scan a product barcode to see it appear here
            </Text>
          </View>
        ) : (
          scannedProducts.map((product) => (
            <ScannedProductCard
              key={product.barcode}
              product={product}
              onPress={() => handleProductPress(product)}
              onRemove={() => removeScannedProduct(product.barcode)}
            />
          ))
        )}
      </ScrollView>

      {/* Product Info Drawer */}
      <ProductInfoDrawer
        product={selectedProduct}
        isVisible={isDrawerVisible}
        onClose={handleCloseDrawer}
        isFromHistory={true}
      />
    </View>
  );
};

export default Saved;