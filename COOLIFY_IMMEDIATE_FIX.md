# 🚨 IMMEDIATE FIX: Stop Nixpacks Error in Coolify

You're still getting the Nixpacks error because Coolify is using **auto-detection**. Here's how to fix it **right now**:

## ✅ Solution: Use Docker Compose Mode

Docker Compose mode **forces Docker** and completely bypasses Nixpacks.

### Step-by-Step:

1. **Delete your current failed deployment** in Coolify
   - Go to the application
   - Delete/Remove it

2. **Create a NEW deployment with Docker Compose**:

   a. Click **+ New Resource** in Coolify
   
   b. Choose **Application**
   
   c. Choose **GitHub**
   
   d. Connect repository: `fanurchroniken/writerssquire`
   
   e. Branch: `main`
   
   f. **🎯 CRITICAL**: Find the setting that says:
      - **"Docker Compose"** or **"Use Docker Compose"**
      - **Turn it ON / Set it to YES**
      - OR look for **"Build Pack"** dropdown and select **"Docker Compose"**
   
   g. Docker Compose File: `docker-compose.yml` (should auto-detect)
   
   h. **Set Environment Variables** in Coolify's Environment Variables tab:
      ```
      NODE_ENV=production
      PORT=3001
      DATABASE_URL=postgresql://postgres.xxxxx:password@host:port/postgres
      SUPABASE_URL=https://xxxxx.supabase.co
      SUPABASE_SECRET_KEY=sb_secret_...
      CORS_ORIGIN=https://your-frontend-url.com
      VITE_API_URL=https://your-backend-url.com
      VITE_SUPABASE_URL=https://xxxxx.supabase.co
      VITE_SUPABASE_ANON_KEY=sb_publishable_...
      ```
   
   i. **Configure ports** (if asked):
      - Backend: `3001`
      - Frontend: `80`
   
   j. **Deploy**

## 🎯 Where to Find Docker Compose Setting

The location varies, but look for:

1. **During creation** (step-by-step form):
   - Look for a checkbox or toggle: **"Use Docker Compose"**
   - Or a dropdown: **"Build Pack"** → Select **"Docker Compose"**

2. **In the application settings** (after creation):
   - Go to your application
   - Look for **"Build"** or **"Configuration"** tab
   - Find **"Docker Compose"** toggle or **"Build Pack"** setting

## ⚠️ Alternative: If You Can't Find Docker Compose Option

If you don't see Docker Compose option, try this:

### Option A: Deploy Each Service Separately with Dockerfile

**Backend:**
1. Create Application → GitHub
2. Repository: `fanurchroniken/writerssquire`
3. Branch: `main`
4. **Before clicking Deploy**, look for advanced settings
5. **Build Pack**: Change to **"Dockerfile"** (NOT auto-detect)
6. **Dockerfile Location**: `backend/Dockerfile`
7. **Build Context**: `backend/`
8. Set environment variables
9. Deploy

**Frontend:**
1. Create Application → GitHub  
2. Repository: `fanurchroniken/writerssquire`
3. Branch: `main`
4. **Build Pack**: **"Dockerfile"** (NOT auto-detect)
5. **Dockerfile Location**: `frontend/Dockerfile`
6. **Build Context**: `frontend/`
7. **Build Arguments**:
   - `VITE_API_URL=...`
   - `VITE_SUPABASE_URL=...`
   - `VITE_SUPABASE_ANON_KEY=...`
8. Deploy

### Option B: Use Pre-built Docker Images

This completely avoids GitHub auto-detection:

**Backend:**
1. Create Application → **Docker Image** (NOT GitHub)
2. Docker Image: `ghcr.io/fanurchroniken/writerssquire/backend:latest`
3. Port: `3001`
4. Set environment variables
5. Deploy

**Frontend:**
1. Create Application → **Docker Image** (NOT GitHub)
2. Docker Image: `ghcr.io/fanurchroniken/writerssquire/frontend:latest`
3. Port: `80`
4. Deploy

## 🔍 Visual Guide: What to Look For

When creating the application, you should see something like this in the form:

```
Repository: [fanurchroniken/writerssquire]
Branch: [main]
Build Pack: [Auto-detect ▼]  <-- CHANGE THIS to "Dockerfile" or "Docker Compose"
```

Or:

```
☐ Use Docker Compose  <-- CHECK THIS BOX
Docker Compose File: [docker-compose.yml]
```

## 💡 Quick Test

To verify you're using Docker and not Nixpacks:

After starting deployment, check the logs. You should see:
- ❌ **Nixpacks** = `nixpacks plan` or `nixpacks detect` in logs (WRONG)
- ✅ **Docker** = `docker build` or `docker compose` in logs (CORRECT)

---

**Last Updated**: 2025-01-27
