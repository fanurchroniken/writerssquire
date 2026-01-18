# 🚀 Coolify Deployment Guide for WriterSquire

This guide explains how to deploy WriterSquire to Coolify using Docker containers from GitHub Container Registry.

## 📋 Prerequisites

- Coolify instance running (v3.x or v4.x)
- GitHub repository access configured in Coolify
- Docker images available at GitHub Container Registry (auto-built via GitHub Actions)

## 🔑 Required Environment Variables

### Backend Environment Variables

Set these in Coolify's **Environment Variables** section for the backend service:

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port (Coolify may override) | `3001` |
| `DATABASE_URL` | Supabase PostgreSQL connection string | `postgresql://postgres.xxx:password@aws-0-xx.supabase.com:6543/postgres` |
| `SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `SUPABASE_SECRET_KEY` | Supabase secret key (backend) | `sb_secret_...` |
| `CORS_ORIGIN` | Allowed CORS origins (frontend URL) | `https://your-domain.com` or `https://writerssquire.your-domain.com` |

### Frontend Environment Variables (Build-time)

For the frontend Docker build, Coolify needs to pass these as **Build Arguments**:

| Build Arg | Description | Example |
|-----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://api.your-domain.com` or `https://writerssquire-backend.your-domain.com` |
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase publishable key | `sb_publishable_...` |

**Note**: These are build-time variables (Vite embeds them in the JavaScript bundle), so they must be set during the Docker build process.

## ⚠️ Important: Nixpacks Auto-Detection Issue

If you see this error:
```
Nixpacks failed to detect the application type.
```

**Solution**: Coolify is trying to auto-detect with Nixpacks, but this monorepo requires Docker. You must configure Coolify to use Docker explicitly.

**Fix**: When creating the application in Coolify:
1. **Do NOT use** "GitHub" with auto-detection
2. **Use one of these options**:
   - **Docker Image** (if images are in GitHub Container Registry)
   - **Docker Compose** (if deploying both services together)
   - **Dockerfile** (if building from source) - Make sure to set Build Pack to **Dockerfile** explicitly

## 🐳 Deployment Methods

Coolify supports multiple deployment methods. Choose one:

### Option 1: Deploy from GitHub Container Registry (Recommended)

This uses pre-built images from GitHub Actions. **This avoids Nixpacks entirely.**

#### Backend Deployment

1. **Create New Resource** in Coolify
   - Choose **Application** → **Docker Image** (NOT GitHub with auto-detection)
   
2. **Configure Image**
   - **Docker Image**: `ghcr.io/fanurchroniken/writerssquire/backend:latest`
   - **Port**: `3001`
   - **Domain**: Set your backend domain (e.g., `api.your-domain.com`)

3. **Set Environment Variables** (in Coolify UI)
   - Click **Environment Variables** tab
   - Add all backend environment variables listed above
   - **Important**: Set `CORS_ORIGIN` to your frontend URL

4. **Deploy**

#### Frontend Deployment

**Important**: Since frontend uses build-time environment variables, you have two options:

**Option A: Rebuild with Build Args** (Recommended)
1. **Create New Resource** in Coolify
   - Choose **Application** → **GitHub**
   
