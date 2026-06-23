import {
  isValidAge,
  isValidName,
  isValidCountry,
  SUPPORTED_LLM_PROVIDERS,
} from '../../shared/types/config';

export interface ValidationError {
  field: string;
  message: string;
}

export class ValidationService {
  static validateName(name: string): ValidationError | null {
    if (!isValidName(name)) {
      return { field: 'name', message: 'Name must be between 1 and 100 characters' };
    }
    return null;
  }

  static validateAge(age: number): ValidationError | null {
    const parsed = Number(age);
    if (!isValidAge(parsed)) {
      return { field: 'age', message: 'Age must be between 10 and 16' };
    }
    return null;
  }

  static validateCountry(country: string): ValidationError | null {
    if (!isValidCountry(country)) {
      return { field: 'country', message: 'Country is required' };
    }
    return null;
  }

  static validateProvider(provider: string): ValidationError | null {
    if (!SUPPORTED_LLM_PROVIDERS.includes(provider as any)) {
      return { field: 'provider', message: 'Invalid LLM provider' };
    }
    return null;
  }

  static validateApiToken(token: string): ValidationError | null {
    if (!token || token.trim().length < 10) {
      return { field: 'apiToken', message: 'API token is required and must be valid' };
    }
    return null;
  }

  static validateAllOnboarding(
    name: string,
    age: number,
    country: string,
    provider: string,
    apiToken: string
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    const nameError = this.validateName(name);
    if (nameError) errors.push(nameError);

    const ageError = this.validateAge(age);
    if (ageError) errors.push(ageError);

    const countryError = this.validateCountry(country);
    if (countryError) errors.push(countryError);

    const providerError = this.validateProvider(provider);
    if (providerError) errors.push(providerError);

    const tokenError = this.validateApiToken(apiToken);
    if (tokenError) errors.push(tokenError);

    return errors;
  }
}
