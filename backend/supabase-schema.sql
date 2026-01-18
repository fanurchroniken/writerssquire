-- WriterSquire Complete Database Schema for Supabase
-- Version 3.0 - Full Worldbuilding with Dynamic Element Types
-- This script destroys and recreates all tables - use with caution!

-- ============================================
-- CLEANUP: DROP ALL EXISTING OBJECTS
-- ============================================

-- Drop function first (CASCADE will drop dependent triggers)
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop all tables (CASCADE handles triggers and dependencies)
DROP TABLE IF EXISTS element_media CASCADE;
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS world_elements CASCADE;
DROP TABLE IF EXISTS element_type_fields CASCADE;
DROP TABLE IF EXISTS element_types CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS timelines CASCADE;
DROP TABLE IF EXISTS characters CASCADE;
DROP TABLE IF EXISTS regions CASCADE;
DROP TABLE IF EXISTS countries CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS world_shares CASCADE;
DROP TABLE IF EXISTS worlds CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- EXTENSIONS
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Users table (synced from Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supabase_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  display_name TEXT,
  avatar TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE INDEX idx_users_supabase_id ON users(supabase_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Worlds table
CREATE TABLE worlds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  cover_image TEXT,
  visibility VARCHAR(20) NOT NULL DEFAULT 'private',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_worlds_owner_id ON worlds(owner_id);
CREATE INDEX idx_worlds_visibility ON worlds(visibility);
CREATE INDEX idx_worlds_created_at ON worlds(created_at DESC);

-- World shares (many-to-many relationship between users and worlds)
CREATE TABLE world_shares (
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission VARCHAR(20) NOT NULL DEFAULT 'view',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (world_id, user_id)
);

-- ============================================
-- CLASSIC WORLDBUILDING TABLES
-- ============================================

-- Countries table
CREATE TABLE countries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  capital VARCHAR(100),
  population BIGINT,
  government_type VARCHAR(100),
  culture TEXT,
  history TEXT,
  geography TEXT,
  map_image TEXT,
  flag_image TEXT,
  external_refs JSONB DEFAULT '[]'::jsonb,
  custom_properties JSONB DEFAULT '{}'::jsonb,
  gallery JSONB DEFAULT '[]'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_countries_world_id ON countries(world_id);
CREATE INDEX idx_countries_name ON countries(name);
CREATE INDEX idx_countries_is_public ON countries(is_public);

-- Regions table
CREATE TABLE regions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  country_id UUID REFERENCES countries(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(50),
  geography TEXT,
  climate TEXT,
  population BIGINT,
  map_image TEXT,
  external_refs JSONB DEFAULT '[]'::jsonb,
  custom_properties JSONB DEFAULT '{}'::jsonb,
  gallery JSONB DEFAULT '[]'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_regions_world_id ON regions(world_id);
CREATE INDEX idx_regions_country_id ON regions(country_id);
CREATE INDEX idx_regions_name ON regions(name);
CREATE INDEX idx_regions_is_public ON regions(is_public);

-- Characters table
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  full_name VARCHAR(200),
  aliases TEXT[] DEFAULT ARRAY[]::TEXT[],
  description TEXT,
  appearance TEXT,
  personality TEXT,
  backstory TEXT,
  motivations TEXT,
  role VARCHAR(50),
  status VARCHAR(50) DEFAULT 'alive',
  birth_date VARCHAR(100),
  death_date VARCHAR(100),
  age VARCHAR(50),
  gender VARCHAR(50),
  species VARCHAR(100) DEFAULT 'Human',
  occupation VARCHAR(100),
  portrait_image TEXT,
  location_id UUID,
  location_type VARCHAR(20),
  relationships JSONB DEFAULT '[]'::jsonb,
  external_refs JSONB DEFAULT '[]'::jsonb,
  custom_properties JSONB DEFAULT '{}'::jsonb,
  gallery JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_public BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_characters_world_id ON characters(world_id);
CREATE INDEX idx_characters_name ON characters(name);
CREATE INDEX idx_characters_role ON characters(role);
CREATE INDEX idx_characters_is_public ON characters(is_public);

-- Timelines table
CREATE TABLE timelines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  start_date VARCHAR(100),
  end_date VARCHAR(100),
  era VARCHAR(100),
  sort_order INTEGER DEFAULT 0,
  custom_properties JSONB DEFAULT '{}'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_timelines_world_id ON timelines(world_id);
CREATE INDEX idx_timelines_title ON timelines(title);
CREATE INDEX idx_timelines_is_public ON timelines(is_public);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  timeline_id UUID REFERENCES timelines(id) ON DELETE SET NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  date VARCHAR(100) NOT NULL,
  end_date VARCHAR(100),
  location VARCHAR(200),
  location_id UUID,
  location_type VARCHAR(20),
  significance VARCHAR(50),
  participants UUID[] DEFAULT ARRAY[]::UUID[],
  external_refs JSONB DEFAULT '[]'::jsonb,
  custom_properties JSONB DEFAULT '{}'::jsonb,
  gallery JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  sort_order INTEGER DEFAULT 0,
  is_public BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_world_id ON events(world_id);
CREATE INDEX idx_events_timeline_id ON events(timeline_id);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_is_public ON events(is_public);

-- Locations table
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  country_id UUID REFERENCES countries(id) ON DELETE SET NULL,
  region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50),
  description TEXT,
  population BIGINT,
  climate TEXT,
  notable_features TEXT,
  map_image TEXT,
  external_refs JSONB DEFAULT '[]'::jsonb,
  custom_properties JSONB DEFAULT '{}'::jsonb,
  gallery JSONB DEFAULT '[]'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_locations_world_id ON locations(world_id);
CREATE INDEX idx_locations_country_id ON locations(country_id);
CREATE INDEX idx_locations_region_id ON locations(region_id);
CREATE INDEX idx_locations_is_public ON locations(is_public);

-- ============================================
-- DOCUMENTS/WRITING TABLE
-- ============================================

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  world_id UUID REFERENCES worlds(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  plain_text TEXT NOT NULL DEFAULT '',
  language VARCHAR(2) NOT NULL DEFAULT 'en',
  word_count INTEGER NOT NULL DEFAULT 0,
  character_count INTEGER NOT NULL DEFAULT 0,
  type VARCHAR(20) NOT NULL DEFAULT 'manuscript',
  parent_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  metadata JSONB DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  history JSONB[] DEFAULT ARRAY[]::JSONB[],
  spell_check_settings JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_owner_id ON documents(owner_id);
CREATE INDEX idx_documents_world_id ON documents(world_id);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_status ON documents(status);

-- ============================================
-- DYNAMIC ELEMENT TYPES SYSTEM
-- ============================================

-- Element Types (templates like Currency, Religion, Magic System)
CREATE TABLE element_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  color VARCHAR(7),
  is_system BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(world_id, slug)
);

CREATE INDEX idx_element_types_world_id ON element_types(world_id);
CREATE INDEX idx_element_types_slug ON element_types(slug);

-- Element Type Fields (properties for each element type)
CREATE TABLE element_type_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  element_type_id UUID NOT NULL REFERENCES element_types(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  field_type VARCHAR(50) NOT NULL,
  description TEXT,
  placeholder TEXT,
  is_required BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  show_in_list BOOLEAN DEFAULT true,
  options JSONB,
  default_value TEXT,
  validation JSONB,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(element_type_id, slug)
);

CREATE INDEX idx_element_type_fields_type_id ON element_type_fields(element_type_id);

-- World Elements (instances of element types)
CREATE TABLE world_elements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  element_type_id UUID NOT NULL REFERENCES element_types(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  properties JSONB DEFAULT '{}'::jsonb,
  cover_image TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  relationships JSONB DEFAULT '[]'::jsonb,
  is_private BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_world_elements_world_id ON world_elements(world_id);
CREATE INDEX idx_world_elements_element_type ON world_elements(element_type_id);
CREATE INDEX idx_world_elements_name ON world_elements(name);

-- ============================================
-- MEDIA MANAGEMENT
-- ============================================

-- Media library
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  mime_type VARCHAR(100),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  external_url TEXT,
  file_size BIGINT,
  width INTEGER,
  height INTEGER,
  duration INTEGER,
  alt_text TEXT,
  caption TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_media_world_id ON media(world_id);
CREATE INDEX idx_media_owner_id ON media(owner_id);
CREATE INDEX idx_media_file_type ON media(file_type);

-- Element to Media junction table
CREATE TABLE element_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  element_id UUID NOT NULL,
  element_table VARCHAR(50) NOT NULL,
  media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  is_cover BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(element_id, element_table, media_id)
);

CREATE INDEX idx_element_media_element ON element_media(element_id, element_table);
CREATE INDEX idx_element_media_media ON element_media(media_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create all triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_worlds_updated_at
  BEFORE UPDATE ON worlds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_countries_updated_at
  BEFORE UPDATE ON countries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regions_updated_at
  BEFORE UPDATE ON regions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_characters_updated_at
  BEFORE UPDATE ON characters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timelines_updated_at
  BEFORE UPDATE ON timelines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_element_types_updated_at
  BEFORE UPDATE ON element_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_element_type_fields_updated_at
  BEFORE UPDATE ON element_type_fields
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_world_elements_updated_at
  BEFORE UPDATE ON world_elements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_updated_at
  BEFORE UPDATE ON media
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SYSTEM ELEMENT TYPE TEMPLATES
-- ============================================

INSERT INTO element_types (id, world_id, name, slug, description, icon, color, is_system, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', NULL, 'Currency', 'currency', 'Monetary systems and currencies used in your world', '💰', '#F59E0B', true, 1),
  ('00000000-0000-0000-0000-000000000002', NULL, 'Religion', 'religion', 'Faiths, beliefs, and religious organizations', '⛪', '#8B5CF6', true, 2),
  ('00000000-0000-0000-0000-000000000003', NULL, 'Magic System', 'magic-system', 'Systems of magic, supernatural abilities, or technology', '✨', '#EC4899', true, 3),
  ('00000000-0000-0000-0000-000000000004', NULL, 'Species', 'species', 'Races, species, and creatures', '🐉', '#10B981', true, 4),
  ('00000000-0000-0000-0000-000000000005', NULL, 'Organization', 'organization', 'Guilds, factions, governments, and groups', '🏛️', '#3B82F6', true, 5),
  ('00000000-0000-0000-0000-000000000006', NULL, 'Item', 'item', 'Important objects, artifacts, and equipment', '⚔️', '#EF4444', true, 6),
  ('00000000-0000-0000-0000-000000000007', NULL, 'Language', 'language', 'Languages and writing systems', '📜', '#6366F1', true, 7),
  ('00000000-0000-0000-0000-000000000008', NULL, 'Culture', 'culture', 'Cultural groups, traditions, and customs', '🎭', '#F97316', true, 8),
  ('00000000-0000-0000-0000-000000000009', NULL, 'Technology', 'technology', 'Technological innovations and inventions', '⚙️', '#64748B', true, 9),
  ('00000000-0000-0000-0000-000000000010', NULL, 'Myth/Legend', 'myth-legend', 'Myths, legends, and folklore', '📖', '#A855F7', true, 10),
  ('00000000-0000-0000-0000-000000000011', NULL, 'Flora', 'flora', 'Plants, herbs, and vegetation', '🌿', '#22C55E', true, 11),
  ('00000000-0000-0000-0000-000000000012', NULL, 'Fauna', 'fauna', 'Animals, beasts, and creatures', '🦁', '#EAB308', true, 12),
  ('00000000-0000-0000-0000-000000000013', NULL, 'Material', 'material', 'Resources, materials, and substances', '💎', '#06B6D4', true, 13),
  ('00000000-0000-0000-0000-000000000014', NULL, 'Landmark', 'landmark', 'Notable geographical or architectural features', '🗻', '#78716C', true, 14),
  ('00000000-0000-0000-0000-000000000015', NULL, 'Conflict', 'conflict', 'Wars, battles, and conflicts', '⚔️', '#DC2626', true, 15);

-- ============================================
-- FIELD DEFINITIONS FOR SYSTEM TEMPLATES
-- ============================================

-- Currency fields
INSERT INTO element_type_fields (element_type_id, name, slug, field_type, description, placeholder, is_required, is_featured, show_in_list, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Symbol', 'symbol', 'text', 'Currency symbol (e.g., $, €, ¥)', '$', false, true, true, 1),
  ('00000000-0000-0000-0000-000000000001', 'Issuing Authority', 'issuing_authority', 'text', 'Who issues this currency', 'Royal Treasury', false, true, true, 2),
  ('00000000-0000-0000-0000-000000000001', 'Material', 'material', 'text', 'What is the currency made of', 'Gold, Silver, Paper', false, false, true, 3),
  ('00000000-0000-0000-0000-000000000001', 'Subdivisions', 'subdivisions', 'textarea', 'Smaller denominations', '100 copper = 1 silver', false, false, false, 4),
  ('00000000-0000-0000-0000-000000000001', 'Exchange Rate', 'exchange_rate', 'textarea', 'How it compares to other currencies', '', false, false, false, 5),
  ('00000000-0000-0000-0000-000000000001', 'History', 'history', 'textarea', 'Origin and history of the currency', '', false, false, false, 6),
  ('00000000-0000-0000-0000-000000000001', 'Image', 'image', 'image', 'Currency appearance', '', false, false, false, 7);

-- Religion fields
INSERT INTO element_type_fields (element_type_id, name, slug, field_type, description, placeholder, is_required, is_featured, show_in_list, options, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000002', 'Type', 'type', 'select', 'Type of religion', '', false, true, true, '[{"value": "monotheistic", "label": "Monotheistic"}, {"value": "polytheistic", "label": "Polytheistic"}, {"value": "animistic", "label": "Animistic"}, {"value": "philosophical", "label": "Philosophical"}, {"value": "cult", "label": "Cult"}, {"value": "other", "label": "Other"}]', 1),
  ('00000000-0000-0000-0000-000000000002', 'Deity/Deities', 'deities', 'textarea', 'Gods or central figures', '', false, true, true, NULL, 2),
  ('00000000-0000-0000-0000-000000000002', 'Holy Text', 'holy_text', 'text', 'Sacred scriptures or texts', '', false, false, true, NULL, 3),
  ('00000000-0000-0000-0000-000000000002', 'Practices', 'practices', 'textarea', 'Religious practices and rituals', '', false, false, false, NULL, 4),
  ('00000000-0000-0000-0000-000000000002', 'Beliefs', 'beliefs', 'textarea', 'Core beliefs and tenets', '', false, false, false, NULL, 5),
  ('00000000-0000-0000-0000-000000000002', 'Holy Sites', 'holy_sites', 'textarea', 'Important religious locations', '', false, false, false, NULL, 6),
  ('00000000-0000-0000-0000-000000000002', 'Symbol/Icon', 'symbol', 'image', 'Religious symbol', '', false, false, false, NULL, 7),
  ('00000000-0000-0000-0000-000000000002', 'Followers', 'followers', 'text', 'Who follows this religion', '', false, false, true, NULL, 8);

-- Magic System fields
INSERT INTO element_type_fields (element_type_id, name, slug, field_type, description, placeholder, is_required, is_featured, show_in_list, options, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000003', 'Type', 'type', 'select', 'Classification of magic system', '', false, true, true, '[{"value": "hard", "label": "Hard Magic (rule-based)"}, {"value": "soft", "label": "Soft Magic (mysterious)"}, {"value": "hybrid", "label": "Hybrid"}, {"value": "technology", "label": "Magitech"}, {"value": "divine", "label": "Divine/Religious"}]', 1),
  ('00000000-0000-0000-0000-000000000003', 'Source', 'source', 'text', 'Where magic comes from', 'Mana, Divine, Nature', false, true, true, NULL, 2),
  ('00000000-0000-0000-0000-000000000003', 'Limitations', 'limitations', 'textarea', 'Rules and restrictions', '', false, false, false, NULL, 3),
  ('00000000-0000-0000-0000-000000000003', 'Cost', 'cost', 'textarea', 'What using magic costs', '', false, false, false, NULL, 4),
  ('00000000-0000-0000-0000-000000000003', 'Schools/Types', 'schools', 'textarea', 'Different branches or types', '', false, false, false, NULL, 5),
  ('00000000-0000-0000-0000-000000000003', 'Practitioners', 'practitioners', 'text', 'Who can use this magic', '', false, false, true, NULL, 6),
  ('00000000-0000-0000-0000-000000000003', 'Training', 'training', 'textarea', 'How one learns this magic', '', false, false, false, NULL, 7);

-- Species fields
INSERT INTO element_type_fields (element_type_id, name, slug, field_type, description, placeholder, is_required, is_featured, show_in_list, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000004', 'Classification', 'classification', 'text', 'Biological classification', 'Humanoid, Beast, Undead', false, true, true, 1),
  ('00000000-0000-0000-0000-000000000004', 'Habitat', 'habitat', 'text', 'Where they live', '', false, true, true, 2),
  ('00000000-0000-0000-0000-000000000004', 'Lifespan', 'lifespan', 'text', 'Typical lifespan', '', false, false, true, 3),
  ('00000000-0000-0000-0000-000000000004', 'Physical Traits', 'physical_traits', 'textarea', 'Physical characteristics', '', false, false, false, 4),
  ('00000000-0000-0000-0000-000000000004', 'Abilities', 'abilities', 'textarea', 'Special abilities or traits', '', false, false, false, 5),
  ('00000000-0000-0000-0000-000000000004', 'Culture', 'culture', 'textarea', 'Cultural characteristics', '', false, false, false, 6),
  ('00000000-0000-0000-0000-000000000004', 'Diet', 'diet', 'text', 'What they eat', '', false, false, false, 7),
  ('00000000-0000-0000-0000-000000000004', 'Population', 'population', 'text', 'Estimated population', '', false, false, true, 8);

-- Organization fields
INSERT INTO element_type_fields (element_type_id, name, slug, field_type, description, placeholder, is_required, is_featured, show_in_list, options, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000005', 'Type', 'type', 'select', 'Type of organization', '', false, true, true, '[{"value": "government", "label": "Government"}, {"value": "military", "label": "Military"}, {"value": "guild", "label": "Guild"}, {"value": "religious", "label": "Religious"}, {"value": "criminal", "label": "Criminal"}, {"value": "secret", "label": "Secret Society"}, {"value": "merchant", "label": "Merchant/Trade"}, {"value": "academic", "label": "Academic"}, {"value": "other", "label": "Other"}]', 1),
  ('00000000-0000-0000-0000-000000000005', 'Motto', 'motto', 'text', 'Official motto or slogan', '', false, false, true, NULL, 2),
  ('00000000-0000-0000-0000-000000000005', 'Founding Date', 'founding_date', 'text', 'When it was founded', '', false, false, true, NULL, 3),
  ('00000000-0000-0000-0000-000000000005', 'Leader', 'leader', 'text', 'Current leader', '', false, true, true, NULL, 4),
  ('00000000-0000-0000-0000-000000000005', 'Headquarters', 'headquarters', 'text', 'Main base of operations', '', false, false, true, NULL, 5),
  ('00000000-0000-0000-0000-000000000005', 'Goals', 'goals', 'textarea', 'Primary objectives', '', false, false, false, NULL, 6),
  ('00000000-0000-0000-0000-000000000005', 'Structure', 'structure', 'textarea', 'Organizational hierarchy', '', false, false, false, NULL, 7),
  ('00000000-0000-0000-0000-000000000005', 'Members', 'members', 'text', 'Estimated membership', '', false, false, true, NULL, 8),
  ('00000000-0000-0000-0000-000000000005', 'Banner/Logo', 'banner', 'image', 'Official symbol or banner', '', false, false, false, NULL, 9),
  ('00000000-0000-0000-0000-000000000005', 'Allies', 'allies', 'textarea', 'Allied organizations', '', false, false, false, NULL, 10),
  ('00000000-0000-0000-0000-000000000005', 'Enemies', 'enemies', 'textarea', 'Rival organizations', '', false, false, false, NULL, 11);

-- Item fields
INSERT INTO element_type_fields (element_type_id, name, slug, field_type, description, placeholder, is_required, is_featured, show_in_list, options, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000006', 'Type', 'type', 'select', 'Type of item', '', false, true, true, '[{"value": "weapon", "label": "Weapon"}, {"value": "armor", "label": "Armor"}, {"value": "artifact", "label": "Artifact"}, {"value": "tool", "label": "Tool"}, {"value": "jewelry", "label": "Jewelry"}, {"value": "document", "label": "Document"}, {"value": "consumable", "label": "Consumable"}, {"value": "clothing", "label": "Clothing"}, {"value": "other", "label": "Other"}]', 1),
  ('00000000-0000-0000-0000-000000000006', 'Rarity', 'rarity', 'select', 'How rare is this item', '', false, true, true, '[{"value": "common", "label": "Common"}, {"value": "uncommon", "label": "Uncommon"}, {"value": "rare", "label": "Rare"}, {"value": "very_rare", "label": "Very Rare"}, {"value": "legendary", "label": "Legendary"}, {"value": "unique", "label": "Unique"}]', 2),
  ('00000000-0000-0000-0000-000000000006', 'Material', 'material', 'text', 'What it is made of', '', false, false, true, NULL, 3),
  ('00000000-0000-0000-0000-000000000006', 'Creator', 'creator', 'text', 'Who made it', '', false, false, true, NULL, 4),
  ('00000000-0000-0000-0000-000000000006', 'Current Owner', 'owner', 'text', 'Who possesses it', '', false, false, true, NULL, 5),
  ('00000000-0000-0000-0000-000000000006', 'Properties', 'properties', 'textarea', 'Magical properties or abilities', '', false, false, false, NULL, 6),
  ('00000000-0000-0000-0000-000000000006', 'History', 'history', 'textarea', 'History of the item', '', false, false, false, NULL, 7),
  ('00000000-0000-0000-0000-000000000006', 'Value', 'value', 'text', 'Monetary or cultural value', '', false, false, true, NULL, 8);

-- Language fields
INSERT INTO element_type_fields (element_type_id, name, slug, field_type, description, placeholder, is_required, is_featured, show_in_list, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000007', 'Language Family', 'family', 'text', 'Related language group', '', false, true, true, 1),
  ('00000000-0000-0000-0000-000000000007', 'Speakers', 'speakers', 'text', 'Who speaks this language', '', false, true, true, 2),
  ('00000000-0000-0000-0000-000000000007', 'Writing System', 'writing_system', 'text', 'Type of script', 'Alphabetic, Logographic, Runic', false, false, true, 3),
  ('00000000-0000-0000-0000-000000000007', 'Script Sample', 'script_sample', 'image', 'Example of the writing', '', false, false, false, 4),
  ('00000000-0000-0000-0000-000000000007', 'Common Phrases', 'common_phrases', 'textarea', 'Example phrases and translations', '', false, false, false, 5),
  ('00000000-0000-0000-0000-000000000007', 'Origin', 'origin', 'textarea', 'History and origin', '', false, false, false, 6);

-- Culture fields
INSERT INTO element_type_fields (element_type_id, name, slug, field_type, description, placeholder, is_required, is_featured, show_in_list, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000008', 'Region', 'region', 'text', 'Geographic area', '', false, true, true, 1),
  ('00000000-0000-0000-0000-000000000008', 'Traditions', 'traditions', 'textarea', 'Cultural traditions', '', false, false, false, 2),
  ('00000000-0000-0000-0000-000000000008', 'Values', 'values', 'textarea', 'Core values and beliefs', '', false, false, false, 3),
  ('00000000-0000-0000-0000-000000000008', 'Customs', 'customs', 'textarea', 'Daily customs and practices', '', false, false, false, 4),
  ('00000000-0000-0000-0000-000000000008', 'Art & Music', 'art_music', 'textarea', 'Artistic expressions', '', false, false, false, 5),
  ('00000000-0000-0000-0000-000000000008', 'Cuisine', 'cuisine', 'textarea', 'Food and dining customs', '', false, false, false, 6),
  ('00000000-0000-0000-0000-000000000008', 'Clothing', 'clothing', 'textarea', 'Traditional dress', '', false, false, false, 7),
  ('00000000-0000-0000-0000-000000000008', 'Festivals', 'festivals', 'textarea', 'Important celebrations', '', false, false, false, 8);

-- Technology fields
INSERT INTO element_type_fields (element_type_id, name, slug, field_type, description, placeholder, is_required, is_featured, show_in_list, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000009', 'Era', 'era', 'text', 'Time period of invention', '', false, true, true, 1),
  ('00000000-0000-0000-0000-000000000009', 'Inventor', 'inventor', 'text', 'Who created it', '', false, false, true, 2),
  ('00000000-0000-0000-0000-000000000009', 'Function', 'function', 'textarea', 'What it does', '', false, false, false, 3),
  ('00000000-0000-0000-0000-000000000009', 'Components', 'components', 'textarea', 'What it is made of', '', false, false, false, 4),
  ('00000000-0000-0000-0000-000000000009', 'Availability', 'availability', 'text', 'How common/rare', '', false, true, true, 5),
  ('00000000-0000-0000-0000-000000000009', 'Impact', 'impact', 'textarea', 'Effect on society', '', false, false, false, 6);

-- Myth/Legend fields
INSERT INTO element_type_fields (element_type_id, name, slug, field_type, description, placeholder, is_required, is_featured, show_in_list, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000010', 'Origin', 'origin', 'text', 'Where the legend comes from', '', false, true, true, 1),
  ('00000000-0000-0000-0000-000000000010', 'Key Figures', 'key_figures', 'textarea', 'Important characters in the myth', '', false, false, false, 2),
  ('00000000-0000-0000-0000-000000000010', 'Moral/Lesson', 'moral', 'textarea', 'What the story teaches', '', false, false, false, 3),
  ('00000000-0000-0000-0000-000000000010', 'Variations', 'variations', 'textarea', 'Different versions', '', false, false, false, 4),
  ('00000000-0000-0000-0000-000000000010', 'Truth', 'truth', 'textarea', 'What parts are actually true', '', false, false, false, 5);

-- Flora fields
INSERT INTO element_type_fields (element_type_id, name, slug, field_type, description, placeholder, is_required, is_featured, show_in_list, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000011', 'Habitat', 'habitat', 'text', 'Where it grows', '', false, true, true, 1),
  ('00000000-0000-0000-0000-000000000011', 'Appearance', 'appearance', 'textarea', 'What it looks like', '', false, false, false, 2),
  ('00000000-0000-0000-0000-000000000011', 'Properties', 'properties', 'textarea', 'Medicinal or magical properties', '', false, false, false, 3),
  ('00000000-0000-0000-0000-000000000011', 'Uses', 'uses', 'textarea', 'How it is used', '', false, true, true, 4),
  ('00000000-0000-0000-0000-000000000011', 'Rarity', 'rarity', 'text', 'How common/rare', '', false, false, true, 5);

-- Fauna fields
INSERT INTO element_type_fields (element_type_id, name, slug, field_type, description, placeholder, is_required, is_featured, show_in_list, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000012', 'Habitat', 'habitat', 'text', 'Where it lives', '', false, true, true, 1),
  ('00000000-0000-0000-0000-000000000012', 'Diet', 'diet', 'text', 'What it eats', '', false, false, true, 2),
  ('00000000-0000-0000-0000-000000000012', 'Behavior', 'behavior', 'textarea', 'How it behaves', '', false, false, false, 3),
  ('00000000-0000-0000-0000-000000000012', 'Abilities', 'abilities', 'textarea', 'Special abilities', '', false, false, false, 4),
  ('00000000-0000-0000-0000-000000000012', 'Danger Level', 'danger_level', 'text', 'How dangerous', '', false, true, true, 5),
  ('00000000-0000-0000-0000-000000000012', 'Uses', 'uses', 'textarea', 'How it is used by people', '', false, false, false, 6);

-- Material fields
INSERT INTO element_type_fields (element_type_id, name, slug, field_type, description, placeholder, is_required, is_featured, show_in_list, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000013', 'Source', 'source', 'text', 'Where it comes from', '', false, true, true, 1),
  ('00000000-0000-0000-0000-000000000013', 'Properties', 'properties', 'textarea', 'Physical properties', '', false, false, false, 2),
  ('00000000-0000-0000-0000-000000000013', 'Uses', 'uses', 'textarea', 'What it is used for', '', false, true, true, 3),
  ('00000000-0000-0000-0000-000000000013', 'Value', 'value', 'text', 'Economic value', '', false, false, true, 4),
  ('00000000-0000-0000-0000-000000000013', 'Rarity', 'rarity', 'text', 'How common/rare', '', false, false, true, 5);

-- Landmark fields
INSERT INTO element_type_fields (element_type_id, name, slug, field_type, description, placeholder, is_required, is_featured, show_in_list, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000014', 'Location', 'location', 'text', 'Where it is located', '', false, true, true, 1),
  ('00000000-0000-0000-0000-000000000014', 'Type', 'type', 'text', 'Natural or constructed', '', false, true, true, 2),
  ('00000000-0000-0000-0000-000000000014', 'History', 'history', 'textarea', 'Historical significance', '', false, false, false, 3),
  ('00000000-0000-0000-0000-000000000014', 'Legends', 'legends', 'textarea', 'Associated myths', '', false, false, false, 4),
  ('00000000-0000-0000-0000-000000000014', 'Current State', 'current_state', 'text', 'Condition today', '', false, false, true, 5);

-- Conflict fields
INSERT INTO element_type_fields (element_type_id, name, slug, field_type, description, placeholder, is_required, is_featured, show_in_list, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000015', 'Type', 'type', 'text', 'War, battle, dispute', '', false, true, true, 1),
  ('00000000-0000-0000-0000-000000000015', 'Parties', 'parties', 'textarea', 'Who was involved', '', false, true, true, 2),
  ('00000000-0000-0000-0000-000000000015', 'Cause', 'cause', 'textarea', 'What started it', '', false, false, false, 3),
  ('00000000-0000-0000-0000-000000000015', 'Duration', 'duration', 'text', 'How long it lasted', '', false, false, true, 4),
  ('00000000-0000-0000-0000-000000000015', 'Outcome', 'outcome', 'textarea', 'How it ended', '', false, false, false, 5),
  ('00000000-0000-0000-0000-000000000015', 'Consequences', 'consequences', 'textarea', 'Long-term effects', '', false, false, false, 6),
  ('00000000-0000-0000-0000-000000000015', 'Key Battles', 'key_battles', 'textarea', 'Important engagements', '', false, false, false, 7);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE worlds ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE element_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE element_type_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE element_media ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = supabase_id);

CREATE POLICY "Users can create own data" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = supabase_id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = supabase_id);

-- Worlds policies
CREATE POLICY "Users can read own worlds" ON worlds
  FOR SELECT USING (
    owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
    OR id IN (SELECT world_id FROM world_shares WHERE user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text))
    OR visibility = 'public'
  );

CREATE POLICY "Users can create own worlds" ON worlds
  FOR INSERT WITH CHECK (owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text));

CREATE POLICY "Users can update own worlds" ON worlds
  FOR UPDATE USING (owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text));

CREATE POLICY "Users can delete own worlds" ON worlds
  FOR DELETE USING (owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text));

-- Documents policies
CREATE POLICY "Users can read own documents" ON documents
  FOR SELECT USING (owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text));

CREATE POLICY "Users can create own documents" ON documents
  FOR INSERT WITH CHECK (owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text));

CREATE POLICY "Users can update own documents" ON documents
  FOR UPDATE USING (owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text));

CREATE POLICY "Users can delete own documents" ON documents
  FOR DELETE USING (owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text));

-- World shares policies
CREATE POLICY "Users can read world shares" ON world_shares
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
    OR world_id IN (SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text))
  );

CREATE POLICY "World owners can manage shares" ON world_shares
  FOR ALL USING (world_id IN (SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)));

-- Countries policies
CREATE POLICY "Users can read world countries" ON countries
  FOR SELECT USING (
    world_id IN (
      SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
      UNION SELECT world_id FROM world_shares WHERE user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
      UNION SELECT id FROM worlds WHERE visibility = 'public'
    )
  );

CREATE POLICY "Users can create world countries" ON countries
  FOR INSERT WITH CHECK (
    world_id IN (SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text))
    OR world_id IN (SELECT world_id FROM world_shares WHERE user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text) AND permission = 'edit')
  );

CREATE POLICY "Users can update world countries" ON countries
  FOR UPDATE USING (
    world_id IN (SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text))
    OR world_id IN (SELECT world_id FROM world_shares WHERE user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text) AND permission = 'edit')
  );

CREATE POLICY "Users can delete world countries" ON countries
  FOR DELETE USING (world_id IN (SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)));

-- Regions policies
CREATE POLICY "Users can read world regions" ON regions
  FOR SELECT USING (
    world_id IN (
      SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
      UNION SELECT world_id FROM world_shares WHERE user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
      UNION SELECT id FROM worlds WHERE visibility = 'public'
    )
  );

CREATE POLICY "Users can create world regions" ON regions
  FOR INSERT WITH CHECK (
    world_id IN (SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text))
    OR world_id IN (SELECT world_id FROM world_shares WHERE user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text) AND permission = 'edit')
  );

