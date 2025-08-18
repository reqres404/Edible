import React from 'react';
import { Dimensions, Image, Pressable, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

const FeedbackRatingSection: React.FC = () => {
  return (
    <View className="mb-3">
      <View className="flex-row justify-between py-1 px-2.5" style={{ gap: 4 }}>
        {/* Feedback Banner */}
        <Pressable className="flex-1">
          <View 
            className="rounded-full overflow-hidden relative"
            style={{ height: width * 0.15 }}
          >
            {/* Background Image - same as GridSection */}
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
            
            {/* Content */}
            <View className="flex-1 justify-center items-center px-4">
              <Text 
                className="text-primary text-center font-semibold"
                style={{ 
                  fontFamily: "LeagueSpartan",
                  fontSize: 14
                }}
              >
                💬 Leave feedback
              </Text>
            </View>
          </View>
        </Pressable>

        {/* Rating Banner */}
        <Pressable className="flex-1">
          <View 
            className="rounded-full overflow-hidden relative"
            style={{ height: width * 0.15 }}
          >
            {/* Background Image - same as GridSection */}
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
            
            {/* Content */}
            <View className="flex-1 justify-center items-center px-4">
              <Text 
                className="text-primary text-center font-semibold"
                style={{ 
                  fontFamily: "LeagueSpartan",
                  fontSize: 14
                }}
              >
                ⭐ Rate our app
              </Text>
            </View>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

export default FeedbackRatingSection;
