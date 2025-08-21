import TopBar from "@/components/TopBar";
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Platform, Pressable, Text, View, Alert } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";

const { width: screenWidth } = Dimensions.get('window');

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [showSuccessIndicator, setShowSuccessIndicator] = useState(false);
  const [isScanningEnabled, setIsScanningEnabled] = useState(true);
  const [scannedCodes, setScannedCodes] = useState<Set<string>>(new Set());
  const [scanAreaActive, setScanAreaActive] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const isFocused = useIsFocused();
  const { getCurrentToken } = useAuth();
  
  // Barcode validation functions
  const isValidBarcode = (code: string): boolean => {
    // Must be a string and have reasonable length
    if (typeof code !== 'string' || code.length < 8 || code.length > 20) {
      console.log(`❌ Invalid barcode length: ${code.length} (expected 8-20)`);
      return false;
    }
    
    // Must contain only digits (for EAN/UPC barcodes)
    if (!/^\d+$/.test(code)) {
      console.log(`❌ Invalid barcode format: ${code} (contains non-digits)`);
      return false;
    }
    
    // Common barcode lengths: EAN-13 (13), EAN-8 (8), UPC-A (12), UPC-E (8)
    const validLengths = [8, 12, 13];
    if (!validLengths.includes(code.length)) {
      console.log(`❌ Invalid barcode length: ${code.length} (expected ${validLengths.join(', ')})`);
      return false;
    }
    
    // Additional validation for EAN-13 (check digit validation)
    if (code.length === 13) {
      const checkDigit = parseInt(code[12]);
      const calculatedCheckDigit = calculateEAN13CheckDigit(code.substring(0, 12));
      if (checkDigit !== calculatedCheckDigit) {
        console.log(`❌ Invalid EAN-13 check digit: expected ${calculatedCheckDigit}, got ${checkDigit}`);
        return false;
      }
    }
    
    console.log(`✅ Barcode validation passed: ${code}`);
    return true;
  };

  const calculateEAN13CheckDigit = (code: string): number => {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(code[i]);
      sum += digit * (i % 2 === 0 ? 1 : 3);
    }
    const remainder = sum % 10;
    return remainder === 0 ? 0 : 10 - remainder;
  };

  const analyzeBarcodePattern = (code: string): void => {
    console.log(`🔍 Barcode pattern analysis for: ${code}`);
    console.log(`   - Length: ${code.length}`);
    console.log(`   - Format: ${getBarcodeFormat(code)}`);
    console.log(`   - Check digit: ${code.length === 13 ? 'Valid' : 'N/A'}`);
    
    // Log digit distribution to help identify patterns
    const digitCounts = new Array(10).fill(0);
    for (const char of code) {
      digitCounts[parseInt(char)]++;
    }
    console.log(`   - Digit distribution:`, digitCounts);
  };

  const getBarcodeFormat = (code: string): string => {
    if (code.length === 13) return 'EAN-13';
    if (code.length === 12) return 'UPC-A';
    if (code.length === 8) return 'EAN-8';
    return 'Unknown';
  };

  const calculateBarcodeSimilarity = (code1: string, code2: string): number => {
    if (code1.length !== code2.length) return 0;
    
    let matches = 0;
    for (let i = 0; i < code1.length; i++) {
      if (code1[i] === code2[i]) matches++;
    }
    
    return matches / code1.length;
  };

  // Check if barcode is in the optimal scanning area
  const isInScanArea = (barcodeData: string): boolean => {
    // For now, we'll use a simple approach - in a real implementation,
    // you'd get the actual barcode position from the camera
    // This simulates the barcode being in the purple border area
    
    // Set scan area as active when we detect a barcode
    setScanAreaActive(true);
    
    // Reset after a short delay
    setTimeout(() => {
      setScanAreaActive(false);
    }, 1000);
    
    return true; // Always return true for now, but you can enhance this
  };

  // Enhanced scan area detection with quality assessment
  const assessScanQuality = (barcodeData: string): { inArea: boolean; quality: 'excellent' | 'good' | 'poor' } => {
    // Simulate quality assessment based on barcode data
    // In a real implementation, this would use camera data and barcode positioning
    
    // Set scan area as active
    setScanAreaActive(true);
    
    // Reset after a short delay
    setTimeout(() => {
      setScanAreaActive(false);
    }, 1000);
    
    // Simulate quality assessment
    const quality = barcodeData.length >= 13 ? 'excellent' : 
                   barcodeData.length >= 8 ? 'good' : 'poor';
    
    console.log(`🎯 Scan quality assessment: ${quality} (length: ${barcodeData.length})`);
    
    return { inArea: true, quality };
  };

  // Provide scanning guidance based on current state
  const getScanningGuidance = (): string => {
    if (scanAreaActive) {
      return "Barcode detected! Processing...";
    }
    if (!isScanningEnabled) {
      return "Scanning paused - please wait...";
    }
    return "Ready to scan";
  };

  // Enhanced similarity detection that allows similar codes
  const isSimilarToExistingCode = (newCode: string): boolean => {
    // Check if this code is too similar to any existing confirmed code
    for (const existingCode of scannedCodes) {
      // Only check similarity if codes have the same length
      if (newCode.length === existingCode.length) {
        const similarity = calculateBarcodeSimilarity(newCode, existingCode);
        console.log(`🔍 Similarity check: ${newCode} vs ${existingCode} = ${Math.round(similarity * 100)}%`);
        
        // Allow similar codes (they might be different products)
        // Only reject if they're essentially identical (98%+ similarity)
        if (similarity > 0.98) {
          console.log(`⚠️ Nearly identical barcode detected: ${newCode} vs ${existingCode} (${Math.round(similarity * 100)}% similar)`);
          console.log(`🔍 This appears to be the exact same product - allowing scan but will overwrite`);
          return false; // Allow scan but will overwrite in the array
        } else if (similarity > 0.9) {
          console.log(`ℹ️ Similar barcode detected: ${newCode} vs ${existingCode} (${Math.round(similarity * 100)}% similar)`);
          console.log(`🔍 Similar but different - allowing scan (might be different product)`);
        }
      }
    }
    return false; // Allow all scans
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      // Android initialization
    } else if (Platform.OS === 'ios') {
      // iOS initialization
    }
    
    // Log initial scanning status
    console.log('🚀 Scan screen mounted - scanning system initialized');
    logScanningStatus();
    exportScanningData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setIsCameraActive(true);
      setCameraReady(false);
      
      console.log(`🎯 Screen focus changed - isFocused: ${isFocused}`);
      
      if (Platform.OS === 'android') {
        setTimeout(() => {
          if (isFocused) {
            setIsCameraActive(true);
            console.log('🤖 Android camera activated');
          }
        }, 50);
      } else if (Platform.OS === 'ios') {
        setTimeout(() => {
          if (isFocused) {
            setIsCameraActive(true);
            console.log('🍎 iOS camera activated');
          }
        }, 50);
      }
      
      return () => {
        setIsCameraActive(false);
        setCameraReady(false);
        console.log('🔒 Screen focus lost - camera deactivated');
        
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

  // Log scanned codes count changes for debugging
  useEffect(() => {
    if (scannedCodes.size > 0) {
      console.log(`📊 Scanned codes updated: ${scannedCodes.size} unique products`);
      // Log the last 3 scanned codes for debugging
      const lastCodes = Array.from(scannedCodes).slice(-3);
      console.log('🔍 Last scanned codes:', lastCodes);
    }
  }, [scannedCodes.size]);

  // Log scanning status changes for debugging
  useEffect(() => {
    console.log(`🔄 Scanning enabled state changed: ${isScanningEnabled}`);
    if (!isScanningEnabled) {
      console.log('⏸️ Scanning paused - cooldown active');
    } else {
      console.log('▶️ Scanning resumed - ready for next scan');
    }
  }, [isScanningEnabled]);

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

  // Function to call backend API when barcode is scanned
  const callBackendAPI = async (barcode: string) => {
    try {
      console.log(`🚀 Calling backend API for barcode: ${barcode}`);
      
      // Get current user's authentication token
      const token = await getCurrentToken();
      if (!token) {
        console.log('❌ No authentication token available');
        Alert.alert('Authentication Required', 'Please sign in to scan products');
        return;
      }
      
      console.log('🔑 Authentication token obtained, calling API...');
      
      // Call the backend API
      const result = await apiService.getProductByBarcode(barcode, token);
      
      console.log('🎉 Backend API call successful!');
      console.log('📦 Product data:', result.data);
      
      // You can add navigation to product details here
      // router.push(`/product/${barcode}`);
      
    } catch (error: any) {
      console.error('🚨 Backend API call failed:', error);
      
      if (error.message?.includes('401')) {
        Alert.alert('Authentication Error', 'Please sign in again');
      } else if (error.message?.includes('404')) {
        Alert.alert('Product Not Found', 'This barcode is not in our database');
      } else if (error.message?.includes('429')) {
        Alert.alert('Rate Limit Exceeded', 'Please wait a moment before scanning again');
      } else {
        Alert.alert('Error', 'Failed to fetch product information. Please try again.');
      }
    }
  };

  const handleBarCodeScanned = ({ type, data }: BarcodeScanningResult) => {
    // Prevent scanning if scanning is temporarily disabled
    if (!isScanningEnabled) {
      console.log('⏳ Scanning temporarily disabled - cooldown active');
      return;
    }

    // Check if barcode is in the optimal scanning area
    if (!isInScanArea(data)) {
      console.log(`⚠️ Barcode ${data} not in optimal scanning area - ignoring`);
      return;
    }

    // Assess scan quality
    const scanQuality = assessScanQuality(data);
    if (!scanQuality.inArea) {
      console.log(`⚠️ Barcode ${data} not properly positioned in scan area`);
      return;
    }

    console.log(`🎯 Barcode properly positioned in scan area`);

    // Validate barcode format
    if (!isValidBarcode(data)) {
      console.log(`❌ Invalid barcode format: ${data} (length: ${data.length})`);
      return;
    }

    // Check if this code is too similar to existing confirmed code
    if (isSimilarToExistingCode(data)) {
      console.log(`⚠️ Nearly identical barcode detected: ${data}`);
      // Don't vibrate for similar codes, just log
      console.log(`ℹ️ Similar code detected - will overwrite in array`);
    }

    // Analyze the barcode pattern for debugging
    analyzeBarcodePattern(data);

    // Add to scanned codes for tracking - overwrite if similar, move to front
    setScannedCodes(prev => {
      const newSet = new Set(prev);
      // Remove the code if it already exists (to avoid duplicates)
      newSet.delete(data);
      // Add the new code (it will be at the end, but we'll handle ordering in the array)
      newSet.add(data);
      return newSet;
    });
    
    // Convert to array and move the new code to the front
    const updatedCodes = Array.from(scannedCodes);
    // Remove the code if it exists
    const filteredCodes = updatedCodes.filter(code => code !== data);
    // Add the new code to the front
    const reorderedCodes = [data, ...filteredCodes];
    
    console.log(`📊 Barcode ${data} scanned successfully in optimal area`);
    console.log(`📊 Updated codes array: [${reorderedCodes.join(', ')}]`);

    // Show success indicator
    setLastScannedCode(data);
    setShowSuccessIndicator(true);
    
    // Disable scanning temporarily to prevent spam
    setIsScanningEnabled(false);
    console.log('🚫 Scanning disabled - starting cooldown period');
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    console.log('✅ Barcode Type:', type);
    console.log('✅ Barcode Data (Serial Number):', data);
    console.log('📊 Total unique codes scanned:', scannedCodes.size + 1);
    
    // Hide the success indicator after 2 seconds
    setTimeout(() => {
      setShowSuccessIndicator(false);
    }, 2000);
    
    // Re-enable scanning after 3 seconds to prevent rapid-fire scanning
    setTimeout(() => {
      setIsScanningEnabled(true);
      console.log('✅ Scanning re-enabled - cooldown period ended');
    }, 3000);

    // Call backend API to get product information
    callBackendAPI(data);
  };

  // Function to manually confirm a pending barcode (for debugging/testing)
  const manuallyConfirmBarcode = (code: string) => {
    // This function is no longer needed as scanning is single-scan
    console.log(`❌ Manually confirming barcode is not supported in single-scan mode.`);
  };

  // Function to get scanning status for debugging
  const logScanningStatus = () => {
    console.log('📊 Current scanning status:');
    console.log(`   - Scanning enabled: ${isScanningEnabled}`);
    console.log(`   - Total codes: ${scannedCodes.size}`);
    console.log(`   - Last scanned code: ${lastScannedCode || 'None'}`);
    console.log(`   - Success indicator visible: ${showSuccessIndicator}`);
    
    // Log scanned codes in order (newest first)
    if (scannedCodes.size > 0) {
      const codesArray = Array.from(scannedCodes);
      console.log('📋 Scanned codes:', codesArray);
    }
  };

  // Function to export scanning data for debugging
  const exportScanningData = () => {
    console.log('📊 === SCANNING DATA EXPORT ===');
    const codesArray = Array.from(scannedCodes);
    console.log('📋 Scanned codes (newest first):', codesArray);
    console.log('📈 Total codes:', codesArray.length);
    console.log('📊 === END EXPORT ===');
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
      <TopBar />
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
          console.log('📷 Camera ready - scanning system fully operational');
          logScanningStatus();
        }}
        onMountError={(error) => {
          setCameraReady(false);
          setCameraError(`Camera error: ${error.message || 'Unknown error'}`);
          console.log('❌ Camera mount error:', error.message || 'Unknown error');
          console.log('🔧 Attempting to recover camera...');
        }}
        barcodeScannerSettings={{
          barcodeTypes: [
            'ean13',    // Most common for retail products
            'ean8',     // Shorter EAN codes
            'upc_a',    // Standard UPC codes
            'upc_e',    // Compressed UPC codes
            'code128',  // Industrial codes
            'code39',   // Industrial codes
          ],
        }}
        {...(Platform.OS === 'ios' && {
          enableZoomGesture: true,
          enablePinchToZoom: true,
        })}
        style={{ flex: 1 }}
        // Add camera quality settings
        focusable={true}
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
                console.log('🔄 Retry camera button pressed - attempting recovery');
                setCameraError(null);
                setCameraReady(false);
                setIsCameraActive(false);
                setTimeout(() => {
                  if (isFocused) {
                    setIsCameraActive(true);
                    console.log('🔄 Camera recovery attempt initiated');
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
          className={`border-2 rounded-lg bg-transparent absolute ${
            scanAreaActive ? 'border-green-400 border-4' : 'border-accent'
          }`}
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
          {/* Success indicator */}
          {showSuccessIndicator && lastScannedCode && (
            <View className="bg-green-500 px-4 py-2 rounded-full mb-4 pointer-events-none">
              <Text className="text-white text-sm font-semibold text-center">
                ✓ Scanned: {lastScannedCode.substring(0, 8)}...
              </Text>
            </View>
          )}
          
          <Text className="text-gray-300 text-sm text-center mb-2">
            {getScanningGuidance()}
          </Text>
          <Text className="text-gray-400 text-xs text-center">
            Hold steady and ensure good lighting for best results
          </Text>
        </View>
        
      </View>
    </View>
  );
}
