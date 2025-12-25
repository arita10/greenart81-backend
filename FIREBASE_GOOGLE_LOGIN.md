# 🔥 Firebase Google Login - Complete Guide

## ✅ Backend Setup Complete!

Your backend is now fully configured for Firebase Google authentication!

---

## 📋 What Was Implemented:

### **1. Firebase Admin SDK** ✅
- Installed `firebase-admin` package
- Created Firebase configuration ([config/firebase.js](config/firebase.js))
- Initialized with your Firebase project ID

### **2. Database Updates** ✅
- Added `firebase_uid` column to users table
- Created index for faster Firebase UID lookups
- Made `password` column nullable (Firebase users don't have passwords)

### **3. Google Login Endpoint** ✅
- Created `/api/auth/firebase-google` endpoint
- Verifies Firebase ID tokens
- Creates new users or logs in existing users
- Returns JWT token for authentication

### **4. Controller & Routes** ✅
- Added `firebaseGoogleLogin` function to authController
- Added route in authRoutes.js
- Proper error handling and validation

---

## 🔗 API Endpoint:

### **POST /api/auth/firebase-google**

**URL:** `https://greenart81-backend.onrender.com/api/auth/firebase-google`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjU..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 7,
      "email": "user@gmail.com",
      "name": "John Doe",
      "phone": null,
      "address": null,
      "role": "customer",
      "is_active": true,
      "created_at": "2025-12-25T13:00:00.000Z",
      "updated_at": "2025-12-25T13:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Google login successful"
}
```

**Error Responses:**

```json
// Missing token
{
  "success": false,
  "error": "Firebase ID token is required",
  "code": "MISSING_TOKEN"
}

// Invalid token
{
  "success": false,
  "error": "Invalid Firebase token",
  "code": "INVALID_TOKEN"
}
```

---

## 🔄 How It Works:

```
1. User clicks "Sign in with Google" in frontend
   ↓
2. Firebase Auth shows Google account picker popup
   ↓
3. User selects Google account and grants permission
   ↓
4. Firebase returns ID token to frontend
   ↓
5. Frontend sends ID token to backend at /api/auth/firebase-google
   ↓
6. Backend verifies token with Firebase Admin SDK
   ↓
7. Backend checks if user exists in database
   ↓
8. If new user: Creates account with Firebase UID
   If existing: Updates Firebase UID (if needed)
   ↓
9. Backend generates JWT token
   ↓
10. Returns user data + JWT token to frontend
    ↓
