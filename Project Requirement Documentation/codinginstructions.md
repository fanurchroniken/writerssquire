# Coding Instructions (Language-Agnostic)

## Overview

This document provides **universal coding standards and implementation principles** that apply across all programming languages. It focuses on **how to build well** using language-independent best practices.

> 📘 **Architecture Context**: For architectural patterns and strategic decisions, see [techstack.md](./techstack.md)
> 
> 💻 **Language-Specific Details**: For syntax-specific examples, see language-specific guides in `/typescript/`, `/python/`, etc.

---

## Part 1: Code Structure & Organization

### 1.1 Universal Project Structure Principles

**Separation of Concerns:**
- API/Interface layer (handles external communication)
- Domain/Business logic layer (core functionality)
- Infrastructure layer (external dependencies: database, cache, APIs)
- Configuration layer (environment-specific settings)
- Utilities layer (reusable helpers)

**Testing Organization:**
- Unit tests alongside or mirrored to source structure
- Integration tests in dedicated directory
- End-to-end tests separate from unit/integration

**Documentation:**
- README at project root
- Technical documentation in `/docs`
- API documentation accessible to consumers

### 1.2 Universal Naming Conventions

**Consistency Principle:**
Choose one naming convention per element type and apply consistently throughout the project.

**Files/Modules:**
- Use clear, descriptive names indicating purpose
- Avoid abbreviations unless universally understood
- Group related files in directories

**Functions/Methods:**
- Use verb phrases describing action: `getUserById`, `calculateTotal`, `validateInput`
- Boolean-returning functions use `is`, `has`, `can`: `isValid`, `hasPermission`, `canDelete`

**Classes/Types:**
- Use noun phrases describing entity: `User`, `OrderService`, `PaymentProcessor`
- Avoid generic names like `Manager`, `Handler` without context

**Constants:**
- Use descriptive names for configuration values
- Distinguish between true constants and configuration

**Private/Internal:**
- Indicate private/internal elements with language-appropriate convention
- Document visibility expectations

---

## Part 2: Documentation Standards

### 2.1 Code-Level Documentation

Every public function/method must document:
- **Purpose**: What the function does
- **Parameters**: Each parameter with type and description
- **Return Value**: What is returned and when
- **Exceptions/Errors**: What errors can occur and why
- **Examples**: Basic usage example

### 2.2 Class/Module Documentation

Document:
- **Responsibility**: What this class/module handles
- **Dependencies**: What it requires to function
- **Usage**: How to instantiate and use
- **Thread Safety**: Concurrency considerations (if applicable)

### 2.3 Architecture Documentation

Maintain:
- System architecture diagrams
- Data flow documentation
- API contracts and interfaces
- Deployment procedures
- Configuration documentation

---

## Part 3: Error Handling Principles

### 3.1 Fail Fast, Fail Clearly

**Never Silently Fail:**
- Always log errors with context
- Propagate errors appropriately
- Never use empty catch/except blocks

**Provide Context:**
- Include relevant data in error messages
- Log error stack traces
- Add operation context (what was being attempted)

### 3.2 Error Hierarchy

Establish clear error types:
- **Validation Errors**: User input problems (recoverable)
- **Not Found Errors**: Resource doesn't exist (recoverable)
- **Authentication Errors**: Identity verification failed (recoverable)
- **Authorization Errors**: Insufficient permissions (recoverable)
- **System Errors**: Infrastructure problems (may not be recoverable)

### 3.3 Error Handling Strategy

**At API Boundaries:**
- Validate all inputs before processing
- Return appropriate status codes (HTTP) or error codes
- Provide helpful error messages to users
- Never expose internal system details in user-facing errors

**Internal Errors:**
- Log detailed information for debugging
- Include correlation IDs for tracing
- Capture relevant context

---

## Part 4: Logging Standards

### 4.1 Structured Logging

**Consistent Format:**
- Use structured logging (not just string concatenation)
- Include timestamp on every log entry
- Add correlation/request IDs for tracing
- Include relevant context (user ID, operation, resource)

