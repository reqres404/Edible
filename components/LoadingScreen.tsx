import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

const LoadingScreen = () => {
  return (
    <View className="flex-1 bg-white justify-center items-center">
      <ActivityIndicator size="large" color="#160455" />
      <Text className="text-lg text-gray-600 mt-4">Loading...</Text>
    </View>
  );
};

export default LoadingScreen;
