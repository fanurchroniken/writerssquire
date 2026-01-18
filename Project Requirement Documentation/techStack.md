# Technology Stack Specification

## Overview

This document defines the **specific technologies, frameworks, libraries, and tools** used in this project. It serves as the single source of truth for technology decisions and helps maintain consistency across the codebase.

> 📘 **Related Documents**:
> - [architecture.md](./architecture.md) - Architectural patterns and design principles
> - [codingInstructions.md](./codingInstructions.md) - Universal coding principles

---

## Core Technology Decisions

### Primary Programming Language
- **Language**: TypeScript 5.x
- **Runtime**: Node.js 20.x LTS
- **Rationale**: Type safety, excellent tooling, large ecosystem, production-ready

### Alternative/Secondary Languages
- **Python 3.11+**: For data processing scripts, if needed
- **SQL**: For database queries and migrations

---

## Backend Stack

### Web Framework
- **Framework**: Express.js 4.x
- **Type Definitions**: @types/express
- **Rationale**: Mature, flexible, extensive middleware ecosystem
- **Alternatives Considered**: Fastify (performance), NestJS (opinionated structure)

### Database

#### Primary Database
- **Database**: MongoDB 7.x / Azure Cosmos DB (MongoDB API)
- **ODM/Query Builder**: 
  - **Primary**: Mongoose 8.x (for MongoDB)
  - **Alternative**: Native MongoDB Driver (for direct access)
- **Migration Tool**: Custom migration scripts / Mongoose migrations
- **Rationale**: 
  - MongoDB: Flexible schema for complex worldbuilding data, native JSON support, excellent for nested structures
  - Object database ideal for worldbuilding entities (countries, characters, timelines) with varying structures
  - Azure Cosmos DB: Managed MongoDB with global distribution, automatic scaling


### Authentication & Authorization
- **JWT Library**: jsonwebtoken 9.x
- **Password Hashing**: bcrypt 5.x
- **Validation**: Zod 3.x (runtime type validation)
- **Rate Limiting**: express-rate-limit 7.x

### File Storage
- **Cloud Storage**: 
  - **Primary**: Azure Blob Storage
  - **SDK**: @azure/storage-blob
- **Local Development**: MinIO (S3-compatible)
- **Use Cases**: User uploads, worldbuilding images/videos, document exports, character portraits, map images

---

## Frontend Stack

### Framework
- **Framework**: React 18.x (latest stable version)
- **Build Tool**: Vite 5.x
- **Rationale**: 
  - React 18: Latest features (concurrent rendering, Suspense, Server Components ready)
  - Vite: Fast development, excellent HMR, optimized production builds
  - TypeScript support throughout

### State Management
- **Library**: 
  - **Primary**: React Context API + useReducer (for global state)
  - **Secondary**: React Query (TanStack Query) 5.x (for server state, caching)
  - **Form State**: React Hook Form 7.x
- **Rationale**: 
  - Context API: Simple, built-in, sufficient for app-level state
  - React Query: Excellent for API data fetching, caching, synchronization
  - React Hook Form: Performant form handling with validation

### UI Components
- **Component Library**: Shadcn/ui (built on Radix UI)
- **Styling**: Tailwind CSS 3.x
- **Rationale**: 
  - Shadcn/ui: Accessible, customizable, copy-paste components
  - Tailwind CSS: Utility-first, fast development, consistent design system
  - Radix UI: Unstyled, accessible primitives

### Rich Text Editor
- **Editor**: Lexical (Meta) or TipTap
- **Rationale**: Modern, extensible, React-friendly rich text editors
- **Spell Check Integration**: Custom integration with spell check libraries

---

## Cloud Infrastructure & Services

### Cloud Provider
- **Provider**: Microsoft Azure
- **Region**: [Your primary region, e.g., West Europe]
- **Rationale**: [Your specific reasons - integration with existing services, pricing, etc.]

### Compute
- **Service**: Azure App Service / Azure Container Instances / Azure Kubernetes Service
- **Configuration**: [Production specs]

### External APIs & Services

#### Spell Checking Services
- **English Spell Check**: 
  - **Library**: hunspell-spellchecker (Node.js) or LanguageTool API
  - **Client Library**: node-nlp or custom integration
- **German Spell Check**: 
  - **Library**: hunspell-spellchecker with German dictionary
  - **Alternative**: LanguageTool API (supports multiple languages)