2. **Connect Repository**
   - Repository: `fanurchroniken/writerssquire`
   - Branch: `main`
   - **IMPORTANT**: Set **Build Pack** to **Dockerfile** (NOT auto-detect/Nixpacks)
   - Docker Compose: **No** (we'll use Dockerfile)
   - Dockerfile Location: `frontend/Dockerfile`
   - Docker Build Context: `frontend/`

3. **Configure Build Arguments**
   - In Coolify's build settings, find **Build Arguments** or **Docker Build Args**
   - Add:
     - `VITE_API_URL=https://api.your-domain.com` (your backend URL)
     - `VITE_SUPABASE_URL=https://xxxxx.supabase.co`
     - `VITE_SUPABASE_ANON_KEY=sb_publishable_...`

4. **Set Domain**
   - Domain: Your frontend domain (e.g., `writerssquire.your-domain.com`)

5. **Deploy**

**Option B: Use Pre-built Image (with runtime env)**
If your frontend doesn't need environment-specific variables at build time:
1. Use image: `ghcr.io/fanurchroniken/writerssquire/frontend:latest`
2. Note: Vite variables are embedded at build time, so this only works if values match your setup

### Option 2: Deploy with Docker Compose

You can deploy both services together using Docker Compose:

1. **Create New Resource** in Coolify
   - Choose **Application** → **GitHub**
   
2. **Connect Repository**
   - Repository: `fanurchroniken/writerssquire`
   - Branch: `main`
   - Docker Compose: **Yes**
   - Docker Compose File: `docker-compose.yml`
   - Docker Compose Service: Leave empty (deploys all)

3. **Set Environment Variables** (for both services)
   - In Coolify's environment variables section, add all backend variables
   - **Important**: The frontend build args need to be set in the compose file or via Coolify's build settings

4. **Configure Domains**
   - Backend: `api.your-domain.com`
   - Frontend: `writerssquire.your-domain.com`

5. **Update docker-compose.yml for Coolify** (optional)

You may need to modify `docker-compose.yml` to work better with Coolify:

```yaml
version: '3.8'

services:
  backend:
    image: ghcr.io/fanurchroniken/writerssquire/backend:latest
    # Remove build: section if using pre-built image
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DATABASE_URL=${DATABASE_URL}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SECRET_KEY=${SUPABASE_SECRET_KEY}
      - CORS_ORIGIN=${CORS_ORIGIN}
    # Coolify may override port mapping
    expose:
      - "3001"
    restart: unless-stopped

  frontend:
    # Use build instead of image if you need build args
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: production
      args:
        VITE_API_URL: ${VITE_API_URL}
        VITE_SUPABASE_URL: ${VITE_SUPABASE_URL}
        VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY}
    # Or use pre-built image
    # image: ghcr.io/fanurchroniken/writerssquire/frontend:latest
    expose:
      - "80"
    restart: unless-stopped
```

## 📝 Step-by-Step: Setting Environment Variables in Coolify

### Method 1: Via Coolify UI (Recommended)

1. **Navigate to your application** in Coolify dashboard
2. Click on **Environment Variables** tab (or **Variables** section)
3. **Add variables one by one**:
   - Click **+ Add Variable**
   - Enter variable name (e.g., `DATABASE_URL`)
   - Enter variable value
   - Click **Save**
4. **Repeat for all required variables**

### Method 2: Bulk Import (if supported)

Some Coolify versions support bulk import:
- Look for **Import** or **Bulk Add** option
- Paste variables in format: `KEY=VALUE` (one per line)

### Method 3: Via .env File (for Docker Compose)

If using Docker Compose deployment:
1. In Coolify, there may be an option to upload or paste `.env` file content
2. Or add variables directly in the UI (Coolify injects them into containers)

## ⚠️ Important Notes

### Frontend Build-Time Variables

**Critical**: Vite requires environment variables at **build time**, not runtime. This means:

1. **If rebuilding in Coolify**: Set them as **Build Arguments** during the Docker build
2. **If using pre-built images**: The values are already baked into the image from GitHub Actions

### CORS Configuration

- Backend `CORS_ORIGIN` must match your frontend URL exactly
- For production: `https://your-frontend-domain.com`
- If using Coolify's auto-generated domains: `https://writerssquire-frontend.xyz.coolify.io`

### Database Connection

- Ensure your Supabase database allows connections from Coolify's IP addresses
- Check Supabase Dashboard → **Settings** → **Database** → **Connection Pooling** settings

### Port Configuration

- Coolify may automatically handle port mapping
- Backend listens on port `3001` internally
- Frontend serves on port `80` (Nginx)
- Coolify will expose these via your configured domains

## 🔍 Verification After Deployment

### Check Backend Health

```bash
curl https://api.your-domain.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "WriterSquire API is running",
  "timestamp": "2025-01-27T..."
}
```

### Check Frontend

1. Visit your frontend domain in a browser
2. Check browser console for any API connection errors
3. Verify that `VITE_API_URL` points to your backend

### Check Logs in Coolify

- Navigate to your application → **Logs** tab
- Check for any connection errors or missing environment variables

## 🐛 Troubleshooting

### "Environment variable not found" errors

- Verify all variables are set in Coolify's **Environment Variables** section
- Check variable names (case-sensitive)
- Ensure no extra spaces in values

### Frontend can't connect to backend

- Verify `VITE_API_URL` in frontend build args matches backend domain
- Check `CORS_ORIGIN` in backend matches frontend domain
- Check Coolify's network/firewall settings

### Database connection errors

- Verify `DATABASE_URL` format is correct
- Check Supabase allows connections from Coolify's IP
- Ensure database is not paused (Supabase free tier pauses after inactivity)

### Build fails for frontend

- Ensure all build args (`VITE_*`) are set in Coolify's build settings
- Check Dockerfile path is correct: `frontend/Dockerfile`
- Verify build context is set to `frontend/`

## 📚 Additional Resources

- [Coolify Documentation](https://coolify.io/docs)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker Deployment Guide](./DOCKER_DEPLOYMENT.md) - General Docker deployment info

## 🔄 Updating Deployment

When you push new code to GitHub:

1. **GitHub Actions** automatically rebuilds Docker images
2. **Coolify** (if using image deployments) will pull new images on next deployment
3. Or trigger **manual redeploy** in Coolify to pull latest images

---

**Last Updated**: 2025-01-27
