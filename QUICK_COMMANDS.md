# Quick Commands Reference

## 🚀 Git Commands

```bash
# First Time Setup
git init
git add .
git commit -m "Initial commit: GreenArt81 Backend API v1.0.0"
git remote add origin https://github.com/YOUR_USERNAME/greenart81-backend.git
git branch -M main
git push -u origin main

# Regular Updates
git add .
git commit -m "Description of changes"
git push origin main

# Check Status
git status
git log --oneline

# Pull Latest
git pull origin main
```

---

## ☁️ Deployment (Render.com)

### Via Website:
1. Go to [render.com](https://render.com)
2. New + → Web Service
3. Connect GitHub repo
4. Add environment variables
5. Deploy!

### Your API URL:
```
https://greenart81-backend.onrender.com
```

---

## 🛠️ Local Development

```bash
# Start server (development with auto-reload)
npm run dev

# Start server (production)
npm start

# Test database connection
npm run test-connection

# Initialize database
npm run init-db

# Reset database (drop all tables)
npm run reset-db

# Full reset and reinitialize
npm run reset-db && npm run init-db
```

---

## 🧪 Testing API

```bash
# Test server health
curl http://localhost:5000

# Test categories
curl http://localhost:5000/api/categories

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test User","phone":"1234567890"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@greenart81.com","password":"admin123"}'

# Get products
curl http://localhost:5000/api/products

# Create product (admin)
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Peace Lily","description":"Beautiful indoor plant","price":29.99,"stock":50,"category_id":1,"is_featured":true}'
```

---

## 📦 NPM Commands

```bash
# Install dependencies
npm install

# Install specific package
npm install package-name

# Update dependencies
npm update

# Check for outdated packages
npm outdated

# Security audit
npm audit

# Fix vulnerabilities
npm audit fix
```

---

## 🗄️ Database Commands

```bash
# Test connection
npm run test-connection

# Initialize database
npm run init-db

# Reset database
npm run reset-db

# Full reset
npm run reset-db && npm run init-db
```

---

## 📝 Documentation Files

```bash
# View README
cat README.md

# View Quick Start
cat QUICKSTART.md

# View API Testing Guide
cat API_TESTING.md

# View Deployment Guide
cat DEPLOYMENT.md

# View Git Setup Guide
cat GIT_SETUP.md
```

---

## 🔧 Server Control

```bash
# Start server
npm start

# Start with auto-reload
npm run dev

# Stop server (if running in terminal)
Ctrl + C

# Check if port 5000 is in use (Windows)
netstat -ano | findstr :5000

# Kill process on port 5000 (Windows)
taskkill /PID <PID> /F

# Check if port 5000 is in use (Mac/Linux)
lsof -i :5000

# Kill process on port 5000 (Mac/Linux)
kill -9 <PID>
```

---

## 🌐 Environment Variables

```bash
# Edit environment variables
notepad .env  # Windows
nano .env     # Mac/Linux

# View current environment
set  # Windows
env  # Mac/Linux
```

---

## 📊 Admin Default Credentials

```
Email: admin@greenart81.com
Password: admin123
```

⚠️ **Change immediately after deployment!**

---

## 🔍 Debugging

```bash
# View server logs (if running in background)
# Check terminal where server is running

# Test specific endpoint
curl -v http://localhost:5000/api/endpoint

# Check database connection
npm run test-connection

# View PostgreSQL connection in code
cat config/database.js
```

---

## 📱 Postman

```bash
# Import collection
# File → Import → Choose POSTMAN_COLLECTION.json

# Set variables
base_url = http://localhost:5000
token = (get from login response)
admin_token = (get from admin login response)
```

---

## 🚨 Emergency Commands

```bash
# Stop everything
Ctrl + C (in terminal)

# Reset database completely
npm run reset-db
npm run init-db

# Reinstall dependencies
rm -rf node_modules
rm package-lock.json
npm install

# Revert to last commit (git)
git reset --hard HEAD
```

---

## 📈 Production Checklist

```bash
# Before deployment:
✅ git status (check no uncommitted changes)
✅ Test all endpoints locally
✅ Update .env.example if needed
✅ Update README if needed
✅ npm audit (check security)
✅ git push origin main

# After deployment:
✅ Test deployed API URL
✅ Initialize database on server
✅ Change admin password
✅ Test admin login
✅ Test customer registration
✅ Test product creation
✅ Test order flow
```

---

## 🔗 Important URLs

```
Local API: http://localhost:5000
Production API: https://your-app.onrender.com
GitHub Repo: https://github.com/YOUR_USERNAME/greenart81-backend
Render Dashboard: https://dashboard.render.com
Aiven Console: https://console.aiven.io
```

---

## 💡 Pro Tips

```bash
# Create git alias for common commands
git config --global alias.co checkout
git config --global alias.cm commit
git config --global alias.st status

# Now you can use:
git co main
git cm -m "message"
git st

# View all git aliases
git config --get-regexp alias

# Pretty git log
git log --oneline --graph --all --decorate
```

---

## 🎯 Common Workflows

### New Feature
```bash
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
# Create PR on GitHub
```

### Bug Fix
```bash
git checkout -b fix/bug-name
# Fix bug
git add .
git commit -m "Fix bug description"
git push origin fix/bug-name
# Create PR on GitHub
```

### Update Production
```bash
git add .
git commit -m "Update description"
git push origin main
# Render auto-deploys!
```

---

## 🆘 Get Help

```bash
# Git help
git help
git help commit
git help push

# NPM help
npm help
npm help install

# Node help
node --help

# View package.json scripts
npm run
```

---

**Keep this handy for quick reference! 📌**