**Log Levels:**
- **DEBUG**: Detailed diagnostic information
- **INFO**: General informational messages
- **WARN**: Warning of potential issues
- **ERROR**: Error events that might still allow application to continue
- **FATAL/CRITICAL**: Severe errors requiring immediate attention

### 4.2 What to Log

**Always Log:**
- Application startup/shutdown
- Configuration loading
- Authentication attempts (success and failure)
- Authorization failures
- External API calls (request/response)
- Database operations (especially failures)
- Business-critical operations

**Never Log:**
- Passwords or credentials
- Personally identifiable information (PII) unless required
- Credit card or payment information
- Session tokens or API keys

### 4.3 Log Context

Include in every log entry:
- Timestamp
- Log level
- Source (file, function, line if possible)
- Correlation ID (for request tracing)
- User/entity involved (if applicable)
- Operation being performed

---

## Part 5: Testing Principles

### 5.1 Test Structure (AAA Pattern)

**Arrange-Act-Assert:**
1. **Arrange**: Set up test data and conditions
2. **Act**: Execute the code being tested
3. **Assert**: Verify the expected outcome

### 5.2 Test Naming

Use descriptive test names that explain:
- What is being tested
- Under what conditions
- What the expected outcome is

Example patterns:
- `testFunctionName_Condition_ExpectedBehavior`
- `givenCondition_whenAction_thenOutcome`

### 5.3 Test Coverage Requirements

**Minimum Coverage:**
- 80% code coverage for business logic
- 100% coverage for critical paths
- All edge cases tested

**What to Test:**
- Happy path (normal operation)
- Edge cases (boundaries, empty inputs, null values)
- Error conditions (invalid input, system failures)
- Integration points (external APIs, database)

### 5.4 Test Independence

**Isolated Tests:**
- Each test runs independently
- No shared state between tests
- Tests can run in any order
- Tests don't depend on external services (use mocks/stubs)

---

## Part 6: Input Validation & Security

### 6.1 Validation Principles

**Whitelist, Don't Blacklist:**
- Define what is valid, not what is invalid
- Reject anything that doesn't match valid criteria

**Validate at Boundaries:**
- Validate all external input immediately
- Validate API parameters
- Validate user input
- Validate configuration

**Validation Layers:**
- **Type Validation**: Correct data type
- **Format Validation**: Matches expected format (email, phone, date)
- **Range Validation**: Within acceptable bounds
- **Business Rule Validation**: Meets domain requirements

### 6.2 SQL Injection Prevention

**Use Parameterized Queries:**
- Never concatenate user input into SQL strings
- Use prepared statements/parameterized queries
- Let database driver handle escaping

### 6.3 Cross-Site Scripting (XSS) Prevention

**Escape Output:**
- Escape HTML entities before rendering
- Use framework-provided escaping mechanisms
- Sanitize rich text input

### 6.4 Authentication & Authorization

**Authentication Best Practices:**
- Use strong password requirements
- Hash passwords with modern algorithms (not MD5 or SHA1)
- Implement account lockout after failed attempts
- Use multi-factor authentication for sensitive operations

**Authorization Best Practices:**
- Implement role-based access control (RBAC)
- Check permissions before every protected operation
- Use principle of least privilege
- Never trust client-side authorization checks

---

## Part 7: Asynchronous & Concurrent Programming

### 7.1 Concurrency Principles

**Avoid Shared Mutable State:**
- Minimize shared state between threads/processes
- Use immutable data structures when possible
- Protect shared state with proper synchronization

**Parallelism vs Concurrency:**
- **Parallelism**: Multiple operations simultaneously (multiple cores)
- **Concurrency**: Managing multiple operations (may not be simultaneous)

### 7.2 Common Patterns

**Parallel Execution:**
- Execute independent operations in parallel when possible
- Wait for all operations to complete before proceeding
- Handle partial failures gracefully

**Rate Limiting:**
- Limit concurrent operations to external services
- Implement backoff strategies for retries
- Respect rate limits of external APIs

**Timeouts:**
- Set timeouts for all external calls
- Don't wait indefinitely
- Handle timeout errors appropriately

---

## Part 8: Configuration Management

### 8.1 Environment Variables

