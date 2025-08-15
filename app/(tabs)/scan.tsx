import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Platform, Pressable, Text, View } from "react-native";

const { width: screenWidth } = Dimensions.get('window');

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const isFocused = useIsFocused();
  
  useEffect(() => {
    if (Platform.OS === 'android') {
      // Android initialization
    } else if (Platform.OS === 'ios') {
      // iOS initialization
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setIsCameraActive(true);
      setCameraReady(false);
      
      if (Platform.OS === 'android') {
        setTimeout(() => {
          if (isFocused) {
            setIsCameraActive(true);
          }
        }, 50);
      } else if (Platform.OS === 'ios') {
        setTimeout(() => {
          if (isFocused) {
            setIsCameraActive(true);
          }
        }, 50);
      }
      
      return () => {
        setIsCameraActive(false);
        setCameraReady(false);
        
        if (Platform.OS === 'android') {
          try {
            setCameraReady(false);
            setIsCameraActive(false);
          } catch (error) {
            // Android cleanup error
          }
        } else if (Platform.OS === 'ios') {
          try {
            setCameraReady(false);
            setIsCameraActive(false);
          } catch (error) {
            // iOS cleanup error
          }
        }
      };
    }, [isFocused])
  );

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    return () => {
      setIsCameraActive(false);
      setCameraReady(false);
      
      if (Platform.OS === 'android') {
        // Android cleanup
      } else if (Platform.OS === 'ios') {
        // iOS cleanup
      }
    };
  }, []);

  const handleBarCodeScanned = ({ type, data }: BarcodeScanningResult) => {
    if (scanned) {
      return;
    }

    setScanned(true);
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    console.log('✅ Barcode Type:', type);
    console.log('✅ Barcode Data (Serial Number):', data);
  };

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white text-lg">Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-black px-4">
        <Text className="text-white text-lg text-center mb-4">
          Camera access is required to scan barcodes
        </Text>
        <Text className="text-gray-400 text-sm text-center">
          Please grant camera permission to use the scanner
        </Text>
      </View>
    );
  }

  if (!isFocused || !isCameraActive) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white text-lg text-center mb-4">
          Camera is initializing...
        </Text>
        <Text className="text-gray-300 text-sm text-center px-8">
          Please wait while the camera loads
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        key={`camera-${isFocused}-${isCameraActive}-${Platform.OS}`}
        ref={cameraRef}
        className="flex-1 w-full h-full"
        facing="back"
        onBarcodeScanned={handleBarCodeScanned}
        onCameraReady={() => {
          setCameraReady(true);
          setCameraError(null);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}
        onMountError={(error) => {
          setCameraReady(false);
          setCameraError(`Camera error: ${error.message || 'Unknown error'}`);
        }}
        barcodeScannerSettings={{
          barcodeTypes: [
            'aztec',
            'ean13',
            'ean8',
            'qr',
            'pdf417',
            'upc_e',
            'datamatrix',
            'code128',
            'code39',
            'code93',
            'codabar',
            'itf14',
            'upc_a',
          ],
        }}
        {...(Platform.OS === 'ios' && {
          enableZoomGesture: true,
          enablePinchToZoom: true,
        })}
        style={{ flex: 1 }}
      />
      
      {!cameraReady && (
        <View className="absolute inset-0 bg-black bg-opacity-80 justify-center items-center">
          <Text className="text-white text-lg text-center mb-4">
            {cameraError ? 'Camera Error' : 'Camera is initializing...'}
          </Text>
          <Text className="text-gray-300 text-sm text-center px-8">
            {cameraError 
              ? cameraError
              : 'If you don\'t see the camera preview, try restarting the app or check camera permissions'
            }
          </Text>
          {cameraError && (
            <Pressable 
              className="bg-white px-4 py-2 rounded-full mt-4"
              onPress={() => {
                setCameraError(null);
                setCameraReady(false);
                setIsCameraActive(false);
                setTimeout(() => {
                  if (isFocused) {
                    setIsCameraActive(true);
                  }
                }, 100);
              }}
            >
              <Text className="text-accent text-sm font-semibold">
                Retry Camera
              </Text>
            </Pressable>
          )}
        </View>
      )}
      
      <View className="absolute inset-0 pointer-events-none">
        <View 
          className="border-2 border-accent rounded-lg bg-transparent absolute"
          style={{ 
            width: screenWidth * 0.8, 
            height: screenWidth * 0.8 * 0.6,
            top: '50%',
            left: '50%',
            marginLeft: -(screenWidth * 0.8) / 2,
            marginTop: -(screenWidth * 0.8 * 0.6) / 2,
            zIndex: 1000,
          }} 
        />
      
        <View className="absolute bottom-36 left-0 right-0 items-center px-5 pointer-events-none">
          <Text className="text-white text-lg font-semibold text-center mb-2">
            Point the camera at a food product barcode
          </Text>
          <Text className="text-gray-300 text-sm text-center">
            The barcode will be automatically detected
          </Text>
        </View>
        
        {scanned && (
          <View className="absolute bottom-10 left-0 right-0 items-center pointer-events-none">
            <Pressable 
              className="bg-white px-5 py-3 rounded-full pointer-events-auto"
              onPress={() => setScanned(false)}
            >
              <Text className="text-accent text-base font-semibold">
                Tap to Scan Again
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}


