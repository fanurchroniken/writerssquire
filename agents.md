# 0. Your role
You are a coding agent working in this repository.
Treat this project like a professional, production system: prioritize correctness, readability, tests, and minimal disruption to existing behavior.​

# 1. Your core responsibilities:

Understand the existing code and docs before making changes.

Propose a short plan, then implement in small, reviewable steps.

Keep tests passing and avoid breaking public APIs or contracts.​

You must not:

Edit configuration for production infrastructure unless explicitly asked.

Delete data, secrets, or CI/CD configuration.

Introduce new major dependencies or services without a clear justification in the plan.

# 2. Repository overview
Main app: ./src

Tests: ./tests (unit), ./e2e (end‑to‑end)

Docs: ./docs (requirements, architecture, API, deployment)

Backend code lives in ./src/backend, frontend in ./src/frontend (if present). Adjust to actual layout in this repo.​

When in doubt, search for similar existing patterns and follow them.

# 3. Workflow: how you should work
Follow this loop for any non‑trivial task:

Explore

Open relevant files and skim related docs in ./docs.

Summarize the current behavior and constraints in a few bullets (for yourself / the user).​

Plan

Write a short implementation plan (3–7 steps) before editing code.

Call out which files you will touch and any migrations or new endpoints.​

Implement

Make small, focused edits.

Prefer refactors that improve clarity over cleverness.

Test

Run fast checks first (lint, unit tests), then broader suites if needed.

If tests fail, fix the root cause instead of updating tests blindly.​

Record

Update the project log/progress section in the relevant doc if it exists.

Add notes to the troubleshooting log when you hit non‑obvious errors.

# 4. Coding standards
Adjust this section to your stack; example for TypeScript/Node + React.​

## Languages & style

Prefer TypeScript over JavaScript.

Use ES modules (import/export), no CommonJS.

Follow the existing ESLint/Prettier configuration.

## Architecture & patterns

Keep business logic out of controllers/routes; use services/helpers.

Write pure, side‑effect‑free functions where possible.

Keep files focused; avoid “god” classes or 1000‑line modules.

## Naming & structure

Components: PascalCase (e.g. UserProfile.tsx).

Utilities: camelCase (e.g. formatDate.ts).

Constants: SCREAMING_SNAKE_CASE.

Types/interfaces: PascalCase with clear suffix (e.g. UserDto).​

## Tests

Every new feature or bugfix should include or update tests.

Co‑locate tests near the code when that is the existing convention.

Prefer small, focused tests with clear input/output expectations.

# 5. Commands you can run
Adapt to your actual scripts; keep them current.​

Install dependencies: npm install

Build: npm run build

Lint: npm run lint

Unit tests: npm test

E2E tests (if configured): npm run test:e2e

When asked to validate changes, at minimum run lint + unit tests.
If commands differ per package (monorepo), note them explicitly for each package.

# 6. Testing & safety expectations
Do not ship changes that cause existing tests to fail.

If you must change tests, explain why the behavior changed and ensure this matches the requirements.

Be conservative with data‑destructive actions (migrations, deletes); flag them clearly and prefer idempotent, reversible steps.​

If CI output or logs indicate flakiness, add a short note to the troubleshooting section instead of ignoring it.

# 7. Security & privacy
Never log secrets, tokens, passwords, or full personal data.

Validate and sanitize all external input (API, forms, webhooks).

Follow existing authentication/authorization patterns; do not roll your own crypto or auth flows.​

If a task seems to require changing auth, CORS, or permissions, pause and surface a clarification request rather than guessing.

# 8. Where to find more details
When you need more context, look here (paths may differ in your repo):​

- /Project Requirement Documentation/appManifest.md -> High level use case description of the project
- /Project Requirement Documentation/brandingGuide.md -> Instructions on styling, visuals, optics and tonality as well as choice of words
- /Project Requirement Documentation/architecture.md -> Guidelines on architecture principles that should be used
- /Project Requirement Documentation/techStack.md -> Guidelines on technology stack that should be used
- /Project Requirement Documentation/codingInstructions.md -> Programming language agnostic instructions on how you should write code
- /Project Requirement Documentation/dataModel.md -> in-depth description of the data model #
- /Project Requirement Documentation/implementationPlan.md -> Plan that indicates the next or outstanding implementation steps
- /Project Requirement Documentation/useCases.md -> List of use cases that must be realized for this application
- /Project Requirement Documentation/userFlow.md -> Instructions on how a user should interact with the system (order of steps and clicks)

Always respect the existing architecture and contracts described in these docs. If code and docs disagree, surface the inconsistency instead of unilaterally choosing one.

# 9. How to behave in subdirectories
Some folders may have their own AGENTS.md with more specific rules (e.g. ./backend/AGENTS.md, ./frontend/AGENTS.md).
When working in a folder with a local AGENTS.md, follow that file in addition to this root file; local rules take precedence for that area.​

