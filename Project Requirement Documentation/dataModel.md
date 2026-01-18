# WriterSquire - Data Model

## Overview

This document defines the **data structures, entities, relationships, and database schema** for WriterSquire. The system uses an object database to support flexible, nested structures for complex worldbuilding data.

> 📘 **Related Documents**:
> - [appManifest.md](./appManifest.md) - Project overview
> - [useCases.md](./useCases.md) - Feature requirements
> - [techStack.md](./techStack.md) - Database technology choices

---

## Database Technology

**Primary Database**: MongoDB / Azure Cosmos DB (Object Database)  
**Rationale**: 
- Flexible schema for complex, nested worldbuilding structures
- Support for rich media attachments
- Easy relationship modeling
- Scalable for large documents and worlds

---

## Core Entities

### Entity: User

**Purpose**: Represents a user account in the system

**Fields:**

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | ObjectId | No | auto | Primary key |
| email | String | No | - | Unique email address |
| username | String | No | - | Unique username |
| passwordHash | String | No | - | Hashed password (bcrypt) |
| displayName | String | Yes | - | User's display name |
| avatar | String | Yes | - | URL to avatar image |
| preferences | Object | Yes | {} | User preferences (language, theme, etc.) |
| subscriptionTier | String | No | "free" | free, pro, enterprise |
| createdAt | DateTime | No | now() | Account creation timestamp |
| updatedAt | DateTime | No | now() | Last update timestamp |
| lastLoginAt | DateTime | Yes | - | Last login timestamp |

**Relationships:**
- One-to-many: Owns multiple Worlds
- One-to-many: Owns multiple Documents
- Many-to-many: Collaborates on shared Worlds

**Indexes:**
- email (unique)
- username (unique)
- subscriptionTier

**Constraints:**
- Email must be valid format
- Username: 3-30 characters, alphanumeric and underscores
- Password: minimum 8 characters

---

### Entity: World

**Purpose**: Represents a fictional world created by a user

**Fields:**

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | ObjectId | No | auto | Primary key |
| ownerId | ObjectId | No | - | Reference to User |
| title | String | No | - | World name |
| description | String | Yes | - | World description |
| coverImage | String | Yes | - | URL to cover image |
| visibility | String | No | "private" | private, shared, public |
| sharedWith | Array[ObjectId] | Yes | [] | Array of User IDs with access |
| tags | Array[String] | Yes | [] | World tags (genre, theme, etc.) |
| metadata | Object | Yes | {} | Custom metadata (genre, era, etc.) |
| createdAt | DateTime | No | now() | Creation timestamp |
| updatedAt | DateTime | No | now() | Last update timestamp |
| version | Number | No | 1 | Version number for change tracking |

**Relationships:**
- Many-to-one: Belongs to User (owner)
- One-to-many: Contains Countries
- One-to-many: Contains Regions
- One-to-many: Contains Characters
- One-to-many: Contains Timelines
- One-to-many: Contains Events
- Many-to-many: Shared with Users (via sharedWith)

**Indexes:**
- ownerId
- visibility
- createdAt
- title (text search)

**Constraints:**
- Title: 1-100 characters
- Visibility must be one of: private, shared, public

---

### Entity: Country

**Purpose**: Represents a country within a world

**Fields:**

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | ObjectId | No | auto | Primary key |
| worldId | ObjectId | No | - | Reference to World |
| name | String | No | - | Country name |
| description | String | Yes | - | Country description |
| capital | String | Yes | - | Capital city name |
| population | Number | Yes | - | Population count |
| governmentType | String | Yes | - | Type of government |
| culture | String | Yes | - | Cultural description |
| history | String | Yes | - | Historical background |
| geography | String | Yes | - | Geographic description |
| mapImage | String | Yes | - | URL to map image |
| isPublic | Boolean | No | true | Visible in public atlas |
| references | Array[Reference] | Yes | [] | Array of references (see Reference schema) |
| relationships | Array[ObjectId] | Yes | [] | Related entities (regions, characters, etc.) |
| createdAt | DateTime | No | now() | Creation timestamp |
| updatedAt | DateTime | No | now() | Last update timestamp |

