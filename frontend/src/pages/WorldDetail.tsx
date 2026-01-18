import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeftIcon,
  GlobeAltIcon,
  MapIcon,
  UserGroupIcon,
  ClockIcon,
  CalendarIcon,
  MapPinIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  SparklesIcon,
  Squares2X2Icon,
  PhotoIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import type { ElementType, WorldElement } from '../types/worldbuilding';
import ElementForm from '../components/worldbuilding/ElementForm';
import ElementCard from '../components/worldbuilding/ElementCard';
import MediaGallery from '../components/worldbuilding/MediaGallery';
import CustomAttributesEditor from '../components/worldbuilding/CustomAttributesEditor';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Types for existing entities
interface World {
  id: string;
  title: string;
  description?: string;
  cover_image?: string;
  visibility: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface Country {
  id: string;
  name: string;
  description?: string;
  capital?: string;
  population?: number;
  government_type?: string;
  flag_image?: string;
  map_image?: string;
  is_public?: boolean;
  custom_properties?: Record<string, any>;
  gallery?: any[];
}

interface Region {
  id: string;
  name: string;
  description?: string;
  type?: string;
  country_id?: string;
  country?: { id: string; name: string };
  is_public?: boolean;
}

interface Character {
  id: string;
  name: string;
  full_name?: string;
  description?: string;
  role?: string;
  status?: string;
  species?: string;
  portrait_image?: string;
  is_public?: boolean;
  custom_properties?: Record<string, any>;
  gallery?: any[];
}

interface Timeline {
  id: string;
  title: string;
  description?: string;
  era?: string;
  start_date?: string;
  end_date?: string;
  is_public?: boolean;
}

interface WorldEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  timeline_id?: string;
  significance?: string;
  is_public?: boolean;
}

interface Location {
  id: string;
  name: string;
  description?: string;
  type?: string;
  country?: { id: string; name: string };
  region?: { id: string; name: string };
  is_public?: boolean;
}

type ClassicElementType = 'countries' | 'regions' | 'characters' | 'timelines' | 'events' | 'locations';
type TabType = ClassicElementType | 'dynamic';

// Helper to convert plural element type to singular
function getSingular(type: ClassicElementType): string {
  const map: Record<ClassicElementType, string> = {
    countries: 'country',
    regions: 'region',
    characters: 'character',
    timelines: 'timeline',
    events: 'event',
    locations: 'location',
  };
  return map[type] || type;
}

type PreviewItem =
  | { kind: 'classic'; classicType: ClassicElementType; data: any }
  | { kind: 'dynamic'; element: WorldElement; elementType?: ElementType };

const CLASSIC_PREVIEW_FIELDS: Record<ClassicElementType, { label: string; key: string }[]> = {
  countries: [
    { label: 'Capital', key: 'capital' },
    { label: 'Population', key: 'population' },
    { label: 'Government', key: 'government_type' },
    { label: 'Culture', key: 'culture' },
  ],
  regions: [
    { label: 'Type', key: 'type' },
    { label: 'Country', key: 'country' },
    { label: 'Climate', key: 'climate' },
    { label: 'Population', key: 'population' },
  ],
  characters: [
    { label: 'Full Name', key: 'full_name' },
    { label: 'Role', key: 'role' },
    { label: 'Status', key: 'status' },
    { label: 'Species', key: 'species' },
    { label: 'Occupation', key: 'occupation' },
  ],
  timelines: [
    { label: 'Era', key: 'era' },
    { label: 'Start Date', key: 'start_date' },
    { label: 'End Date', key: 'end_date' },
  ],
  events: [
    { label: 'Date', key: 'date' },
    { label: 'End Date', key: 'end_date' },
    { label: 'Location', key: 'location' },
    { label: 'Significance', key: 'significance' },
  ],
  locations: [
    { label: 'Type', key: 'type' },
    { label: 'Country', key: 'country' },
    { label: 'Region', key: 'region' },
    { label: 'Population', key: 'population' },
    { label: 'Climate', key: 'climate' },
  ],
};

const CLASSIC_ALLOWED_FIELDS: Record<ClassicElementType, string[]> = {
  countries: [
    'name',
    'description',
    'capital',
    'population',
    'government_type',
    'culture',
    'history',
    'geography',
    'map_image',
    'flag_image',
    'is_public',
    'custom_properties',
    'gallery',
    'metadata',
  ],
  regions: [
    'name',
    'description',
    'country_id',
    'type',
    'geography',
    'climate',
    'population',
    'map_image',
    'is_public',
    'custom_properties',
    'gallery',
    'metadata',
  ],
  characters: [
    'name',
    'full_name',
    'aliases',
    'description',
    'appearance',
    'personality',
    'backstory',
    'motivations',
    'role',
    'status',
    'birth_date',
    'death_date',
    'age',
    'gender',
    'species',
    'occupation',
    'portrait_image',
    'is_public',
    'location_id',
    'location_type',
    'relationships',
    'custom_properties',
    'gallery',
    'tags',
    'metadata',
  ],
  timelines: [
    'title',
    'description',
    'start_date',
    'end_date',
    'era',
    'is_public',
    'sort_order',
    'custom_properties',
    'metadata',
  ],
  events: [
    'title',
    'description',
    'date',
    'end_date',
    'timeline_id',
    'location',
    'location_id',
    'location_type',
    'significance',
    'participants',
    'is_public',
    'custom_properties',
    'gallery',
    'tags',
    'sort_order',
    'metadata',
  ],
  locations: [
    'name',
    'description',
    'type',
    'country_id',
    'region_id',
    'population',
    'climate',
    'notable_features',
    'map_image',
    'is_public',
    'custom_properties',
    'gallery',
    'metadata',
  ],
};