**Externalize Configuration:**
- All environment-specific values in environment variables
- No hardcoded values in source code
- Provide example/template files

**Required Variables:**
- Application environment (development, staging, production)
- Service ports and URLs
- Database connection strings
- API keys and secrets
- Log levels
- Feature flags

### 8.2 Configuration Validation

**Validate on Startup:**
- Check all required configuration present
- Validate configuration format
- Fail fast if configuration invalid
- Log configuration being used (redact secrets)

### 8.3 Secrets Management

**Never Commit Secrets:**
- Use environment variables for secrets
- Use secret management services (AWS Secrets Manager, Azure Key Vault, etc.)
- Rotate secrets regularly
- Revoke compromised secrets immediately

---

## Part 9: API Design Principles

### 9.1 RESTful API Standards

**Resource-Based URLs:**
- Use nouns, not verbs in URLs
- Hierarchical resource structure
- Consistent naming

**HTTP Methods:**
- GET: Retrieve data (idempotent, no side effects)
- POST: Create new resource
- PUT: Update entire resource
- PATCH: Partial update
- DELETE: Remove resource

**Status Codes:**
- 2xx: Success (200 OK, 201 Created, 204 No Content)
- 3xx: Redirection
- 4xx: Client errors (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found)
- 5xx: Server errors (500 Internal Server Error, 503 Service Unavailable)

### 9.2 API Versioning

**Version Your APIs:**
- Include version in URL path (`/api/v1/users`)
- Maintain backward compatibility within major version
- Document breaking changes
- Provide migration path for deprecated endpoints

### 9.3 Response Format Consistency

**Standardized Responses:**
- Consistent response structure across all endpoints
- Include success/error indication
- Provide helpful error messages
- Include metadata (timestamp, request ID)

**Pagination:**
- Support pagination for list endpoints
- Include pagination metadata (total count, page size, current page)
- Provide links to next/previous pages

---

## Part 10: Database Design Principles

### 10.1 Schema Design

**Normalization:**
- Eliminate data redundancy
- Ensure data integrity
- Balance normalization with query performance

**Data Types:**
- Use appropriate data types for each column
- Use constraints (NOT NULL, UNIQUE, FOREIGN KEY)
- Add indexes on frequently queried columns

### 10.2 Query Optimization

**Avoid N+1 Queries:**
- Fetch related data efficiently
- Use joins or eager loading
- Batch operations when possible

**Use Indexes Wisely:**
- Index columns used in WHERE, JOIN, ORDER BY
- Don't over-index (slows writes)
- Monitor slow queries

### 10.3 Transactions

**ACID Properties:**
- **Atomicity**: All operations succeed or all fail
- **Consistency**: Database remains in valid state
- **Isolation**: Concurrent transactions don't interfere
- **Durability**: Committed data persists

**Transaction Scope:**
- Keep transactions small and focused
- Don't hold transactions open unnecessarily
- Handle rollback on errors

---

## Part 11: Performance Optimization

### 11.1 Caching Strategy

**What to Cache:**
- Frequently accessed data
- Expensive computations
- External API responses
- Static content

**Cache Invalidation:**
- Set appropriate TTL (time to live)
- Invalidate on data updates
- Handle cache misses gracefully

**Caching Layers:**
- Application-level cache (in-memory)
- Distributed cache (Redis, Memcached)
- HTTP caching (CDN)

### 11.2 Resource Management

**Connection Pooling:**
- Reuse database connections
- Configure pool size appropriately
- Monitor pool utilization

**Memory Management:**
- Avoid memory leaks
- Clean up resources (close files, connections)
- Monitor memory usage

### 11.3 Algorithm Efficiency

**Time Complexity:**
- Prefer O(1) or O(log n) algorithms
- Avoid O(n²) or worse when possible
- Use appropriate data structures

**Space Complexity:**
- Balance memory usage with performance
- Avoid unnecessary data copies
- Stream large datasets

---

## Part 12: Security Best Practices

### 12.1 Defense in Depth

**Multiple Security Layers:**
- Network security (firewalls, VPCs)
- Application security (input validation, authentication)
- Data security (encryption, access controls)

