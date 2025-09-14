import { DAILY_REFERENCE_VALUES, NUTRIENT_DV_MAPPING, NUTRIENT_UNITS } from '@/constants/nutrition';

/**
 * Calculates the % Daily Value for a given nutrient
 * @param nutrientKey - The OpenFoodFacts nutrient key (e.g., 'fat_100g')
 * @param nutrientValue - The nutrient value per 100g
 * @returns Object containing the calculated %DV and related information
 */
export const calculateDailyValue = (
  nutrientKey: string,
  nutrientValue: number
): {
  dailyValue: number | null;
  percentage: number | null;
  unit: string;
  hasDV: boolean;
} => {
  // Get the corresponding DV key from mapping
  const dvKey = NUTRIENT_DV_MAPPING[nutrientKey as keyof typeof NUTRIENT_DV_MAPPING];
  
  // If no DV mapping exists, return null values
  if (!dvKey) {
    return {
      dailyValue: null,
      percentage: null,
      unit: getUnitForNutrient(nutrientKey),
      hasDV: false,
    };
  }

  // Get the daily reference value
  const dailyValue = DAILY_REFERENCE_VALUES[dvKey as keyof typeof DAILY_REFERENCE_VALUES];
  
  if (!dailyValue || dailyValue === 0) {
    return {
      dailyValue: null,
      percentage: null,
      unit: getUnitForNutrient(nutrientKey),
      hasDV: false,
    };
  }

  // Calculate percentage
  const percentage = (nutrientValue / dailyValue) * 100;

  return {
    dailyValue,
    percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal place
    unit: getUnitForNutrient(nutrientKey),
    hasDV: true,
  };
};

/**
 * Gets the appropriate unit for a nutrient key
 * @param nutrientKey - The OpenFoodFacts nutrient key
 * @returns The unit string
 */
const getUnitForNutrient = (nutrientKey: string): string => {
  // Special cases for common nutrients
  if (nutrientKey.includes('energy') || nutrientKey.includes('kcal')) {
    return 'kcal';
  }
  
  if (nutrientKey.includes('sugars')) {
    return 'g';
  }
  
  if (nutrientKey.includes('salt')) {
    return 'g';
  }
  
  // Get unit from mapping if available
  const dvKey = NUTRIENT_DV_MAPPING[nutrientKey as keyof typeof NUTRIENT_DV_MAPPING];
  if (dvKey) {
    return NUTRIENT_UNITS[dvKey as keyof typeof NUTRIENT_UNITS] || 'g';
  }
  
  // Default units based on nutrient type
  if (nutrientKey.includes('vitamin') || nutrientKey.includes('mineral')) {
    return 'mg';
  }
  
  return 'g';
};

/**
 * Converts salt to sodium equivalent for DV calculation
 * @param saltValue - Salt value in grams
 * @returns Sodium equivalent in milligrams
 */
export const convertSaltToSodium = (saltValue: number): number => {
  // Salt is approximately 40% sodium by weight
  // 1g salt = 400mg sodium
  return saltValue * 400;
};

/**
 * Gets a color for the %DV based on the percentage value
 * @param percentage - The %DV percentage
 * @returns Color string for the progress bar
 */
export const getDVColor = (percentage: number): string => {
  if (percentage >= 20) {
    return '#10B981'; // Green - High
  } else if (percentage >= 10) {
    return '#3B82F6'; // Blue - Good
  } else if (percentage >= 5) {
    return '#F59E0B'; // Yellow - Moderate
  } else {
    return '#6B7280'; // Gray - Low
  }
};

/**
 * Gets a descriptive label for the %DV level
 * @param percentage - The %DV percentage
 * @returns Descriptive label
 */
export const getDVLabel = (percentage: number): string => {
  if (percentage >= 20) {
    return 'High';
  } else if (percentage >= 10) {
    return 'Good';
  } else if (percentage >= 5) {
    return 'Moderate';
  } else {
    return 'Low';
  }
};




