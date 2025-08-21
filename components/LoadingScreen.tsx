import React from 'react';
import { View, Text, ActivityIndicator, Image } from 'react-native';

const LoadingScreen = () => {
  return (
    <View className="flex-1 bg-white justify-center items-center">
      {/* App Logo */}
      <Image 
        source={require("../assets/images/logo.png")} 
        className="w-24 h-24 mb-8"
        resizeMode="contain"
      />
      
      {/* Loading Spinner */}
      <ActivityIndicator size="large" color="#160455" />
      
      {/* Loading Text */}
      <Text className="text-lg text-gray-600 mt-4 font-medium">
        Loading Edible...
      </Text>
      
      {/* Subtitle */}
      <Text className="text-sm text-gray-400 mt-2 text-center px-8">
        Checking authentication status
      </Text>
    </View>
  );
};

export default LoadingScreen;