### 12.2 Data Protection

**Encryption:**
- Encrypt sensitive data at rest
- Use TLS/HTTPS for data in transit
- Never store passwords in plain text

**Access Control:**
- Implement proper authorization
- Audit sensitive operations
- Follow principle of least privilege

### 12.3 Dependency Security

**Keep Dependencies Updated:**
- Regularly update libraries and frameworks
- Monitor security advisories
- Use automated vulnerability scanning
- Audit dependencies before adding

---

## Part 13: Code Review Standards

### 13.1 What to Review

**Functionality:**
- Code does what it's supposed to do
- Edge cases handled
- Error handling present

**Code Quality:**
- Follows coding standards
- Properly documented
- No unnecessary complexity
- Tests included

**Security:**
- No security vulnerabilities
- Input validation present
- Authentication/authorization correct

**Performance:**
- No obvious performance issues
- Appropriate algorithms and data structures
- Database queries optimized

### 13.2 Review Process

**Before Requesting Review:**
- Code compiles/runs
- Tests pass
- Linting passes
- Documentation updated

**During Review:**
- Be constructive
- Explain reasoning
- Suggest alternatives
- Approve or request changes

---

## Part 14: Production Readiness

### 14.1 Health Checks

**Endpoint Requirements:**
- Responds quickly (< 1 second)
- Checks critical dependencies
- Returns appropriate status codes
- Includes version information

**What to Check:**
- Database connectivity
- Cache availability
- External API reachability
- Disk space
- Memory usage

### 14.2 Monitoring & Observability

**Metrics to Track:**
- Request rate and latency
- Error rate
- CPU and memory usage
- Database query performance
- Cache hit rate

**Alerting:**
- Alert on error rate thresholds
- Alert on performance degradation
- Alert on service unavailability
- Include runbooks with alerts

### 14.3 Deployment Checklist

Before deploying to production:
- [ ] All tests pass
- [ ] Code review completed
- [ ] Security scan passed
- [ ] Performance tested
- [ ] Database migrations tested
- [ ] Configuration validated
- [ ] Health checks working
- [ ] Monitoring configured
- [ ] Rollback plan documented
- [ ] Team notified

---

## Part 15: Maintenance & Technical Debt

### 15.1 Code Refactoring

**When to Refactor:**
- Code difficult to understand
- Duplication present
- Changes require many file edits
- Tests are brittle

**Refactoring Principles:**
- Make small, incremental changes
- Maintain test coverage
- Don't change behavior and refactor simultaneously
- Use version control

### 15.2 Technical Debt Management

**Identify Debt:**
- Code smells (long methods, large classes)
- Outdated dependencies
- Missing tests
- Poor documentation

**Address Debt:**
- Prioritize based on impact
- Allocate time for debt reduction
- Track debt in issue tracker
- Don't let debt accumulate indefinitely

---

## Part 16: Universal Code Patterns

### 16.1 Repository Pattern

**Purpose:** Abstract data access logic

**Responsibilities:**
- CRUD operations for entities
- Query methods
- Transaction management
- No business logic

### 16.2 Service Layer Pattern

**Purpose:** Contain business logic

**Responsibilities:**
- Orchestrate operations
- Enforce business rules
- Coordinate multiple repositories
- Handle transactions

### 16.3 Factory Pattern

**Purpose:** Create complex objects

**Use When:**
- Object creation is complex
- Multiple configuration options
- Need to abstract implementation

### 16.4 Dependency Injection

**Purpose:** Loose coupling between components

**Benefits:**
- Easy to test (can inject mocks)
- Flexible (swap implementations)
- Clear dependencies

---

## Conclusion

These coding instructions provide **language-agnostic principles** that apply regardless of programming language. They focus on universal concepts like proper error handling, testing, security, and code organization.

**For language-specific syntax and examples**, refer to:
- [TypeScript Coding Instructions](./typescript/codingInstructions-ts.md)
- [Python Coding Instructions](./python/codingInstructions-py.md) *(future)*

**For architectural guidance**, see [techstack.md](./techstack.md)

Together, these documents provide a complete framework for building production-ready software.