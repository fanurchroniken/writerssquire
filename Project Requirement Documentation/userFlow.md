# WriterSquire - User Flows

## Overview

This document describes **how users interact with WriterSquire** through complete workflows. User flows map the step-by-step journey users take to accomplish specific goals, including decision points, system responses, and alternative paths.

> 📘 **Related Documents**:
> - [useCases.md](./useCases.md) - What users can do (features and scenarios)
> - [appManifest.md](./appManifest.md) - Project overview
> - [brandingGuide.md](./brandingGuide.md) - Visual and tonal guidelines

---

## Document Purpose

**User Flows** answer:
- HOW does a user accomplish a task?
- What is the step-by-step interaction sequence?
- What happens at each step?
- Where do users make decisions?
- What are alternative paths?

**Use this document when:**
- Building UI/UX flows
- Implementing multi-step processes
- Understanding user journey
- Identifying edge cases in workflows
- Planning error handling in user context

---

## User Personas

### Primary Personas

#### Fiction Writer
**Profile:**
- Aspiring or published author
- Writing novels, short stories, or other fiction
- Needs: Writing tools, worldbuilding organization, publishing capabilities

**Technical Proficiency**: Medium
**Primary Goals**: 
- Write and organize manuscripts
- Build consistent fictional worlds
- Export works for publishing

#### Worldbuilder
**Profile:**
- Enthusiastic worldbuilder
- Creates detailed fictional universes
- Needs: Rich worldbuilding tools, organization, sharing capabilities

**Technical Proficiency**: Low to Medium
**Primary Goals**:
- Create detailed worlds with interconnected elements
- Share worlds with others
- Reference world elements while writing

#### Collaborative Writer
**Profile:**
- Co-author or writing group member
- Needs: Sharing, collaboration, version control

**Technical Proficiency**: Medium
**Primary Goals**:
- Share worlds with co-authors
- Collaborate on documents
- Maintain consistency across shared works

---

## Core User Flows

### Flow 1: Create and Build a World

**Goal**: Create a new world and add initial worldbuilding elements

**Entry Point**: Dashboard → "Create New World" button

**Preconditions**:
- User is authenticated
- User has available world slots

#### Main Flow

```
1. User clicks "Create New World"
   ↓
2. System displays world creation form
   Input fields:
   - World title (required)
   - Description (optional)
   - Cover image upload (optional)
   - Visibility (private/shared/public)
   ↓
3. User enters world title: "The Realm of Eldoria"
   ↓
4. User enters description: "A fantasy world with..."
   ↓
5. User uploads cover image
   System: Shows image preview, validates format/size
   ↓
6. User selects visibility: "Private"
   ↓
7. User clicks "Create World"
   ↓
8. System validates input
   Checks:
   - Title length (1-100 chars)
   - Image format/size (if provided)
   - User has available slots
   ↓
9. System creates world
   ↓
10. System redirects to world detail page
    Display:
    - World title and description
    - Cover image
    - Empty sections: Countries, Regions, Characters, Timelines
    - "Add" buttons for each section
    ↓
11. User clicks "Add Country"
    ↓
12. System displays country creation form
    ↓
13. User enters country details:
    - Name: "Kingdom of Aetheria"
    - Capital: "Aetheria City"
    - Population: 500000
    - Description: "A prosperous kingdom..."
    ↓
14. User uploads map image
    ↓
15. User adds reference (link to inspiration image)
    ↓
16. User clicks "Save Country"
    ↓
17. System creates country
    ↓
18. System displays country in world view
    ↓
19. User clicks "Add Character"
    ↓
20. System displays character creation form
    ↓
21. User enters character details:
    - Name: "Princess Elara"
    - Description, appearance, personality, backstory
    ↓
22. User links character to location: "Kingdom of Aetheria"
    ↓
23. User uploads character portrait
    ↓
24. User clicks "Save Character"
    ↓
25. System creates character
    ↓
26. System displays character in world view
```

#### Alternative Paths

**Alt 5a**: User skips cover image
```
5a. User clicks "Skip" for cover image
    ↓
System creates world without cover
    ↓
User can add cover later from world settings
```

**Alt 8a**: Validation fails
```
8a. System finds validation errors
    ↓
System highlights errors with red indicators
    ↓
System displays error messages:
  - "Title is required"
  - "Image must be JPG, PNG, or WebP"
  - "You've reached your world limit"
    ↓
User fixes errors
    ↓
Return to step 7
```

**Alt 22a**: User creates location first
```
22a. Character location doesn't exist yet
    ↓
User clicks "Create New Location"
    ↓
System opens location creation in modal
    ↓
User creates location
    ↓
System links character to new location
    ↓
Continue to step 23
```

