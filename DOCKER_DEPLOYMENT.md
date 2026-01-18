# 🐳 WriterSquire Docker Deployment Guide

This guide explains how to deploy WriterSquire using Docker containers via GitHub Container Registry.

## 📦 Container Images

The application consists of two containerized services:
- **Backend**: Node.js/Express API server
- **Frontend**: React/Vite application served via Nginx

Both images are automatically built and pushed to GitHub Container Registry on every push to `main`/`master` branch.

## 🚀 Quick Start with Docker Compose

### Prerequisites

- Docker and Docker Compose installed
- GitHub Container Registry access (images are public)
- Environment variables configured

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/WritersSquire.git
cd WritersSquire
```

### Step 2: Configure Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your actual configuration:
- `DATABASE_URL`: Your Supabase PostgreSQL connection string
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SECRET_KEY`: Your Supabase secret key (backend)
- `VITE_SUPABASE_ANON_KEY`: Your Supabase publishable key (frontend)
- `CORS_ORIGIN`: Frontend URL (use `http://localhost:80` for local Docker)

### Step 3: Pull and Run with Docker Compose

```bash
# Pull the latest images (optional - Docker Compose will pull if needed)
docker compose pull

# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

The application will be available at:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 📥 Using Pre-built Images from GitHub Container Registry

### Pull Images Manually

```bash
# Backend image
docker pull ghcr.io/yourusername/writerssquire/backend:latest

# Frontend image
docker pull ghcr.io/yourusername/writerssquire/frontend:latest
```

### Run Individual Containers

**Backend:**
```bash
docker run -d \
  --name writerssquire-backend \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e DATABASE_URL=postgresql://... \
  -e SUPABASE_URL=https://... \
  -e SUPABASE_SECRET_KEY=sb_secret_... \
  -e CORS_ORIGIN=http://localhost:80 \
  ghcr.io/yourusername/writerssquire/backend:latest
```

**Frontend:**
```bash
docker run -d \
  --name writerssquire-frontend \
  -p 80:80 \
  ghcr.io/yourusername/writerssquire/frontend:latest
```

## 🔨 Building Images Locally

If you want to build images locally instead of using pre-built ones:

```bash
# Build backend
cd backend
docker build -t writerssquire-backend:latest --target production .

# Build frontend (requires build args for environment variables)
cd ../frontend
docker build \
  --build-arg VITE_API_URL=http://localhost:3001 \
  --build-arg VITE_SUPABASE_URL=https://your-project.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=your-publishable-key \
  -t writerssquire-frontend:latest \
  --target production .
```

Then update `docker-compose.yml` to use local images:

```yaml
services:
  backend:
    image: writerssquire-backend:latest
    # Remove build: section
  
  frontend:
    image: writerssquire-frontend:latest
    # Remove build: section
```

## 🔄 CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/docker-build-push.yml`) automatically:

1. **Builds** Docker images for both services on every push/PR
2. **Pushes** images to GitHub Container Registry (ghcr.io) on pushes to main
3. **Tags** images with:
   - `latest` for default branch
   - Branch name for other branches
   - Git SHA for commit-specific tags
   - Semantic version tags (v1.0.0, etc.)

### Accessing Images

After pushing to main, images are available at:
- `ghcr.io/yourusername/writerssquire/backend:latest`
- `ghcr.io/yourusername/writerssquire/frontend:latest`

To make images public:
1. Go to your GitHub repository
2. Navigate to **Packages** section
3. Click on each package (backend/frontend)
4. Go to **Package settings** → **Change visibility** → **Public**

## 🌐 Production Deployment

For production deployment, consider:

1. **Use a reverse proxy** (Nginx/Traefik) in front of containers
2. **Set up SSL/TLS** certificates (Let's Encrypt)
3. **Configure environment variables** securely (secrets management)
4. **Set up monitoring** and logging
5. **Use container orchestration** (Kubernetes, Docker Swarm) for scaling

### Example with Nginx Reverse Proxy

```nginx
# nginx.conf
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://writerssquire-frontend:80;
    }

    # Backend API
    location /api {
        proxy_pass http://writerssquire-backend:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🔍 Troubleshooting

### Check Container Status

```bash
docker compose ps
docker compose logs backend
docker compose logs frontend
```

### Inspect Container

```bash
docker exec -it writerssquire-backend sh
docker exec -it writerssquire-frontend sh
```

### Health Checks

```bash
# Backend health
curl http://localhost:3001/api/health

# Frontend health
curl http://localhost/
```

### Common Issues

**Port already in use:**
- Change ports in `docker-compose.yml` or stop conflicting services

**Database connection errors:**
- Verify `DATABASE_URL` in `.env` is correct
- Ensure database is accessible from container network

**CORS errors:**
- Check `CORS_ORIGIN` matches your frontend URL
- Ensure backend can accept requests from frontend origin

**Frontend can't reach backend:**
- In Docker Compose, use service names: `http://backend:3001`
- For external access, use host URL: `http://localhost:3001` or production URL

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
