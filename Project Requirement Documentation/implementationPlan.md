# Implementation Plan

## Overview

This document provides **step-by-step instructions for AI agents** to autonomously build features from initial planning through deployment. It defines the workflow, decision points, and checkpoints that ensure high-quality, well-documented implementations.

> 📘 **Related Documents**:
> - [appManifest.md](./appManifest.md) - High-level project description
> - [architecture.md](./architecture.md) - Architectural principles
> - [techStack.md](./techStack.md) - Technologies to use
> - [codingInstructions.md](./codingInstructions.md) - Coding standards
> - [dataModel.md](./dataModel.md) - Data structure specifications
> - [useCases.md](./useCases.md) - Feature requirements
> - [userFlow.md](./userFlow.md) - User interaction patterns
> - [brandingGuide.md](./brandingGuide.md) - Visual and tonal guidelines

---

## Implementation Workflow

### Workflow Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Phase 1: Planning & Analysis                               │
│  Review requirements → Analyze dependencies → Validate tech │
│  → Create plan                                              │
└────────────────────────────────┬────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 2: Documentation Updates                             │
│  Update data model → Update use cases → Update user flows   │
│  → Update tech stack (if needed)                            │
└────────────────────────────────┬────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 3: Architecture & Design                             │
│  Design components → Define APIs → Plan data flow           │
└────────────────────────────────┬────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 4: Data Layer Implementation                         │
│  Database schema → Migrations → Repository layer            │
└────────────────────────────────┬────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 5: Business Logic Implementation                     │
│  Services → Validation → Error handling                     │
└────────────────────────────────┬────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 6: API Layer Implementation                          │
│  Endpoints → Request/response → Middleware                  │
└────────────────────────────────┬────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 7: Testing                                           │
│  Unit tests → Integration tests → Manual testing            │
└────────────────────────────────┬────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 8: Documentation & Deployment                        │
│  API docs → README updates → Deploy to staging              │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Planning & Analysis

### Step 1.1: Understand the Feature Request

**Agent Actions:**
1. Read the feature request or user story
2. Identify which use case(s) in `useCases.md` this relates to
3. Review relevant user flows in `userFlow.md`
4. Check if feature aligns with `appManifest.md` goals

**Output:**
- Summary of feature understanding
- Related use case IDs (e.g., UC-001, UC-102)
- Related user flow IDs

**Decision Point:**
> **Agent asks:** "I understand this feature as: [summary]. It relates to use cases [UC-XXX] and user flows [Flow-X]. Is this correct? Are there additional requirements I should consider?"
>
> **Recommendations provided:** 
> - If feature is large: "This seems complex. Should we break it into smaller sub-features?"
> - If unclear: "These aspects need clarification: [list specific questions]"

---

### Step 1.2: Analyze Dependencies

**Agent Actions:**
1. Review `dataModel.md` to identify required entities
2. Check `techStack.md` for technology constraints
3. Review `architecture.md` for pattern requirements
4. Identify dependencies on existing features
5. Identify external service integrations needed

**Output:**
- List of required database entities/tables
- List of dependencies (existing features, external services)
- List of new libraries/packages needed (if any)
- Architecture pattern to use (from `architecture.md`)

**Decision Point:**
> **Agent asks:** "This feature requires:
> - Database entities: [list]
> - Dependencies: [list]
> - External services: [list]
> - Architectural pattern: [pattern from architecture.md]
> 
> Should I proceed with this approach? Are there any constraints I'm missing?"
>
> **Recommendations provided:**
> - If new external service: "This requires [service]. Cost: [research cost], Alternatives: [list alternatives]"
> - If complex dependencies: "Consider implementing [dependency] first"

---

### Step 1.3: Validate and Question Tech Stack

**Agent Actions:**
1. Review `techStack.md` for current technology choices
2. Analyze if existing stack is optimal for this specific feature
3. Research alternatives if current stack seems suboptimal
4. Consider performance, cost, maintainability, team expertise
5. Check for any missing technologies needed

**Analysis Framework:**
For each relevant technology decision, evaluate:
- **Fit for purpose**: Does it solve this specific problem well?
- **Performance**: Will it meet our performance requirements?
- **Cost**: Licensing, hosting, operational costs?
- **Maturity**: Stable, well-documented, community support?
- **Team expertise**: Do we know this technology?
- **Integration**: Works well with existing stack?
- **Alternatives**: Are there better options available?

**Output:**
Structured technology assessment:

```markdown
### Technology Assessment for [Feature]

#### Currently Specified (from techStack.md):
- Database: [current choice]
- Framework: [current choice]
- External Service: [current choice]
etc.

#### Analysis:

**1. Database Choice: [Current: PostgreSQL]**
✅ Strengths for this feature:
- [strength 1]
- [strength 2]

⚠️ Potential concerns:
- [concern 1]
- [concern 2]

🔄 Alternatives considered:
- **Alternative 1**: [name] 
  - Pros: [list]
  - Cons: [list]
  - Recommendation: [Keep current / Switch because X]

**2. [Other Technology]**
[Same analysis format]

#### New Technologies Needed:
- **Technology**: [name]
  - Purpose: [why needed]
  - Cost: [pricing info]
  - Alternatives: [list with comparison]
  - Recommendation: [choice with rationale]

#### Missing from Tech Stack:
- [Technology type] not specified in techStack.md
  - Needed for: [purpose]
  - Suggested options: [list]
```

**Decision Point:**
> **Agent asks:** "I've analyzed the tech stack for this feature:
>
> **Current Stack Assessment:**
> [Show technology assessment]
>
> **Recommendations:**
> 1. ✅ **Keep**: [Technology] - Works well because [reason]
> 2. ⚠️ **Question**: [Technology] - Consider [alternative] because [reason]
>    - Current: [pros/cons]
>    - Alternative: [pros/cons]
>    - My recommendation: [choice with detailed rationale]
> 3. 🆕 **Add**: [New technology] needed for [purpose]
>    - Option A: [name] - [pros/cons] - Cost: [X]
>    - Option B: [name] - [pros/cons] - Cost: [Y]
>    - My recommendation: [choice with rationale]
>
> **Questions for you:**
> - Do you agree with keeping [technologies] as-is?
> - Should we switch from [current] to [alternative] for [reason]?
> - Which option do you prefer for [new technology needed]?
> - Are there any constraints I'm not aware of (budget, team skills, existing licenses)?
>
> **Impact of changes:**
> - If we switch [X]: [timeline impact, learning curve, migration effort]
> - If we add [Y]: [cost impact, integration complexity]"

**Specific Technology Question Examples:**

**For Database:**
> "TechStack.md specifies PostgreSQL, which works well for relational data. However, this feature involves:
> - Heavy JSON document storage
> - Flexible schema requirements
> - [specific need]
> 
> Options:
> 1. **Keep PostgreSQL**: Has good JSON support (jsonb). Pros: [list]. Cons: [list].
> 2. **Add MongoDB**: Purpose-built for documents. Pros: [list]. Cons: [complexity of dual databases].
> 3. **Use PostgreSQL's jsonb**: Best of both worlds. Pros: [list]. Cons: [list].
>
> My recommendation: [choice] because [detailed rationale]
> 
> Your preference?"

**For External Services:**
> "This feature needs text-to-speech. TechStack.md specifies Eleven Labs.
>
> Eleven Labs Analysis:
> - Quality: Excellent, very natural
> - Cost: $0.30 per 1K characters
> - For our expected usage: ~$X/month
>
> Alternatives:
> - **Azure TTS**: $4 per million chars (~$Y/month), already using Azure, good quality
> - **Google Cloud TTS**: $4 per million chars, similar pricing
> - **AWS Polly**: Similar pricing
>
> Cost comparison for expected usage:
> - Eleven Labs: $X/month
> - Azure/Google/AWS: $Y/month (Z% cheaper)
>
> Quality comparison: [analysis]
>
> My recommendation: [choice] because [rationale considering quality vs cost]
>
> Should we stick with Eleven Labs or switch?"

**For Libraries/Frameworks:**
> "TechStack.md specifies Zod for validation. For this feature with complex nested validation:
>
> Zod Analysis:
> - Type inference: Excellent
> - Nested validation: Requires verbose code for deep nesting
> - Error messages: Good but need customization
>
> Alternative for consideration:
> - **Joi**: More concise for complex schemas, battle-tested
> - **Yup**: Similar to Zod, React form integration
> - **ArkType**: Newer, claims better performance
>
> For this feature's needs: [analysis]
>
> My recommendation: [Keep Zod / Consider alternative] because [rationale]
>
> Should we proceed with Zod or explore alternatives?"

---

### Step 1.4: Create Implementation Plan

**Agent Actions:**
1. Break feature into implementable tasks
2. Estimate complexity for each task
3. Identify risks and mitigation strategies
4. Determine order of implementation
5. Include any tech stack changes in plan