#### Error Scenarios

**Network Error During Save:**
```
System shows: "Connection lost. Changes saved locally."
User can retry when connection restored
```

**Image Upload Fails:**
```
System shows: "Image upload failed. Please try again."
User can retry upload or continue without image
```

---

### Flow 2: Write Document with Spell Check

**Goal**: Create a document, write content, and use spell checking

**Entry Point**: Dashboard → "Create New Document" button

**Preconditions**:
- User is authenticated

#### Main Flow

```
1. User clicks "Create New Document"
   ↓
2. System displays document creation form
   ↓
3. User enters document title: "Chapter 1: The Beginning"
   ↓
4. User selects document type: "Chapter"
   ↓
5. User optionally links to world: "The Realm of Eldoria"
   ↓
6. User selects language: "English"
   ↓
7. User clicks "Create Document"
   ↓
8. System creates document
   ↓
9. System opens document in writing editor
   Display:
   - Rich text editor toolbar
   - Document content area
   - Spell check indicator (language: English)
   - Word count: 0
   - Auto-save indicator: "Saving..."
   ↓
10. User starts typing
    User types: "The princess walked through the ancient forrest..."
    ↓
11. System performs real-time spell check
    ↓
12. System highlights "forrest" as error (should be "forest")
    Red underline appears under "forrest"
    ↓
13. User right-clicks on "forrest"
    ↓
14. System displays suggestions:
    - "forest" (correct spelling)
    - "Forrest" (proper noun)
    ↓
15. User clicks "forest"
    ↓
16. System replaces "forrest" with "forest"
    ↓
17. System removes error highlight
    ↓
18. User continues writing
    ↓
19. System auto-saves every 30 seconds
    Display: "Saved" indicator appears briefly
    ↓
20. User writes more content
    ↓
21. System updates word count in real-time
    Display: "Word count: 1,234"
    ↓
22. User clicks "Spell Check" button (manual check)
    ↓
23. System scans entire document
    ↓
24. System highlights all errors
    Display: "Found 3 spelling errors"
    ↓
25. User navigates through errors using "Next Error" button
    ↓
26. User corrects each error
    ↓
27. System updates document
    ↓
28. User clicks "Save" (manual save)
    ↓
29. System saves document
    Display: "Document saved successfully"
```

#### Alternative Paths

**Alt 5a**: User links document to world
```
5a. User selects world from dropdown
    ↓
System links document to world
    ↓
Document can now reference world elements
    ↓
User can use "@" mentions to link characters, locations
```

**Alt 12a**: No errors found
```
12a. System finds no spelling errors
    ↓
No highlights appear
    ↓
User continues writing normally
```

**Alt 14a**: User adds word to dictionary
```
14a. User right-clicks on flagged word
    ↓
System shows suggestions
    ↓
User clicks "Add to Dictionary"
    ↓
System adds word to user's custom dictionary
    ↓
Word not flagged in future
    ↓
Useful for character names, world-specific terms
```

**Alt 19a**: Network error during auto-save
```
19a. System attempts auto-save
    ↓
Network connection lost
    ↓
System shows: "Offline. Changes will save when connection restored."
    ↓
System queues changes locally
    ↓
When connection restored:
  System automatically syncs changes
  Display: "All changes saved"
```

#### Error Scenarios

**Spell Check Service Unavailable:**
```
System shows: "Spell check temporarily unavailable. Your writing is still saved."
User can continue writing, spell check resumes when available
```

**Document Too Large:**
```
System shows: "Document exceeds size limit. Please split into multiple documents."
User can create new document and continue
```

---

### Flow 3: Link Document to World Elements

**Goal**: Reference worldbuilding elements (characters, locations) in a document

**Preconditions**:
- User has document open
- Document is linked to a world
- World has elements (characters, countries, etc.)

#### Main Flow

