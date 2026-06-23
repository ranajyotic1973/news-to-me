import { describe, it, expect } from 'vitest';
import { StockMarketLocalization } from './StockMarketLocalization';

describe('StockMarketLocalization', () => {
  it('should get US market data', () => {
    const data = StockMarketLocalization.getMarketData('US');
    expect(data).not.toBeNull();
    expect(data?.primaryIndex).toBe('S&P 500');
    expect(data?.currencySymbol).toBe('$');
  });

  it('should get India market data', () => {
    const data = StockMarketLocalization.getMarketData('IN');
    expect(data).not.toBeNull();
    expect(data?.primaryIndex).toBe('SENSEX');
    expect(data?.currency).toBe('Indian Rupee');
  });

  it('should be case insensitive', () => {
    const data1 = StockMarketLocalization.getMarketData('us');
    const data2 = StockMarketLocalization.getMarketData('US');
    expect(data1).toEqual(data2);
  });

  it('should return null for unknown country', () => {
    const data = StockMarketLocalization.getMarketData('XX');
    expect(data).toBeNull();
  });

  it('should get country by name', () => {
    const data = StockMarketLocalization.getCountryByName('United States');
    expect(data?.countryCode).toBe('US');
  });

  it('should get all countries', () => {
    const countries = StockMarketLocalization.getAllCountries();
    expect(countries.length).toBeGreaterThan(0);
    expect(countries.some((c) => c.countryCode === 'US')).toBe(true);
  });

  it('should format currency correctly', () => {
    const formatted = StockMarketLocalization.formatCurrency(100, 'US');
    expect(formatted).toBe('$100.00');
  });

  it('should handle unknown country in currency formatting', () => {
    const formatted = StockMarketLocalization.formatCurrency(100, 'XX');
    expect(formatted).toBe('100');
  });
});
