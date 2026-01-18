// Dynamic Element Types System

export interface ElementTypeField {
  id: string;
  element_type_id: string;
  name: string;
  slug: string;
  field_type: 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'boolean' | 'date' | 'image' | 'video' | 'link' | 'element_ref';
  description?: string;
  placeholder?: string;
  is_required: boolean;
  is_featured: boolean;
  show_in_list: boolean;
  options?: { value: string; label: string }[];
  default_value?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  sort_order: number;
}

export interface ElementType {
  id: string;
  world_id?: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  is_system: boolean;
  sort_order: number;
  fields?: ElementTypeField[];
}

export interface WorldElement {
  id: string;
  world_id: string;
  element_type_id: string;
  name: string;
  description?: string;
  properties: Record<string, any>;
  cover_image?: string;
  gallery?: MediaReference[];
  tags: string[];
  relationships: ElementRelationship[];
  is_private: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  element_type?: ElementType;
}

export interface ElementRelationship {
  target_id: string;
  target_type: string; // 'world_elements', 'characters', 'countries', etc.
  relationship_type: string; // 'ally', 'enemy', 'member', 'located_in', etc.
  description?: string;
}

export interface Media {
  id: string;
  world_id: string;
  owner_id: string;
  name: string;
  file_type: 'image' | 'video' | 'audio' | 'document';
  mime_type?: string;
  url: string;
  thumbnail_url?: string;
  external_url?: string;
  file_size?: number;
  width?: number;
  height?: number;
  duration?: number;
  alt_text?: string;
  caption?: string;
  tags: string[];
  metadata?: Record<string, any>;
  created_at: string;
}

export interface MediaReference {
  media_id: string;
  url: string;
  thumbnail_url?: string;
  caption?: string;
}

export interface ElementMedia {
  id: string;
  element_id: string;
  element_table: string;
  media_id: string;
  is_cover: boolean;
  is_featured: boolean;
  sort_order: number;
  caption?: string;
  media?: Media;
}

// System element type slugs
export const SYSTEM_ELEMENT_TYPES = {
  CURRENCY: 'currency',
  RELIGION: 'religion',
  MAGIC_SYSTEM: 'magic-system',
  SPECIES: 'species',
  ORGANIZATION: 'organization',
  ITEM: 'item',
  LANGUAGE: 'language',
  CULTURE: 'culture',
  TECHNOLOGY: 'technology',
  MYTH_LEGEND: 'myth-legend',
  FLORA: 'flora',
  FAUNA: 'fauna',
  MATERIAL: 'material',
  LANDMARK: 'landmark',
  CONFLICT: 'conflict',
} as const;

// Field type icons and labels
export const FIELD_TYPES = {
  text: { label: 'Text', icon: '📝' },
  textarea: { label: 'Long Text', icon: '📄' },
  number: { label: 'Number', icon: '🔢' },
  select: { label: 'Dropdown', icon: '📋' },
  multiselect: { label: 'Multi-Select', icon: '☑️' },
  boolean: { label: 'Yes/No', icon: '✓' },
  date: { label: 'Date', icon: '📅' },
  image: { label: 'Image', icon: '🖼️' },
  video: { label: 'Video', icon: '🎬' },
  link: { label: 'Link', icon: '🔗' },
  element_ref: { label: 'Element Reference', icon: '🔗' },
} as const;

// Relationship types
export const RELATIONSHIP_TYPES = [
  { value: 'ally', label: 'Ally' },
  { value: 'enemy', label: 'Enemy' },
  { value: 'member', label: 'Member of' },
  { value: 'leader', label: 'Leader of' },
  { value: 'located_in', label: 'Located in' },
  { value: 'origin', label: 'Origin' },
  { value: 'created_by', label: 'Created by' },
  { value: 'owns', label: 'Owns' },
  { value: 'worships', label: 'Worships' },
  { value: 'uses', label: 'Uses' },
  { value: 'speaks', label: 'Speaks' },
  { value: 'related_to', label: 'Related to' },
  { value: 'descendant', label: 'Descendant of' },
  { value: 'ancestor', label: 'Ancestor of' },
  { value: 'trade_partner', label: 'Trade Partner' },
  { value: 'vassal', label: 'Vassal of' },
  { value: 'overlord', label: 'Overlord of' },
] as const;
