# WriterSquire - Use Cases

## Overview

This document describes **what users can do** with WriterSquire. Use cases define features, functionality, and scenarios from a user's perspective, focusing on goals and outcomes rather than implementation steps.

> 📘 **Related Documents**:
> - [userFlow.md](./userFlow.md) - How users accomplish tasks (step-by-step workflows)
> - [dataModel.md](./dataModel.md) - Data structures
> - [appManifest.md](./appManifest.md) - Project overview

---

## Document Purpose

**Use Cases** answer:
- WHAT can users do?
- What features exist?
- What are the inputs and outputs?
- What are success and failure conditions?

**Use this document when:**
- Planning features to implement
- Understanding system capabilities
- Writing API specifications
- Defining acceptance criteria
- Scoping development work

---

## Use Case Template

Each use case follows this structure:

```
### UC-XXX: Use Case Name

**Actor**: Who performs this action
**Goal**: What the user wants to achieve
**Preconditions**: What must be true before starting
**Postconditions**: What is true after success

**Main Success Scenario:**
1. Actor does action
2. System responds
3. ...

**Extensions (Alternative Paths):**
- 2a. If condition: Alternative action
- 3a. If error: Error handling

**Business Rules:**
- Relevant constraints or rules

**Non-Functional Requirements:**
- Performance, security, or other quality requirements
```

---

## Worldbuilding Use Cases

### UC-001: Create World

**Actor**: User (authenticated)

**Goal**: Create a new fictional world for worldbuilding

**Preconditions**:
- User is authenticated
- User has available world slots (based on subscription tier)

**Postconditions**:
- World is created and stored in database
- World has unique ID
- World is set to "private" visibility by default
- User can start adding elements (countries, characters, etc.)

**Main Success Scenario:**
1. User navigates to "My Worlds" page
2. User clicks "Create New World"
3. System displays world creation form
4. User enters world title and description
5. User optionally uploads cover image
6. User sets visibility (private/shared/public)
7. User clicks "Create World"
8. System validates input
9. System creates world
10. System redirects to world detail page
11. User can now add countries, characters, timelines, etc.

**Extensions:**
- 8a. Validation fails: System shows errors, user fixes and retries
- 5a. User skips cover image: World created without cover, can add later
- 7a. User saves as draft: World saved but not fully initialized

**Business Rules:**
- BR-001: World title must be 1-100 characters
- BR-002: Free tier limited to 3 worlds
- BR-003: Pro tier: 50 worlds
- BR-004: Enterprise tier: Unlimited worlds
- BR-005: World title must be unique per user

**Non-Functional Requirements:**
- World creation completes within 1 second
- Cover image upload supports: JPG, PNG, WebP (max 10MB)

---

### UC-002: Add Country to World

**Actor**: User (authenticated, world owner or collaborator)

**Goal**: Add a country to a world

**Preconditions**:
- User is authenticated
- User has access to world (owner or shared access)
- World exists

**Postconditions**:
- Country is created and linked to world
- Country appears in world's country list
- Country can be linked to regions, characters, events

**Main Success Scenario:**
1. User navigates to world detail page
2. User clicks "Add Country"
3. System displays country creation form
4. User enters country name
5. User enters description, capital, population, etc.
6. User optionally uploads map image
7. User adds references (images, videos, links)
8. User clicks "Save Country"
9. System validates input
10. System creates country
11. System displays country in world view

**Extensions:**
- 6a. User skips map: Country created without map, can add later
- 7a. User adds multiple references: All references saved
- 9a. Validation fails: System shows errors, user fixes

**Business Rules:**
- BR-101: Country name must be 1-100 characters
- BR-102: Country name must be unique within world
- BR-103: Map image max size: 10MB
- BR-104: References can be: image, video URL, external link, document

**Non-Functional Requirements:**
- Country creation completes within 1 second
- Image upload processes in background
- References stored as URLs or file references

---

### UC-003: Add Character to World

**Actor**: User (authenticated, world owner or collaborator)

**Goal**: Add a character to a world

**Preconditions**:
- User is authenticated
- User has access to world
- World exists