**Relationships:**
- Many-to-one: Belongs to World
- One-to-many: Contains Regions
- Many-to-many: Related to Characters (via relationships)

**Indexes:**
- worldId
- name (text search)

**Constraints:**
- Name: 1-100 characters
- Must belong to a World

---

### Entity: Region

**Purpose**: Represents a region within a country or world

**Fields:**

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | ObjectId | No | auto | Primary key |
| worldId | ObjectId | No | - | Reference to World |
| countryId | ObjectId | Yes | - | Reference to Country (if applicable) |
| name | String | No | - | Region name |
| description | String | Yes | - | Region description |
| type | String | Yes | - | Region type (province, state, territory, etc.) |
| geography | String | Yes | - | Geographic features |
| climate | String | Yes | - | Climate description |
| population | Number | Yes | - | Population count |
| mapImage | String | Yes | - | URL to map image |
| isPublic | Boolean | No | true | Visible in public atlas |
| references | Array[Reference] | Yes | [] | Array of references |
| relationships | Array[ObjectId] | Yes | [] | Related entities |
| createdAt | DateTime | No | now() | Creation timestamp |
| updatedAt | DateTime | No | now() | Last update timestamp |

**Relationships:**
- Many-to-one: Belongs to World
- Many-to-one: Belongs to Country (optional)
- Many-to-many: Related to Characters, Locations

**Indexes:**
- worldId
- countryId
- name (text search)

---

### Entity: Character

**Purpose**: Represents a character in a world

**Fields:**

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | ObjectId | No | auto | Primary key |
| worldId | ObjectId | No | - | Reference to World |
| name | String | No | - | Character name |
| fullName | String | Yes | - | Full name including titles |
| aliases | Array[String] | Yes | [] | Alternative names |
| description | String | Yes | - | Character description |
| appearance | String | Yes | - | Physical appearance |
| personality | String | Yes | - | Personality traits |
| backstory | String | Yes | - | Character history |
| motivations | String | Yes | - | Character goals and motivations |
| relationships | Array[Relationship] | Yes | [] | Relationships with other characters (see Relationship schema) |
| locationId | ObjectId | Yes | - | Primary location reference |
| birthDate | String | Yes | - | Birth date (timeline reference) |
| deathDate | String | Yes | - | Death date (if applicable) |
| portraitImage | String | Yes | - | URL to character portrait |
| isPublic | Boolean | No | true | Visible in public atlas |
| references | Array[Reference] | Yes | [] | Array of references |
| tags | Array[String] | Yes | [] | Character tags (protagonist, antagonist, etc.) |
| createdAt | DateTime | No | now() | Creation timestamp |
| updatedAt | DateTime | No | now() | Last update timestamp |

**Relationships:**
- Many-to-one: Belongs to World
- Many-to-one: Primary location (Location)
- Many-to-many: Related to other Characters (via relationships)
- Many-to-many: Related to Events (via timeline)

**Indexes:**
- worldId
- name (text search)
- locationId

**Constraints:**
- Name: 1-100 characters

---

### Entity: Timeline

**Purpose**: Represents a chronological timeline of events in a world

**Fields:**

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | ObjectId | No | auto | Primary key |
| worldId | ObjectId | No | - | Reference to World |
| title | String | No | - | Timeline name |
| description | String | Yes | - | Timeline description |
| startDate | String | Yes | - | Timeline start date (custom format) |
| endDate | String | Yes | - | Timeline end date (custom format) |
| events | Array[ObjectId] | Yes | [] | Array of Event IDs |
| era | String | Yes | - | Era name (e.g., "First Age", "Modern Era") |
| isPublic | Boolean | No | true | Visible in public atlas |
| createdAt | DateTime | No | now() | Creation timestamp |
| updatedAt | DateTime | No | now() | Last update timestamp |