CREATE POLICY "Users can update world regions" ON regions
  FOR UPDATE USING (
    world_id IN (SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text))
    OR world_id IN (SELECT world_id FROM world_shares WHERE user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text) AND permission = 'edit')
  );

CREATE POLICY "Users can delete world regions" ON regions
  FOR DELETE USING (world_id IN (SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)));

-- Characters policies
CREATE POLICY "Users can read world characters" ON characters
  FOR SELECT USING (
    world_id IN (
      SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
      UNION SELECT world_id FROM world_shares WHERE user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
      UNION SELECT id FROM worlds WHERE visibility = 'public'
    )
  );

CREATE POLICY "Users can create world characters" ON characters
  FOR INSERT WITH CHECK (
    world_id IN (SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text))
    OR world_id IN (SELECT world_id FROM world_shares WHERE user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text) AND permission = 'edit')
  );

CREATE POLICY "Users can update world characters" ON characters
  FOR UPDATE USING (
    world_id IN (SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text))
    OR world_id IN (SELECT world_id FROM world_shares WHERE user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text) AND permission = 'edit')
  );

CREATE POLICY "Users can delete world characters" ON characters
  FOR DELETE USING (world_id IN (SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)));

-- Timelines policies
CREATE POLICY "Users can read world timelines" ON timelines
  FOR SELECT USING (
    world_id IN (
      SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
      UNION SELECT world_id FROM world_shares WHERE user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
      UNION SELECT id FROM worlds WHERE visibility = 'public'
    )
  );

