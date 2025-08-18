import React from 'react';
import { Text, View } from 'react-native';

const Footer: React.FC = () => {
  return (
    <View>
      {/* Footer content */}
      <View className="bg-white-100 py-10 px-4">
        <Text 
          className="text-gray-400 text-left"
          style={{ 
            fontFamily: "LeagueSpartan",
            fontSize: 36,
            lineHeight: 44
          }}
        >
          Let Edible Make What You Eat Edible
          <Text>
            ❤️
          </Text>
        </Text>
      </View>
      
      {/* Empty white space below footer for scrolling */}
      <View className="bg-white-100 h-20" />
    </View>
  );
};

export default Footer;
