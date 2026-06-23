export interface CountryMarketData {
  country: string;
  countryCode: string;
  primaryIndex: string;
  indexSymbol: string;
  currency: string;
  currencySymbol: string;
  exchangeName: string;
}

export class StockMarketLocalization {
  private static readonly MARKET_DATA: { [countryCode: string]: CountryMarketData } = {
    US: {
      country: 'United States',
      countryCode: 'US',
      primaryIndex: 'S&P 500',
      indexSymbol: '^GSPC',
      currency: 'US Dollar',
      currencySymbol: '$',
      exchangeName: 'NYSE / NASDAQ',
    },
    IN: {
      country: 'India',
      countryCode: 'IN',
      primaryIndex: 'SENSEX',
      indexSymbol: '^BSESN',
      currency: 'Indian Rupee',
      currencySymbol: '₹',
      exchangeName: 'BSE',
    },
    GB: {
      country: 'United Kingdom',
      countryCode: 'GB',
      primaryIndex: 'FTSE 100',
      indexSymbol: '^FTSE',
      currency: 'British Pound',
      currencySymbol: '£',
      exchangeName: 'LSE',
    },
    DE: {
      country: 'Germany',
      countryCode: 'DE',
      primaryIndex: 'DAX',
      indexSymbol: '^GDAXI',
      currency: 'Euro',
      currencySymbol: '€',
      exchangeName: 'Frankfurt Stock Exchange',
    },
    JP: {
      country: 'Japan',
      countryCode: 'JP',
      primaryIndex: 'Nikkei 225',
      indexSymbol: '^N225',
      currency: 'Japanese Yen',
      currencySymbol: '¥',
      exchangeName: 'Tokyo Stock Exchange',
    },
    CA: {
      country: 'Canada',
      countryCode: 'CA',
      primaryIndex: 'S&P/TSX',
      indexSymbol: '^GSPTSE',
      currency: 'Canadian Dollar',
      currencySymbol: 'C$',
      exchangeName: 'TSX',
    },
    AU: {
      country: 'Australia',
      countryCode: 'AU',
      primaryIndex: 'ASX 200',
      indexSymbol: '^AXJO',
      currency: 'Australian Dollar',
      currencySymbol: 'A$',
      exchangeName: 'ASX',
    },
    BR: {
      country: 'Brazil',
      countryCode: 'BR',
      primaryIndex: 'Ibovespa',
      indexSymbol: '^BVSP',
      currency: 'Brazilian Real',
      currencySymbol: 'R$',
      exchangeName: 'B3',
    },
  };

  static getMarketData(countryCode: string): CountryMarketData | null {
    return this.MARKET_DATA[countryCode.toUpperCase()] || null;
  }

  static getAllCountries(): CountryMarketData[] {
    return Object.values(this.MARKET_DATA);
  }

  static getCountryByName(countryName: string): CountryMarketData | null {
    const normalized = countryName.toUpperCase();
    for (const data of Object.values(this.MARKET_DATA)) {
      if (data.country.toUpperCase() === normalized || data.countryCode === normalized) {
        return data;
      }
    }
    return null;
  }

  static getCountryCodeByName(countryName: string): string | null {
    const data = this.getCountryByName(countryName);
    return data ? data.countryCode.toLowerCase() : null;
  }

  static formatCurrency(amount: number, countryCode: string): string {
    const data = this.getMarketData(countryCode);
    if (!data) return `${amount}`;
    return `${data.currencySymbol}${amount.toFixed(2)}`;
  }
}