**Output:**
Task breakdown with format:
```
Task 1: [Name] - Complexity: [Low/Medium/High] - Time: [estimate]
  Dependencies: [list]
  Risk: [potential issue]
  Mitigation: [how to handle]
  Tech Stack Impact: [any changes needed]
```

**Decision Point:**
> **Agent asks:** "I've planned these tasks in this order:
> 1. [Task 1]
> 2. [Task 2]
> ...
>
> Total estimated time: [X hours/days]
> High-risk areas: [list]
> Tech stack changes: [if any]
>
> Does this plan make sense? Should we adjust priorities or approach?"
>
> **Recommendations provided:**
> - If high complexity: "Consider proof-of-concept for [risky part] first"
> - If long timeline: "Could be split into MVP + enhancements"
> - If tech changes: "New technology requires [setup time, learning time]"

---

## Phase 2: Documentation Updates

### Step 2.1: Update Tech Stack (if changes approved)

**Agent Actions (if tech stack changes were approved in Phase 1):**
1. Open `techStack.md`
2. Update relevant sections with new technology choices
3. Document rationale for change
4. Update version numbers
5. Document migration path if replacing existing technology
6. Update dependency list

**Format:**
```markdown
### [Technology Category]

#### Previous Choice (Deprecated)
- **Technology**: [old choice]
- **Reason for change**: [why switching]
- **Deprecated date**: [date]
- **Removal target**: [when to remove]

#### Current Choice
- **Technology**: [new choice]
- **Version**: [version number]
- **Rationale**: [why this choice]
  - [reason 1]
  - [reason 2]
- **Migration path**: [if applicable]
  - [step 1]
  - [step 2]
- **Cost**: [pricing if applicable]
- **Alternatives considered**: [list with brief comparison]
```

**Decision Point:**
> **Agent asks:** "I've updated techStack.md with the approved changes:
> [Show changes]
>
> Should I also update:
> - Environment variable documentation?
> - Setup instructions in README?
> - CI/CD pipeline configuration?"

---

### Step 2.2: Update Data Model

**Agent Actions:**
1. Open `dataModel.md`
2. Add or update entities required for feature
3. Define fields, types, relationships, constraints
4. Document indexes needed for performance
5. Follow existing naming conventions

**Format:**
```markdown
### Entity: [EntityName]

**Purpose**: [What this entity represents]

**Fields:**
| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| ... | ... | ... | ... | ... |

**Relationships:**
- [relationship type] to [OtherEntity]

**Indexes:**
- [field_name] (for [query pattern])

**Constraints:**
- [constraint description]
```

**Decision Point:**
> **Agent asks:** "I've designed the data model as follows:
> [Show entity definitions]
>
> Questions:
> - Should [field_name] be nullable or required?
> - Should I use UUID or integer for IDs?
> - Do you want soft deletes (deleted_at) or hard deletes?
>
> Default recommendations:
> - UUID for distributed systems
> - Soft deletes for audit trail
> - Timestamps (created_at, updated_at) on all entities"

---

### Step 2.3: Update Use Cases

**Agent Actions:**
1. Open `useCases.md`
2. Find related use case or create new one
3. Update or add:
   - Preconditions
   - Main success scenario
   - Extensions (alternative paths)
   - Business rules
   - Non-functional requirements

**Decision Point:**
> **Agent asks:** "I've documented the use case:
> [Show use case]
>
> Business rules identified:
> - BR-XXX: [rule]
> 
> Are these business rules correct? Are there additional rules I should document?"
>
> **Recommendations provided:**
> - "Consider adding validation rule for [field]"
> - "Should we limit [action] to [frequency]?"

---

### Step 2.4: Update User Flows

**Agent Actions:**
1. Open `userFlow.md`
2. Find related flow or create new one
3. Document step-by-step user interaction
4. Include decision points, error paths, alternative flows
5. Reference branding guide for UI elements

**Decision Point:**
> **Agent asks:** "I've mapped the user flow:
> [Show flow diagram]
>
> Questions:
> - What should happen if [error scenario]?
> - Should users be able to [alternative action]?
> - Where should [action] redirect users?
>
> Default recommendations based on userFlow.md patterns"

---

## Phase 3: Architecture & Design

### Step 3.1: Design Component Structure

**Agent Actions:**
1. Review `architecture.md` for pattern requirements
2. Design component structure following chosen pattern
3. Define component responsibilities
4. Identify interfaces/contracts between components

