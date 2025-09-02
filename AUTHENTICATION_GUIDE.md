# Google Auth Persistent Authentication Guide

## Overview

This guide explains how the Edible app implements persistent authentication using Google Sign-In, ensuring users stay signed in across app restarts without needing to re-authenticate.

## How It Works

### 1. **Google Sign-In Flow**
- User taps Google Sign-In button
- Google handles authentication and returns user data
- App stores user data securely using `expo-secure-store`
- User is redirected to main app

### 2. **Persistent Authentication**
- **Google ID Token**: Stored securely in device storage
- **User Data**: Cached locally with profile information
- **Automatic Sync**: User data automatically syncs with backend
- **Token Refresh**: Google handles token refresh automatically

### 3. **Security Features**
- Uses `expo-secure-store` for secure token storage
- Tokens are stored separately from user data
- Automatic cleanup on sign out or errors
- Google's security standards for authentication

## Backend API Endpoints

### User Management
```
POST /api/v1/users          - Create/Update user
GET /api/v1/users/:googleId - Get user by Google ID
PATCH /api/v1/users/:googleId/profile - Update profile
POST /api/v1/users/:googleId/scanned-codes - Add scanned barcode
GET /api/v1/users/:googleId/scanned-codes - Get scanned codes
DELETE /api/v1/users/:googleId - Delete user account
```

### Authentication
- All user endpoints require Google ID token in Authorization header
- Token verification happens in `authMiddleware.ts`
- Supports both Google ID tokens and custom JWT tokens

## Frontend Implementation

### AuthContext
The main authentication context provides:
- `user`: Current user data
- `isLoading`: Authentication state loading
- `signIn(userData)`: Sign in with user data
- `signOut()`: Sign out and clear data
- `checkAuthState()`: Check current authentication state
- `getCurrentToken()`: Get current Google ID token
- `syncUserWithBackend()`: Sync user data with backend

### useUserProfile Hook
Custom hook for profile management:
- `updateProfile(updates)`: Update user profile
- `addScannedCode(barcode)`: Add scanned barcode
- `getScannedCodes()`: Get user's scanned codes

### API Service
Enhanced API service with user management methods:
- `createOrUpdateUser()`
- `getUserByGoogleId()`
- `updateUserProfile()`
- `addScannedCode()`
- `getScannedCodes()`

## Data Flow

### Sign In Process
1. User taps Google Sign-In
2. Google authenticates user
3. App creates user object with Google data
4. User data stored locally in secure storage
5. User data synced with backend
6. User redirected to main app

### App Restart Process
1. App checks Google Sign-In state
2. If signed in, retrieves stored user data
3. Verifies stored data matches current Google user
4. Restores user session automatically
5. Syncs with backend if needed

### Profile Updates
1. User updates profile locally
2. Changes synced to backend via API
3. Local data updated with backend response
4. Changes persist across app restarts

## User Data Structure

```typescript
interface User {
  id: string;           // Unique identifier
  googleId: string;     // Google user ID
  email: string;        // User's email
  name: string;         // User's name
  picture?: string;     // Profile picture URL
  age?: number;         // User's age
  allergies: string[];  // Food allergies
  lifestyle?: string;   // Lifestyle information
  scannedCodes: string[]; // Scanned barcodes
  createdAt?: string;   // Account creation date
  updatedAt?: string;   // Last update date
}
```

## Error Handling

### Authentication Errors
- Network issues during sign-in
- Google Play Services unavailable
- Token verification failures
- User data sync failures

### Recovery Strategies
- Automatic retry for network issues
- Fallback to local data if backend unavailable
- Clear stored data on authentication errors
- Graceful degradation for offline scenarios

## Best Practices

### Security
- Never store sensitive data in plain text
- Use secure storage for tokens
- Validate tokens before API calls
- Clear data on sign out

### Performance
- Cache user data locally
- Sync with backend in background
- Minimize API calls
- Handle offline scenarios gracefully

### User Experience
- Seamless sign-in experience
- No repeated authentication prompts
- Fast app startup
- Consistent data across sessions

## Troubleshooting

### Common Issues
1. **User not staying signed in**
   - Check Google Sign-In configuration
   - Verify secure storage permissions
   - Check for authentication errors

2. **Data not syncing**
   - Verify backend connectivity
   - Check authentication tokens
   - Review API error logs

3. **App crashes on startup**
   - Check stored data integrity
   - Verify Google Sign-In state
   - Clear stored data if needed

### Debug Steps
1. Check console logs for authentication errors
2. Verify Google Sign-In configuration
3. Test backend API endpoints
4. Check secure storage permissions
5. Review authentication middleware

## Future Enhancements

### Planned Features
- Biometric authentication support
- Multi-device sync
- Offline data management
- Enhanced security features

### Considerations
- Token expiration handling
- Refresh token implementation
- Multi-account support
- Data encryption at rest