CREATE POLICY "Users can create world timelines" ON timelines
  FOR INSERT WITH CHECK (
    world_id IN (SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text))
    OR world_id IN (SELECT world_id FROM world_shares WHERE user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text) AND permission = 'edit')
  );

CREATE POLICY "Users can update world timelines" ON timelines
  FOR UPDATE USING (
    world_id IN (SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text))
    OR world_id IN (SELECT world_id FROM world_shares WHERE user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text) AND permission = 'edit')
  );

CREATE POLICY "Users can delete world timelines" ON timelines
  FOR DELETE USING (world_id IN (SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)));

-- Events policies
CREATE POLICY "Users can read world events" ON events
  FOR SELECT USING (
    world_id IN (
      SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
      UNION SELECT world_id FROM world_shares WHERE user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
      UNION SELECT id FROM worlds WHERE visibility = 'public'
    )
  );

CREATE POLICY "Users can create world events" ON events
  FOR INSERT WITH CHECK (
    world_id IN (SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text))
    OR world_id IN (SELECT world_id FROM world_shares WHERE user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text) AND permission = 'edit')
  );

CREATE POLICY "Users can update world events" ON events
  FOR UPDATE USING (
    world_id IN (SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text))
    OR world_id IN (SELECT world_id FROM world_shares WHERE user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text) AND permission = 'edit')
  );

