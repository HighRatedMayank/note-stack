# Firebase Authentication Setup Guide

## Fixing "auth/auth-domain-config-required" Error

The error you're seeing occurs because Google Authentication is not enabled in your Firebase project. Follow these steps to fix it:

### Step 1: Enable Google Authentication

1. **Go to Firebase Console**: https://console.firebase.google.com/project/note-stack-dadcb/overview

2. **Navigate to Authentication**:
   - Click on "Authentication" in the left sidebar
   - Click on "Get started" if you haven't set up authentication yet

3. **Enable Google Sign-in**:
   - Click on the "Sign-in method" tab
   - Click on "Google" from the list of providers
   - Click "Enable"
   - Add your support email (your email address)
   - Click "Save"

### Step 2: Configure Authorized Domains

1. **In the Authentication section**:
   - Click on the "Settings" tab
   - Scroll down to "Authorized domains"
   - Add your development domain: `localhost`
   - If you plan to deploy, also add your production domain

### Step 3: Verify Configuration

Your Firebase configuration should look like this in `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyByB9MwPxsNP3mD3pL9RM7Bc_vRv-hhTzs
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=note-stack-dadcb.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=note-stack-dadcb
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=note-stack-dadcb.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=967279881167
NEXT_PUBLIC_FIREBASE_APP_ID=1:967279881167:web:652b63bd2fec62c03280ba
```

### Step 4: Test Authentication

After enabling Google Authentication:
1. Restart your development server
2. Try signing in with Google again
3. The error should be resolved

### Optional: Enable GitHub Authentication

If you want to use GitHub authentication as well:
1. Go to GitHub Developer Settings: https://github.com/settings/developers
2. Create a new OAuth App
3. Set the Authorization callback URL to: `https://note-stack-dadcb.firebaseapp.com/__/auth/handler`
4. Copy the Client ID and Client Secret
5. In Firebase Console > Authentication > Sign-in method > GitHub
6. Enable GitHub and add your Client ID and Client Secret

### Troubleshooting

If you still get errors:
1. Make sure you're using the correct Firebase project
2. Verify all environment variables are loaded
3. Check that the auth domain matches your Firebase project
4. Clear browser cache and try again
