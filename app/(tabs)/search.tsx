import React from 'react'
import { Text, View } from 'react-native'

const search = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text className="text-5xl text-dark-500 font-bold">Search</Text>
    </View>
  )
}

export default search