11. Frontend stores token and user is logged in ✅
```

---

## 🎯 Frontend Integration (Already Done):

Your frontend is already configured! It will:

1. Use Firebase SDK to get ID token
2. Send POST request to `/api/auth/firebase-google`
3. Receive JWT token
4. Store token in localStorage
5. User is logged in!

**Frontend calls this from:**
- `src/services/api.js` → `googleLogin()` function
- `src/context/AuthContext.jsx` → `loginWithGoogle()` function
- `src/pages/Public/Login.jsx` → "Sign in with Google" button

---

## 🧪 Testing Firebase Google Login:

### **Test Flow:**

1. **Go to your frontend login page**
2. **Click "Sign in with Google" button**
3. **Select your Google account**
4. **Check browser console for:**
   - Firebase ID token received
   - Backend API call made
   - JWT token received
   - User logged in successfully

### **Manual API Test with Postman:**

1. **Get a Firebase ID Token:**
   - Login through frontend first
   - Check browser console/network tab for `idToken`
   - Copy the token

2. **Test Backend Endpoint:**
   ```
   POST https://greenart81-backend.onrender.com/api/auth/firebase-google

   Body (JSON):
   {
     "idToken": "PASTE_YOUR_FIREBASE_ID_TOKEN_HERE"
   }
   ```

3. **Verify Response:**
   - Should return user data
   - Should return JWT token
   - Token should work for authenticated endpoints

---

## 📁 Files Created/Modified:

### **Created:**
- `config/firebase.js` - Firebase Admin configuration
- `config/add-firebase-uid.sql` - Database migration SQL
- `scripts/add-firebase-support.js` - Migration script
- `FIREBASE_GOOGLE_LOGIN.md` - This documentation

### **Modified:**
- `controllers/authController.js` - Added `firebaseGoogleLogin` function
- `routes/authRoutes.js` - Added `/firebase-google` route
- `.env` - Added `FIREBASE_PROJECT_ID`
- `package.json` - Added `firebase-admin` dependency

---

## 🔧 Environment Variables:

### **Local (.env):**
```env
FIREBASE_PROJECT_ID=greenart-27e91
```

### **Render Dashboard:**
Add this environment variable:
- Key: `FIREBASE_PROJECT_ID`
- Value: `greenart-27e91`

---

## 🚀 Deployment to Render:

The code is ready to deploy! Just push to GitHub:

```bash
git add .
git commit -m "Add Firebase Google login support"
git push origin main
```

Then add `FIREBASE_PROJECT_ID` to Render environment variables.

---

## ✅ Features:

1. **Auto-create Users:** New Google users automatically get accounts
2. **Existing Users:** Users who already have accounts can link Google
3. **No Password:** Firebase users don't need passwords
4. **JWT Token:** Returns standard JWT token like email/password login
5. **Role Management:** New users get "customer" role by default
6. **Security:** Firebase Admin SDK verifies all tokens

---

## 📊 Database Schema:

The `users` table now has:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),                    -- Nullable for Firebase users
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  role VARCHAR(50) DEFAULT 'customer',
  firebase_uid VARCHAR(255),                -- NEW: Firebase user ID
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
```

---

## 🔐 Security Notes:

1. **ID Token Verification:** All Firebase tokens are verified with Firebase Admin SDK
2. **No Direct Password:** Firebase handles authentication, we just verify
3. **JWT Token:** Our JWT token is used for subsequent API calls
4. **Email Verification:** Firebase handles email verification
5. **Secure:** Only valid Google accounts can authenticate

---

## 🎨 User Experience:

### **New User (First Google Login):**
1. Clicks "Sign in with Google"
2. Picks Google account
3. Account created automatically
4. Logged in immediately
5. Can start shopping!

### **Existing User:**
1. Clicks "Sign in with Google"
2. Picks Google account
3. Linked to existing account
4. Logged in immediately
5. All their data preserved!

---

## 🆘 Troubleshooting:

### **Error: "Invalid Firebase token"**
- Token might be expired (Firebase tokens expire after 1 hour)
- User needs to login again
- Check Firebase project configuration

### **Error: "Firebase Admin initialization error"**
- Check `FIREBASE_PROJECT_ID` is set correctly
- Verify it matches your Firebase project

### **User can't login with Google:**
- Check Firebase is enabled in frontend
- Verify Google Auth is enabled in Firebase Console
- Check network tab for API errors
- Verify `idToken` is being sent to backend

### **User created but not logging in:**
- Check JWT token is being returned
- Verify frontend stores token correctly
- Check browser console for errors

---

## 📈 Next Steps:

### **Optional Enhancements:**

1. **Save Google Profile Picture:**
   - Modify controller to save `picture` URL
   - Add `avatar` column to users table
   - Display in frontend profile

2. **Firebase Phone Authentication:**
   - Add phone number login
   - Use Firebase Phone Auth

3. **Link Multiple Auth Methods:**
   - Allow users to link email/password + Google
   - Add `auth_providers` column

4. **Email Verification:**
   - Use Firebase email verification
   - Require verified emails

---

## ✨ Summary:

**Backend Status:** ✅ Fully configured and ready!

**Endpoint:** `POST /api/auth/firebase-google`

**Database:** ✅ Updated with Firebase support

**Frontend:** ✅ Already configured and ready to use

**Testing:** Ready to test! Just click "Sign in with Google" in your frontend!

---

**Firebase Google Login is 100% ready to use!** 🎉🔥

Your users can now sign in with their Google accounts instantly!
