# 🔧 Fix for Coolify Nixpacks Detection Error

If you see this error when deploying to Coolify:

```
Nixpacks failed to detect the application type.
```

## ❌ Problem

Coolify is trying to auto-detect your application type using Nixpacks, but this monorepo structure (frontend + backend) confuses Nixpacks. The repository root doesn't have a single `package.json`, so Nixpacks doesn't know what to do.

## ✅ Solution

You must explicitly tell Coolify to use **Docker** instead of auto-detection.

### Quick Fix Steps

1. **Delete the failed deployment** in Coolify (if it exists)

2. **Create a NEW resource** with one of these methods:

#### Method 1: Use Pre-built Docker Image (Easiest)

For **Backend**:
1. Create **Application** → **Docker Image** (NOT GitHub)
2. Docker Image: `ghcr.io/fanurchroniken/writerssquire/backend:latest`
3. Port: `3001`
4. Set environment variables (see COOLIFY_DEPLOYMENT.md)

For **Frontend**:
1. Create **Application** → **Docker Image** (NOT GitHub)
2. Docker Image: `ghcr.io/fanurchroniken/writerssquire/frontend:latest`
3. Port: `80`
4. Note: Frontend image may have build-time variables already baked in

#### Method 2: Deploy from GitHub with Dockerfile (Recommended for Frontend)

For **Frontend** (if you need custom build args):

1. Create **Application** → **GitHub**
2. Repository: `fanurchroniken/writerssquire`
3. Branch: `main`
4. **CRITICAL**: Set **Build Pack** to **"Dockerfile"** (NOT "Auto-detect" or "Nixpacks")
5. Dockerfile Location: `frontend/Dockerfile`
6. Docker Build Context: `frontend/`
7. In **Build Arguments** section, add:
   - `VITE_API_URL=https://your-backend-url.com`
   - `VITE_SUPABASE_URL=https://xxxxx.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=sb_publishable_...`

For **Backend**:

1. Create **Application** → **GitHub**
2. Repository: `fanurchroniken/writerssquire`
3. Branch: `main`
4. **CRITICAL**: Set **Build Pack** to **"Dockerfile"** (NOT "Auto-detect")
5. Dockerfile Location: `backend/Dockerfile`
6. Docker Build Context: `backend/`
7. Set environment variables (see COOLIFY_DEPLOYMENT.md)

#### Method 3: Use Docker Compose

1. Create **Application** → **GitHub**
2. Repository: `fanurchroniken/writerssquire`
3. Branch: `main`
4. Set **Docker Compose** to **Yes**
5. Docker Compose File: `docker-compose.yml`
6. Set environment variables in Coolify's environment variables section

## 📋 Step-by-Step for Method 2 (Most Common Fix)

### Backend Deployment

1. In Coolify dashboard, click **+ New Resource**
2. Choose **Application**
3. Choose **GitHub**
4. Connect to repository: `fanurchroniken/writerssquire`
5. Select branch: `main`
6. **⚠️ CRITICAL STEP**: Find **Build Pack** or **Build Configuration** section
   - Change from **"Auto-detect"** or **"Nixpacks"** to **"Dockerfile"**
7. Set **Dockerfile Location**: `backend/Dockerfile`
8. Set **Docker Build Context**: `backend/`
9. Set **Port**: `3001`
10. Add **Environment Variables**:
    - `NODE_ENV=production`
    - `PORT=3001`
    - `DATABASE_URL=postgresql://...`
    - `SUPABASE_URL=https://...`
    - `SUPABASE_SECRET_KEY=sb_secret_...`
    - `CORS_ORIGIN=https://your-frontend-url.com`
11. Click **Deploy**

### Frontend Deployment

1. In Coolify dashboard, click **+ New Resource**
2. Choose **Application**
3. Choose **GitHub**
4. Connect to repository: `fanurchroniken/writerssquire`
5. Select branch: `main`
6. **⚠️ CRITICAL STEP**: Find **Build Pack** or **Build Configuration** section
   - Change from **"Auto-detect"** or **"Nixpacks"** to **"Dockerfile"**
7. Set **Dockerfile Location**: `frontend/Dockerfile`
8. Set **Docker Build Context**: `frontend/`
9. Find **Build Arguments** or **Docker Build Args** section
   - Add: `VITE_API_URL=https://your-backend-url.com`
   - Add: `VITE_SUPABASE_URL=https://xxxxx.supabase.co`
   - Add: `VITE_SUPABASE_ANON_KEY=sb_publishable_...`
10. Set **Port**: `80`
11. Click **Deploy**

## 🎯 Key Points

- **Never use "Auto-detect"** or "Nixpacks" for this repository
- **Always set Build Pack to "Dockerfile"** explicitly
- **Use correct Docker Build Context** (`frontend/` or `backend/`)
- **Frontend needs build arguments** (Vite embeds them at build time)

## 🔍 How to Find Build Pack Setting in Coolify

The location varies by Coolify version, but look for:

- **Build Settings** tab
- **Build Configuration** section
- **Build Pack** dropdown (should have options like: Auto-detect, Nixpacks, Dockerfile, Docker Compose)
- Sometimes it's in **Advanced Settings** or **Configuration** section

If you can't find it:
1. Make sure you're on the **GitHub** deployment type (not Docker Image)
2. Look for tabs: General, Build, Environment, Networking
3. Check the **Build** tab

## 📚 Related Documentation

- [Full Coolify Deployment Guide](./COOLIFY_DEPLOYMENT.md)
- [Docker Deployment Guide](./DOCKER_DEPLOYMENT.md)

---

**Last Updated**: 2025-01-27