CREATE POLICY "Users can delete world events" ON events
  FOR DELETE USING (world_id IN (SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)));

-- Locations policies
CREATE POLICY "Users can read world locations" ON locations
  FOR SELECT USING (
    world_id IN (
      SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
      UNION SELECT world_id FROM world_shares WHERE user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
      UNION SELECT id FROM worlds WHERE visibility = 'public'
    )
  );

CREATE POLICY "Users can create world locations" ON locations
  FOR INSERT WITH CHECK (
    world_id IN (SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text))
    OR world_id IN (SELECT world_id FROM world_shares WHERE user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text) AND permission = 'edit')
  );

CREATE POLICY "Users can update world locations" ON locations
  FOR UPDATE USING (
    world_id IN (SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text))
    OR world_id IN (SELECT world_id FROM world_shares WHERE user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text) AND permission = 'edit')
  );

CREATE POLICY "Users can delete world locations" ON locations
  FOR DELETE USING (world_id IN (SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)));

-- Element types policies
CREATE POLICY "Anyone can read system element types" ON element_types
  FOR SELECT USING (is_system = true OR world_id IS NULL);

CREATE POLICY "Users can read world element types" ON element_types
  FOR SELECT USING (
    world_id IN (
      SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
      UNION SELECT world_id FROM world_shares WHERE user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
    )
  );