**Output:**
```
Component: [Name]
Type: [Controller/Service/Repository/etc.]
Responsibilities:
  - [responsibility 1]
  - [responsibility 2]
Dependencies:
  - [other components]
Interfaces:
  - [methods/functions it exposes]
```

**Decision Point:**
> **Agent asks:** "Based on architecture.md, I recommend [pattern] (e.g., Hexagonal Architecture, Repository Pattern).
>
> Component structure:
> [Show components]
>
> Does this architecture align with project standards? Should I adjust the design?"

---

### Step 3.2: Define API Contracts

**Agent Actions:**
1. Design API endpoints following REST principles
2. Define request/response schemas
3. Document status codes and error responses
4. Follow patterns from existing APIs

**Output:**
```
Endpoint: POST /api/v1/[resource]
Purpose: [what it does]

Request Body:
{
  "field": "type - description"
}

Response (201 Created):
{
  "success": true,
  "data": { ... }
}

Response (400 Bad Request):
{
  "success": false,
  "error": { ... }
}

Validation Rules:
- [field]: [rule]
```

**Decision Point:**
> **Agent asks:** "I've designed these API endpoints:
> [List endpoints]
>
> Questions:
> - Should [endpoint] be paginated?
> - Should [endpoint] support filtering by [field]?
> - Rate limiting: [X] requests per [timeframe]?
>
> Recommendations based on similar endpoints in codebase"

---

### Step 3.3: Plan Data Flow

**Agent Actions:**
1. Map data flow from request to response
2. Identify transformation points
3. Plan validation layers
4. Document error handling strategy

**Decision Point:**
> **Agent asks:** "Data flow planned:
> Request → Validation → Business Logic → Database → Response
>
> Validation happens at: [layers]
> Error handling strategy: [approach]
>
> Is this flow correct for this feature?"

---

## Phase 4: Data Layer Implementation

### Step 4.1: Create Database Schema

**Agent Actions:**
1. Review `dataModel.md` specifications
2. Review `techStack.md` for database technology (Prisma, Drizzle, etc.)
3. Create migration file
4. Define schema with proper types, constraints, indexes
5. Add comments for clarity

**Code Generation:**
- Generate migration file
- Include up and down migrations
- Follow database naming conventions (snake_case)

**Decision Point:**
> **Agent asks:** "Migration created for:
> [Show schema]
>
> Should I run this migration now or wait for your review?
>
> Warning: This will modify production database structure."
>
> **Recommendation:** "Always review migrations before running on production"

---

### Step 4.2: Implement Repository Layer

**Agent Actions:**
1. Review `codingInstructions.md` for repository pattern
2. Review language-specific guide (e.g., TypeScript guide)
3. Create repository class with CRUD operations
4. Implement query methods needed by use cases
5. Add comprehensive error handling
6. Include JSDoc/documentation comments

**Code Generation:**
- Repository class following project patterns
- Methods: create, findById, findByX, update, delete
- Use parameterized queries (from codingInstructions.md security section)
- Include transaction support if needed

**Decision Point:**
> **Agent asks:** "Repository implemented with methods:
> [List methods]
>
> Questions:
> - Should findAll include pagination by default?
> - Should soft delete be implemented?
> - What default sorting should be used?
>
> Recommendations:
> - Pagination: Yes, with default limit 20
> - Soft delete: Yes, for audit trail
> - Sorting: By created_at DESC"

---

### Step 4.3: Write Data Layer Tests

**Agent Actions:**
1. Create unit tests for repository
2. Test each CRUD operation
3. Test error scenarios
4. Test constraints and validations
5. Use test database (from techStack.md)

**Code Generation:**
- Unit tests following project test structure
- Use AAA pattern (Arrange-Act-Assert)
- Mock database connections where appropriate
- Achieve >80% coverage

**Decision Point:**
> **Agent asks:** "Tests created covering:
> - Happy paths: [list]
> - Error cases: [list]
> - Coverage: [X]%
>
> Should I add additional test scenarios?"

---

## Phase 5: Business Logic Implementation

### Step 5.1: Implement Service Layer

**Agent Actions:**
1. Review `codingInstructions.md` for service pattern
2. Create service class
3. Implement business logic from `useCases.md`
4. Apply business rules from `useCases.md`
5. Coordinate multiple repositories if needed
6. Handle transactions
7. Implement comprehensive error handling

**Code Generation:**
- Service class following project patterns
- Business logic separated from data access
- Proper error types (ValidationError, NotFoundError, etc.)
- Transaction management for multi-step operations