**Postconditions**:
- Character is created and linked to world
- Character appears in world's character list
- Character can be linked to locations, events, other characters

**Main Success Scenario:**
1. User navigates to world detail page
2. User clicks "Add Character"
3. System displays character creation form
4. User enters character name
5. User enters description, appearance, personality, backstory
6. User optionally uploads portrait image
7. User sets primary location (links to Country/Region)
8. User adds relationships to other characters
9. User adds references (images, videos, links)
10. User clicks "Save Character"
11. System validates input
12. System creates character
13. System displays character in world view

**Extensions:**
- 7a. User skips location: Character created without location link
- 8a. User adds multiple relationships: All relationships saved
- 9a. User adds references: References attached to character

**Business Rules:**
- BR-201: Character name must be 1-100 characters
- BR-202: Character name must be unique within world
- BR-203: Portrait image max size: 5MB
- BR-204: Relationships can be: friend, enemy, family, romantic, mentor, etc.

**Non-Functional Requirements:**
- Character creation completes within 1 second
- Portrait upload processes in background
- Relationship links validated (target characters must exist)

---

### UC-004: Create Timeline

**Actor**: User (authenticated, world owner or collaborator)

**Goal**: Create a chronological timeline for a world

**Preconditions**:
- User is authenticated
- User has access to world
- World exists

**Postconditions**:
- Timeline is created and linked to world
- Timeline appears in world's timeline list
- User can add events to timeline

**Main Success Scenario:**
1. User navigates to world detail page
2. User clicks "Create Timeline"
3. System displays timeline creation form
4. User enters timeline title and description
5. User sets start date and end date (custom format)
6. User optionally sets era name
7. User clicks "Create Timeline"
8. System validates input
9. System creates timeline
10. System displays timeline in world view
11. User can now add events to timeline

**Extensions:**
- 5a. User uses custom date format: System accepts format (e.g., "Year 1234", "Spring 567")
- 6a. User skips era: Timeline created without era designation

**Business Rules:**
- BR-301: Timeline title must be 1-100 characters
- BR-302: Timeline title must be unique within world
- BR-303: End date must be after start date (if both provided)
- BR-304: Date format is flexible (supports custom calendar systems)

**Non-Functional Requirements:**
- Timeline creation completes within 500ms
- Timeline view loads events in chronological order

---

### UC-005: Add Event to Timeline

**Actor**: User (authenticated, world owner or collaborator)

**Goal**: Add an event to a timeline

**Preconditions**:
- User is authenticated
- User has access to world
- Timeline exists

**Postconditions**:
- Event is created and linked to timeline
- Event appears in timeline view at correct chronological position
- Event can be linked to characters and locations

**Main Success Scenario:**
1. User navigates to timeline view
2. User clicks "Add Event"
3. System displays event creation form
4. User enters event title and description
5. User sets event date (custom format)
6. User optionally links to location
7. User optionally links participating characters
8. User adds references (images, videos, links)
9. User clicks "Save Event"
10. System validates input
11. System creates event
12. System displays event in timeline at correct position

**Extensions:**
- 6a. User skips location: Event created without location link
- 7a. User links multiple characters: All character links saved
- 9a. Validation fails: System shows errors

**Business Rules:**
- BR-401: Event title must be 1-100 characters
- BR-402: Event date must be within timeline date range (if timeline has range)
- BR-403: Event can have multiple participating characters
- BR-404: Event can reference one primary location

**Non-Functional Requirements:**
- Event creation completes within 1 second
- Timeline view updates immediately
- Events sorted chronologically

---

### UC-006: Share World

**Actor**: User (authenticated, world owner)

**Goal**: Share a world with other users

**Preconditions**:
- User is authenticated
- User owns world
- World exists

**Postconditions**:
- World visibility updated
- Shared users can access world
- Shared users can edit (if permissions granted)

**Main Success Scenario:**
1. User navigates to world detail page
2. User clicks "Share World"
3. System displays sharing options
4. User selects visibility: private, shared, or public
5. If "shared": User enters email addresses of users to share with
6. User sets permissions (view-only or edit)
7. User clicks "Save Sharing Settings"
8. System validates email addresses
9. System updates world visibility
10. System sends invitation emails (if shared with specific users)
11. System confirms sharing settings saved

