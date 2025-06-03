import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { HotmartConfig, AccessToken, HotmartApiError } from '../types';

export class HotmartHttpClient {
  private axiosInstance: AxiosInstance;
  private config: HotmartConfig;
  private accessToken?: string;
  private tokenExpiresAt?: number;

  constructor(config: HotmartConfig) {
    this.config = config;
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl || (config.isSandbox ? 'https://sandbox.hotmart.com' : 'https://developers.hotmart.com'),
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        await this.ensureValidToken();
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.accessToken = undefined;
          this.tokenExpiresAt = undefined;
        }
        return Promise.reject(this.formatError(error));
      }
    );
  }

  private async ensureValidToken(): Promise<void> {
    if (this.accessToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
      return;
    }

    await this.authenticate();
  }

  private async authenticate(): Promise<void> {
    try {
      const authUrl = this.config.isSandbox 
        ? 'https://sandbox.hotmart.com/security/oauth/token'
        : 'https://api-sec-vlc.hotmart.com/security/oauth/token';

      const basicAuth = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');

      const response = await axios.post<AccessToken>(
        authUrl,
        null,
        {
          params: {
            grant_type: 'client_credentials',
            client_id: this.config.clientId,
            client_secret: this.config.clientSecret,
          },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${basicAuth}`,
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiresAt = Date.now() + (response.data.expires_in * 1000) - 60000; // 1 minute buffer
    } catch (error) {
      throw new Error(`Authentication failed: ${error}`);
    }
  }

  private formatError(error: any): Error {
    if (error.response?.data) {
      const apiError: HotmartApiError = error.response.data;
      return new Error(`Hotmart API Error: ${apiError.error_description || apiError.error}`);
    }
    return new Error(`Request failed: ${error.message}`);
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.put(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.patch(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.delete(url, config);
    return response.data;
  }
} 