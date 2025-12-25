# Admin Login Fix Guide

## Problem
Admin login fails with "Invalid credentials" error.

## Solution
Wait for Render deployment to complete (2-3 minutes), then run setup-admin endpoint.

---

## Step 1: Wait for Render Deployment

Go to https://dashboard.render.com and check your service status shows "Live"

---

## Step 2: Run Setup Admin Endpoint

### Option A: Using curl (Command Line)

```bash
curl -X POST https://greenart81-backend.onrender.com/api/setup-admin
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "admin@greenart81.com",
    "name": "Admin User",
    "role": "admin"
  },
  "message": "Admin account created successfully!",
  "credentials": {
    "email": "admin@greenart81.com",
    "password": "admin123"
  }
}
```

### Option B: Using Browser

1. Open: https://greenart81-backend.onrender.com/api/setup-admin
2. Use a tool like Postman or browser extension
3. Send POST request
4. Check response

---

## Step 3: Test Admin Login

```bash
curl -X POST https://greenart81-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@greenart81.com","password":"admin123"}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "admin@greenart81.com",
      "name": "Admin User",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

---

## Step 4: Login from Frontend

Use these credentials in your frontend:

**Email:** `admin@greenart81.com`
**Password:** `admin123`

---

## Alternative: Make Existing User Admin

If you already have a user account, you can promote it to admin:

```bash
curl -X POST https://greenart81-backend.onrender.com/api/make-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"your_user@email.com"}'
```

---

## Troubleshooting

### Error: "Route not found"
- Wait for Render deployment to complete
- Check https://dashboard.render.com for deployment status
- Deployment usually takes 2-3 minutes

### Error: "Invalid credentials" after setup
- Run setup-admin endpoint again
- It will delete old admin and create new one

### Frontend still can't login
- Clear browser cache and localStorage
- Check network tab for actual error response
- Verify API_URL is correct in frontend

---

## Security Note

**IMPORTANT:** Change admin password after first login!

1. Login with admin123
2. Go to profile/settings
3. Change password to something secure
4. Delete the setup-admin endpoint from server.js after setup

---

**After running setup-admin, your admin login will work!** 🎉
