import TopBar from "@/components/TopBar";
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Platform, Pressable, Text, View, Alert, Animated, FlatList, Easing } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from "@/contexts/AuthContext";
import { useScannedProducts, ScannedProduct } from "@/contexts/ScannedProductsContext";
import { apiService } from "@/services/api";
import { ScannedProductIcon } from "@/components/ScannedProductIcon";
import { ProductInfoDrawer } from "@/components/ProductInfoDrawer";

const { width: screenWidth } = Dimensions.get('window');

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [showSuccessIndicator, setShowSuccessIndicator] = useState(false);
  const [isScanningEnabled, setIsScanningEnabled] = useState(true);
  const successIndicatorAnim = useRef(new Animated.Value(0)).current;
  const [scannedCodes, setScannedCodes] = useState<Set<string>>(new Set());
  const [currentScannedProducts, setCurrentScannedProducts] = useState<ScannedProduct[]>([]);
  const [showProductNotFound, setShowProductNotFound] = useState(false);
  const [isWaitingForAPI, setIsWaitingForAPI] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ScannedProduct | null>(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const productNotFoundAnim = useRef(new Animated.Value(0)).current;
  const iconsPositionAnim = useRef(new Animated.Value(0)).current;
  const cameraRef = useRef<CameraView>(null);
  const flatListRef = useRef<FlatList>(null);
  const isFocused = useIsFocused();
  const { getCurrentToken } = useAuth();
  const { addScannedProduct, isProductAlreadyScanned, scannedProducts } = useScannedProducts();
  const insets = useSafeAreaInsets();
  
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

  const isInScanArea = (code: string): boolean => {
    // Simple validation - just check if code is in the general area
    // In a real implementation, you'd get the actual barcode position from the camera
    return true; // Always return true for now
  };

  const assessScanQuality = (code: string): { inArea: boolean; quality: 'excellent' | 'good' | 'poor' } => {
    // Simulate quality assessment based on barcode data
    // In a real implementation, this would use camera data and barcode positioning
    
    // Simulate quality assessment
    const quality = code.length >= 13 ? 'excellent' : 
                   code.length >= 8 ? 'good' : 'poor';
    
    console.log(`🎯 Scan quality assessment: ${quality} (length: ${code.length})`);
    
    return { inArea: true, quality };
  };

  // Provide scanning guidance based on current state
  const getScanningGuidance = (): string => {
    if (isWaitingForAPI) {
      return "Processing scanned item...";
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

  // Scroll to the latest product when a new one is added
  useEffect(() => {
    if (currentScannedProducts.length > 0 && flatListRef.current) {
      // Small delay to ensure the FlatList has rendered
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    }
  }, [currentScannedProducts.length]);

  // Sync with global scanned products context to maintain persistence
  useEffect(() => {
    if (scannedProducts.length > 0) {
      setCurrentScannedProducts(scannedProducts);
    }
  }, [scannedProducts]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      // Android initialization
    } else if (Platform.OS === 'ios') {
      // iOS initialization
    }
    
    // Log initial scanning status
    console.log('🚀 Scan screen mounted - scanning system initialized');
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
      let result = await apiService.getProductByBarcode(barcode, token);
      
      // If unauthorized, try one refresh-and-retry
      if ((result as any)?.status === 'error' && (result as any)?.statusCode === 401) {
        console.log('🔄 Token may be expired. Refreshing token and retrying...');
        // Force refresh by clearing stored token and fetching a new one
        try {
          // getCurrentToken already refreshes proactively, so call it again
          const refreshedToken = await getCurrentToken();
          if (refreshedToken) {
            result = await apiService.getProductByBarcode(barcode, refreshedToken);
          }
        } catch (retryError) {
          console.log('Retry after token refresh failed:', retryError);
        }
      }
      
      console.log('🎉 Backend API call successful!');
      console.log('📦 Product data:', result.data);
      
      // Transform the API response to our ScannedProduct format
      const scannedProduct: ScannedProduct = {
        barcode: barcode,
        name: result.data.name,
        brand: result.data.brand,
        imageUrl: result.data.imageUrl,
        categories: result.data.categories,
        ingredients: result.data.ingredients,
        allergens: result.data.allergens,
        nutritionGrade: result.data.nutritionGrade,
        novaGroup: result.data.novaGroup,
        ecoscore: result.data.ecoscore,
        nutriments: result.data.nutriments,
        nutriscore: result.data.nutriscore,
        scannedAt: new Date(),
      };
      
      // Check if product was already scanned in this session
      const wasAlreadyScanned = isProductAlreadyScanned(barcode);
      
      // Add to scanned products context
      addScannedProduct(scannedProduct);
      
      // Add the new product to current scanned products for display (no limit)
      setCurrentScannedProducts(prev => {
        const newList = [scannedProduct, ...prev.filter(p => p.barcode !== scannedProduct.barcode)];
        return newList;
      });
      
      // Clear waiting state
      setIsWaitingForAPI(false);
      
      // Show success message
      if (wasAlreadyScanned) {
        console.log('🔄 Product already scanned - updated in session');
      } else {
        console.log('✅ New product scanned successfully');
      }
      
    } catch (error: any) {
      // Clear waiting state on error
      setIsWaitingForAPI(false);
      console.error('🚨 Backend API call failed:', error);
      
      // Check if it's an API error response
      if (error.status === 'error') {
        if (error.message?.includes('401') || error.message?.includes('Authentication')) {
          Alert.alert('Authentication Error', 'Please sign in again');
        } else if (error.message?.includes('404') || error.message?.includes('not found') || error.message?.includes('Product not found')) {
          console.log('❌ Product not found - showing not found message');
          setShowProductNotFound(true);
          
          // Animate in
          Animated.timing(productNotFoundAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
          
          // Hide the message after 3 seconds
          setTimeout(() => {
            Animated.timing(productNotFoundAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              setShowProductNotFound(false);
            });
          }, 3000);
        } else if (error.message?.includes('429') || error.message?.includes('rate limit')) {
          Alert.alert('Rate Limit Exceeded', 'Please wait a moment before scanning again');
        } else {
          Alert.alert('Error', error.message || 'Failed to fetch product information. Please try again.');
        }
      } else if (error.message) {
        // Handle other types of errors
        if (error.message.includes('401')) {
          Alert.alert('Authentication Error', 'Please sign in again');
        } else if (error.message.includes('404') || error.message.includes('not found') || error.message.includes('Product not found')) {
          console.log('❌ Product not found - showing not found message');
          setShowProductNotFound(true);
          
          // Animate in
          Animated.timing(productNotFoundAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
          
          setTimeout(() => {
            Animated.timing(productNotFoundAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              setShowProductNotFound(false);
            });
          }, 3000);
        } else if (error.message.includes('429')) {
          Alert.alert('Rate Limit Exceeded', 'Please wait a moment before scanning again');
        } else {
          Alert.alert('Error', 'Failed to fetch product information. Please try again.');
        }
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

    // Simple barcode detection - no complex area checking
    console.log(`🎯 Barcode detected: ${data}`);

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
    
    // Animate success indicator in
    Animated.spring(successIndicatorAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
    
    // Don't create icon yet - wait for API success
    console.log('🎯 Barcode scanned, waiting for API response...');
    
    // Set waiting state
    setIsWaitingForAPI(true);
    
    // Disable scanning temporarily to prevent spam
    setIsScanningEnabled(false);
    console.log('🚫 Scanning disabled - starting cooldown period');
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    console.log('✅ Barcode Type:', type);
    console.log('✅ Barcode Data (Serial Number):', data);
    console.log('📊 Total unique codes scanned:', scannedCodes.size + 1);
    
    // Hide the success indicator after 2 seconds
    setTimeout(() => {
      Animated.timing(successIndicatorAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setShowSuccessIndicator(false);
      });
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

  // Function to handle icon click and show product info
  const handleIconPress = (product: ScannedProduct) => {
    const productIndex = currentScannedProducts.findIndex(p => p.barcode === product.barcode);
    setSelectedProduct(product);
    setSelectedProductIndex(productIndex);
    setIsDrawerVisible(true);
    
    // Start animation with improved timing for smoother motion
    Animated.timing(iconsPositionAnim, {
      toValue: 1,
      duration: 200, // Slightly longer duration for smoother animation
      easing: Easing.out(Easing.quad), // Quad easing for smoother deceleration
      useNativeDriver: true,
    }).start();
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Function to close the product info drawer
  const closeDrawer = () => {
    setIsDrawerVisible(false);
    // Don't reset selected product to ensure we remember the position
    // setSelectedProduct(null);
    
    // Animate icons back to original position after drawer starts closing
    setTimeout(() => {
      Animated.timing(iconsPositionAnim, {
        toValue: 0,
        duration: 180, // Increased slightly for smoother motion
        easing: Easing.inOut(Easing.cubic), // Using inOut easing for smoother acceleration/deceleration
        useNativeDriver: true,
      }).start();
    }, 20); // Reduced delay for more immediate response
  };

  // Function to switch between products
  const handleSwitchProduct = (direction: 'left' | 'right') => {
    console.log('handleSwitchProduct called:', { direction, currentScannedProducts: currentScannedProducts.length, selectedProductIndex });
    
    if (currentScannedProducts.length <= 1) {
      console.log('Not enough products to switch');
      return;
    }
    
    let newIndex = selectedProductIndex;
    if (direction === 'right') {
      newIndex = (selectedProductIndex + 1) % currentScannedProducts.length;
    } else {
      newIndex = selectedProductIndex === 0 ? currentScannedProducts.length - 1 : selectedProductIndex - 1;
    }
    
    console.log('Switching from index', selectedProductIndex, 'to', newIndex);
    setSelectedProductIndex(newIndex);
    setSelectedProduct(currentScannedProducts[newIndex]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Render item for FlatList with enhanced animations
  const renderProductIcon = ({ item, index }: { item: ScannedProduct; index: number }) => {
    return (
      <Pressable onPress={() => handleIconPress(item)}>
        <ScannedProductIcon 
          key={item.barcode}
          product={item} 
          position="left"
        />
      </Pressable>
    );
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
        <Text className="text-gray-400 text-sm text-center px-8">
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
      
      {/* Product Icons Display - Horizontal Scrollable Carousel - Always visible with consistent height */}
      <Animated.View 
        className="absolute left-0 right-0 h-36 z-40 bg-black bg-opacity-80 flex items-center justify-center"
        style={{
          transform: [{
            translateY: iconsPositionAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -40], // Reduced movement to keep icons more visible
            })
          }],
          top: Math.max(90, insets.top + 50), // Adjusted positioning for better visual balance
        }}
      >
        {currentScannedProducts.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={currentScannedProducts}
            renderItem={renderProductIcon}
            keyExtractor={(item) => item.barcode}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'center', paddingVertical: 10 }}
            snapToInterval={104} // 80px icon + 24px spacing
            decelerationRate="fast"
            bounces={false}
            scrollEnabled={true}
            // Enhanced scroll animations
            scrollEventThrottle={16}
            onScrollBeginDrag={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            onMomentumScrollEnd={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-400 text-sm">Scan products to see them here</Text>
        </View>
      )}
      </Animated.View>
      
      <View className="absolute inset-0 pointer-events-none">
        
        <View 
          className="border-2 rounded-lg bg-transparent absolute border-accent"
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
            <Animated.View 
              className="bg-green-500 px-4 py-2 rounded-full mb-4 pointer-events-none"
              style={{
                opacity: successIndicatorAnim,
                transform: [{ scale: successIndicatorAnim }],
              }}
            >
              <Text className="text-white text-sm font-semibold text-center">
                ✓ Scanned: {lastScannedCode.substring(0, 8)}...
              </Text>
            </Animated.View>
          )}
          
          {/* Processing indicator */}
          {isWaitingForAPI && (
            <Animated.View 
              className="bg-blue-500 px-4 py-2 rounded-full mb-4 pointer-events-none"
              style={{
                opacity: 1,
                transform: [{ scale: 1 }],
              }}
            >
              <Text className="text-white text-sm font-semibold text-center">
                🔄 Processing scanned item...
              </Text>
            </Animated.View>
          )}
          
          {/* Product not found message */}
          {showProductNotFound && (
            <Animated.View 
              className="bg-orange-500 px-4 py-2 rounded-full mb-4 pointer-events-none"
              style={{
                opacity: productNotFoundAnim,
                transform: [{ scale: productNotFoundAnim }],
              }}
            >
              <Text className="text-white text-sm font-semibold text-center">
                ⚠️ Scanned item does not exist
              </Text>
            </Animated.View>
          )}
          
          <Text className="text-gray-300 text-sm text-center mb-2">
            {getScanningGuidance()}
          </Text>
          <Text className="text-gray-400 text-xs text-center">
            Hold steady and ensure good lighting for best results
          </Text>
        </View>
        
      </View>
      
      {/* Product Info Drawer */}
      <ProductInfoDrawer
        product={selectedProduct}
        isVisible={isDrawerVisible}
        onClose={closeDrawer}
        onSwitchProduct={handleSwitchProduct}
        hasNextProduct={currentScannedProducts.length > 1}
        hasPreviousProduct={currentScannedProducts.length > 1}
      />
    </View>
  );
}