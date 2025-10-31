import { calculateDailyValue, convertSaltToSodium, getDVColor, getDVLabel } from '../utils/nutritionCalculator';

describe('Nutrition Calculator', () => {
  describe('calculateDailyValue', () => {
    it('should calculate %DV for protein correctly', () => {
      const result = calculateDailyValue('proteins_100g', 10);
      expect(result.hasDV).toBe(true);
      expect(result.percentage).toBe(20); // 10g / 50g * 100 = 20%
      expect(result.unit).toBe('g');
    });

    it('should calculate %DV for fat correctly', () => {
      const result = calculateDailyValue('fat_100g', 15.6);
      expect(result.hasDV).toBe(true);
      expect(result.percentage).toBe(20); // 15.6g / 78g * 100 = 20%
      expect(result.unit).toBe('g');
    });

    it('should calculate %DV for fiber correctly', () => {
      const result = calculateDailyValue('fiber_100g', 5.6);
      expect(result.hasDV).toBe(true);
      expect(result.percentage).toBe(20); // 5.6g / 28g * 100 = 20%
      expect(result.unit).toBe('g');
    });

    it('should handle nutrients without DV', () => {
      const result = calculateDailyValue('sugars_100g', 10);
      expect(result.hasDV).toBe(false);
      expect(result.percentage).toBe(null);
      expect(result.unit).toBe('g');
    });

    it('should handle energy without DV', () => {
      const result = calculateDailyValue('energy_kcal_100g', 250);
      expect(result.hasDV).toBe(false);
      expect(result.percentage).toBe(null);
      expect(result.unit).toBe('kcal');
    });
  });

  describe('convertSaltToSodium', () => {
    it('should convert salt to sodium correctly', () => {
      const sodium = convertSaltToSodium(1); // 1g salt
      expect(sodium).toBe(400); // 1g salt = 400mg sodium
    });

    it('should handle decimal values', () => {
      const sodium = convertSaltToSodium(0.5); // 0.5g salt
      expect(sodium).toBe(200); // 0.5g salt = 200mg sodium
    });
  });

  describe('getDVColor', () => {
    it('should return green for high %DV (>=20%)', () => {
      expect(getDVColor(25)).toBe('#10B981');
      expect(getDVColor(20)).toBe('#10B981');
    });

    it('should return blue for good %DV (10-19%)', () => {
      expect(getDVColor(15)).toBe('#3B82F6');
      expect(getDVColor(10)).toBe('#3B82F6');
    });

    it('should return yellow for moderate %DV (5-9%)', () => {
      expect(getDVColor(7)).toBe('#F59E0B');
      expect(getDVColor(5)).toBe('#F59E0B');
    });

    it('should return gray for low %DV (<5%)', () => {
      expect(getDVColor(3)).toBe('#6B7280');
      expect(getDVColor(0)).toBe('#6B7280');
    });
  });

  describe('getDVLabel', () => {
    it('should return correct labels for different %DV ranges', () => {
      expect(getDVLabel(25)).toBe('High');
      expect(getDVLabel(15)).toBe('Good');
      expect(getDVLabel(7)).toBe('Moderate');
      expect(getDVLabel(3)).toBe('Low');
    });
  });
});




