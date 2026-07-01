// Electron IPC for desktop app communication via preload bridge
// (declared in preload/index.ts)

export interface ApiError {
  message: string;
  status?: number;
}

export class ApiService {
  static async get<T>(endpoint: string, params?: Record<string, string | number>): Promise<T> {
    try {
      // Use IPC for backend communication in Electron (via preload bridge)
      if (window.electron?.api) {
        return await this.ipcCall<T>(endpoint, params);
      }
      // Fallback to HTTP for web dev server
      return await this.httpCall<T>(endpoint, params);
    } catch (error) {
      throw {
        message: error instanceof Error ? error.message : 'Request failed',
      };
    }
  }

  static async post<T>(endpoint: string, data: unknown): Promise<T> {
    try {
      // Use IPC for backend communication in Electron (via preload bridge)
      if (window.electron?.api) {
        return await this.ipcCall<T>(endpoint, data as Record<string, unknown>);
      }
      return await this.httpCall<T>(endpoint, undefined, data);
    } catch (error) {
      throw {
        message: error instanceof Error ? error.message : 'Request failed',
      };
    }
  }

  private static async ipcCall<T>(endpoint: string, data?: Record<string, unknown>): Promise<T> {
    // Convert HTTP-style endpoints to IPC channel names
    const channel = this.endpointToIpcChannel(endpoint);
    const args = data ? Object.values(data) : [];

    console.log(`[ApiService] IPC Call: ${channel}`, data || {});
    try {
      if (!window.electron?.api) {
        throw new Error('Electron API not available');
      }
      const result = await window.electron.api.invoke(channel, ...args);
      console.log(`[ApiService] IPC Result: ${channel}`, result);
      return result;
    } catch (error) {
      console.error(`[ApiService] IPC Error: ${channel}`, error);
      throw error;
    }
  }

  private static async httpCall<T>(
    endpoint: string,
    params?: Record<string, string | number>,
    data?: unknown
  ): Promise<T> {
    const url = new URL(`http://localhost:5173${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      method: data ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw {
        message: errorData.error || 'Request failed',
        status: response.status,
      };
    }

    return response.json() as Promise<T>;
  }

  private static endpointToIpcChannel(endpoint: string): string {
    // Convert /api/config/validate-token to config:validateToken
    // Convert /api/newspaper/page/1 to newspaper:getPage
    const parts = endpoint.split('/').filter((p) => p && p !== 'api');

    if (parts[0] === 'config') {
      if (parts[1] === 'validate-token') return 'config:validateToken';
      if (parts[1] === 'list-models') return 'config:listModels';
      if (parts[1] === 'providers') return 'config:getProviders';
    }

    if (parts[0] === 'newspaper') {
      if (parts[1] === 'page') return 'newspaper:getPage';
      if (parts[1] === 'regenerate') return 'newspaper:regenerateContent';
    }

    throw new Error(`Unknown endpoint: ${endpoint}`);
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
  imageUrl?: string;
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
      pageNum,
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
      provider,
      apiToken,
      modelId,
      childCountry,
    });
  }
}
