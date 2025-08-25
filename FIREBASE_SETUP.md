# Firebase Setup Guide

## Fixing Permission Issues

The "Missing or insufficient permissions" error occurs because Firestore security rules are not properly configured. Follow these steps to fix it:

### 1. Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase in your project (if not already done)
```bash
firebase init
```

### 4. Deploy Firestore Security Rules
```bash
firebase deploy --only firestore:rules
```

### 5. Deploy Firestore Indexes (if needed)
```bash
firebase deploy --only firestore:indexes
```

## Security Rules Explanation

The `firestore.rules` file contains rules that:
- Allow authenticated users to read and write their own pages
- Allow users to manage their own user documents
- Deny all other access for security

## Environment Variables

Make sure you have these environment variables set in your `.env.local` file:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Testing

After deploying the rules, test your application to ensure:
1. Users can create and edit their own pages
2. Users cannot access other users' pages
3. Unauthenticated users cannot access any data
