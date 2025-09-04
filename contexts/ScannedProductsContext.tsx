import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ScannedProduct {
  barcode: string;
  name?: string;
  brand?: string;
  imageUrl?: string;
  categories?: string[];
  ingredients?: string;
  allergens?: string[];
  nutritionGrade?: string;
  novaGroup?: number;
  ecoscore?: {
    grade?: string;
    score?: number;
  };
  nutriments?: {
    energy_kcal_100g?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
    sugars_100g?: number;
    salt_100g?: number;
    sodium_100g?: number;
  };
  nutriscore?: {
    grade?: string;
    score?: number;
  };
  scannedAt: Date;
}

interface ScannedProductsContextType {
  scannedProducts: ScannedProduct[];
  addScannedProduct: (product: ScannedProduct) => void;
  removeScannedProduct: (barcode: string) => void;
  clearScannedProducts: () => void;
  isProductAlreadyScanned: (barcode: string) => boolean;
  getProductByBarcode: (barcode: string) => ScannedProduct | undefined;
}

const ScannedProductsContext = createContext<ScannedProductsContextType | undefined>(undefined);

export const useScannedProducts = () => {
  const context = useContext(ScannedProductsContext);
  if (!context) {
    throw new Error('useScannedProducts must be used within a ScannedProductsProvider');
  }
  return context;
};

interface ScannedProductsProviderProps {
  children: ReactNode;
}

export const ScannedProductsProvider: React.FC<ScannedProductsProviderProps> = ({ children }) => {
  const [scannedProducts, setScannedProducts] = useState<ScannedProduct[]>([]);

  const addScannedProduct = (product: ScannedProduct) => {
    setScannedProducts(prev => {
      // Remove existing product with same barcode if it exists
      const filtered = prev.filter(p => p.barcode !== product.barcode);
      // Add new product at the beginning (most recent first)
      return [product, ...filtered];
    });
  };

  const removeScannedProduct = (barcode: string) => {
    setScannedProducts(prev => prev.filter(p => p.barcode !== barcode));
  };

  const clearScannedProducts = () => {
    setScannedProducts([]);
  };

  const isProductAlreadyScanned = (barcode: string) => {
    return scannedProducts.some(p => p.barcode === barcode);
  };

  const getProductByBarcode = (barcode: string) => {
    return scannedProducts.find(p => p.barcode === barcode);
  };

  const value: ScannedProductsContextType = {
    scannedProducts,
    addScannedProduct,
    removeScannedProduct,
    clearScannedProducts,
    isProductAlreadyScanned,
    getProductByBarcode,
  };

  return (
    <ScannedProductsContext.Provider value={value}>
      {children}
    </ScannedProductsContext.Provider>
  );
};