**Decision Point:**
> **Agent asks:** "Service layer implemented with:
> [List methods and business rules applied]
>
> Questions:
> - Should [operation] be wrapped in a transaction?
> - How should [business rule] be validated?
> - What happens if [edge case]?
>
> Recommendations based on codingInstructions.md patterns"

---

### Step 5.2: Implement Validation

**Agent Actions:**
1. Review validation library from `techStack.md` (e.g., Zod)
2. Create validation schemas
3. Implement input validation
4. Implement business rule validation
5. Provide clear error messages

**Code Generation:**
- Validation schemas for all inputs
- Whitelist validation (from codingInstructions.md)
- Clear, user-friendly error messages
- Type-safe validation

**Decision Point:**
> **Agent asks:** "Validation implemented:
> [Show validation rules]
>
> Questions:
> - Should [field] accept [value]?
> - What's the max length for [field]?
> - Should [field] be case-sensitive?
>
> Recommendations:
> - Email: lowercase, RFC compliant
> - Passwords: min 8 chars, complexity requirements
> - Text: sanitize HTML, max length 500"

---

### Step 5.3: Write Service Layer Tests

**Agent Actions:**
1. Create unit tests for service methods
2. Mock repository layer
3. Test business logic and rules
4. Test validation
5. Test error scenarios

**Code Generation:**
- Comprehensive unit tests
- Mock all dependencies
- Test all business rule branches
- >80% coverage

---

## Phase 6: API Layer Implementation

### Step 6.1: Implement API Endpoints

**Agent Actions:**
1. Review `techStack.md` for web framework (Express, etc.)
2. Create route handlers
3. Implement request validation
4. Call service layer
5. Format responses consistently
6. Add comprehensive error handling
7. Follow existing API patterns

**Code Generation:**
- Route handlers following project structure
- Consistent response format (from codingInstructions.md)
- Proper status codes
- Error handling middleware integration

**Decision Point:**
> **Agent asks:** "API endpoints implemented:
> [List endpoints with methods]
>
> Questions:
> - Should [endpoint] require authentication?
> - Should [endpoint] have rate limiting?
> - What permissions are needed for [endpoint]?
>
> Recommendations:
> - All POST/PUT/DELETE require authentication
> - Public GET endpoints: rate limit 100/hour
> - Private endpoints: rate limit 1000/hour"

---

### Step 6.2: Implement Authentication & Authorization

**Agent Actions:**
1. Review `techStack.md` for auth library (JWT, etc.)
2. Add authentication middleware
3. Implement authorization checks
4. Apply to endpoints based on requirements

**Code Generation:**
- Authentication middleware
- Authorization checks based on roles
- Proper error responses (401, 403)

**Decision Point:**
> **Agent asks:** "Authentication/Authorization implemented:
> - Protected endpoints: [list]
> - Required roles: [list]
>
> Is this security level appropriate?"

---

### Step 6.3: Write Integration Tests

**Agent Actions:**
1. Create integration tests for API endpoints
2. Test full request/response cycle
3. Test authentication/authorization
4. Test error scenarios
5. Use test database

**Code Generation:**
- Integration tests using supertest or similar
- Test all endpoints
- Test authorization boundaries
- >70% coverage

---

## Phase 7: Testing

### Step 7.1: Run All Tests

**Agent Actions:**
1. Run unit tests
2. Run integration tests
3. Check code coverage
4. Fix any failing tests

**Decision Point:**
> **Agent reports:** "Test results:
> - Unit tests: [X passed, Y failed]
> - Integration tests: [X passed, Y failed]
> - Coverage: [X]%
>
> [If failures] Failed tests: [list with reasons]
>
> Should I fix failing tests or are they expected?"

---

### Step 7.2: Manual Testing Checklist

**Agent provides:**
Checklist for manual testing based on userFlow.md:

```
Manual Testing Checklist:
□ Happy path: [steps from userFlow.md]
□ Error case 1: [steps]
□ Error case 2: [steps]
□ Edge case 1: [steps]
□ UI matches brandingGuide.md (if applicable)
□ Responsive design (if applicable)
□ Loading states work
□ Error messages are clear
```

**Decision Point:**
> **Agent asks:** "Please perform manual testing using the checklist above. Let me know:
> - What works correctly
> - What needs fixing
> - Any unexpected behavior"

---

### Step 7.3: Fix Issues

**Agent Actions:**
1. Wait for manual testing feedback
2. Fix reported issues
3. Re-run automated tests
4. Update documentation if needed

---

## Phase 8: Documentation & Deployment

### Step 8.1: Update API Documentation

