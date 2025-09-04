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

  /**
   * Create or update user
   */
  async createOrUpdateUser(userData: any, token: string) {
    try {
      console.log(`👤 Creating/updating user: ${userData.email}`);
      
      const response = await fetch(`${this.getBaseUrl()}/api/v1/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          const errorText = await response.text();
          errorData = { message: errorText };
        }
        
        console.error(`❌ User API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        
        const error = new Error() as any;
        error.status = 'error';
        error.message = errorData.message || `HTTP error! status: ${response.status}`;
        error.statusCode = response.status;
        throw error;
      }
      
      const data = await response.json();
      console.log(`✅ User created/updated:`, data);
      return data;
    } catch (error) {
      console.error('🚨 User API call failed:', error);
      throw error;
    }
  }

  /**
   * Get user by Google ID
   */
  async getUserByGoogleId(googleId: string, token: string) {
    try {
      console.log(`👤 Fetching user: ${googleId}`);
      
      const response = await fetch(`${this.getBaseUrl()}/api/v1/users/${googleId}`, {
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
        
        console.error(`❌ Get User API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        
        const error = new Error() as any;
        error.status = 'error';
        error.message = errorData.message || `HTTP error! status: ${response.status}`;
        error.statusCode = response.status;
        throw error;
      }
      
      const data = await response.json();
      console.log(`✅ User fetched:`, data);
      return data;
    } catch (error) {
      console.error('🚨 Get User API call failed:', error);
      throw error;
    }
  }

  /**
   * Add new profile to user
   */
  async addProfile(googleId: string, profileData: any, token: string) {
    try {
      console.log(`👤 Adding new profile for user: ${googleId}`);
      
      const response = await fetch(`${this.getBaseUrl()}/api/v1/users/${googleId}/profiles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          const errorText = await response.text();
          errorData = { message: errorText };
        }
        
        console.error(`❌ Add Profile API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        
        const error = new Error() as any;
        error.status = 'error';
        error.message = errorData.message || `HTTP error! status: ${response.status}`;
        error.statusCode = response.status;
        throw error;
      }
      
      const data = await response.json();
      console.log(`✅ Profile added:`, data);
      return data;
    } catch (error) {
      console.error('🚨 Add Profile API call failed:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(googleId: string, profileId: string, profileData: any, token: string) {
    try {
      console.log(`👤 Updating profile ${profileId} for user: ${googleId}`);
      
      const response = await fetch(`${this.getBaseUrl()}/api/v1/users/${googleId}/profiles/${profileId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileId, updates: profileData }),
      });
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          const errorText = await response.text();
          errorData = { message: errorText };
        }
        
        console.error(`❌ Update Profile API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        
        const error = new Error() as any;
        error.status = 'error';
        error.message = errorData.message || `HTTP error! status: ${response.status}`;
        error.statusCode = response.status;
        throw error;
      }
      
      const data = await response.json();
      console.log(`✅ Profile updated:`, data);
      return data;
    } catch (error) {
      console.error('🚨 Update Profile API call failed:', error);
      throw error;
    }
  }

  /**
   * Delete user profile
   */
  async deleteProfile(googleId: string, profileId: string, token: string) {
    try {
      console.log(`👤 Deleting profile ${profileId} for user: ${googleId}`);
      
      const response = await fetch(`${this.getBaseUrl()}/api/v1/users/${googleId}/profiles/${profileId}`, {
        method: 'DELETE',
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
        
        console.error(`❌ Delete Profile API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        
        const error = new Error() as any;
        error.status = 'error';
        error.message = errorData.message || `HTTP error! status: ${response.status}`;
        error.statusCode = response.status;
        throw error;
      }
      
      const data = await response.json();
      console.log(`✅ Profile deleted:`, data);
      return data;
    } catch (error) {
      console.error('🚨 Delete Profile API call failed:', error);
      throw error;
    }
  }

  /**
   * Add scanned barcode to user
   */
  async addScannedCode(googleId: string, barcode: string, token: string) {
    try {
      console.log(`📱 Adding scanned code ${barcode} to user: ${googleId}`);
      
      const response = await fetch(`${this.getBaseUrl()}/api/v1/users/${googleId}/scanned-codes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ barcode }),
      });
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          const errorText = await response.text();
          errorData = { message: errorText };
        }
        
        console.error(`❌ Add Scanned Code API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        
        const error = new Error() as any;
        error.status = 'error';
        error.message = errorData.message || `HTTP error! status: ${response.status}`;
        error.statusCode = response.status;
        throw error;
      }
      
      const data = await response.json();
      console.log(`✅ Scanned code added:`, data);
      return data;
    } catch (error) {
      console.error('🚨 Add Scanned Code API call failed:', error);
      throw error;
    }
  }

  /**
   * Get user's scanned codes
   */
  async getScannedCodes(googleId: string, token: string) {
    try {
      console.log(`📱 Fetching scanned codes for user: ${googleId}`);
      
      const response = await fetch(`${this.getBaseUrl()}/api/v1/users/${googleId}/scanned-codes`, {
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
        
        console.error(`❌ Get Scanned Codes API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        
        const error = new Error() as any;
        error.status = 'error';
        error.message = errorData.message || `HTTP error! status: ${response.status}`;
        error.statusCode = response.status;
        throw error;
      }
      
      const data = await response.json();
      console.log(`✅ Scanned codes fetched:`, data);
      return data;
    } catch (error) {
      console.error('🚨 Get Scanned Codes API call failed:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();