- **Purpose**: Real-time spell checking in writing editor for English and German
- **Rationale**: Multi-language support is core feature requirement

#### Document Export Services
- **EPUB Generation**: 
  - **Library**: epub-gen 0.1.x or epubjs
  - **Purpose**: Convert documents to EPUB format
- **MOBI Generation**: 
  - **Library**: kindlegen (Amazon) or calibre (via CLI)
  - **Purpose**: Convert documents to MOBI format for Kindle
- **Word Document Export**: 
  - **Library**: docx 8.x (for .docx generation)
  - **Purpose**: Export documents to Microsoft Word format
- **Rationale**: Core publishing feature requirement

#### Database Hosting
- **Service**: Azure Cosmos DB (MongoDB API) / MongoDB Atlas
- **Rationale**: 
  - Azure Cosmos DB: Managed MongoDB, global distribution, automatic scaling, integrated with Azure ecosystem
  - MongoDB Atlas: Alternative managed MongoDB with good free tier for development

#### Workflow Automation
- **Service**: Azure Logic Apps
- **Purpose**: [Scheduled tasks, integrations, workflows]

---

## Development Tools

### Package Management
- **Package Manager**: npm 10.x / pnpm 8.x / yarn 4.x
- **Choice**: [Specify your preference]
- **Lock File**: Committed to repository

### Code Quality

#### Linting
- **Linter**: ESLint 8.x
- **Configuration**: 
  - @typescript-eslint/parser
  - @typescript-eslint/eslint-plugin
  - eslint-config-prettier (if using Prettier)
- **Rules**: [Link to .eslintrc.js or specify preset]

#### Formatting
- **Formatter**: Prettier 3.x
- **Configuration**: [Link to .prettierrc or specify settings]

#### Type Checking
- **Tool**: TypeScript Compiler (tsc)
- **Configuration**: tsconfig.json with strict mode enabled

### Testing

#### Unit Testing
- **Framework**: Jest 29.x / Vitest 1.x
- **Assertion Library**: Built-in (Jest) / Chai
- **Mocking**: jest.mock() / vitest.mock()
- **Coverage Tool**: Jest Coverage / c8

#### Integration Testing
- **Framework**: Jest with Supertest 6.x
- **Database**: Test database or in-memory SQLite for speed

#### End-to-End Testing
- **Framework**: Playwright 1.x / Cypress 13.x
- **Rationale**: [Your choice]

### API Documentation
- **Tool**: Swagger/OpenAPI 3.0
- **Implementation**: swagger-jsdoc + swagger-ui-express
- **Alternative**: Postman Collections

---

## DevOps & CI/CD

### Version Control
- **Platform**: GitHub / GitLab / Azure DevOps
- **Branching Strategy**: Git Flow / Trunk-Based Development

### CI/CD Pipeline
- **Platform**: GitHub Actions / Azure Pipelines / GitLab CI
- **Stages**:
  1. Lint & Format Check
  2. Type Check
  3. Unit Tests
  4. Integration Tests
  5. Build
  6. Security Scan
  7. Deploy to Staging
  8. (Manual) Deploy to Production

### Container Technology
- **Containerization**: Docker 24.x
- **Orchestration**: Docker Compose (development) / Kubernetes (production, if needed)
- **Registry**: Docker Hub / Azure Container Registry

### Monitoring & Observability

#### Application Monitoring
- **APM**: Azure Application Insights / Datadog / New Relic
- **Logging**: Winston 3.x (structured logging)
- **Log Aggregation**: Azure Log Analytics / ELK Stack

#### Error Tracking
- **Service**: Sentry / Azure Application Insights
- **SDK**: @sentry/node

#### Metrics
- **Tool**: Prometheus + Grafana / Azure Monitor
- **Metrics Collected**: 
  - Request rate, latency, error rate
  - Database query performance
  - Cache hit rate
  - Memory and CPU usage

---

## Security Tools

### Dependency Scanning
- **Tool**: npm audit / Snyk / Dependabot
- **Frequency**: On every PR, weekly scheduled scans

### Static Application Security Testing (SAST)
- **Tool**: SonarQube / Semgrep / GitHub CodeQL
- **Integration**: CI/CD pipeline

### Secrets Management
- **Development**: .env files (never committed)
- **Production**: Azure Key Vault / AWS Secrets Manager
- **Client**: @azure/keyvault-secrets

