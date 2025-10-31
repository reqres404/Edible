import { GoogleSignin, GoogleSigninButton, statusCodes, isSuccessResponse, isErrorWithCode } from "@react-native-google-signin/google-signin";
import { useState } from "react";
import { View, Text, Alert, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";



const SignInScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      
      // Check if Google Play Services are available (Android only)
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Sign in with Google
      const response = await GoogleSignin.signIn();
      
      if (isSuccessResponse(response)) {
        const token = await GoogleSignin.getTokens();
        if (!token.idToken) {
          throw new Error('No ID token received from Google');
        }

        const googleId = response.data.user.id;
        const email = response.data.user.email || '';
        const name = response.data.user.name || 'User';
        const picture = response.data.user.photo;

        try {
          // First, try to fetch existing user data from backend
          console.log('🔍 Checking for existing user in backend...');
          const existingUser = await apiService.getUserByGoogleId(googleId, token.idToken);
          
          if (existingUser.status === 'success' && existingUser.data.user) {
            console.log('✅ Found existing user with profiles:', existingUser.data.user.profiles?.length);
            // User exists, use their existing data
            await signIn(existingUser.data.user);
          } else {
            console.log('👤 No existing user found, creating new user...');
            // User doesn't exist, create new user with default profile
            const userData = {
              id: googleId,
              googleId: googleId,
              email: email,
              name: name,
              picture: picture,
              profiles: [{
                name: name,
                age: undefined,
                conditions: [],
                lifestyle: undefined,
              }],
              scannedCodes: [],
            };

            const backendResponse = await apiService.createOrUpdateUser({
              googleId: userData.googleId,
              email: userData.email,
              name: userData.name,
              picture: userData.picture,
              profiles: userData.profiles,
              scannedCodes: userData.scannedCodes,
            }, token.idToken);
            
            if (backendResponse.status === 'success' && backendResponse.data.user) {
              await signIn(backendResponse.data.user);
            } else {
              await signIn(userData);
            }
          }
        } catch (error) {
          console.error('Error during user authentication:', error);
          
          // Fallback: create user with default profile
          const userData = {
            id: googleId,
            googleId: googleId,
            email: email,
            name: name,
            picture: picture,
            profiles: [{
              name: name,
              age: undefined,
              conditions: [],
              lifestyle: undefined,
            }],
            scannedCodes: [],
          };

          try {
            const backendResponse = await apiService.createOrUpdateUser({
              googleId: userData.googleId,
              email: userData.email,
              name: userData.name,
              picture: userData.picture,
              profiles: userData.profiles,
              scannedCodes: userData.scannedCodes,
            }, token.idToken);
            
            if (backendResponse.status === 'success' && backendResponse.data.user) {
              await signIn(backendResponse.data.user);
            } else {
              await signIn(userData);
            }
          } catch (createError) {
            console.error('Error creating user:', createError);
            await signIn(userData);
          }
        }
        
        router.replace("/(tabs)");
      } else {
        console.log("Sign in was cancelled by user");
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      
      if (error?.message?.includes('NETWORK_ERROR')) {
        Alert.alert(
          'Network issue',
          'Unable to reach Google. Please check your internet connection and try again.'
        );
        return;
      }
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("Sign in was cancelled by user");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Sign in is already in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("Error", "Google Play Services not available");
      } else {
        Alert.alert("Sign-in Failed!", "Please try again later.");
      }
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

      {/* Google Sign-In Button */}
      <View className="w-full max-w-sm">
        <GoogleSigninButton
          style={{ 
            width: '100%', 
            height: 56,
            borderRadius: 50,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
          }}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Light}
          onPress={handleGoogleSignIn}
          disabled={isLoading}
        />
        
        {/* Custom styled alternative button for better control */}
        {isLoading && (
          <View className="absolute inset-0 bg-white bg-opacity-90 rounded-2xl items-center justify-center">
            <View className="flex-row items-center">
              <View className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
              <Text className="text-blue-600 font-semibold text-base">Signing in...</Text>
            </View>
          </View>
        )}
      </View>

      {/* Additional styling for the button container */}
      <View className="mt-6 px-8">
        <Text className="text-gray-500 text-sm text-center leading-5">
          Sign in securely with your Google account
        </Text>
      </View>
    </View>
  );
};

export default SignInScreen;
