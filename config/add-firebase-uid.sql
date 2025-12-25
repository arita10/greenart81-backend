-- Add firebase_uid column to users table for Google Firebase authentication

ALTER TABLE users
ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(255);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);

-- Make password nullable for Firebase users (they don't have passwords)
ALTER TABLE users
ALTER COLUMN password DROP NOT NULL;