### SSL/TLS
- **Certificate Provider**: Let's Encrypt / Azure managed certificates
- **Renewal**: Automated

---

## Third-Party Libraries & Utilities

### HTTP Client
- **Library**: axios 1.x / node-fetch 3.x
- **Rationale**: [Your choice]

### Date/Time Handling
- **Library**: date-fns 2.x / dayjs 1.x
- **Rationale**: Lightweight, modern, tree-shakeable

### Validation
- **Library**: Zod 3.x
- **Use Cases**: 
  - API request validation
  - Environment variable validation
  - Configuration validation
  - Document schema validation
  - Worldbuilding entity validation

### UUID Generation
- **Library**: uuid 9.x
- **Use Cases**: Unique identifiers for entities

### Email Sending
- **Service**: SendGrid / Azure Communication Services
- **SDK**: @sendgrid/mail / @azure/communication-email

---

## Environment-Specific Configuration

### Development
```
Database: PostgreSQL (Docker container)
Cache: Redis (Docker container)
Storage: MinIO (local S3-compatible)
External APIs: Sandbox/Test endpoints
```

### Staging
```
Database: Azure Database for PostgreSQL
Cache: Azure Cache for Redis
Storage: Azure Blob Storage (staging container)
External APIs: Test/Sandbox endpoints
```

### Production
```
Database: Azure Database for PostgreSQL (Production tier)
Cache: Azure Cache for Redis (Production tier)
Storage: Azure Blob Storage (production container)
External APIs: Production endpoints
```

---

## Technology Decision Process

When adding new technologies:

1. **Justify the Need**: Why is this technology necessary?
2. **Evaluate Alternatives**: Consider at least 2-3 alternatives
3. **Assess Criteria**:
   - Maturity and stability
   - Community support and documentation
   - Performance characteristics
   - Licensing and cost
   - Team expertise
   - Integration with existing stack
4. **Document Decision**: Update this file with rationale
5. **Review with Team**: Get approval for major additions
6. **Update Dependencies**: Add to package.json with specific version

---

## Deprecated Technologies

Track technologies being phased out:

| Technology | Replaced By | Reason | Removal Target Date |
|------------|-------------|--------|---------------------|
| Example: Lodash | Native ES6 methods | Reduce bundle size | 2025-12-31 |

---

## Technology Version Policy

### Version Pinning
- **Development Dependencies**: Pin to minor version (^)
- **Production Dependencies**: Pin to exact version for stability
- **Critical Security Dependencies**: Update immediately on CVE

### Update Cadence
- **Patch Updates**: Weekly review, apply non-breaking patches
- **Minor Updates**: Monthly review, test in staging first
- **Major Updates**: Quarterly review, plan migration carefully

### Node.js LTS Policy
- Always use Active LTS or Maintenance LTS versions
- Plan Node.js version upgrades 3 months before EOL
- Test thoroughly in staging before production upgrade

---

## Quick Reference

### Installation Commands

```bash
# Install dependencies
npm install

# Setup development environment
docker-compose up -d

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Useful Links

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Azure Documentation](https://docs.microsoft.com/azure/)
- [Project Architecture Documentation](./architecture.md)

---

## Maintenance

- **Review Frequency**: Quarterly
- **Last Updated**: 2025-01-27
- **Next Review**: April 2025
- **Maintained By**: WriterSquire Development Team

---

## Notes

This tech stack is specific to **WriterSquire** project. For universal principles and patterns that apply regardless of technology choices, see:
- [architecture.md](./architecture.md) - Architectural patterns
- [codingInstructions.md](./codingInstructions.md) - Language-agnostic principles

## WriterSquire-Specific Technology Notes

### Object Database Choice
MongoDB/Cosmos DB was chosen over PostgreSQL because:
- Worldbuilding entities have highly variable structures
- Nested relationships (characters with relationships, events with participants)
- Rich media attachments (images, videos) stored as references
- Flexible schema allows evolution without migrations
- Native JSON support matches data model

### React 18 Features to Leverage
- Concurrent rendering for smooth UI during data fetching
- Suspense for loading states
- Server Components ready (for future SSR/SSG)
- Automatic batching for performance

### Spell Checking Architecture
- Client-side spell checking for immediate feedback
- Server-side validation for accuracy
- Language detection for automatic language switching
- Custom dictionaries for user-specific terms (character names, world-specific terms)