**Extensions:**
- 4a. User selects "public": World visible to all users
- 5a. User enters multiple emails: All users added to shared list
- 8a. Invalid email: System shows error, user corrects

**Business Rules:**
- BR-501: Public worlds visible to all authenticated users
- BR-502: Shared worlds visible only to specified users
- BR-503: World owner can always edit
- BR-504: Shared users can edit only if granted permission
- BR-505: Maximum 50 shared users per world (free tier), unlimited (pro/enterprise)

**Non-Functional Requirements:**
- Sharing settings save within 1 second
- Invitation emails sent within 5 seconds
- Shared users see world immediately after accepting invitation

---

### UC-007: View Public World Atlas

**Actor**: Visitor (unauthenticated) or authenticated reader

**Goal**: Explore a shared world through a public atlas-style interface

**Preconditions**:
- World visibility is set to "public"
- Public atlas link exists

**Postconditions**:
- World atlas loads successfully
- Viewer can navigate entries, media, and references

**Main Success Scenario:**
1. Visitor opens the public atlas link
2. System validates world visibility
3. System loads world overview, hierarchy, and media
4. Visitor selects a world entry (country, character, event, etc.)
5. System displays the entry hero, quick stats, lore, and references
6. Visitor navigates to related entries through links
7. Visitor searches the atlas to find entries by name or type

**Extensions:**
- 2a. World is private: System shows "Atlas unavailable"
- 4a. Entry has no description: System shows empty-state guidance
- 5a. Entry has no media: System shows reference bin placeholder

**Business Rules:**
- BR-601: Only worlds with visibility "public" are accessible
- BR-602: Private dynamic elements are excluded from public atlas
- BR-603: Public atlas must not expose edit controls
- BR-604: Classic elements are visible only when their visibility is public

**Non-Functional Requirements:**
- Atlas load time < 2 seconds for standard worlds
- Media thumbnails load progressively without blocking text content

---

## Writing Use Cases

### UC-101: Create Document

**Actor**: User (authenticated)

**Goal**: Create a new writing document

**Preconditions**:
- User is authenticated

**Postconditions**:
- Document is created and stored
- Document is in "draft" status
- User can start writing
- Document linked to world (if specified)

**Main Success Scenario:**
1. User navigates to "My Documents" page
2. User clicks "Create New Document"
3. System displays document creation form
4. User enters document title
5. User selects document type (manuscript, chapter, scene, note)
6. User optionally links to world
7. User selects language (English or German)
8. User clicks "Create Document"
9. System validates input
10. System creates document
11. System opens document in writing editor
12. User can start writing

**Extensions:**
- 6a. User links to world: Document associated with world, can reference world elements
- 7a. User selects language: Spell check configured for that language
- 9a. Validation fails: System shows errors

**Business Rules:**
- BR-601: Document title must be 1-200 characters
- BR-602: Document type determines default structure
- BR-603: Language must be "en" or "de"
- BR-604: Free tier: 10 documents, Pro: 500, Enterprise: Unlimited

**Non-Functional Requirements:**
- Document creation completes within 500ms
- Writing editor loads within 1 second
- Auto-save every 30 seconds

---

### UC-102: Write in Document

**Actor**: User (authenticated, document owner)

**Goal**: Write and edit document content

**Preconditions**:
- User is authenticated
- User owns document or has edit access
- Document exists
- Document is open in writing editor

**Postconditions**:
- Document content updated
- Changes auto-saved
- Word count updated
- Version history updated

**Main Success Scenario:**
1. User types in writing editor
2. System displays content in real-time
3. System performs spell check as user types
4. System highlights spelling errors (red underline)
5. User right-clicks on error to see suggestions
6. User selects suggestion or ignores
7. System auto-saves every 30 seconds
8. System updates word count
9. System updates version history

**Extensions:**
- 3a. Spell check finds error: Error highlighted, suggestions available
- 5a. User ignores error: Error remains, not corrected
- 7a. Network error during auto-save: Changes queued, saved when connection restored

