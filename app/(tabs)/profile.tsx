import React from 'react';
import { Text, View, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileManager } from '../../components/ProfileManager';

const Profile = () => {
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: signOut
        }
      ]
    );
  };

  return (
    <ScrollView 
      className="flex-1 bg-offwhite"
      contentContainerStyle={{
        paddingBottom: insets.bottom + 100, // Add extra space for bottom navigation + safe area
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* User Info Card */}
      <View 
        className="bg-white rounded-2xl p-6 mb-6 mx-6 shadow-sm"
        style={{ marginTop: insets.top + 20 }}
      >
        <View className="flex-row items-center mb-4">
          <View className="w-20 h-20 rounded-full bg-gray-300 items-center justify-center mr-4">
            <Text className="text-2xl text-gray-600 font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-xl font-semibold text-gray-800 mb-1">{user?.name}</Text>
            <Text className="text-gray-600">{user?.email}</Text>
          </View>
        </View>
      </View>

      {/* Profile Manager Section */}
      <ProfileManager />

      {/* Sign Out Button */}
      <View className="px-6 pb-8">
        <TouchableOpacity
          onPress={handleSignOut}
          className="bg-red-500 rounded-xl py-4 px-6 items-center"
        >
          <Text className="text-white font-semibold text-lg">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Profile;