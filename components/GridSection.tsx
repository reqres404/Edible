import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React from 'react';
import { Dimensions, Image, Pressable, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

interface GridSectionProps {
  onCardPress?: (cardType: 'profile' | 'search') => void;
}

const GridSection: React.FC<GridSectionProps> = ({ onCardPress }) => {
  const router = useRouter();

  const handleCardPress = (cardType: 'profile' | 'search') => {
    if (onCardPress) {
      onCardPress(cardType);
    } else {
      // Default navigation behavior
      if (cardType === 'profile') {
        router.push('/(tabs)/profile');
      } else if (cardType === 'search') {
        router.push('/(tabs)/search');
      }
    }
  };

  return (
    <View 
      className="relative" 
      style={{ height: width * 0.5}}
    >
      <View className="flex-row justify-between px-4" style={{ gap: 12 }}>
        {/* Profile Card */}
        <Pressable
          onPress={() => handleCardPress('profile')}
          className="flex-1 rounded-3xl overflow-hidden relative border-2 border-primary"
          style={{ height: width * 0.5 }}
        >
          {/* Background Image */}
          <Image
            source={require('../assets/images/bg.png')}
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%'
            }}
            resizeMode="cover"
          />
          
          {/* Main Content */}
          <View className="flex-1 p-5 justify-between">
            {/* Top Section with Animation - Upper Left */}
            <View className="items-start -ml-2 -mt-4">
              <LottieView
                source={require('../assets/icons/profile-animation.json')}
                autoPlay
                loop
                style={{ width: 96, height: 96 }}
              />
            </View>
            
            {/* Bottom Section with Text - Bottom Right */}
            <View className="items-end">
              <Text className="text-primary text-base font-semibold opacity-90 leading-4 text-right">
                Customise <Text className="font-bold">profile</Text>{'\n'}for personalised analysis
              </Text>
            </View>
          </View>
        </Pressable>

        {/* Search Card */}
        <Pressable
          onPress={() => handleCardPress('search')}
          className="flex-1 rounded-3xl overflow-hidden relative border-2 border-primary"
          style={{ height: width * 0.5 }}
        >
          {/* Background Image */}
          <Image
            source={require('../assets/images/bg.png')}
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%'
            }}
            resizeMode="cover"
          />
          
          {/* Main Content */}
          <View className="flex-1 p-5 justify-between">
            {/* Top Section with Text - Upper Right */}
            <View className="items-end">
              <Text className="text-primary text-base font-semibold opacity-90 leading-5 text-right">
                Oops don't have barcode to scan no worries just <Text className="font-bold">search</Text> it!
              </Text>
            </View>
            
            {/* Bottom Section with Animation - Bottom Left */}
            <View className="items-start">
              <LottieView
                source={require('../assets/icons/search-animation.json')}
                autoPlay
                loop
                style={{ width: 96, height: 96 }}
              />
            </View>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

export default GridSection;