**Business Rules:**
- BR-701: Spell check runs in real-time for selected language
- BR-702: Auto-save interval: 30 seconds
- BR-703: Maximum document size: 10MB
- BR-704: Word count updates in real-time
- BR-705: Version history: Last 50 versions retained

**Non-Functional Requirements:**
- Spell check response time: < 100ms
- Auto-save completes in background without blocking
- Editor remains responsive during typing
- Support for documents up to 100,000 words

---

### UC-103: Spell Check Document

**Actor**: User (authenticated, document owner)

**Goal**: Check and correct spelling errors in document

**Preconditions**:
- User is authenticated
- User owns document
- Document exists and has content
- Document language is set (English or German)

**Postconditions**:
- Spelling errors identified
- User can correct errors
- Document updated with corrections

**Main Success Scenario:**
1. User opens document in writing editor
2. System automatically runs spell check for document language
3. System highlights all spelling errors
4. User clicks on error or uses "Next Error" button
5. System displays suggestions
6. User selects correct spelling
7. System replaces error with correction
8. System updates document
9. System removes error highlight
10. User continues to next error

**Extensions:**
- 4a. User adds word to dictionary: Word added to custom dictionary, not flagged again
- 6a. User ignores error: Error remains, can revisit later
- 3a. No errors found: System shows "No spelling errors" message

**Business Rules:**
- BR-801: Spell check supports English and German
- BR-802: Custom dictionary per user (for character names, world-specific terms)
- BR-803: Spell check runs automatically on document open
- BR-804: User can manually trigger spell check
- BR-805: Grammar checking optional (future feature)

**Non-Functional Requirements:**
- Spell check completes within 2 seconds for 10,000 word document
- Suggestions displayed within 100ms
- Custom dictionary updates immediately

---

### UC-104: Link Document to World Element

**Actor**: User (authenticated, document owner)

**Goal**: Link document to worldbuilding elements (characters, locations, etc.)

**Preconditions**:
- User is authenticated
- User owns document
- Document exists
- World exists and is linked to document
- World has elements (characters, countries, etc.)

**Postconditions**:
- Document linked to world elements
- References available in document
- Elements accessible from document

**Main Success Scenario:**
1. User opens document in writing editor
2. User clicks "Link to World" or "@" mention
3. System displays world element selector
4. User searches for element (character, location, event)
5. User selects element
6. System inserts link/reference in document
7. User can click link to view element details
8. System saves link relationship

**Extensions:**
- 4a. Element not found: User can create new element from document
- 5a. User selects multiple elements: All elements linked
- 7a. User clicks link: Element details shown in sidebar or modal

**Business Rules:**
- BR-901: Document must be linked to world to reference elements
- BR-902: Links are bidirectional (document → element, element → document)
- BR-903: User can link to: characters, countries, regions, events, timelines

**Non-Functional Requirements:**
- Element search completes within 500ms
- Link insertion is instant
- Element details load within 1 second

---

## Publishing Use Cases

### UC-201: Export Document to EPUB

**Actor**: User (authenticated, document owner)

**Goal**: Export document as EPUB ebook format

**Preconditions**:
- User is authenticated
- User owns document
- Document exists and has content
- Document is in "completed" or "draft" status

**Postconditions**:
- EPUB file generated
- EPUB file available for download
- Export record created

**Main Success Scenario:**
1. User opens document
2. User clicks "Export" button
3. System displays export options
4. User selects "EPUB" format
5. User enters metadata (title, author, ISBN, etc.)
6. User optionally uploads cover image
7. User clicks "Generate EPUB"
8. System validates document and metadata
9. System queues export job
10. System processes export (converts content, generates EPUB)
11. System generates EPUB file
12. System provides download link
13. User downloads EPUB file

**Extensions:**
- 6a. User skips cover: EPUB generated without cover
- 8a. Validation fails: System shows errors, user fixes
- 10a. Export fails: System shows error, user can retry

**Business Rules:**
- BR-1001: EPUB must include valid metadata
- BR-1002: Cover image: JPG or PNG, max 2MB, recommended 1600x2560px
- BR-1003: EPUB follows EPUB 3.0 standard
- BR-1004: Export limited to 10 per day (free tier), unlimited (pro/enterprise)