CREATE POLICY "Users can create world element types" ON element_types
  FOR INSERT WITH CHECK (
    world_id IN (SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text))
  );

CREATE POLICY "Users can update world element types" ON element_types
  FOR UPDATE USING (
    is_system = false AND
    world_id IN (SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text))
  );

CREATE POLICY "Users can delete world element types" ON element_types
  FOR DELETE USING (
    is_system = false AND
    world_id IN (SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text))
  );

-- Element type fields policies
CREATE POLICY "Anyone can read system element type fields" ON element_type_fields
  FOR SELECT USING (
    element_type_id IN (SELECT id FROM element_types WHERE is_system = true OR world_id IS NULL)
  );

CREATE POLICY "Users can read world element type fields" ON element_type_fields
  FOR SELECT USING (
    element_type_id IN (
      SELECT id FROM element_types WHERE world_id IN (
        SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
        UNION SELECT world_id FROM world_shares WHERE user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
      )
    )
  );

CREATE POLICY "Users can manage world element type fields" ON element_type_fields
  FOR ALL USING (
    element_type_id IN (
      SELECT id FROM element_types WHERE 
        is_system = false AND
        world_id IN (SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text))
    )
  );

-- World elements policies
CREATE POLICY "Users can read world elements" ON world_elements
  FOR SELECT USING (
    world_id IN (
      SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
      UNION SELECT world_id FROM world_shares WHERE user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
      UNION SELECT id FROM worlds WHERE visibility = 'public'
    )
  );

