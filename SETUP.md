# WriterSquire Setup Guide

## 🚀 Quick Start

### 1. Prerequisites

- **Node.js** 20.x LTS or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js) or **pnpm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)

### 2. Clone and Install

```bash
# Clone the repository
git clone https://github.com/fanurchroniken/writerssquire.git
cd writerssquire

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 3. Environment Setup

#### Backend Environment

Create `backend/.env` file:

```env
NODE_ENV=development
PORT=3001

# MongoDB - Local
MONGODB_URI=mongodb://localhost:27017/writerssquire

# OR MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/writerssquire?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

#### Frontend Environment

Create `frontend/.env` file:

```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_ENV=development
```

### 4. Start MongoDB

#### Option A: Local MongoDB with Docker

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Option B: MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Add connection string to `backend/.env`

#### Option C: Local MongoDB Installation

Install MongoDB locally following [official guide](https://www.mongodb.com/docs/manual/installation/)

### 5. Start Development Servers

#### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

Backend will run on: http://localhost:3001

#### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

Frontend will run on: http://localhost:5173

### 6. Verify Setup

1. **Backend Health Check**: Visit http://localhost:3001/health
   - Should return: `{"status":"ok","message":"WriterSquire API is running"}`

2. **Frontend**: Visit http://localhost:5173
   - Should show WriterSquire welcome page

3. **API Info**: Visit http://localhost:3001/api
   - Should return API information

## 📁 Project Structure

```
writerssquire/
├── frontend/                 # React 18 + Vite + TypeScript
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css        # Tailwind + WriterSquire branding
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                  # Express + TypeScript + MongoDB
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts   # MongoDB connection
│   │   ├── models/           # Mongoose models
│   │   │   ├── User.ts
│   │   │   ├── World.ts
│   │   │   └── Document.ts
│   │   ├── routes/           # API routes
│   │   │   └── index.ts
│   │   └── index.ts         # Express app entry
│   ├── package.json
│   └── tsconfig.json
│
└── Project Requirement Documentation/  # Project docs
```

## 🛠️ Available Scripts

### Frontend

```bash
cd frontend

npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Backend

```bash
cd backend

npm run dev      # Start development server with hot reload
npm run build    # Compile TypeScript
npm run start    # Start production server
npm run lint     # Run ESLint
npm run test     # Run tests
```

## 🔧 Troubleshooting

### MongoDB Connection Issues

**Error**: `MongoDB connection failed`

**Solutions**:
1. Verify MongoDB is running: `docker ps` (if using Docker)
2. Check connection string in `backend/.env`
3. For MongoDB Atlas: Ensure IP is whitelisted
4. Check firewall settings

### Port Already in Use

**Error**: `Port 3001 is already in use`

**Solutions**:
1. Change PORT in `backend/.env`
2. Or kill process using port: `lsof -ti:3001 | xargs kill` (Mac/Linux)

### Frontend Can't Connect to Backend

**Error**: `Failed to fetch` or CORS errors

**Solutions**:
1. Verify backend is running on correct port
2. Check `VITE_API_URL` in `frontend/.env`
3. Verify `CORS_ORIGIN` in `backend/.env` matches frontend URL

## 📚 Next Steps

1. **Review Documentation**: See `Project Requirement Documentation/` folder
2. **Start Building**: Follow the implementation plan
3. **Create First Feature**: Begin with authentication or world creation

## 🆘 Need Help?

- Check the [README.md](./README.md)
- Review [Implementation Plan](./Project%20Requirement%20Documentation/implementationPlan.md)
- See [Architecture Documentation](./Project%20Requirement%20Documentation/architecture.md)

---

**Status**: ✅ Project structure initialized and ready for development
