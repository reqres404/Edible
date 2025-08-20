import React from 'react';
import { Text, View, TouchableOpacity, Image, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
  const { user, signOut } = useAuth();

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
    <View className="flex-1 bg-offwhite p-6">
      {/* Header */}
      <View className="items-center mb-8 mt-12">
        <Text className="text-4xl text-dark-500 font-bold mb-2">Profile</Text>
        <Text className="text-lg text-gray-600">Your account information</Text>
      </View>

      {/* User Info Card */}
      <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
        <View className="items-center mb-4">
          {user?.photo ? (
            <Image 
              source={{ uri: user.photo }} 
              className="w-20 h-20 rounded-full mb-3"
            />
          ) : (
            <View className="w-20 h-20 rounded-full bg-gray-300 items-center justify-center mb-3">
              <Text className="text-2xl text-gray-600 font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <Text className="text-xl font-semibold text-gray-800">{user?.name}</Text>
          <Text className="text-gray-600">{user?.email}</Text>
        </View>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity
        onPress={handleSignOut}
        className="bg-red-500 rounded-xl py-4 px-6 items-center"
      >
        <Text className="text-white font-semibold text-lg">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Profile;