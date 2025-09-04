# Google Sign-In Native Module Setup

## Current Issue
The app is showing: `'RNGoogleSignin' could not be found. Verify that a module by this name is registered in the native binary.`

## Temporary Solution
I've temporarily disabled Google Sign-In to get the app running. You can now test the authentication flow with a demo sign-in button.

## To Fix Google Sign-In Native Module:

### 1. For Development (Expo Go)
Google Sign-In requires native code and won't work in Expo Go. You need to use a development build.

### 2. Create Development Build
```bash
cd Edible-FE
npx expo install expo-dev-client
npx expo prebuild
```

### 3. For Android
```bash
npx expo run:android
```

### 4. For iOS
```bash
npx expo run:ios
```

### 5. Verify Google Services
Make sure you have:
- `google-services.json` in `android/app/` (Android)
- `GoogleService-Info.plist` in your iOS project
- Proper Google OAuth configuration

### 6. Re-enable Google Sign-In
After creating the development build, uncomment the Google Sign-In code in:
- `app/auth/signin.tsx`
- `contexts/AuthContext.tsx`

## Current Demo Mode
The app now works with a demo sign-in button that creates a mock user. This allows you to test the authentication flow while fixing the native module issue.

## Testing the Current Setup
1. Run the app
2. You'll see the sign-in screen with "Sign In (Demo)" button
3. Tap it to sign in with mock data
4. Navigate through the app tabs
5. Check the profile tab to see user info
6. Test the sign-out functionality

## Next Steps
1. Create a development build
2. Fix Google Sign-In native module
3. Re-enable Google Sign-In functionality
4. Test with real Google accounts