**Non-Functional Requirements:**
- EPUB generation completes within 30 seconds for 100,000 word document
- EPUB file size optimized
- Download available for 7 days

---

### UC-202: Export Document to Word

**Actor**: User (authenticated, document owner)

**Goal**: Export document as Microsoft Word (.docx) format

**Preconditions**:
- User is authenticated
- User owns document
- Document exists and has content

**Postconditions**:
- Word document generated
- Word document available for download
- Export record created

**Main Success Scenario:**
1. User opens document
2. User clicks "Export" button
3. System displays export options
4. User selects "Word Document (.docx)" format
5. User selects formatting options (styles, headers, etc.)
6. User clicks "Generate Word Document"
7. System validates document
8. System converts content to Word format
9. System generates .docx file
10. System provides download link
11. User downloads Word document

**Extensions:**
- 5a. User uses default formatting: Standard Word styles applied
- 8a. Conversion fails: System shows error, user can retry

**Business Rules:**
- BR-1101: Word document follows .docx standard
- BR-1102: Formatting preserved (headings, bold, italic, etc.)
- BR-1103: Export limited to 20 per day (free tier), unlimited (pro/enterprise)

**Non-Functional Requirements:**
- Word generation completes within 10 seconds for 100,000 word document
- Formatting accurately preserved
- Download available for 7 days

---

### UC-203: Export Document to MOBI

**Actor**: User (authenticated, document owner)

**Goal**: Export document as MOBI format for Kindle

**Preconditions**:
- User is authenticated
- User owns document
- Document exists and has content

**Postconditions**:
- MOBI file generated
- MOBI file available for download
- Export record created

**Main Success Scenario:**
1. User opens document
2. User clicks "Export" button
3. System displays export options
4. User selects "MOBI (Kindle)" format
5. User enters metadata
6. User optionally uploads cover image
7. User clicks "Generate MOBI"
8. System validates document
9. System converts EPUB to MOBI (or generates directly)
10. System generates MOBI file
11. System provides download link
12. User downloads MOBI file

**Extensions:**
- 6a. User skips cover: MOBI generated without cover
- 9a. Conversion fails: System shows error, user can retry

**Business Rules:**
- BR-1201: MOBI follows Kindle format requirements
- BR-1202: Cover image required for best results
- BR-1203: Export limited to 10 per day (free tier), unlimited (pro/enterprise)

**Non-Functional Requirements:**
- MOBI generation completes within 45 seconds for 100,000 word document
- MOBI file compatible with Kindle devices
- Download available for 7 days

---

## Feature Matrix

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Worlds | 3 | 50 | Unlimited |
| Documents | 10 | 500 | Unlimited |
| Characters per world | 50 | 500 | Unlimited |
| Spell check languages | English, German | English, German | English, German + Custom |
| Export formats | EPUB, Word | EPUB, Word, MOBI | All formats + Custom |
| Exports per day | 10 | Unlimited | Unlimited |
| World sharing | 5 users | 50 users | Unlimited |
| Storage | 1 GB | 50 GB | Unlimited |
| Custom dictionaries | ❌ | ✅ | ✅ |
| Priority support | ❌ | ✅ | ✅ |
| API access | ❌ | ❌ | ✅ |

---

## Non-Functional Requirements Summary

### Performance
- Page load time: < 2 seconds
- API response time: < 500ms (95th percentile)
- Spell check response: < 100ms
- Export generation: < 30 seconds for 100K words
- Support 1,000 concurrent users per instance

### Security
- HTTPS required for all connections
- Authentication via JWT
- GDPR compliant data handling
- User data encrypted at rest
- Regular security audits

### Availability
- 99.9% uptime SLA for paid plans
- Automated backups every 6 hours
- Disaster recovery plan in place

### Scalability
- Horizontal scaling supported
- Support 100,000 active worlds
- Support 1,000,000 documents
- Support 10,000,000 worldbuilding elements

---

## Maintenance

- **Update Frequency**: When features added or changed
- **Last Updated**: 2025-01-27
- **Next Review**: After each sprint/milestone
- **Maintained By**: Product & Development Team
