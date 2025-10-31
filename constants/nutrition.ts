/**
 * FDA Daily Reference Values (DRVs) for adults and children aged 4 and older
 * Based on a 2,000-calorie daily intake
 * Source: FDA Nutrition Facts Label Requirements
 */

export const DAILY_REFERENCE_VALUES = {
  // Macronutrients
  totalFat: 78, // grams
  saturatedFat: 20, // grams
  cholesterol: 300, // milligrams
  sodium: 2300, // milligrams
  potassium: 4700, // milligrams
  totalCarbohydrate: 275, // grams
  dietaryFiber: 28, // grams
  protein: 50, // grams

  // Vitamins
  vitaminA: 900, // micrograms
  vitaminC: 90, // milligrams
  vitaminD: 20, // micrograms
  vitaminE: 15, // milligrams
  vitaminK: 120, // micrograms
  thiamin: 1.2, // milligrams (Vitamin B1)
  riboflavin: 1.3, // milligrams (Vitamin B2)
  niacin: 16, // milligrams (Vitamin B3)
  vitaminB6: 1.7, // milligrams
  folate: 400, // micrograms
  vitaminB12: 2.4, // micrograms
  biotin: 30, // micrograms
  pantothenicAcid: 5, // milligrams

  // Minerals
  calcium: 1300, // milligrams
  iron: 18, // milligrams
  phosphorus: 1250, // milligrams
  iodine: 150, // micrograms
  magnesium: 420, // milligrams
  zinc: 11, // milligrams
  selenium: 55, // micrograms
  copper: 0.9, // milligrams
  manganese: 2.3, // milligrams
  chromium: 35, // micrograms
  molybdenum: 45, // micrograms
  chloride: 2300, // milligrams
  choline: 550, // milligrams
} as const;

/**
 * Mapping of OpenFoodFacts nutrient keys to FDA Daily Reference Values
 */
export const NUTRIENT_DV_MAPPING = {
  // Energy (no DV, but we can show calories)
  energy_kcal_100g: null,
  
  // Macronutrients
  fat_100g: 'totalFat',
  'saturated-fat_100g': 'saturatedFat',
  cholesterol_100g: 'cholesterol',
  sodium_100g: 'sodium',
  potassium_100g: 'potassium',
  carbohydrates_100g: 'totalCarbohydrate',
  fiber_100g: 'dietaryFiber',
  proteins_100g: 'protein',
  sugars_100g: null, // No DV for sugars, but we show the value
  salt_100g: 'sodium', // Salt is converted to sodium equivalent
  
  // Vitamins
  'vitamin-a_100g': 'vitaminA',
  'vitamin-c_100g': 'vitaminC',
  'vitamin-d_100g': 'vitaminD',
  'vitamin-e_100g': 'vitaminE',
  'vitamin-k_100g': 'vitaminK',
  'vitamin-b1_100g': 'thiamin',
  'vitamin-b2_100g': 'riboflavin',
  'vitamin-b3_100g': 'niacin',
  'vitamin-b6_100g': 'vitaminB6',
  'folates_100g': 'folate',
  'vitamin-b12_100g': 'vitaminB12',
  'biotin_100g': 'biotin',
  'pantothenic-acid_100g': 'pantothenicAcid',
  
  // Minerals
  calcium_100g: 'calcium',
  iron_100g: 'iron',
  phosphorus_100g: 'phosphorus',
  iodine_100g: 'iodine',
  magnesium_100g: 'magnesium',
  zinc_100g: 'zinc',
  selenium_100g: 'selenium',
  copper_100g: 'copper',
  manganese_100g: 'manganese',
  chromium_100g: 'chromium',
  molybdenum_100g: 'molybdenum',
  chloride_100g: 'chloride',
  choline_100g: 'choline',
} as const;

/**
 * Units for display purposes
 */
export const NUTRIENT_UNITS = {
  // Macronutrients
  totalFat: 'g',
  saturatedFat: 'g',
  cholesterol: 'mg',
  sodium: 'mg',
  potassium: 'mg',
  totalCarbohydrate: 'g',
  dietaryFiber: 'g',
  protein: 'g',
  
  // Vitamins
  vitaminA: 'μg',
  vitaminC: 'mg',
  vitaminD: 'μg',
  vitaminE: 'mg',
  vitaminK: 'μg',
  thiamin: 'mg',
  riboflavin: 'mg',
  niacin: 'mg',
  vitaminB6: 'mg',
  folate: 'μg',
  vitaminB12: 'μg',
  biotin: 'μg',
  pantothenicAcid: 'mg',
  
  // Minerals
  calcium: 'mg',
  iron: 'mg',
  phosphorus: 'mg',
  iodine: 'μg',
  magnesium: 'mg',
  zinc: 'mg',
  selenium: 'μg',
  copper: 'mg',
  manganese: 'mg',
  chromium: 'μg',
  molybdenum: 'μg',
  chloride: 'mg',
  choline: 'mg',
} as const;




