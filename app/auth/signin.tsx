// import { GoogleSignin, GoogleSigninButton, statusCodes, isSuccessResponse, isErrorWithCode } from "@react-native-google-signin/google-signin";
import { useState } from "react";
import { View, Text, Alert, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";

// Temporarily disable Google Sign-In configuration
// GoogleSignin.configure({
//   webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
// });

const SignInScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      
      // Temporarily use mock data for testing
      const mockUserData = {
        id: 'mock-user-123',
        email: 'test@example.com',
        name: 'Test User',
        photo: null,
      };
      
      await signIn(mockUserData);
      router.replace("/(tabs)");
      
      // TODO: Re-enable Google Sign-In after fixing native module
      // await GoogleSignin.hasPlayServices();
      // const response = await GoogleSignin.signIn();
      // 
      // if (isSuccessResponse(response)) {
      //   const userData = {
      //     id: response.data.user.id,
      //     email: response.data.user.email || '',
      //     name: response.data.user.name || 'User',
      //     photo: response.data.user.photo,
      //   };
      //   
      //   await signIn(userData);
      //   router.replace("/(tabs)");
      // } else {
      //   console.log("Sign in was cancelled by user");
      // }
    } catch (error) {
      Alert.alert("Sign-in Failed!", "Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white justify-center items-center px-8">
      {/* Logo and Welcome Text */}
      <View className="items-center mb-16">
        <Image 
          source={require("../../assets/images/logo.png")} 
          className="w-32 h-32 mb-6"
          resizeMode="contain"
        />
        <Text className="text-3xl font-bold text-center text-gray-800 mb-2">
          Welcome to Edible
        </Text>
        <Text className="text-lg text-center text-gray-600">
          To continue, please sign in
        </Text>
      </View>

      {/* Temporary Sign-In Button */}
      <TouchableOpacity
        onPress={handleGoogleSignIn}
        disabled={isLoading}
        className="bg-blue-500 rounded-xl py-4 px-8 items-center"
        style={{ width: 280, height: 56 }}
      >
        <Text className="text-white font-semibold text-lg">
          {isLoading ? "Signing in..." : "Sign In (Demo)"}
        </Text>
      </TouchableOpacity>

      {/* TODO: Re-enable Google Sign-In Button after fixing native module */}
      {/* <GoogleSigninButton
        style={{ width: 280, height: 56 }}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={handleGoogleSignIn}
        disabled={isLoading}
      /> */}

      {/* Loading State */}
      {isLoading && (
        <Text className="text-gray-500 mt-4">Signing in...</Text>
      )}
    </View>
  );
};

export default SignInScreen;
