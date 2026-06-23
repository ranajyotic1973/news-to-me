const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface ApiError {
  message: string;
  status: number;
}

export class ApiService {
  static async get<T>(endpoint: string, params?: Record<string, string | number>): Promise<T> {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
      cache: 'no-store',
    });

    return ApiService.handleResponse<T>(response);
  }

  static async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    return ApiService.handleResponse<T>(response);
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw {
        message: errorData.error || 'Request failed',
        status: response.status,
      };
    }

    return response.json() as Promise<T>;
  }
}

// Config API
export interface ValidateTokenResponse {
  valid: boolean;
  models: Array<{ id: string; name: string; inputCostPer1mTokens: number; outputCostPer1mTokens: number }>;
  error?: string;
}

export interface ListModelsResponse {
  models: Array<{ id: string; name: string; inputCostPer1mTokens: number; outputCostPer1mTokens: number }>;
  recommended: { id: string; inputCostPer1mTokens: number; outputCostPer1mTokens: number };
}

export interface ProvidersResponse {
  providers: string[];
}

export class ConfigApi {
  static async validateToken(provider: string, apiToken: string): Promise<ValidateTokenResponse> {
    return ApiService.post<ValidateTokenResponse>('/api/config/validate-token', {
      provider,
      apiToken,
    });
  }

  static async listModels(provider: string, apiToken: string): Promise<ListModelsResponse> {
    return ApiService.get<ListModelsResponse>('/api/config/list-models', {
      provider,
      apiToken,
    });
  }

  static async getProviders(): Promise<ProvidersResponse> {
    return ApiService.get<ProvidersResponse>('/api/config/providers');
  }
}

// Newspaper API
export interface NewsStory {
  id: string;
  headline: string;
  summary: string;
  category: 'business' | 'stock-market' | 'sports' | 'math';
}

export interface NewspaperPageResponse {
  pageNumber: number;
  totalPages: number;
  stories: NewsStory[];
}

export class NewspaperApi {
  static async getPage(
    pageNum: number,
    childAge: number,
    childCountry: string,
    provider: string,
    apiToken: string,
    modelId: string
  ): Promise<NewspaperPageResponse> {
    return ApiService.get<NewspaperPageResponse>(`/api/newspaper/page/${pageNum}`, {
      childAge,
      childCountry,
      provider,
      apiToken,
      modelId,
    });
  }

  static async regenerateContent(
    childCountry: string,
    provider: string,
    apiToken: string,
    modelId: string
  ): Promise<{ success: boolean; message: string }> {
    return ApiService.get<{ success: boolean; message: string }>('/api/newspaper/regenerate', {
      childCountry,
      provider,
      apiToken,
      modelId,
    });
  }
}
