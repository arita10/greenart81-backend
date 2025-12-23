# Git Setup & Push Guide

## Step 1: Verify Git is Installed

```bash
git --version
```

If not installed, download from [git-scm.com](https://git-scm.com)

---

## Step 2: Initialize Git Repository

```bash
# Navigate to your project
cd c:\Users\msapi\OneDrive\Documents\ReactProJ\greenart81-backend

# Initialize git
git init

# Configure git (if first time)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## Step 3: Review Files to be Committed

```bash
# Check status
git status

# Review .gitignore (should exclude .env)
cat .gitignore
```

Your `.gitignore` already excludes:
- `node_modules/`
- `.env` (⚠️ Important - keeps credentials safe)
- `*.log`
- `.DS_Store`
- `uploads/`
- `.vscode/`

---

## Step 4: Add Files to Git

```bash
# Add all files (respects .gitignore)
git add .

# Verify what will be committed
git status
```

You should see:
- ✅ All code files added
- ❌ `.env` NOT added (good!)
- ❌ `node_modules/` NOT added (good!)

---

## Step 5: Create First Commit

```bash
git commit -m "Initial commit: GreenArt81 E-commerce Backend API v1.0.0

- Complete RESTful API with 67 endpoints
- JWT authentication and authorization
- PostgreSQL database integration
- Customer features: products, cart, orders, wishlist, reviews
- Admin features: management dashboard and analytics
- Comprehensive documentation
- Production-ready deployment configuration"
```

---

## Step 6: Create GitHub Repository

### Option A: Via GitHub Website
1. Go to [github.com](https://github.com)
2. Click "+" (top right) → "New repository"
3. Fill in:
   - **Repository name:** `greenart81-backend`
   - **Description:** "Node.js E-commerce Backend API for GreenArt81"
   - **Visibility:** Public or Private
   - **DO NOT** initialize with README, .gitignore, or license
4. Click "Create repository"

### Option B: Via GitHub CLI (if installed)
```bash
gh repo create greenart81-backend --public --source=. --remote=origin
```

---

## Step 7: Link Local to GitHub

After creating GitHub repository, copy the URL and run:

```bash
# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/greenart81-backend.git

# Verify remote
git remote -v
```

You should see:
```
origin  https://github.com/YOUR_USERNAME/greenart81-backend.git (fetch)
origin  https://github.com/YOUR_USERNAME/greenart81-backend.git (push)
```

---

## Step 8: Push to GitHub

```bash
# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

Enter your GitHub credentials when prompted.

---

## Step 9: Verify on GitHub

1. Go to your repository: `https://github.com/YOUR_USERNAME/greenart81-backend`
2. You should see all your files
3. Verify `.env` is NOT there (good!)

---

## Step 10: Add Repository Secrets (for CI/CD)

If you plan to use GitHub Actions or automated deployments:

1. Go to your repository on GitHub
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Add secrets:
   - `DB_CONNECTION_STRING`
   - `JWT_SECRET`

---

## Future Updates - How to Push Changes

Every time you make changes:

```bash
# Check what changed
git status

# Add changes
git add .

# Commit with descriptive message
git commit -m "Description of changes"

# Push to GitHub
git push origin main
```

---

## Branching Strategy (Optional but Recommended)

### For Features:
```bash
# Create feature branch
git checkout -b feature/payment-integration

# Make changes, commit
git add .
git commit -m "Add payment integration"

# Push feature branch
git push origin feature/payment-integration

# Create Pull Request on GitHub
# After merge, switch back to main
git checkout main
git pull origin main
```

### For Hotfixes:
```bash
git checkout -b hotfix/critical-bug
# Fix, commit, push
git push origin hotfix/critical-bug
# Create PR, merge
```

---

## Common Git Commands

```bash
# View commit history
git log --oneline

# View changes before committing
git diff

# Undo changes (before commit)
git checkout -- filename.js

# Undo last commit (keep changes)
git reset --soft HEAD~1

# View remote repositories
git remote -v

# Pull latest changes
git pull origin main

# Create and switch to new branch
git checkout -b branch-name

# List all branches
git branch -a

# Delete branch
git branch -d branch-name

# Clone repository (on another machine)
git clone https://github.com/YOUR_USERNAME/greenart81-backend.git
```

---

## Protecting Your `.env` File

### ✅ Current Setup (Good!)
- `.env` is in `.gitignore`
- `.env.example` is tracked (shows structure, no real values)

### ⚠️ If You Accidentally Commit .env

```bash
# Remove from git but keep local file
git rm --cached .env

# Commit the removal
git commit -m "Remove .env from tracking"

# Push
git push origin main

# Change all passwords/secrets immediately!
```

---

## Setting Up SSH (Optional, More Secure)

Instead of HTTPS, you can use SSH:

```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub:
# Settings → SSH and GPG keys → New SSH key

# Change remote to SSH
git remote set-url origin git@github.com:YOUR_USERNAME/greenart81-backend.git
```

---

## Collaboration Features

### Add Collaborators:
1. Repository → Settings → Collaborators
2. Add team members

### Code Review:
- Use Pull Requests
- Require reviews before merging
- Enable branch protection

---

## GitHub Features to Explore

1. **Issues** - Track bugs and features
2. **Projects** - Kanban board
3. **Actions** - CI/CD automation
4. **Wiki** - Additional documentation
5. **Releases** - Version management

---

## Sample README.md Badges

Add to your GitHub README for a professional look:

```markdown
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
```

---

## Troubleshooting

### Issue: Permission Denied
```bash
# Use personal access token instead of password
# Generate at: GitHub → Settings → Developer settings → Personal access tokens
```

### Issue: Large Files
```bash
# Check file sizes
du -sh *

# Remove large file from git
git rm --cached large-file.zip
```

### Issue: Merge Conflicts
```bash
# Pull latest changes
git pull origin main

# Fix conflicts in files (marked with <<<<<<< HEAD)
# After fixing:
git add .
git commit -m "Resolve merge conflicts"
git push origin main
```

---

## Next Steps

After pushing to GitHub:
1. ✅ Verify repository on GitHub
2. ✅ Add a nice README.md (already created)
3. ✅ Deploy to hosting (see DEPLOYMENT.md)
4. ✅ Set up automated deployments
5. ✅ Invite collaborators (if any)

---

**Your code is now safely version controlled! 🎉**

Next: See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment instructions.
