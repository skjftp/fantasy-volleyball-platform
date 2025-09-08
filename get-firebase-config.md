# Getting Firebase Configuration

## Steps to Get Your Firebase Config:

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Add Firebase to existing project**:
   - Click "Add project"
   - Select "Use an existing Google Cloud project"
   - Choose `fantasy-volleyball-21364`
   - Click "Add Firebase"

3. **Create Web App**:
   - Click the Web icon `</>`
   - App name: `Fantasy Volleyball Platform`
   - Register app

4. **Copy the configuration** and update `frontend/.env`:

```bash
# Replace these with your actual values from Firebase Console
VITE_FIREBASE_API_KEY=AIzaSyD_your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=fantasy-volleyball-21364.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fantasy-volleyball-21364
VITE_FIREBASE_STORAGE_BUCKET=fantasy-volleyball-21364.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=107958119805
VITE_FIREBASE_APP_ID=1:107958119805:web:your_actual_app_id
```

## Enable Required Services:

### 1. Authentication
- Go to Authentication → Sign-in method
- Enable "Phone" provider
- Add authorized domains if needed

### 2. Firestore Database  
- Go to Firestore Database → Create database
- Choose "Start in production mode"
- Location: `us-central1`

### 3. Deploy Security Rules
After getting config, deploy the security rules:

```bash
# In project root
firebase deploy --only firestore:rules
```

## Initialize Sample Data

After configuration, run the initialization script:

```bash
cd fantasy-volleyball-platform
npm install firebase
node init-firestore.js
```

This will populate your Firestore with sample matches, players, and contests.

## Test the Setup

1. Update your `.env` with real values
2. Run the frontend: `npm run dev`  
3. Try to register with a phone number
4. Check if data loads on the home page

## Troubleshooting

- **API Key errors**: Make sure all values are copied correctly
- **Auth errors**: Check that Phone authentication is enabled
- **CORS errors**: Add your domain to authorized domains in Firebase Auth settings
- **Firestore errors**: Ensure security rules are deployed