CREATE POLICY "Users can create world elements" ON world_elements
  FOR INSERT WITH CHECK (
    world_id IN (SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text))
    OR world_id IN (SELECT world_id FROM world_shares WHERE user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text) AND permission = 'edit')
  );

CREATE POLICY "Users can update world elements" ON world_elements
  FOR UPDATE USING (
    world_id IN (SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text))
    OR world_id IN (SELECT world_id FROM world_shares WHERE user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text) AND permission = 'edit')
  );

CREATE POLICY "Users can delete world elements" ON world_elements
  FOR DELETE USING (world_id IN (SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)));

-- Media policies
CREATE POLICY "Users can read media" ON media
  FOR SELECT USING (
    world_id IN (
      SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
      UNION SELECT world_id FROM world_shares WHERE user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
      UNION SELECT id FROM worlds WHERE visibility = 'public'
    )
  );

CREATE POLICY "Users can create media" ON media
  FOR INSERT WITH CHECK (
    owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
  );

CREATE POLICY "Users can update own media" ON media
  FOR UPDATE USING (owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text));

CREATE POLICY "Users can delete own media" ON media
  FOR DELETE USING (owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text));

-- Element media policies
CREATE POLICY "Users can read element media" ON element_media
  FOR SELECT USING (
    media_id IN (
      SELECT id FROM media WHERE world_id IN (
        SELECT id FROM worlds WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
        UNION SELECT world_id FROM world_shares WHERE user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
        UNION SELECT id FROM worlds WHERE visibility = 'public'
      )
    )
  );

CREATE POLICY "Users can manage element media" ON element_media
  FOR ALL USING (
    media_id IN (SELECT id FROM media WHERE owner_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text))
  );

-- ============================================
-- COMPLETE
-- ============================================
-- Schema v3.0 created successfully!
-- Tables: users, worlds, world_shares, documents, countries, regions, characters, 
--         timelines, events, locations, element_types, element_type_fields, 
--         world_elements, media, element_media
-- 
-- System element types: Currency, Religion, Magic System, Species, Organization,
--                       Item, Language, Culture, Technology, Myth/Legend, Flora,
--                       Fauna, Material, Landmark, Conflict
