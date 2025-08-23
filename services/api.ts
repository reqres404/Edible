import { Platform } from 'react-native';

/**
 * API service for communicating with the Edible backend
 */
class ApiService {
  private getBaseUrl(): string {
    if (__DEV__) {
      // Development environment
      if (Platform.OS === 'android') {
        return 'http://10.0.2.2:3000'; // Android emulator
      } else if (Platform.OS === 'ios') {
        return 'http://localhost:3000'; // iOS simulator
      }
    }
    
    // Production (update this when you deploy)
    return 'https://your-production-api.com';
  }

  /**
   * Get product by barcode
   */
  async getProductByBarcode(barcode: string, token: string) {
    try {
      console.log(`🔍 Fetching product for barcode: ${barcode}`);
      console.log(`🌐 API URL: ${this.getBaseUrl()}/api/v1/barcode/product/${barcode}`);
      
      const response = await fetch(`${this.getBaseUrl()}/api/v1/barcode/product/${barcode}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`📡 Response status: ${response.status}`);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          const errorText = await response.text();
          errorData = { message: errorText };
        }
        
        console.error(`❌ API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        
        // Create error object that matches backend error structure
        const error = new Error() as any;
        error.status = 'error';
        error.message = errorData.message || `HTTP error! status: ${response.status}`;
        error.statusCode = response.status;
        throw error;
      }
      
      const data = await response.json();
      console.log(`✅ API Response:`, data);
      return data;
    } catch (error) {
      console.error('🚨 API call failed:', error);
      throw error;
    }
  }

  /**
   * Search products by query
   */
  async searchProducts(query: string, token: string, page = 1, limit = 20) {
    try {
      console.log(`🔍 Searching products for query: "${query}"`);
      
      const response = await fetch(
        `${this.getBaseUrl()}/api/v1/barcode/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          const errorText = await response.text();
          errorData = { message: errorText };
        }
        
        console.error(`❌ Search API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        
        // Create error object that matches backend error structure
        const error = new Error() as any;
        error.status = 'error';
        error.message = errorData.message || `HTTP error! status: ${response.status}`;
        error.statusCode = response.status;
        throw error;
      }
      
      const data = await response.json();
      console.log(`✅ Search Response:`, data);
      return data;
    } catch (error) {
      console.error('🚨 Search API call failed:', error);
      throw error;
    }
  }

  /**
   * Get rate limit status
   */
  async getRateLimitStatus(token: string) {
    try {
      const response = await fetch(`${this.getBaseUrl()}/api/v1/barcode/rate-limits`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          const errorText = await response.text();
          errorData = { message: errorText };
        }
        
        console.error(`❌ Rate Limit API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        
        // Create error object that matches backend error structure
        const error = new Error() as any;
        error.status = 'error';
        error.message = errorData.message || `HTTP error! status: ${response.status}`;
        error.statusCode = response.status;
        throw error;
      }
      
      return await response.json();
    } catch (error) {
      console.error('🚨 Rate limit API call failed:', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.getBaseUrl()}/api/v1/barcode/health`);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          const errorText = await response.text();
          errorData = { message: errorText };
        }
        
        console.error(`❌ Health Check API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        
        // Create error object that matches backend error structure
        const error = new Error() as any;
        error.status = 'error';
        error.message = errorData.message || `HTTP error! status: ${response.status}`;
        error.statusCode = response.status;
        throw error;
      }
      
      return await response.json();
    } catch (error) {
      console.error('🚨 Health check failed:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();