**Agent Actions:**
1. Generate/update API documentation
2. Include all new endpoints
3. Document request/response formats
4. Add examples
5. Follow format from `techStack.md` (Swagger, etc.)

**Decision Point:**
> **Agent asks:** "API documentation updated with:
> [List documented endpoints]
>
> Are there additional details that should be included?"

---

### Step 8.2: Update README and Guides

**Agent Actions:**
1. Update project README if new setup steps
2. Update environment variables documentation
3. Document new configuration
4. Update deployment guide if needed
5. Document any tech stack changes

---

### Step 8.3: Update Implementation Plan

**Agent Actions:**
1. Open this file (`implementationPlan.md`)
2. Mark completed features
3. Update "Next Steps" section
4. Document any blockers or issues
5. Update Decision Log with tech stack decisions

**Output:**
```markdown
## Completed Features
- [x] Feature X - Completed [date] - Branch: feature/x - PR: #123

## In Progress
- [ ] Feature Y - Started [date] - Branch: feature/y - Status: [current phase]

## Next Steps
1. [Next feature]
2. [Subsequent feature]

## Blockers
- [Blocker description] - Needs: [resolution]
```

---

### Step 8.4: Create Pull Request

**Agent Actions:**
1. Review all changes
2. Ensure code follows `codingInstructions.md`
3. Ensure tests pass
4. Create descriptive PR

**PR Template:**
```markdown
## Feature: [Name]

### Use Case
Implements UC-XXX from useCases.md

### Changes
- Added [list changes]
- Updated [list updates]

### Tech Stack Changes
- [If any] Changed from [X] to [Y] because [rationale]
- [If any] Added [new technology] for [purpose]

### Testing
- Unit test coverage: X%
- Integration tests: [list key tests]
- Manual testing: [checklist completed]

### Documentation
- Updated dataModel.md
- Updated useCases.md
- Updated userFlow.md
- Updated techStack.md (if applicable)
- Updated API docs

### Checklist
- [ ] Code follows codingInstructions.md
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No security vulnerabilities
- [ ] Follows architecture.md patterns
- [ ] Uses technologies from techStack.md (or documents approved changes)
```

**Decision Point:**
> **Agent asks:** "Pull request ready:
> - Branch: [name]
> - Files changed: [count]
> - Tests: [passing/failing]
> - Tech stack changes: [if any]
>
> Should I create the PR or do you want to review locally first?"

---

## Feature Status Tracking

### Current Sprint / Iteration

**Status Legend:**
- 🎯 Planned
- 🚧 In Progress
- ✅ Completed
- ⏸️ Blocked
- ❌ Cancelled

### Phase 1: MVP Features

| Feature | Use Case | Priority | Status | Assignee | Branch | Notes |
|---------|----------|----------|--------|----------|--------|-------|
| User authentication | UC-XXX | High | ✅ | - | main | Supabase Auth integration |
| World creation | UC-001 | High | ✅ | - | main | Core worldbuilding feature |
| Character creation | UC-003 | High | ✅ | - | main | Core worldbuilding feature |
| Classic world elements | UC-002, UC-003, UC-004, UC-005 | High | ✅ | - | main | Countries, Regions, Characters, Timelines, Events, Locations |
| **Dynamic Element Types** | New | High | ✅ | - | main | World Anvil-style customizable element types |
| **Custom Properties System** | New | High | ✅ | - | main | Dynamic fields with templates |
| **Media Gallery Support** | New | High | ✅ | - | main | Images, videos, galleries for all elements |
| Document creation | UC-101 | High | 🎯 | - | - | Core writing feature |
| Spell checking | UC-103 | High | 🎯 | - | - | English and German support |

### Phase 2: Enhanced Features

| Feature | Use Case | Priority | Status | Branch | Notes |
|---------|----------|----------|--------|--------|-------|
| Timeline and events | UC-004, UC-005 | Medium | 🎯 | - | Worldbuilding enhancement |
| World sharing | UC-006, UC-007 | Medium | 🚧 | - | Public atlas view + sharing link |
| Document export | UC-201, UC-202, UC-203 | High | 🎯 | - | EPUB, Word, MOBI formats |
| Document-world linking | UC-104 | Medium | 🎯 | - | Integration feature |

---

## Decision Log

Track important decisions made during implementation:

