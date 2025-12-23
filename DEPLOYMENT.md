# Deployment Guide - GreenArt81 Backend

## Prerequisites
- GitHub account
- Git installed locally
- Your code pushed to GitHub

---

## Option 1: Deploy to Render.com (Recommended)

### Why Render?
- ✅ Free tier (750 hours/month)
- ✅ No credit card required
- ✅ Auto-deploy from GitHub
- ✅ Built-in HTTPS
- ✅ Easy environment variables
- ✅ Works perfectly with PostgreSQL (Aiven)

### Step-by-Step Deployment

#### 1. Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: GreenArt81 Backend API"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/greenart81-backend.git
git branch -M main
git push -u origin main
```

#### 2. Sign Up on Render

1. Go to [https://render.com](https://render.com)
2. Click "Get Started for Free"
3. Sign up with GitHub

#### 3. Create Web Service

1. Click "New +" button → "Web Service"
2. Click "Connect Account" to link GitHub
3. Find and select your `greenart81-backend` repository
4. Click "Connect"

#### 4. Configure Service

Fill in the following:

- **Name:** `greenart81-backend` (or your preferred name)
- **Region:** Choose closest to your users
- **Branch:** `main`
- **Root Directory:** (leave empty)
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** `Free`

#### 5. Add Environment Variables

Click "Advanced" → "Add Environment Variable" for each:

| Key | Value |
|-----|-------|
| `PORT` | `5000` |
| `NODE_ENV` | `production` |
| `DB_CONNECTION_STRING` | `postgres://avnadmin:AVNS_Nh02jPSirVhenMJ_bcy@pg-2738ab86-chabasolution-2341.f.aivencloud.com:25389/defaultdb?sslmode=require` |
| `JWT_SECRET` | `your_super_secret_jwt_key_change_this_in_production` |
| `JWT_EXPIRE` | `7d` |
| `CORS_ORIGIN` | `*` (or your frontend URL) |

#### 6. Deploy

1. Click "Create Web Service"
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Start your server
3. Wait 2-3 minutes for deployment

#### 7. Your API is Live! 🎉

Your API will be available at:
```
https://greenart81-backend.onrender.com
```

Test it:
```bash
curl https://greenart81-backend.onrender.com
```

#### 8. Initialize Database (First Time Only)

After deployment, you need to initialize the database:

**Option A: Using Render Shell**
1. Go to your service dashboard
2. Click "Shell" tab
3. Run: `npm run init-db`

**Option B: Using API endpoint**
Create a one-time initialization endpoint (we'll add this below)

#### 9. Auto-Deploy

Every time you push to GitHub, Render will automatically redeploy! 🚀

---

## Option 2: Deploy to Railway.app

### Step-by-Step

1. Go to [https://railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `greenart81-backend` repository
6. Railway will auto-detect it's a Node.js app
7. Add environment variables:
   - Click "Variables" tab
   - Add all the variables from above
8. Click "Deploy"
9. Get your URL from the "Settings" tab

---

## Option 3: Deploy to Cyclic.sh

### Step-by-Step

1. Go to [https://cyclic.sh](https://cyclic.sh)
2. Click "Deploy Now"
3. Connect with GitHub
4. Select your repository
5. Add environment variables
6. Deploy!

---

## Option 4: Deploy to Vercel (Serverless)

**Note:** Vercel is great for serverless but has some limitations for long-running processes.

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Add environment variables via Vercel dashboard

---

## Post-Deployment Checklist

### ✅ After Deployment:

1. **Test API Health:**
```bash
curl https://your-app-url.com
```

2. **Initialize Database:**
```bash
# Via shell or create a special endpoint
npm run init-db
```

3. **Test Login:**
```bash
curl -X POST https://your-app-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@greenart81.com","password":"admin123"}'
```

4. **Update Frontend CORS:**
Update `.env` CORS_ORIGIN to your frontend URL:
```
CORS_ORIGIN=https://your-frontend-url.com
```

5. **Change Admin Password:**
Use the API to change default admin password

6. **Test All Endpoints:**
Use Postman collection to verify all routes work

---

## Monitoring & Maintenance

### Render Dashboard
- View logs: Click "Logs" tab
- View metrics: Click "Metrics" tab
- Restart service: Click "Manual Deploy" → "Deploy latest commit"

### Common Issues

#### Issue: Database Connection Failed
**Solution:** Check DB_CONNECTION_STRING environment variable

#### Issue: Server Not Starting
**Solution:** Check logs for errors, verify all environment variables are set

#### Issue: CORS Errors
**Solution:** Update CORS_ORIGIN to include your frontend URL

---

## Scaling (Future)

### Free Tier Limitations:
- **Render:** 750 hours/month (sleeps after 15 min inactivity)
- **Railway:** $5 credit/month
- **Cyclic:** Unlimited

### Paid Options (When you need more):
- **Render:** $7/month (no sleep, more resources)
- **Railway:** Pay as you go
- **AWS/Google Cloud/Azure:** Full control

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `production` |
| `DB_CONNECTION_STRING` | PostgreSQL URL | Your Aiven connection string |
| `JWT_SECRET` | JWT signing key | Strong random string |
| `JWT_EXPIRE` | Token expiration | `7d` |
| `CORS_ORIGIN` | Allowed origins | `*` or specific URL |

---

## CI/CD Pipeline (Optional)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Render

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: curl ${{ secrets.RENDER_DEPLOY_HOOK }}
```

---

## Security Best Practices

1. ✅ Never commit `.env` file
2. ✅ Use strong JWT_SECRET (32+ characters)
3. ✅ Change default admin password
4. ✅ Use HTTPS only (automatic on Render)
5. ✅ Set specific CORS_ORIGIN for production
6. ✅ Keep dependencies updated

---

## Backup & Recovery

### Database Backup (Aiven)
1. Go to Aiven console
2. Select your database
3. Click "Backups" tab
4. Download backup

### Code Backup
- Your code is on GitHub (automatic backup)
- Keep local copy

---

## Support

If you encounter issues:
1. Check deployment logs
2. Verify environment variables
3. Test database connection
4. Review [Render docs](https://render.com/docs)

---

## Quick Deploy Commands

```bash
# Push changes
git add .
git commit -m "Update: description"
git push origin main

# Render auto-deploys!
```

---

**Your backend is ready for production! 🚀**

Recommended: **Render.com** - Best balance of features and free tier.