```
1. User is writing in document
   User types: "Princess Elara walked through the"
   ↓
2. User types "@" symbol
   ↓
3. System displays element selector dropdown
   Display:
   - Search box
   - Recent elements
   - Categories: Characters, Locations, Events
   ↓
4. User types "Elara" in search
   ↓
5. System filters and shows matching elements
   Display:
   - "Princess Elara" (Character)
   - "Elara's Castle" (Location)
   ↓
6. User clicks "Princess Elara" (Character)
   ↓
7. System inserts link in document
   Display: "@Princess Elara" (styled as link)
   ↓
8. User continues writing
   User types: " and entered @Aetheria City"
   ↓
9. User types "@" again
   ↓
10. System shows element selector
    ↓
11. User clicks "Kingdom of Aetheria" (Country)
    ↓
12. System inserts link
    ↓
13. User hovers over "@Princess Elara" link
    ↓
14. System shows tooltip with character preview
    Display:
    - Character name
    - Portrait thumbnail
    - Brief description
    - "View Details" link
    ↓
15. User clicks "View Details"
    ↓
16. System opens character detail in sidebar
    Display:
    - Full character profile
    - Relationships
    - Location
    - References
    ↓
17. User reviews character details
    ↓
18. User closes sidebar
    ↓
19. User continues writing with context
```

#### Alternative Paths

**Alt 4a**: Element not found
```
4a. User searches for element that doesn't exist
    ↓
System shows: "No elements found"
    ↓
System shows "Create New" button
    ↓
User clicks "Create New Character"
    ↓
System opens character creation in modal
    ↓
User creates character
    ↓
System links character to document
    ↓
Continue to step 7
```

**Alt 5a**: Multiple matches
```
5a. System finds multiple matching elements
    ↓
System displays list with categories
    ↓
User selects appropriate element
    ↓
Continue to step 7
```

---

### Flow 4: Export Document to EPUB

**Goal**: Export a completed document as EPUB ebook

**Preconditions**:
- User has document with content
- User is authenticated

#### Main Flow

```
1. User opens completed document
   ↓
2. User clicks "Export" button in toolbar
   ↓
3. System displays export options modal
   Display:
   - Format options: EPUB, Word, MOBI
   - Export settings
   ↓
4. User selects "EPUB" format
   ↓
5. System displays EPUB export form
   Input fields:
   - Title (pre-filled from document)
   - Author name
   - ISBN (optional)
   - Publisher (optional)
   - Description
   - Cover image upload
   ↓
6. User enters metadata:
   - Title: "The Realm of Eldoria: Book 1"
   - Author: "John Writer"
   - Description: "A fantasy novel..."
   ↓
7. User uploads cover image
   System: Validates image (JPG/PNG, max 2MB, recommends 1600x2560px)
   ↓
8. User clicks "Generate EPUB"
   ↓
9. System validates inputs
   Checks:
   - Title required
   - Author required
   - Cover image format/size
   - Document has content
   ↓
10. System queues export job
    Display: "Generating EPUB... This may take a moment."
    ↓
11. System processes export
    Actions:
    - Converts document content to EPUB format
    - Applies formatting
    - Embeds cover image
    - Generates table of contents
    - Creates EPUB file
    ↓
12. System completes export
    Display: "EPUB generated successfully!"
    ↓
13. System provides download link
    Display:
    - "Download EPUB" button
    - File size: "2.5 MB"
    - "Download available for 7 days"
    ↓
14. User clicks "Download EPUB"
    ↓
15. System downloads EPUB file
    File: "The_Realm_of_Eldoria_Book_1.epub"
    ↓
16. User opens EPUB in ebook reader
    User verifies formatting, cover, content
```

#### Alternative Paths

**Alt 7a**: User skips cover image
```
7a. User clicks "Skip Cover Image"
    ↓
System allows export without cover
    ↓
EPUB generated with default cover or no cover
    ↓
Continue to step 8
```

**Alt 9a**: Validation fails
```
9a. System finds validation errors
    ↓
System highlights errors:
  - "Title is required"
  - "Cover image must be JPG or PNG"
    ↓
User fixes errors
    ↓
Return to step 8
```

**Alt 11a**: Export fails
```
11a. System encounters error during export
    ↓
System shows: "Export failed. Please try again."
    ↓
System logs error for support
    ↓
User can retry export
```

#### Error Scenarios

**Export Timeout:**
```
System shows: "Export is taking longer than expected. We'll email you when it's ready."
System processes export in background
User receives email with download link when complete
```

**Storage Quota Exceeded:**
```
System shows: "Storage quota exceeded. Please upgrade your plan or delete old exports."
User can upgrade or clean up old exports
```

---

### Flow 5: Share World with Collaborator

**Goal**: Share a world with another user for collaboration

**Preconditions**:
- User owns a world
- User is authenticated

#### Main Flow