| Date | Feature | Decision | Rationale | Alternatives Considered | Impact |
|------|---------|----------|-----------|------------------------|--------|
| 2025-01-27 | Database | Use MongoDB/Cosmos DB | Flexible schema for worldbuilding, object database requirement | PostgreSQL (relational), DynamoDB (NoSQL) | Core architecture decision |
| 2025-01-27 | Frontend | React 18.x | Latest version, modern features, large ecosystem | Vue 3, Svelte | Standard React SPA |
| 2025-01-27 | Authentication | JWT tokens | Stateless, scalable, works with SPA | Sessions (simpler but less scalable) | Standard approach |
| 2026-01-16 | Database | Use PostgreSQL with Supabase | Switched to Supabase for auth+db, PostgreSQL with JSONB for flexible schema | MongoDB standalone | Simplified architecture |
| 2026-01-16 | Worldbuilding | Dynamic Element Types System | Competitive analysis showed World Anvil/Scrivener use dynamic templates | Fixed schema only | Major feature parity |
| 2026-01-16 | Media | JSONB galleries + Supabase Storage | Flexible media linking per element with cloud storage | Separate media service | Integrated approach |

### Tech Stack Change Log

Track technology changes specifically:

| Date | Category | Previous | New | Reason | Migration Required | Status |
|------|----------|----------|-----|--------|-------------------|--------|
| YYYY-MM-DD | [Database/API/etc.] | [Old tech] | [New tech] | [Rationale] | Yes/No | Planned/In Progress/Complete |

**Example:**
| Date | Category | Previous | New | Reason | Migration Required | Status |
|------|----------|----------|-----|--------|-------------------|--------|
| 2025-01-27 | Database | PostgreSQL | MongoDB | Object database requirement, flexible schema for worldbuilding | Yes - new database schema | Planned |

---

## Blockers and Issues

### Active Blockers