**Relationships:**
- Many-to-one: Belongs to World
- One-to-many: Contains Events

**Indexes:**
- worldId
- title (text search)

---

### Entity: Event

**Purpose**: Represents an event in a timeline

**Fields:**

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | ObjectId | No | auto | Primary key |
| timelineId | ObjectId | No | - | Reference to Timeline |
| worldId | ObjectId | No | - | Reference to World |
| title | String | No | - | Event name |
| description | String | Yes | - | Event description |
| date | String | No | - | Event date (custom format, e.g., "Year 1234", "Spring 567") |
| location | String | Yes | - | Event location description |
| locationId | ObjectId | Yes | - | Reference to specific Location |
| participants | Array[ObjectId] | Yes | [] | Array of Character IDs involved |
| significance | String | Yes | - | Event significance/impact |
| isPublic | Boolean | No | true | Visible in public atlas |
| references | Array[Reference] | Yes | [] | Array of references |
| createdAt | DateTime | No | now() | Creation timestamp |
| updatedAt | DateTime | No | now() | Last update timestamp |

**Relationships:**
- Many-to-one: Belongs to Timeline
- Many-to-one: Belongs to World
- Many-to-one: Location (optional)
- Many-to-many: Involves Characters (via participants)

**Indexes:**
- timelineId
- worldId
- date
- title (text search)

---

### Entity: Document

**Purpose**: Represents a writing document (manuscript, chapter, scene, etc.)

**Fields:**

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | ObjectId | No | auto | Primary key |
| ownerId | ObjectId | No | - | Reference to User |
| worldId | ObjectId | Yes | - | Reference to World (if linked) |
| title | String | No | - | Document title |
| content | String | No | "" | Document content (rich text/HTML) |
| plainText | String | No | "" | Plain text version for search |
| language | String | No | "en" | Language code (en, de) |
| wordCount | Number | No | 0 | Current word count |
| characterCount | Number | No | 0 | Character count |
| type | String | No | "manuscript" | manuscript, chapter, scene, note |
| parentDocumentId | ObjectId | Yes | - | Parent document (for chapters) |
| order | Number | Yes | 0 | Display order (for chapters) |
| status | String | No | "draft" | draft, in-progress, completed, archived |
| metadata | Object | Yes | {} | Custom metadata (genre, POV, etc.) |
| version | Number | No | 1 | Version number |
| history | Array[Version] | Yes | [] | Version history (see Version schema) |
| spellCheckSettings | Object | Yes | {} | Spell check configuration |
| createdAt | DateTime | No | now() | Creation timestamp |
| updatedAt | DateTime | No | now() | Last update timestamp |

**Relationships:**
- Many-to-one: Belongs to User (owner)
- Many-to-one: Belongs to World (optional)
- One-to-many: Contains child Documents (chapters)

**Indexes:**
- ownerId
- worldId
- title (text search)
- plainText (text search, full-text index)
- type
- status

**Constraints:**
- Title: 1-200 characters
- Language must be one of: en, de

---

### Entity: Export

**Purpose**: Represents a document export (ebook, Word, etc.)

**Fields:**

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| id | ObjectId | No | auto | Primary key |
| documentId | ObjectId | No | - | Reference to Document |
| userId | ObjectId | No | - | Reference to User |
| format | String | No | - | epub, mobi, docx |
| fileUrl | String | Yes | - | URL to generated file |
| fileSize | Number | Yes | - | File size in bytes |
| metadata | Object | Yes | {} | Export metadata (title, author, ISBN, etc.) |
| coverImageUrl | String | Yes | - | Cover image URL |
| status | String | No | "pending" | pending, processing, completed, failed |
| errorMessage | String | Yes | - | Error message if failed |
| createdAt | DateTime | No | now() | Creation timestamp |
| completedAt | DateTime | Yes | - | Completion timestamp |

