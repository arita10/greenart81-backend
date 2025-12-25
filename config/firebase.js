const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
// Note: For production, use a service account JSON file
// For now, we'll use the web config (limited functionality but works for auth)
try {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'greenart-27e91',
  });
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Firebase Admin initialization error:', error.message);
}

module.exports = admin;
