# 🔐 Secure Architecture: Backend-Only Firebase Credentials

## Architecture Overview

```
Frontend (React) ←→ Go Backend ←→ Firebase (Auth + Firestore)
                 ↑
            JWT Tokens
```

## Security Benefits

✅ **Firebase credentials never exposed to frontend**  
✅ **JWT-based authentication with 7-day expiry**  
✅ **OTP verification handled server-side**  
✅ **Protected API endpoints with middleware**  
✅ **User context validation**  

## Implementation

### 1. Frontend Changes

- **Removed direct Firebase SDK usage**
- **Created API client for backend communication**
- **Updated AuthContext to use backend endpoints**
- **JWT tokens stored in localStorage**
- **Automatic token injection in API calls**

### 2. Backend Authentication Endpoints

```go
POST /api/auth/send-otp     // Send OTP to phone number
POST /api/auth/verify-otp   // Verify OTP and get JWT token
POST /api/auth/logout       // Logout (client-side token removal)
```

### 3. Protected Endpoints

All user-specific endpoints now require `Authorization: Bearer <jwt_token>`:

```go
POST /api/teams                    // Create team
POST /api/contests/{id}/join       // Join contest  
GET  /api/users/{userId}/teams     // Get user teams
GET  /api/users/{userId}           // Get user profile
POST /api/admin/*                  // Admin operations
```

### 4. OTP Flow

1. **Frontend** → `POST /api/auth/send-otp` → **Backend**
2. **Backend** → Generate 6-digit OTP → Store temporarily (5min expiry)
3. **Backend** → Print OTP to console (TODO: Send SMS via Twilio/AWS)
4. **User** → Enter OTP → **Frontend** 
5. **Frontend** → `POST /api/auth/verify-otp` → **Backend**
6. **Backend** → Validate OTP → Create/find user → Generate JWT → Return token
7. **Frontend** → Store token → Redirect to dashboard

## Environment Variables Needed

### Backend (Cloud Run)
```bash
JWT_SECRET=your-super-secret-key-here
GOOGLE_APPLICATION_CREDENTIALS=serviceAccountKey.json
PORT=8080
```

### Frontend (Netlify)
```bash
VITE_API_BASE_URL=https://your-backend-url.run.app/api
```

## Firebase Project Setup (Backend Only)

1. **Create Firebase project** (you've done this ✅)
2. **Enable Firestore database** (done ✅)
3. **Service account credentials** in backend only ✅
4. **No Firebase SDK in frontend** ✅

## Security Rules

Since frontend doesn't directly access Firestore, the rules can be more restrictive:

```javascript
// All operations go through authenticated backend
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only allow backend service account access
    match /{document=**} {
      allow read, write: if false; // Frontend has no direct access
    }
  }
}
```

## Development Testing

1. **Start Backend:**
   ```bash
   cd backend
   go run main.go
   # Server starts on localhost:8080
   ```

2. **Start Frontend:**
   ```bash
   cd frontend  
   npm run dev
   # App starts on localhost:5173
   ```

3. **Test Authentication:**
   - Enter phone number (e.g., 9876543210)
   - Check backend console for OTP
   - Enter OTP to verify
   - JWT token stored automatically

## Production Deployment

### Backend to Cloud Run
```bash
# Set environment variables in Cloud Run
JWT_SECRET=production-secret-key
GOOGLE_APPLICATION_CREDENTIALS=serviceAccountKey.json

# Deploy
gcloud run deploy fantasy-volleyball-backend \
  --source . \
  --region=us-central1 \
  --allow-unauthenticated
```

### Frontend to Netlify
```bash
# Environment variables in Netlify
VITE_API_BASE_URL=https://your-backend-url.run.app/api

# Auto-deploy from Git repository
```

## SMS Integration (TODO)

For production, replace console logging with actual SMS:

```go
// In sendOTP function, replace:
fmt.Printf("OTP for %s: %s\n", request.PhoneNumber, otp)

// With Twilio/AWS SNS integration:
err = sendSMS(request.PhoneNumber, fmt.Sprintf("Your OTP: %s", otp))
```

## Token Refresh (Future Enhancement)

Current implementation uses 7-day JWT tokens. For production, consider:
- Refresh token mechanism
- Shorter access token expiry (1 hour)
- Token blacklisting for logout

This architecture ensures Firebase credentials are never exposed to the client while maintaining a smooth user experience!