| Blocker | Feature | Impact | Resolution Needed | Status |
|---------|---------|--------|-------------------|--------|
| [Description] | [Feature] | High/Med/Low | [What's needed] | Open/Resolved |

### Resolved Issues

| Issue | Feature | Resolution | Date Resolved |
|-------|---------|------------|---------------|
| [Description] | [Feature] | [How resolved] | [Date] |

---

## Agent Workflow Quick Reference

### Starting a New Feature

1. Run Planning Phase (Phase 1)
   - **Include tech stack validation!**
2. Get approval on plan AND tech choices
3. Update documentation (Phase 2)
   - Update techStack.md if changes approved
4. Get approval on documentation
5. Design architecture (Phase 3)
6. Get approval on design
7. Implement (Phases 4-6)
8. Test (Phase 7)
9. Deploy (Phase 8)

### At Each Decision Point

1. **Analyze** the situation
2. **Provide recommendations** with pros/cons
3. **Ask specific questions** that need human input
4. **Wait for feedback** before proceeding
5. **Document decision** in decision log

### When Questioning Tech Stack

1. **Analyze current choice** against feature needs
2. **Research alternatives** thoroughly
3. **Present comparison** with concrete data (cost, performance, etc.)
4. **Make recommendation** with clear rationale
5. **Explain trade-offs** honestly
6. **Respect constraints** (budget, team skills, existing commitments)
7. **Document decision** regardless of outcome

### When Blocked

1. **Document the blocker** in Blockers section
2. **Explain impact** on timeline
3. **Propose alternatives** if possible
4. **Ask for guidance** on resolution
5. **Continue on unblocked work** if possible

---

## Best Practices for Agent

### Communication

✅ **DO:**
- Ask specific questions
- Provide recommendations with rationale
- Explain trade-offs
- Reference relevant documentation
- Summarize what was done
- Flag potential issues early
- Challenge tech stack constructively

❌ **DON'T:**
- Make major decisions without approval
- Proceed when uncertain
- Ignore project documentation
- Skip testing
- Leave TODO comments in code
- Commit commented-out code
- Accept tech stack blindly without analysis

### Code Quality

✅ **DO:**
- Follow `codingInstructions.md` strictly
- Use patterns from `architecture.md`
- Use technologies from `techStack.md` (or document approved changes)
- Write comprehensive tests
- Document complex logic
- Handle errors properly
- Validate all inputs

❌ **DON'T:**
- Copy-paste code without understanding
- Skip error handling
- Ignore edge cases
- Write code without tests
- Use deprecated patterns
- Hardcode configuration
- Expose sensitive data

### Tech Stack Decisions

✅ **DO:**
- Question when something seems suboptimal
- Research alternatives thoroughly
- Consider total cost of ownership
- Factor in team expertise
- Think about maintenance
- Document rationale clearly
- Update techStack.md when changes approved

❌ **DON'T:**
- Change tech without asking
- Ignore techStack.md specifications
- Choose bleeding-edge unstable tech
- Add dependencies unnecessarily
- Ignore cost implications
- Forget about team learning curve

### Documentation

✅ **DO:**
- Update all relevant .md files
- Keep documentation in sync with code
- Document decision rationale
- Update implementation plan
- Write clear commit messages
- Add code comments for complex logic
- Update techStack.md with changes

❌ **DON'T:**
- Leave documentation outdated
- Skip documentation updates
- Document obvious code
- Over-document simple code
- Forget to document tech changes

---

## Maintenance

- **Update Frequency**: After each feature completion
- **Last Updated**: 2025-01-27
- **Next Review**: End of current sprint
- **Maintained By**: WriterSquire Product & Development Team

---

## Templates

### Feature Request Template

```markdown
## Feature: [Name]

### Description
[What the feature does]

### User Story
As a [user type], I want to [action] so that [benefit]

### Related Documents
- Use Case: UC-XXX in useCases.md
- User Flow: Flow-X in userFlow.md
- Data Model: [entities] in dataModel.md

### Tech Stack Considerations
- Potential new technologies needed: [list]
- Potential challenges with current stack: [list]

### Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
```

### Bug Report Template

```markdown
## Bug: [Title]

### Description
[What's wrong]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Error occurs]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Environment
- Branch: [name]
- Commit: [hash]
- Environment: [dev/staging/prod]
- Tech Stack Version: [if relevant]
```

### Tech Stack Change Proposal Template

```markdown
## Tech Stack Change Proposal

### Current Technology
- **Category**: [Database/API/Framework/Library/Service]
- **Current Choice**: [name and version]
- **In use since**: [date]

### Proposed Change
- **New Choice**: [name and version]
- **Reason for change**: [detailed rationale]

### Analysis

#### Current Technology
✅ **Strengths**:
- [strength 1]
- [strength 2]

⚠️ **Weaknesses/Issues**:
- [weakness 1]
- [weakness 2]

#### Proposed Technology
✅ **Advantages**:
- [advantage 1]
- [advantage 2]

⚠️ **Disadvantages**:
- [disadvantage 1]
- [disadvantage 2]

### Comparison

| Aspect | Current | Proposed | Winner |
|--------|---------|----------|--------|
| Performance | [data] | [data] | [choice] |
| Cost | [data] | [data] | [choice] |
| Maturity | [data] | [data] | [choice] |
| Team Expertise | [data] | [data] | [choice] |
| Integration | [data] | [data] | [choice] |

### Impact Assessment

**Migration Effort**: [High/Medium/Low]
- [specific tasks required]
- Estimated time: [X hours/days]

**Learning Curve**: [High/Medium/Low]
- Team familiarity: [level]
- Training needed: [Y hours]

**Cost Impact**: 
- One-time: $[X]
- Recurring: $[Y]/month
- Net change: [increase/decrease by Z%]

**Risk Level**: [High/Medium/Low]
- [risk 1]
- Mitigation: [how to handle]

### Recommendation

**My recommendation**: [Keep current / Switch to proposed]

**Rationale**: [Detailed reasoning]

**Timeline**: [When to implement if approved]

### Alternatives Considered

1. **[Alternative 1]**: [Brief analysis] - Not recommended because [reason]
2. **[Alternative 2]**: [Brief analysis] - Not recommended because [reason]
```

---

## Notes

This implementation plan is designed to work with autonomous AI agents while ensuring:
- **Human oversight** at critical decision points
- **Tech stack validation** for optimal technology choices
- **Quality standards** from project documentation
- **Consistent patterns** across codebase
- **Comprehensive testing** before deployment
- **Clear communication** throughout process
- **Constructive questioning** of technology decisions

The agent should treat this as a flexible guide, adapting the process based on feature complexity while maintaining quality standards. **The agent should always question and validate technology choices** but respect the final decision after discussion.

## WriterSquire-Specific Implementation Notes

### Worldbuilding Module Priority
- Start with core entities: World, Character, Country
- Implement relationships and references early
- Media uploads (images, videos) can be added incrementally

### Writing Module Priority
- Rich text editor is critical path
- Spell checking integration should be done early
- Auto-save and version history important for user trust

### Publishing Module
- Can be implemented after writing module is stable
- EPUB generation is most important format
- Word export is second priority
- MOBI can be added later

### Database Considerations
- MongoDB schema should be flexible for worldbuilding entities
- Consider indexing strategy early for performance
- Plan for document versioning and history storage