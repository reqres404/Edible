import { BarcodeScanningResult, CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from "react";
import { Alert, Dimensions, Platform, Pressable, Text, View } from "react-native";

const { width: screenWidth } = Dimensions.get('window');

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  
  // Debug: Log when component mounts
  useEffect(() => {
    console.log('📱 ScanScreen mounted');
    console.log('📱 Platform:', Platform.OS);
    console.log('📱 Camera permission status:', permission);
    
    // Android-specific camera initialization
    if (Platform.OS === 'android') {
      console.log('🤖 Android device detected - initializing camera...');
    }
  }, []);

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({ type, data }: BarcodeScanningResult) => {
    console.log('🔍 Barcode detected!', { type, data }); // Debug log
    
    if (scanned) {
      console.log('⚠️ Already scanned, ignoring...'); // Debug log
      return;
    }

    setScanned(true);
    
    // Trigger haptic feedback for successful scan
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Log the scanned barcode data to console
    console.log('✅ Barcode Type:', type);
    console.log('✅ Barcode Data (Serial Number):', data);
    
    // Show alert to user with the scanned data
    Alert.alert(
      'Barcode Scanned!',
      `Type: ${type}\nSerial Number: ${data}`,
      [
        {
          text: 'Scan Again',
          onPress: () => {
            // Trigger haptic feedback for scan again
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setScanned(false);
          },
        },
      ]
    );
  };

  if (!permission) {
    // Camera permissions are still loading
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white text-lg">Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
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

  return (
    <View className="flex-1 bg-black">
            <CameraView
        className="flex-1 w-full h-full"
        facing="back"
        onBarcodeScanned={handleBarCodeScanned}
        onCameraReady={() => {
          console.log('📸 Camera is ready');
          setCameraReady(true);
          // Trigger haptic feedback when camera is ready
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}
        onMountError={(error) => console.log('❌ Camera error:', error)}

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
        style={{ flex: 1 }}

      />
      
      {/* Camera preview fallback message */}
      {!cameraReady && (
        <View className="absolute inset-0 bg-black bg-opacity-80 justify-center items-center">
          <Text className="text-white text-lg text-center mb-4">
            Camera is initializing...
          </Text>
          <Text className="text-gray-300 text-sm text-center px-8">
            If you don't see the camera preview, try restarting the app or check camera permissions
          </Text>
        </View>
      )}
      
      {/* Overlay UI positioned absolutely over the camera */}
        <View className="absolute inset-0 pointer-events-none">
          {/* Scanning frame */}
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
        
        {/* Instructions */}
        <View className="absolute bottom-36 left-0 right-0 items-center px-5 pointer-events-none">
          <Text className="text-white text-lg font-semibold text-center mb-2">
            Point the camera at a food product barcode
          </Text>
          <Text className="text-gray-300 text-sm text-center">
            The barcode will be automatically detected
          </Text>
        </View>
        
        {/* Scan again button when a code is detected */}
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