```
1. User navigates to world detail page
   ↓
2. User clicks "Share" button
   ↓
3. System displays sharing settings
   Display:
   - Current visibility: "Private"
   - Sharing options: Private, Shared, Public
   - Shared users list (empty)
   ↓
4. User selects "Shared" visibility
   ↓
5. System displays "Add Collaborators" section
   Input: Email address field
   ↓
6. User enters collaborator email: "colleague@example.com"
   ↓
7. User selects permission: "Can Edit"
   Options: "View Only" or "Can Edit"
   ↓
8. User clicks "Add Collaborator"
   ↓
9. System validates email format
   ↓
10. System adds user to shared list
    Display:
    - "colleague@example.com" in shared users list
    - Permission: "Can Edit"
    - Status: "Invitation sent"
    ↓
11. System sends invitation email
    Email contains:
    - Invitation message
    - Link to accept invitation
    - World preview
    ↓
12. System saves sharing settings
    ↓
13. Collaborator receives email
    ↓
14. Collaborator clicks "Accept Invitation"
    ↓
15. System opens world in collaborator's account
    ↓
16. Collaborator can now view/edit world (based on permissions)
```

#### Alternative Paths

**Alt 4a**: User selects "Public"
```
4a. User selects "Public" visibility
    ↓
System shows confirmation: "Make world visible to all users?"
    ↓
User confirms
    ↓
World becomes publicly visible
    ↓
All authenticated users can view world
```

**Alt 9a**: Invalid email
```
9a. System validates email
    ↓
Email format invalid
    ↓
System shows: "Please enter a valid email address"
    ↓
User corrects email
    ↓
Return to step 8
```

**Alt 9b**: User already has access
```
9b. System checks if user already shared
    ↓
User already in shared list
    ↓
System shows: "User already has access"
    ↓
User can update permissions instead
```

---

### Flow 6: Explore Public World Atlas

**Goal**: Browse a publicly shared world as an interactive atlas

**Preconditions**:
- World visibility is set to "Public"
- Visitor has the atlas link

#### Main Flow

```
1. Visitor opens the atlas link
   ↓
2. System checks that the world is public
   ↓
3. System loads the atlas shell
   Display:
   - World title + hero image
   - Navigation hierarchy
   - Quick-stats cards
   ↓
4. Visitor selects an entry from the hierarchy
   ↓
5. System shows the entry:
   - Hero gallery
   - Quick-stats
   - Lore text
   - Hierarchy and connections
   - Reference bin
   ↓
6. Visitor clicks a related entry
   ↓
7. System opens the related entry in the atlas view
   ↓
8. Visitor searches for a topic
   ↓
9. System filters results by name/type
```

#### Alternative Paths

**Alt 2a**: World is private
```
2a. System detects non-public visibility
    ↓
System shows: "Atlas unavailable"
```

**Alt 5a**: Entry missing media
```
5a. Entry has no gallery
    ↓
System shows reference placeholder
```

---

## Edge Cases & Special Scenarios

### Scenario 1: Switching Spell Check Language Mid-Document

**Situation**: User writes document in English, wants to add German section

```
Flow:
1. User is writing in English document
2. User selects text block
3. User clicks "Language" dropdown
4. User selects "German"
5. System applies German spell check to selected text
6. User continues writing in German
7. System checks selected text with German dictionary
8. User can switch back to English for other sections
```

### Scenario 2: Collaborative Editing Conflict

**Situation**: Two users edit same world element simultaneously

```
Flow:
1. User A opens character for editing
2. User B opens same character for editing
3. User A saves changes
4. User B attempts to save
5. System detects conflict
6. System shows: "Character was modified by another user. View changes?"
7. User B views User A's changes
8. User B can:
   - Accept changes and edit again
   - Merge changes
   - Overwrite (with warning)
```

### Scenario 3: Large Document Export

**Situation**: User exports very large document (200,000+ words)

```
Flow:
1. User initiates export
2. System estimates processing time: "This may take 2-3 minutes"
3. System processes export in background
4. System shows progress indicator
5. System sends email when complete
6. User receives email with download link
7. User downloads large file
```

---

## Flow Notation Guide

### Symbols Used
- `→` or `↓`: Next step in sequence
- `(If condition)`: Conditional branch
- `Alt Xa`: Alternative path from step X
- `Display:`: What user sees
- `Input:`: What user provides
- `System:`: Automatic system action

### Decision Points
```
Step N: System checks condition
    ↓ (If condition A)
Path A steps...
    ↓ (If condition B)
Path B steps...
```

---

## Maintenance

- **Update Frequency**: When features change or new flows added
- **Last Updated**: 2025-01-27
- **Next Review**: After major feature releases
- **Maintained By**: Product & Development Team

---

## Related Resources

- [Use Cases](./useCases.md) - What users can do
- [Architecture](./architecture.md) - System design
- [Branding Guide](./brandingGuide.md) - Visual guidelines
