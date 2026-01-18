# WriterSquire

A comprehensive web-based writing and worldbuilding platform for writers, authors, and content creators.

## 🎯 Project Overview

WriterSquire combines rich worldbuilding tools with professional writing capabilities, enabling authors to:
- Create and organize complex fictional worlds (countries, regions, characters, timelines)
- Write with advanced text editing and multi-language spell checking (English & German)
- Export works to professional formats (EPUB, MOBI, Word)
- Share and collaborate on worlds with other writers

## 🏗️ Project Structure

```
writerssquire/
├── frontend/          # React 18 + Vite + TypeScript
├── backend/           # Express.js + TypeScript + PostgreSQL
├── Project Requirement Documentation/  # Project documentation
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x LTS or higher
- npm, pnpm, or yarn
- Supabase account (free tier works)
- PostgreSQL database (can use Supabase's built-in PostgreSQL)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/fanurchroniken/writerssquire.git
   cd writerssquire
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../backend
   npm install
   ```

4. **Set up Supabase Authentication & Database**

   Follow the quick guide in [QUICK_START.md](./QUICK_START.md) or detailed guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to:
   - Create a Supabase project
   - Get your API keys
   - Get PostgreSQL connection string
   - Configure OAuth providers (optional)

5. **Set up environment variables**

   Create `backend/.env`:
   ```env
   # Database - Use Supabase PostgreSQL connection string
   DATABASE_URL=postgresql://postgres.xxxxx:password@host:port/postgres?schema=public
   
   # Server
   PORT=3001
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   
   # Supabase Configuration
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_API_KEY=your-anon-public-key
   ```

   Create `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:3001
   
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```

6. **Set up database**

   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev --name init
   ```

   Backend:
   ```bash
   cd backend
   npm run dev
   ```

   Frontend (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

8. **Open the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Prisma Studio: `cd backend && npx prisma studio` (opens http://localhost:5555)

## 🐳 Docker Deployment

WriterSquire is fully containerized and ready for deployment using Docker and Docker Compose. See [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) for complete deployment instructions.

### Quick Start with Docker

```bash
# Configure environment variables
cp .env.example .env
# Edit .env with your values

# Start with Docker Compose
docker compose up -d
```

The application will be available at:
- Frontend: http://localhost
- Backend API: http://localhost:3001

### GitHub Container Registry

Docker images are automatically built and pushed to GitHub Container Registry on every push to `main`. See the [GitHub Actions workflow](./.github/workflows/docker-build-push.yml) for details.

## 📚 Documentation

Comprehensive project documentation is available in the `Project Requirement Documentation/` folder:

- [App Manifest](./Project%20Requirement%20Documentation/appManifest.md) - Project overview and goals
- [Architecture](./Project%20Requirement%20Documentation/architecture.md) - System architecture
- [Tech Stack](./Project%20Requirement%20Documentation/techStack.md) - Technology choices
- [Data Model](./Project%20Requirement%20Documentation/dataModel.md) - Database schema
- [Use Cases](./Project%20Requirement%20Documentation/useCases.md) - Feature requirements
- [User Flows](./Project%20Requirement%20Documentation/userFlow.md) - User workflows
- [Branding Guide](./Project%20Requirement%20Documentation/brandingGuide.md) - Design guidelines
- [Implementation Plan](./Project%20Requirement%20Documentation/implementationPlan.md) - Development workflow

### Setup Guides
- [Quick Start Guide](./QUICK_START.md) - Get MVP running in 5 minutes ⚡
- [Complete MVP Setup](./MVP_SETUP_COMPLETE.md) - Detailed setup instructions
- [Supabase Setup Guide](./SUPABASE_SETUP.md) - Complete Supabase Auth setup
- [PostgreSQL Migration](./POSTGRESQL_MIGRATION.md) - Database setup guide
- [Docker Deployment](./DOCKER_DEPLOYMENT.md) - Container deployment guide

## 🛠️ Tech Stack

### Frontend
- **React 18.x** - UI framework
- **Vite 5.x** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **React Query** - Server state management
- **React Hook Form** - Form handling

### Backend
- **Node.js 20.x** - Runtime
- **Express.js 4.x** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Relational database
- **Prisma** - ORM
- **Supabase Auth** - Authentication (JWT-based)
- **Zod** - Validation

## 📦 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run db:generate` - Generate Prisma Client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio (database GUI)

## 🏛️ Architecture

WriterSquire follows a modern web application architecture:

```
Frontend (React) → REST API → Backend (Express) → PostgreSQL (Prisma)
                                                     ↓
                                             Supabase Auth
```

### Core Modules
- **Worldbuilding Module**: Worlds, countries, regions, characters, timelines
- **Writing Module**: Rich text editor, spell checking, document management
- **Publishing Module**: Export to EPUB, MOBI, Word formats

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Follow coding standards (see `Project Requirement Documentation/codinginstructions.md`)
4. Submit a pull request

## 📄 License

[Add your license here]

## 🔗 Links

- GitHub Repository: https://github.com/fanurchroniken/writerssquire
- Documentation: See `Project Requirement Documentation/` folder

---

**Status**: 🚧 In Development

**Last Updated**: 2025-01-27