export default function WorldDetail() {
  const { worldId } = useParams<{ worldId: string }>();
  const { session } = useAuth();
  const navigate = useNavigate();

  const [world, setWorld] = useState<World | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('countries');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Classic element data
  const [countries, setCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [events, setEvents] = useState<WorldEvent[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  // Dynamic element system
  const [elementTypes, setElementTypes] = useState<ElementType[]>([]);
  const [dynamicElements, setDynamicElements] = useState<WorldElement[]>([]);
  const [selectedElementType, setSelectedElementType] = useState<ElementType | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'classic' | 'dynamic'>('classic');
  const [classicModalType, setClassicModalType] = useState<ClassicElementType>('countries');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  // Element type selector modal
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [previewItem, setPreviewItem] = useState<PreviewItem | null>(null);
  const [classicMediaUrl, setClassicMediaUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingWorldVisibility, setUpdatingWorldVisibility] = useState(false);

  useEffect(() => {
    if (worldId && session?.access_token) {
      fetchWorld();
      fetchAllElements();
      fetchElementTypes();
    }
  }, [worldId, session?.access_token]);

  // Fetch world details
  const fetchWorld = async () => {
    try {
      const res = await fetch(`${API_URL}/api/worlds/${worldId}`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.ok) {
        const { data } = await res.json();
        setWorld(data);
      } else {
        setError('World not found');
      }
    } catch (e) {
      setError('Failed to load world');
    }
  };

  // Fetch classic elements
  const fetchAllElements = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${session?.access_token}` };
      const [countriesRes, regionsRes, charactersRes, timelinesRes, eventsRes, locationsRes] = await Promise.all([
        fetch(`${API_URL}/api/worlds/${worldId}/countries`, { headers }),
        fetch(`${API_URL}/api/worlds/${worldId}/regions`, { headers }),
        fetch(`${API_URL}/api/worlds/${worldId}/characters`, { headers }),
        fetch(`${API_URL}/api/worlds/${worldId}/timelines`, { headers }),
        fetch(`${API_URL}/api/worlds/${worldId}/events`, { headers }),
        fetch(`${API_URL}/api/worlds/${worldId}/locations`, { headers }),
      ]);

      if (countriesRes.ok) setCountries((await countriesRes.json()).data || []);
      if (regionsRes.ok) setRegions((await regionsRes.json()).data || []);
      if (charactersRes.ok) setCharacters((await charactersRes.json()).data || []);
      if (timelinesRes.ok) setTimelines((await timelinesRes.json()).data || []);
      if (eventsRes.ok) setEvents((await eventsRes.json()).data || []);
      if (locationsRes.ok) setLocations((await locationsRes.json()).data || []);
    } catch (e) {
      console.error('Error fetching elements:', e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch element types and dynamic elements
  const fetchElementTypes = async () => {
    try {
      const headers = { Authorization: `Bearer ${session?.access_token}` };
      const res = await fetch(`${API_URL}/api/element-types?world_id=${worldId}`, { headers });
      if (res.ok) {
        const { data } = await res.json();
        setElementTypes(data || []);
      }
    } catch (e) {
      console.error('Error fetching element types:', e);
    }
  };

  const fetchDynamicElements = async (typeId?: string) => {
    try {
      const headers = { Authorization: `Bearer ${session?.access_token}` };
      let url = `${API_URL}/api/worlds/${worldId}/elements`;
      if (typeId) url += `?type_id=${typeId}`;
      
      const res = await fetch(url, { headers });
      if (res.ok) {
        const { data } = await res.json();
        setDynamicElements(data || []);
      }
    } catch (e) {
      console.error('Error fetching dynamic elements:', e);
    }
  };

  useEffect(() => {
    if (activeTab === 'dynamic' && session?.access_token) {
      fetchDynamicElements(selectedElementType?.id);
    }
  }, [activeTab, selectedElementType, session?.access_token]);

  // Classic modal handlers
  const openClassicCreateModal = (type: ClassicElementType) => {
    setClassicModalType(type);
    setModalMode('classic');
    setEditingItem(null);
    setFormData({ is_public: true });
    setClassicMediaUrl('');
    setShowModal(true);
  };

  const openClassicEditModal = (type: ClassicElementType, item: any) => {
    setClassicModalType(type);
    setModalMode('classic');
    setEditingItem(item);
    setFormData({ is_public: item.is_public ?? true, ...item });
    setClassicMediaUrl('');
    setShowModal(true);
  };

  // Dynamic modal handlers
  const openDynamicCreateModal = (elementType: ElementType) => {
    console.log('Opening create modal for element type:', { 
      id: elementType.id, 
      name: elementType.name,
      hasId: !!elementType.id 
    });
    if (!elementType.id) {
      console.error('Element type missing ID!', elementType);
      alert('Error: Element type is missing an ID. Please refresh the page and try again.');
      return;
    }
    setSelectedElementType(elementType);
    setModalMode('dynamic');
    setEditingItem(null);
    setShowModal(true);
    setShowTypeSelector(false);
  };

  const openDynamicEditModal = (element: WorldElement) => {
    const elType = elementTypes.find(t => t.id === element.element_type_id);
    if (elType) {
      setSelectedElementType(elType);
      setModalMode('dynamic');
      setEditingItem(element);
      setShowModal(true);
    }
  };

  const openClassicPreview = (type: ClassicElementType, item: any) => {
    setPreviewItem({ kind: 'classic', classicType: type, data: item });
  };

  const openDynamicPreview = (element: WorldElement) => {
    const elType = elementTypes.find(t => t.id === element.element_type_id);
    setPreviewItem({ kind: 'dynamic', element, elementType: elType });
  };

  const formatPreviewValue = (value: any): string => {
    if (value === undefined || value === null || value === '') return '';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  };

  const buildClassicPayload = (type: ClassicElementType, data: Record<string, any>) => {
    const allowed = CLASSIC_ALLOWED_FIELDS[type];
    const payload = allowed.reduce<Record<string, any>>((acc, key) => {
      if (data[key] !== undefined) {
        // Convert empty strings to null for optional image fields
        if (typeof data[key] === 'string' && data[key].trim() === '') {
          if (key.includes('_image') || key === 'map_image' || key === 'flag_image' || key === 'portrait_image') {
            acc[key] = null;
          } else {
            acc[key] = data[key];
          }
        } else {
          acc[key] = data[key];
        }
      }
      return acc;
    }, {});
    
    // Ensure gallery is always an array (not undefined)
    if (allowed.includes('gallery')) {
      payload.gallery = Array.isArray(data.gallery) ? data.gallery : [];
    }
    
    // Ensure custom_properties is always an object (not undefined)
    if (allowed.includes('custom_properties')) {
      payload.custom_properties = data.custom_properties && typeof data.custom_properties === 'object' 
        ? data.custom_properties 
        : {};
    }
    
    return payload;
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const isSearching = normalizedSearch.length > 0;
  const elementTypeMap = new Map(elementTypes.map((type) => [type.id, type]));

  const matchesSearch = (name: string | undefined, category: string, tags?: string[]) => {
    const haystack = [
      name || '',
      category,
      ...(tags || []),
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalizedSearch);
  };

  const filterClassic = (items: any[], type: ClassicElementType) =>
    items.filter((item) =>
      matchesSearch(item.name || item.title, type, item.tags)
    );

  const filteredCountries = isSearching ? filterClassic(countries, 'countries') : countries;
  const filteredRegions = isSearching ? filterClassic(regions, 'regions') : regions;
  const filteredCharacters = isSearching ? filterClassic(characters, 'characters') : characters;
  const filteredTimelines = isSearching ? filterClassic(timelines, 'timelines') : timelines;
  const filteredEvents = isSearching ? filterClassic(events, 'events') : events;
  const filteredLocations = isSearching ? filterClassic(locations, 'locations') : locations;

  const filteredDynamicElements = isSearching
    ? dynamicElements.filter((element) =>
        matchesSearch(
          element.name,
          elementTypeMap.get(element.element_type_id)?.name || 'dynamic',
          element.tags
        )
      )
    : dynamicElements;

  const getClassicCoverImage = (type: ClassicElementType, item: any): string | undefined => {
    switch (type) {
      case 'countries':
        return item.flag_image || item.map_image;
      case 'characters':
        return item.portrait_image;
      case 'regions':
      case 'locations':
        return item.map_image;
      default:
        return undefined;
    }
  };

  const getClassicFieldValue = (item: any, key: string) => {
    const value = item[key];
    if (value && typeof value === 'object' && 'name' in value) {
      return value.name;
    }
    return value;
  };

  // Save handlers
  const handleClassicSave = async () => {
    setSaving(true);
    try {
      const isEdit = !!editingItem;
      const url = isEdit
        ? `${API_URL}/api/${classicModalType}/${editingItem.id}`
        : `${API_URL}/api/worlds/${worldId}/${classicModalType}`;

      const payload = buildClassicPayload(classicModalType, formData);

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        fetchAllElements();
      } else {
        const err = await res.json();
        console.error('Save error:', err);
        alert(err.error?.message || err.message || 'Failed to save');
      }
    } catch (e: any) {
      console.error('Save exception:', e);
      alert(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDynamicSave = async (data: Partial<WorldElement>) => {
    setSaving(true);
    try {
      // Validate element_type_id before sending
      if (!data.element_type_id) {
        alert('Element type is required. Please ensure a type is selected.');
        setSaving(false);
        return;
      }

      const isEdit = !!editingItem;
      const url = isEdit
        ? `${API_URL}/api/elements/${editingItem.id}`
        : `${API_URL}/api/worlds/${worldId}/elements`;

      const requestBody = JSON.stringify(data);
      console.log('Saving element - full payload:', requestBody);
      console.log('Saving element - data object:', { ...data, element_type_id: data.element_type_id, element_type_id_type: typeof data.element_type_id });

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: requestBody,
      });

      if (res.ok) {
        setShowModal(false);
        fetchDynamicElements(selectedElementType?.id);
      } else {
        const err = await res.json();
        console.error('Save error:', err);
        console.error('Full error response:', JSON.stringify(err, null, 2));
        // Handle both error formats: {error: {message}} or {errors: [...]}
        const errorMessage = err.error?.message 
          || err.message 
          || (err.errors && Array.isArray(err.errors) && err.errors.length > 0 
              ? err.errors.map((e: any) => `${e.param || e.path || 'Field'}: ${e.msg || e.message || JSON.stringify(e)}`).join(', ')
              : 'Failed to save');
        alert(errorMessage);
      }
    } catch (e: any) {
      console.error('Save exception:', e);
      alert(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // Delete handlers
  const handleDelete = async (type: ClassicElementType, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const res = await fetch(`${API_URL}/api/${type}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      if (res.ok) {
        fetchAllElements();
      } else {
        alert('Failed to delete');
      }
    } catch (e) {
      alert('Failed to delete');
    }
  };

  const handleDynamicDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this element?')) return;

    try {
      const res = await fetch(`${API_URL}/api/elements/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      if (res.ok) {
        fetchDynamicElements(selectedElementType?.id);
      } else {
        alert('Failed to delete');
      }
    } catch (e) {
      alert('Failed to delete');
    }
  };

  const handleClassicVisibilityToggle = async (type: ClassicElementType, item: any) => {
    try {
      const res = await fetch(`${API_URL}/api/${type}/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ is_public: !(item.is_public ?? true) }),
      });

      if (res.ok) {
        fetchAllElements();
      } else {
        alert('Failed to update visibility');
      }
    } catch (e) {
      alert('Failed to update visibility');
    }
  };

  const handleDynamicVisibilityToggle = async (element: WorldElement) => {
    try {
      const res = await fetch(`${API_URL}/api/elements/${element.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ is_private: !element.is_private }),
      });

      if (res.ok) {
        fetchDynamicElements(selectedElementType?.id);
      } else {
        alert('Failed to update visibility');
      }
    } catch (e) {
      alert('Failed to update visibility');
    }
  };

  const handleWorldVisibilityToggle = async () => {
    if (!world || !session?.access_token) return;
    const nextVisibility = world.visibility === 'public' ? 'private' : 'public';
    setUpdatingWorldVisibility(true);
    try {
      const res = await fetch(`${API_URL}/api/worlds/${world.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ visibility: nextVisibility }),
      });

      if (res.ok) {
        const { data } = await res.json();
        setWorld(data);
      } else {
        alert('Failed to update world visibility');
      }
    } catch (e) {
      alert('Failed to update world visibility');
    } finally {
      setUpdatingWorldVisibility(false);
    }
  };

  // Tab configuration
  const classicTabs = [
    { id: 'countries' as ClassicElementType, name: 'Countries', icon: GlobeAltIcon, count: filteredCountries.length },
    { id: 'regions' as ClassicElementType, name: 'Regions', icon: MapIcon, count: filteredRegions.length },
    { id: 'characters' as ClassicElementType, name: 'Characters', icon: UserGroupIcon, count: filteredCharacters.length },
    { id: 'timelines' as ClassicElementType, name: 'Timelines', icon: ClockIcon, count: filteredTimelines.length },
    { id: 'events' as ClassicElementType, name: 'Events', icon: CalendarIcon, count: filteredEvents.length },
    { id: 'locations' as ClassicElementType, name: 'Locations', icon: MapPinIcon, count: filteredLocations.length },
  ];

  // Render classic form fields
  const renderClassicFormFields = () => {
    const baseInputClass = "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500";
    const isPublic = formData.is_public ?? true;
    const renderVisibilityToggle = () => (
      <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/60 border border-gray-700">
        <div>
          <p className="text-sm font-medium text-white">Public visibility</p>
          <p className="text-xs text-gray-400">
            {isPublic ? 'Visible in the shared atlas.' : 'Hidden from public atlas.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormData({ ...formData, is_public: !isPublic })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isPublic ? 'bg-amber-500' : 'bg-gray-600'
          }`}
          aria-pressed={isPublic}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isPublic ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    );
    const renderCustomAttributesFields = () => (
      <div className="pt-4 border-t border-gray-700">
        <CustomAttributesEditor
          value={formData.custom_properties || {}}
          onChange={(next) => setFormData({ ...formData, custom_properties: next })}
        />
      </div>
    );
    const galleryItems = (formData.gallery || []) as { media_id: string; url: string; thumbnail_url?: string }[];
    const handleAddClassicMedia = () => {
      if (!classicMediaUrl.trim()) return;
      setFormData({
        ...formData,
        gallery: [
          ...galleryItems,
          { media_id: `temp-${Date.now()}`, url: classicMediaUrl.trim(), thumbnail_url: classicMediaUrl.trim() },
        ],
      });
      setClassicMediaUrl('');
    };
    const handleRemoveClassicMedia = (mediaId: string) => {
      setFormData({
        ...formData,
        gallery: galleryItems.filter((item) => item.media_id !== mediaId),
      });
    };
    const renderClassicMediaSection = () => (
      <div className="space-y-3 pt-4 border-t border-gray-700">
        <label className="block text-sm font-medium text-gray-300">Research & Reference Bin</label>
        <p className="text-xs text-gray-500 mb-3">Store scanned maps, letters, mood boards, or video inspirations here.</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="url"
            value={classicMediaUrl}
            onChange={(e) => setClassicMediaUrl(e.target.value)}
            placeholder="Paste image or video URL..."
            className={`${baseInputClass} flex-1`}
          />
          <button type="button" onClick={handleAddClassicMedia} className="btn btn-secondary">
            Add media
          </button>
        </div>
        {galleryItems.length > 0 ? (
          <MediaGallery
            media={galleryItems}
            editable
            onRemoveMedia={handleRemoveClassicMedia}
            compact
          />
        ) : (
          <p className="text-xs text-gray-500">Add as many URLs as you like. YouTube/Vimeo links will show video previews.</p>
        )}
      </div>
    );

    switch (classicModalType) {
      case 'countries':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                <input
                  type="text"
                  className={baseInputClass}
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Kingdom of Eldoria"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Capital</label>
                <input
                  type="text"
                  className={baseInputClass}
                  value={formData.capital || ''}
                  onChange={(e) => setFormData({ ...formData, capital: e.target.value })}
                  placeholder="Eldoria City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Population</label>
                <input
                  type="number"
                  className={baseInputClass}
                  value={formData.population || ''}
                  onChange={(e) => setFormData({ ...formData, population: parseInt(e.target.value) || null })}
                  placeholder="1000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Government Type</label>
                <input
                  type="text"
                  className={baseInputClass}
                  value={formData.government_type || ''}
                  onChange={(e) => setFormData({ ...formData, government_type: e.target.value })}
                  placeholder="Monarchy, Republic, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Flag/Banner Image</label>
                <input
                  type="url"
                  className={baseInputClass}
                  value={formData.flag_image || ''}
                  onChange={(e) => setFormData({ ...formData, flag_image: e.target.value })}
                  placeholder="https://..."
                />
                {formData.flag_image && (
                  <img src={formData.flag_image} alt="Flag preview" className="mt-2 h-20 object-contain rounded" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Map Image</label>
                <input
                  type="url"
                  className={baseInputClass}
                  value={formData.map_image || ''}
                  onChange={(e) => setFormData({ ...formData, map_image: e.target.value })}
                  placeholder="https://..."
                />
                {formData.map_image && (
                  <img src={formData.map_image} alt="Map preview" className="mt-2 h-20 object-contain rounded" />
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                rows={4}
                className={baseInputClass}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="A prosperous kingdom known for..."
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Culture</label>
                <textarea
                  rows={3}
                  className={baseInputClass}
                  value={formData.culture || ''}
                  onChange={(e) => setFormData({ ...formData, culture: e.target.value })}
                  placeholder="Cultural characteristics..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">History</label>
                <textarea
                  rows={3}
                  className={baseInputClass}
                  value={formData.history || ''}
                  onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                  placeholder="Historical background..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Geography</label>
                <textarea
                  rows={3}
                  className={baseInputClass}
                  value={formData.geography || ''}
                  onChange={(e) => setFormData({ ...formData, geography: e.target.value })}
                  placeholder="Geographical features..."
                />
              </div>
            </div>
            {renderClassicMediaSection()}
            {renderVisibilityToggle()}
            {renderCustomAttributesFields()}
          </div>
        );

      case 'characters':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                <input
                  type="text"
                  className={baseInputClass}
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Elara"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  className={baseInputClass}
                  value={formData.full_name || ''}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Princess Elara of Eldoria"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Portrait Image</label>
                <input
                  type="url"
                  className={baseInputClass}
                  value={formData.portrait_image || ''}
                  onChange={(e) => setFormData({ ...formData, portrait_image: e.target.value })}
                  placeholder="https://..."
                />
                {formData.portrait_image && (
                  <img src={formData.portrait_image} alt="Portrait preview" className="mt-2 h-24 object-contain rounded" />
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select
                  className={baseInputClass}
                  value={formData.role || ''}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="protagonist">Protagonist</option>
                  <option value="antagonist">Antagonist</option>
                  <option value="supporting">Supporting</option>
                  <option value="minor">Minor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  className={baseInputClass}
                  value={formData.status || 'alive'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="alive">Alive</option>
                  <option value="deceased">Deceased</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Species</label>
                <input
                  type="text"
                  className={baseInputClass}
                  value={formData.species || ''}
                  onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                  placeholder="Human"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                <input
                  type="text"
                  className={baseInputClass}
                  value={formData.gender || ''}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  placeholder="Male, Female, etc."
                />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  rows={4}
                  className={baseInputClass}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="A brief description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Backstory</label>
                <textarea
                  rows={4}
                  className={baseInputClass}
                  value={formData.backstory || ''}
                  onChange={(e) => setFormData({ ...formData, backstory: e.target.value })}
                  placeholder="Character's history..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Appearance</label>
                <textarea
                  rows={3}
                  className={baseInputClass}
                  value={formData.appearance || ''}
                  onChange={(e) => setFormData({ ...formData, appearance: e.target.value })}
                  placeholder="Physical description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Personality</label>
                <textarea
                  rows={3}
                  className={baseInputClass}
                  value={formData.personality || ''}
                  onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                  placeholder="Personality traits..."
                />
              </div>
            </div>
            {renderClassicMediaSection()}
            {renderVisibilityToggle()}
            {renderCustomAttributesFields()}
          </div>
        );

      // Add other classic types as needed
      default:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
              <input
                type="text"
                className={baseInputClass}
                value={formData.name || formData.title || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                rows={4}
                className={baseInputClass}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            {renderClassicMediaSection()}
            {renderVisibilityToggle()}
            {renderCustomAttributesFields()}
          </div>
        );
    }
  };

  // Render classic element list
  const renderClassicElementList = () => {
    let items: any[] = [];
    
    switch (activeTab) {
      case 'countries':
        items = filteredCountries;
        return items.length === 0 ? renderEmptyState() : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors group">
                {item.flag_image && (
                  <div className="h-32 bg-gray-900 relative overflow-hidden">
                    <img src={item.flag_image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                      {item.capital && <p className="text-sm text-amber-400">Capital: {item.capital}</p>}
                      {item.government_type && <p className="text-sm text-gray-400">{item.government_type}</p>}
                      {item.population && <p className="text-sm text-gray-500">Pop: {item.population.toLocaleString()}</p>}
                      <span className={`mt-2 inline-flex items-center text-xs px-2 py-0.5 rounded-full ${
                        (item.is_public ?? true) ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-700 text-gray-300'
                      }`}>
                        {(item.is_public ?? true) ? 'Public' : 'Private'}
                      </span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleClassicVisibilityToggle('countries', item)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                        title={(item.is_public ?? true) ? 'Make private' : 'Make public'}
                      >
                        {(item.is_public ?? true) ? <EyeIcon className="h-4 w-4" /> : <EyeSlashIcon className="h-4 w-4" />}
                      </button>
                      <button onClick={() => openClassicPreview('countries', item)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => openClassicEditModal('countries', item)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete('countries', item.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {item.description && <p className="mt-2 text-sm text-gray-400 line-clamp-2">{item.description}</p>}
                </div>
              </div>
            ))}
          </div>
        );

      case 'characters':
        items = filteredCharacters;
        return items.length === 0 ? renderEmptyState() : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors group">
                {item.portrait_image && (
                  <div className="h-48 bg-gray-900 relative overflow-hidden">
                    <img src={item.portrait_image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      {!item.portrait_image && (
                        <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-xl text-gray-400">
                          {item.name[0]}
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                        {item.full_name && item.full_name !== item.name && (
                          <p className="text-sm text-gray-400">{item.full_name}</p>
                        )}
                        <div className="flex gap-2 mt-1">
                          {item.role && (
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              item.role === 'protagonist' ? 'bg-blue-900 text-blue-300' :
                              item.role === 'antagonist' ? 'bg-red-900 text-red-300' :
                              'bg-gray-700 text-gray-300'
                            }`}>{item.role}</span>
                          )}
                          {item.species && item.species !== 'Human' && (
                            <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded">{item.species}</span>
                          )}
                        </div>
                        <span className={`mt-2 inline-flex items-center text-xs px-2 py-0.5 rounded-full ${
                          (item.is_public ?? true) ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-700 text-gray-300'
                        }`}>
                          {(item.is_public ?? true) ? 'Public' : 'Private'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleClassicVisibilityToggle('characters', item)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                        title={(item.is_public ?? true) ? 'Make private' : 'Make public'}
                      >
                        {(item.is_public ?? true) ? <EyeIcon className="h-4 w-4" /> : <EyeSlashIcon className="h-4 w-4" />}
                      </button>
                      <button onClick={() => openClassicPreview('characters', item)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => openClassicEditModal('characters', item)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete('characters', item.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {item.description && <p className="mt-3 text-sm text-gray-400 line-clamp-2">{item.description}</p>}
                </div>
              </div>
            ))}
          </div>
        );

      // Add simple rendering for other types
      default:
        switch (activeTab) {
          case 'regions': items = filteredRegions; break;
          case 'timelines': items = filteredTimelines; break;
          case 'events': items = filteredEvents; break;
          case 'locations': items = filteredLocations; break;
        }
        return items.length === 0 ? renderEmptyState() : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item.id} className="bg-gray-800 rounded-lg p-5 border border-gray-700 hover:border-gray-600 transition-colors group">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{item.name || item.title}</h3>
                    {item.type && <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">{item.type}</span>}
                    <span className={`ml-2 inline-flex items-center text-xs px-2 py-0.5 rounded-full ${
                      (item.is_public ?? true) ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-700 text-gray-300'
                    }`}>
                      {(item.is_public ?? true) ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleClassicVisibilityToggle(activeTab as ClassicElementType, item)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                      title={(item.is_public ?? true) ? 'Make private' : 'Make public'}
                    >
                      {(item.is_public ?? true) ? <EyeIcon className="h-4 w-4" /> : <EyeSlashIcon className="h-4 w-4" />}
                    </button>
                    <button onClick={() => openClassicPreview(activeTab as ClassicElementType, item)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => openClassicEditModal(activeTab as ClassicElementType, item)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(activeTab as ClassicElementType, item.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {item.description && <p className="mt-2 text-sm text-gray-400 line-clamp-2">{item.description}</p>}
              </div>
            ))}
          </div>
        );
    }
  };

  // Empty state
  const renderEmptyState = () => {
    const tabInfo = classicTabs.find(t => t.id === activeTab);
    const isDynamic = activeTab === 'dynamic';
    
    return (
      <div className="text-center py-16 border border-gray-700 rounded-xl bg-gray-800/50">
        {isDynamic ? (
          <>
            <SparklesIcon className="mx-auto h-16 w-16 text-amber-500/50 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Dynamic Elements</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Create currencies, religions, magic systems, organizations, and more with customizable properties.
            </p>
            <button
              onClick={() => setShowTypeSelector(true)}
              className="btn btn-primary"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Element
            </button>
          </>
        ) : (
          <>
            {tabInfo && <tabInfo.icon className="mx-auto h-16 w-16 text-gray-600 mb-4" />}
            <h3 className="text-xl font-semibold text-white mb-2">No {activeTab} yet</h3>
            <p className="text-gray-400 mb-6">Start building your world by adding {activeTab}.</p>
            <button
              onClick={() => openClassicCreateModal(activeTab as ClassicElementType)}
              className="btn btn-primary"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add {activeTab !== 'dynamic' ? getSingular(activeTab) : 'Element'}
            </button>
          </>
        )}
      </div>
    );
  };

  // Render dynamic elements
  const renderDynamicElements = () => {
    if (filteredDynamicElements.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDynamicElements.map((element) => (
          <ElementCard
            key={element.id}
            element={element}
            elementType={elementTypes.find(t => t.id === element.element_type_id)}
            onView={() => openDynamicPreview(element)}
            onEdit={() => openDynamicEditModal(element)}
            onDelete={() => handleDynamicDelete(element.id)}
            onToggleVisibility={() => handleDynamicVisibilityToggle(element)}
          />
        ))}
      </div>
    );
  };

  const renderClassicSearchSection = (type: ClassicElementType, items: any[]) => {
    if (items.length === 0) return null;
    const title = type.charAt(0).toUpperCase() + type.slice(1);

    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-gray-800 rounded-lg p-5 border border-gray-700 hover:border-gray-600 transition-colors group">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-semibold text-white">{item.name || item.title}</h4>
                  <span className="text-xs text-gray-500">{title !== 'dynamic' ? getSingular(title as ClassicElementType) : 'Element'}</span>
                  <span className={`ml-2 inline-flex items-center text-xs px-2 py-0.5 rounded-full ${
                    (item.is_public ?? true) ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-700 text-gray-300'
                  }`}>
                    {(item.is_public ?? true) ? 'Public' : 'Private'}
                  </span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleClassicVisibilityToggle(type, item)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                    title={(item.is_public ?? true) ? 'Make private' : 'Make public'}
                  >
                    {(item.is_public ?? true) ? <EyeIcon className="h-4 w-4" /> : <EyeSlashIcon className="h-4 w-4" />}
                  </button>
                  <button onClick={() => openClassicPreview(type, item)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button onClick={() => openClassicEditModal(type, item)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(type, item.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {item.description && <p className="mt-2 text-sm text-gray-400 line-clamp-2">{item.description}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDynamicSearchSections = () => {
    if (filteredDynamicElements.length === 0) return null;
    const grouped = filteredDynamicElements.reduce<Record<string, WorldElement[]>>((acc, element) => {
      const typeName = elementTypeMap.get(element.element_type_id)?.name || 'Dynamic';
      if (!acc[typeName]) acc[typeName] = [];
      acc[typeName].push(element);
      return acc;
    }, {});

    return (
      <div className="space-y-4">
        {Object.entries(grouped).map(([typeName, elements]) => (
          <div key={typeName} className="space-y-3">
            <h3 className="text-lg font-semibold text-white">{typeName}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {elements.map((element) => (
                <ElementCard
                  key={element.id}
                  element={element}
                  elementType={elementTypeMap.get(element.element_type_id)}
                  onView={() => openDynamicPreview(element)}
                  onEdit={() => openDynamicEditModal(element)}
                  onDelete={() => handleDynamicDelete(element.id)}
                  onToggleVisibility={() => handleDynamicVisibilityToggle(element)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSearchResults = () => {
    const sections = [
      renderClassicSearchSection('countries', filteredCountries),
      renderClassicSearchSection('regions', filteredRegions),
      renderClassicSearchSection('characters', filteredCharacters),
      renderClassicSearchSection('timelines', filteredTimelines),
      renderClassicSearchSection('events', filteredEvents),
      renderClassicSearchSection('locations', filteredLocations),
      renderDynamicSearchSections(),
    ].filter(Boolean);

    if (sections.length === 0) {
      return (
        <div className="text-center py-16 border border-gray-700 rounded-xl bg-gray-800/50">
          <MagnifyingGlassIcon className="mx-auto h-16 w-16 text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
          <p className="text-gray-400 mb-6">Try a different keyword or check your spelling.</p>
        </div>
      );
    }

    return <div className="space-y-8">{sections}</div>;
  };

  const previewTitle = previewItem
    ? previewItem.kind === 'dynamic'
      ? previewItem.element.name
      : previewItem.data.name || previewItem.data.title
    : '';

  const previewSubtitle = previewItem
    ? previewItem.kind === 'dynamic'
      ? previewItem.elementType?.name
      : getSingular(previewItem.classicType)
    : '';

  const previewDescription = previewItem
    ? previewItem.kind === 'dynamic'
      ? previewItem.element.description
      : previewItem.data.description
    : '';

  const previewCoverImage = previewItem
    ? previewItem.kind === 'dynamic'
      ? previewItem.element.cover_image
      : getClassicCoverImage(previewItem.classicType, previewItem.data)
    : undefined;

  const previewGallery = previewItem
    ? previewItem.kind === 'dynamic'
      ? previewItem.element.gallery || []
      : previewItem.data.gallery || []
    : [];

  const previewDetails = previewItem
    ? previewItem.kind === 'dynamic'
      ? (previewItem.elementType?.fields || [])
          .map((field) => ({
            label: field.name,
            value: formatPreviewValue(previewItem.element.properties?.[field.slug]),
          }))
          .filter((item) => item.value)
      : (CLASSIC_PREVIEW_FIELDS[previewItem.classicType] || [])
          .map((field) => ({
            label: field.label,
            value: formatPreviewValue(getClassicFieldValue(previewItem.data, field.key)),
          }))
          .filter((item) => item.value)
    : [];

  const previewCustomAttributes = previewItem
    ? previewItem.kind === 'dynamic'
      ? previewItem.element.properties?.custom_attributes || {}
      : previewItem.data.custom_properties || {}
    : {};

  const atlasLink = worldId ? `/worlds/${worldId}/atlas` : '/';

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{error}</h2>
          <Link to="/" className="btn btn-primary">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700">
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">{world?.title || 'Loading...'}</h1>
                {world?.description && (
                  <p className="text-sm text-gray-400 max-w-xl truncate">{world.description}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="flex items-center gap-3 bg-gray-700/60 rounded-lg px-3 py-2">
                <span className="text-xs text-gray-400 uppercase tracking-wide">World</span>
                <button
                  onClick={handleWorldVisibilityToggle}
                  disabled={updatingWorldVisibility}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    world?.visibility === 'public' ? 'bg-emerald-500' : 'bg-gray-600'
                  } ${updatingWorldVisibility ? 'opacity-60 cursor-not-allowed' : ''}`}
                  aria-pressed={world?.visibility === 'public'}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      world?.visibility === 'public' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-xs text-gray-300">
                  {world?.visibility === 'public' ? 'Public' : 'Private'}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-gray-700/60 px-3 py-2 text-gray-300 md:min-w-[280px]">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search name, category, or tag..."
                  className="w-full bg-transparent text-sm text-gray-100 placeholder-gray-400 focus:outline-none"
                />
              </div>
              <Link to={atlasLink} className="btn btn-secondary">
                <BookOpenIcon className="h-4 w-4" />
                Atlas View
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-gray-800/50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto py-2">
            {classicTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
                <span className="bg-gray-600 text-gray-300 px-2 py-0.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
            {/* Dynamic Elements Tab */}
            <button
              onClick={() => setActiveTab('dynamic')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === 'dynamic'
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-400 hover:text-white hover:bg-amber-600/20'
              }`}
            >
              <SparklesIcon className="h-4 w-4" />
              More Elements
              <span className="bg-amber-700 text-amber-200 px-2 py-0.5 rounded-full text-xs">
                {filteredDynamicElements.length}
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Element Type Filter (for dynamic tab) */}
      {activeTab === 'dynamic' && (
        <div className="bg-gray-800/30 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-500 whitespace-nowrap">Filter:</span>
              <button
                onClick={() => setSelectedElementType(null)}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                  !selectedElementType
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                All
              </button>
              {elementTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedElementType(type)}
                  className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    selectedElementType?.id === type.id
                      ? 'text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  style={{
                    backgroundColor: selectedElementType?.id === type.id ? type.color || '#d97706' : undefined
                  }}
                >
                  <span>{type.icon}</span>
                  {type.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white capitalize">
            {isSearching
              ? `Search results for "${searchTerm.trim() || ''}"`
              : activeTab === 'dynamic'
                ? (selectedElementType ? selectedElementType.name : 'All Elements')
                : activeTab
            }
          </h2>
          {activeTab === 'dynamic' ? (
            <button
              onClick={() => setShowTypeSelector(true)}
              className="btn btn-primary"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Element
            </button>
          ) : (
            <button
              onClick={() => openClassicCreateModal(activeTab as ClassicElementType)}
              className="btn btn-primary"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add {activeTab !== 'dynamic' ? getSingular(activeTab) : 'Element'}
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            <p className="mt-4 text-gray-400">Loading...</p>
          </div>
        ) : isSearching ? (
          renderSearchResults()
        ) : activeTab === 'dynamic' ? (
          renderDynamicElements()
        ) : (
          renderClassicElementList()
        )}
      </main>

      {/* Element Type Selector Modal */}
      {showTypeSelector && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl ring-1 ring-black/40 w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Choose Element Type</h3>
              <button onClick={() => setShowTypeSelector(false)} className="p-2 text-gray-400 hover:text-white">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {elementTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => openDynamicCreateModal(type)}
                    className="flex flex-col items-center p-4 rounded-xl border-2 border-gray-700 hover:border-amber-500 bg-gray-800/50 hover:bg-gray-700/50 transition-all group"
                  >
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-2 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: type.color ? `${type.color}20` : '#374151' }}
                    >
                      {type.icon || '📝'}
                    </div>
                    <span className="text-white font-medium text-center">{type.name}</span>
                    {type.description && (
                      <span className="text-xs text-gray-500 text-center mt-1 line-clamp-2">{type.description}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#f8f5f0] text-gray-900 rounded-xl shadow-2xl ring-1 ring-black/20 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#e5e1da]">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Preview</p>
                <h3 className="text-2xl font-semibold">{previewTitle}</h3>
                {previewSubtitle && <p className="text-sm text-gray-500 mt-1">{previewSubtitle}</p>}
              </div>
              <button onClick={() => setPreviewItem(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
            <div className="p-8 space-y-6 font-serif">
              {previewCoverImage && (
                <div className="overflow-hidden rounded-xl border border-[#e5e1da]">
                  <img src={previewCoverImage} alt={previewTitle} className="w-full max-h-72 object-cover" />
                </div>
              )}

              {previewDescription && (
                <div className="text-[15px] leading-relaxed whitespace-pre-wrap text-gray-700">
                  {previewDescription}
                </div>
              )}

              {previewDetails.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {previewDetails.map((detail) => (
                    <div key={detail.label} className="rounded-lg border border-[#e5e1da] bg-white/70 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.15em] text-gray-400">{detail.label}</p>
                      <p className="mt-1 text-sm text-gray-700">{detail.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {Object.keys(previewCustomAttributes || {}).length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-[0.2em] text-gray-500">Custom Attributes</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(previewCustomAttributes).map(([key, value]) => (
                      <div key={key} className="rounded-lg border border-[#e5e1da] bg-white/70 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.15em] text-gray-400">{key}</p>
                        <p className="mt-1 text-sm text-gray-700">{formatPreviewValue(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {previewGallery.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-[0.2em] text-gray-500">Gallery</h4>
                  <MediaGallery media={previewGallery} coverImage={previewCoverImage} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl ring-1 ring-black/40 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            {modalMode === 'dynamic' && selectedElementType ? (
              <div className="p-8">
                <ElementForm
                  elementType={selectedElementType}
                  element={editingItem}
                  worldId={worldId!}
                  onSave={handleDynamicSave}
                  onCancel={() => setShowModal(false)}
                  saving={saving}
                />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                  <h3 className="text-xl font-bold text-white">
                    {editingItem ? 'Edit' : 'Add'} {getSingular(classicModalType)}
                  </h3>
                  <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-white">
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-8">
                  {renderClassicFormFields()}
                  <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-700">
                    <button onClick={() => setShowModal(false)} className="btn btn-secondary">
                      Cancel
                    </button>
                    <button
                      onClick={handleClassicSave}
                      disabled={saving}
                      className="btn btn-primary disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