**Relationships:**
- Many-to-one: Belongs to Document
- Many-to-one: Belongs to User

**Indexes:**
- documentId
- userId
- format
- status
- createdAt

---

## Embedded Schemas

### Schema: Reference

**Purpose**: Represents a reference attachment (image, video, link, document)

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| type | String | image, video, link, document |
| url | String | URL to resource |
| title | String | Reference title |
| description | String | Optional description |
| thumbnail | String | Thumbnail URL (for images/videos) |
| uploadedAt | DateTime | Upload timestamp |

**Usage**: Embedded in Country, Region, Character, Event entities

---

### Schema: Relationship

**Purpose**: Represents a relationship between characters

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| characterId | ObjectId | Related character ID |
| relationshipType | String | friend, enemy, family, romantic, mentor, etc. |
| description | String | Relationship description |
| strength | String | strong, moderate, weak |

**Usage**: Embedded in Character.relationships array

---

### Schema: Version

**Purpose**: Represents a document version in history

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| version | Number | Version number |
| content | String | Document content at this version |
| changeSummary | String | Summary of changes |
| changedBy | ObjectId | User who made changes |
| changedAt | DateTime | Change timestamp |

**Usage**: Embedded in Document.history array

---

## Data Relationships Diagram

```
User
  ├── owns → World (one-to-many)
  ├── owns → Document (one-to-many)
  └── collaborates → World (many-to-many via sharedWith)

World
  ├── contains → Country (one-to-many)
  ├── contains → Region (one-to-many)
  ├── contains → Character (one-to-many)
  ├── contains → Timeline (one-to-many)
  └── linked → Document (one-to-many, optional)

Country
  ├── contains → Region (one-to-many)
  └── related → Character (many-to-many)

Character
  ├── related → Character (many-to-many via relationships)
  ├── located → Location (many-to-one)
  └── participates → Event (many-to-many)

Timeline
  └── contains → Event (one-to-many)

Event
  ├── involves → Character (many-to-many)
  └── occurs → Location (many-to-one)

Document
  ├── contains → Document (one-to-many, chapters)
  └── exported → Export (one-to-many)
```

---

## Indexing Strategy

### Text Search Indexes
- World.title
- Country.name
- Region.name
- Character.name
- Event.title
- Document.title
- Document.plainText (full-text search)

### Performance Indexes
- User.email (unique)
- User.username (unique)
- World.ownerId
- World.visibility
- Document.ownerId
- Document.worldId
- Document.status
- Export.documentId
- Export.status

### Compound Indexes
- (worldId, createdAt) - for sorting worlds by creation date
- (ownerId, status) - for filtering user documents by status
- (worldId, type) - for filtering world elements by type

---

## Data Validation Rules

### User
- Email: Valid email format, unique
- Username: 3-30 characters, alphanumeric and underscores only
- Password: Minimum 8 characters, must contain letters and numbers

### World
- Title: 1-100 characters, required
- Visibility: Must be one of: private, shared, public

### Character
- Name: 1-100 characters, required
- Relationships: characterId must reference valid Character

### Document
- Title: 1-200 characters, required
- Language: Must be "en" or "de"
- Content: Maximum 10MB (for performance)

### Export
- Format: Must be one of: epub, mobi, docx
- Document must exist and belong to user

---

## Data Migration Considerations

- All timestamps stored as ISO 8601 strings or DateTime objects
- ObjectId references maintained for relationships
- Soft deletes: Consider adding `deletedAt` field for important entities
- Version tracking: Document versions stored in history array
- Media files: Store URLs, actual files in cloud storage (Azure Blob Storage)

---

## Maintenance

- **Review Frequency**: When new entities added or schema changes
- **Last Updated**: 2025-01-27
- **Next Review**: After initial implementation
- **Maintained By**: Development Team
