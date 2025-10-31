import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';

export const useUserProfile = () => {
  const { user, syncUserWithBackend, getCurrentToken } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const addProfile = async (profileData: {
    name: string;
    age?: number;
    allergens?: string[];
    conditions?: string[]; // Keep for backward compatibility
    lifestyle?: string;
  }) => {
    if (!user) return null;
    
    try {
      setIsUpdating(true);
      const token = await getCurrentToken();
      if (!token) throw new Error('No authentication token');
      
      const response = await apiService.addProfile(
        user.googleId,
        profileData,
        token
      );
      
      if (response.status === 'success') {
        console.log('✅ Profile add response:', response);
        console.log('📊 Profile add response user:', response.data.user);
        console.log('📝 Number of profiles in response:', response.data.user?.profiles?.length);
        
        // Sync the updated user data
        console.log('🔄 Calling syncUserWithBackend...');
        await syncUserWithBackend();
        console.log('✅ syncUserWithBackend completed');
        
        return response.data.user;
      }
      
      return null;
    } catch (error) {
      console.error('Error adding profile:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateProfile = async (profileId: string, updates: {
    name?: string;
    age?: number;
    allergens?: string[];
    conditions?: string[]; // Keep for backward compatibility
    lifestyle?: string;
  }) => {
    if (!user) return null;
    
    try {
      setIsUpdating(true);
      const token = await getCurrentToken();
      if (!token) throw new Error('No authentication token');
      
      const response = await apiService.updateUserProfile(
        user.googleId,
        profileId,
        updates,
        token
      );
      
      if (response.status === 'success') {
        // Sync the updated user data
        await syncUserWithBackend();
        return response.data.user;
      }
      
      return null;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteProfile = async (profileId: string) => {
    if (!user) return null;
    
    try {
      setIsUpdating(true);
      const token = await getCurrentToken();
      if (!token) throw new Error('No authentication token');
      
      const response = await apiService.deleteProfile(
        user.googleId,
        profileId,
        token
      );
      
      if (response.status === 'success') {
        // Sync the updated user data
        await syncUserWithBackend();
        return response.data.user;
      }
      
      return null;
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const addScannedCode = async (barcode: string) => {
    if (!user) return null;
    
    try {
      const token = await getCurrentToken();
      if (!token) throw new Error('No authentication token');
      
      const response = await apiService.addScannedCode(
        user.googleId,
        barcode,
        token
      );
      
      if (response.status === 'success') {
        // Sync the updated user data
        await syncUserWithBackend();
        return response.data.scannedCodes;
      }
      
      return null;
    } catch (error) {
      console.error('Error adding scanned code:', error);
      throw error;
    }
  };

  const getScannedCodes = async () => {
    if (!user) return [];
    
    try {
      const token = await getCurrentToken();
      if (!token) throw new Error('No authentication token');
      
      const response = await apiService.getScannedCodes(
        user.googleId,
        token
      );
      
      if (response.status === 'success') {
        return response.data.scannedCodes;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting scanned codes:', error);
      return [];
    }
  };

  return {
    user,
    isUpdating,
    addProfile,
    updateProfile,
    deleteProfile,
    addScannedCode,
    getScannedCodes,
  };
};
