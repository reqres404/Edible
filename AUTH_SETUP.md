# Authentication Setup for Edible App

## Overview
This app now includes Google Sign-In authentication with a proper authentication flow. Users are required to sign in with Google before accessing the main app features.

## Features
- **Google Sign-In**: Users authenticate using their Google account
- **Persistent Authentication**: User session is maintained across app restarts
- **Protected Routes**: Main app features are only accessible after authentication
- **Sign Out**: Users can sign out from the profile tab

## File Structure
```
app/
├── auth/
│   ├── _layout.tsx          # Auth navigation layout
│   └── signin.tsx           # Sign-in screen
├── (tabs)/
│   ├── profile.tsx          # Profile tab with sign-out
│   └── ...                  # Other tabs
├── _layout.tsx              # Root layout with auth provider
└── ...

contexts/
└── AuthContext.tsx          # Authentication context

components/
└── LoadingScreen.tsx        # Loading screen component
```

## How It Works

### 1. App Startup
- App checks for existing authentication state
- If no user is signed in, redirects to `/auth/signin`
- If user is signed in, redirects to main app `/(tabs)`

### 2. Sign-In Process
- User sees welcome screen with Google Sign-In button
- After successful authentication, user data is stored securely
- User is redirected to main app

### 3. Authentication State
- User information is stored using `expo-secure-store`
- Authentication context provides user data throughout the app
- Profile tab displays user information and sign-out option

### 4. Sign-Out Process
- User can sign out from profile tab
- Confirmation dialog prevents accidental sign-out
- After sign-out, user is redirected to sign-in screen

## Environment Variables
Make sure to set your Google OAuth client ID:
```
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## Usage in Components
```typescript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, signOut } = useAuth();
  
  // Access user data
  console.log(user?.name, user?.email);
  
  // Sign out user
  const handleSignOut = () => signOut();
};
```

## Security Features
- Uses `expo-secure-store` for secure storage of user data
- Google Sign-In handles OAuth security
- Authentication state is checked on app startup and route changes
