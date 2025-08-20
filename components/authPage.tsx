import {GoogleSignin,GoogleSigninButton,statusCodes,isSuccessResponse,isErrorWithCode} from "@react-native-google-signin/google-signin"
import { useState } from "react";
import { View,Text, Alert } from "react-native";

GoogleSignin.configure()

GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  });

const authPage = () => {
    const [userInfo, setUserInfo] = useState<any>(null);
    const handleGoogleSignIn = async () =>{
        try {
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn()
            if (isSuccessResponse(response)) {
                setUserInfo(response.data);
              } else {
                console.log("sign in was cancelled by user")
              }
        } catch (error) {
            if (isErrorWithCode(error)) {
                switch (error.code) {
                  case statusCodes.IN_PROGRESS:
                    Alert.alert("Sign-in in progress")
                    break;
                  case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                    Alert.alert("play services not available or outdated")
                    break;
                  default:
                    Alert.alert("Sign-in Failed! due to google")
                }
              } else {
                Alert.alert("Sign-in Failed! due to Dev error")
              }
            }  
        }
    
    return (
        <View>
            <Text> Auth Page </Text>
            {userInfo?(
                <Text>{JSON.stringify(userInfo,null,2)}</Text>
            ):<GoogleSigninButton
            style={{width:212,height:48}}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={handleGoogleSignIn}
            />}
            
        </View>
    )
}


export default authPage