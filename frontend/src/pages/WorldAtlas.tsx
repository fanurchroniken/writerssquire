import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  GlobeAltIcon,
  MapIcon,
  MapPinIcon,
  UserGroupIcon,
  ClockIcon,
  CalendarIcon,
  SparklesIcon,
  BookOpenIcon,
  LinkIcon,
  PhotoIcon,
  Square3Stack3DIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import type { ElementRelationship, ElementType, MediaReference, WorldElement } from '../types/worldbuilding';
import MediaGallery from '../components/worldbuilding/MediaGallery';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface World {
  id: string;
  title: string;
  description?: string;
  cover_image?: string;
  visibility: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

interface Country {
  id: string;
  name: string;
  description?: string;
  capital?: string;
  population?: number;
  government_type?: string;
  culture?: string;
  history?: string;
  geography?: string;
  flag_image?: string;
  map_image?: string;
  custom_properties?: Record<string, any>;
  gallery?: MediaReference[];
  metadata?: Record<string, any>;
}

interface Region {
  id: string;
  name: string;
  description?: string;
  type?: string;
  country_id?: string;
  country?: { id: string; name: string };
  map_image?: string;
  custom_properties?: Record<string, any>;
  gallery?: MediaReference[];
  metadata?: Record<string, any>;
}

interface Character {
  id: string;
  name: string;
  full_name?: string;
  description?: string;
  role?: string;
  status?: string;
  species?: string;
  age?: number;
  gender?: string;
  portrait_image?: string;
  location_id?: string;
  custom_properties?: Record<string, any>;
  gallery?: MediaReference[];
  metadata?: Record<string, any>;
}

interface Timeline {
  id: string;
  title: string;
  description?: string;
  era?: string;
  start_date?: string;
  end_date?: string;
}

interface WorldEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  end_date?: string;
  timeline_id?: string;
  timeline?: { id: string; title: string };
  location?: string;
  location_id?: string;
  significance?: string;
  participants?: string[];
}

interface Location {
  id: string;
  name: string;
  description?: string;
  type?: string;
  country_id?: string;
  region_id?: string;
  country?: { id: string; name: string };
  region?: { id: string; name: string };
  map_image?: string;
  custom_properties?: Record<string, any>;
  gallery?: MediaReference[];
}

type AtlasEntryKind =
  | 'overview'
  | 'country'
  | 'region'
  | 'character'
  | 'timeline'
  | 'event'
  | 'location'
  | 'dynamic';

interface AtlasEntry {
  id: string;
  kind: AtlasEntryKind;
  name: string;
  description?: string;
  coverImage?: string;
  gallery?: MediaReference[];
  data: any;
  elementType?: ElementType;
}

interface QuickStat {
  label: string;
  value: string;
  icon?: ComponentType<{ className?: string }>;
}

const CLASSIC_QUICK_STATS: Record<Exclude<AtlasEntryKind, 'overview' | 'dynamic'>, { label: string; key: string }[]> = {
  country: [
    { label: 'Capital', key: 'capital' },
    { label: 'Population', key: 'population' },
    { label: 'Government', key: 'government_type' },
    { label: 'Culture', key: 'culture' },
  ],
  region: [
    { label: 'Type', key: 'type' },
    { label: 'Country', key: 'country' },
    { label: 'Climate', key: 'climate' },
    { label: 'Population', key: 'population' },
  ],
  character: [
    { label: 'Role', key: 'role' },
    { label: 'Status', key: 'status' },
    { label: 'Species', key: 'species' },
    { label: 'Age', key: 'age' },
  ],
  timeline: [
    { label: 'Era', key: 'era' },
    { label: 'Start Date', key: 'start_date' },
    { label: 'End Date', key: 'end_date' },
  ],
  event: [
    { label: 'Date', key: 'date' },
    { label: 'End Date', key: 'end_date' },
    { label: 'Location', key: 'location' },
    { label: 'Significance', key: 'significance' },
  ],
  location: [
    { label: 'Type', key: 'type' },
    { label: 'Country', key: 'country' },
    { label: 'Region', key: 'region' },
    { label: 'Population', key: 'population' },
  ],
};

const STAT_ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  Capital: MapPinIcon,
  Population: UserGroupIcon,
  Government: GlobeAltIcon,
  Culture: BookOpenIcon,
  Type: Square3Stack3DIcon,
  Country: GlobeAltIcon,
  Region: MapIcon,
  Role: UserGroupIcon,
  Status: SparklesIcon,
  Species: SparklesIcon,
  Age: UserGroupIcon,
  Era: ClockIcon,
  'Start Date': CalendarIcon,
  'End Date': CalendarIcon,
  Date: CalendarIcon,
  Location: MapPinIcon,
  Significance: SparklesIcon,
};

const entryKey = (entry: AtlasEntry) => `${entry.kind}:${entry.id}`;

export default function WorldAtlas() {
  const { worldId } = useParams<{ worldId: string }>();
  const { session } = useAuth();
  const [world, setWorld] = useState<World | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [events, setEvents] = useState<WorldEvent[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [elementTypes, setElementTypes] = useState<ElementType[]>([]);
  const [dynamicElements, setDynamicElements] = useState<WorldElement[]>([]);
  const [activeEntry, setActiveEntry] = useState<AtlasEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [shareStatus, setShareStatus] = useState('');
  const [isPrivatePreview, setIsPrivatePreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!worldId) return;
    // If user is logged in, use private endpoints to show ALL data (consistent with planner)
    // Otherwise, try public endpoints
    if (session?.access_token) {
      fetchPrivateWorld().then((success) => {
        if (!success) {
          // Fall back to public if private fails
          fetchPublicWorld();
        }
      });
    } else {
      fetchPublicWorld();
    }
  }, [worldId, session?.access_token]);

  const fetchPublicWorld = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        worldRes,
        countriesRes,
        regionsRes,
        charactersRes,
        timelinesRes,
        eventsRes,
        locationsRes,
        elementTypesRes,
        dynamicElementsRes,
      ] = await Promise.all([
        fetch(`${API_URL}/api/public/worlds/${worldId}`),
        fetch(`${API_URL}/api/public/worlds/${worldId}/countries`),
        fetch(`${API_URL}/api/public/worlds/${worldId}/regions`),
        fetch(`${API_URL}/api/public/worlds/${worldId}/characters`),
        fetch(`${API_URL}/api/public/worlds/${worldId}/timelines`),
        fetch(`${API_URL}/api/public/worlds/${worldId}/events`),
        fetch(`${API_URL}/api/public/worlds/${worldId}/locations`),
        fetch(`${API_URL}/api/public/element-types?world_id=${worldId}`),
        fetch(`${API_URL}/api/public/worlds/${worldId}/elements`),
      ]);

      if (!worldRes.ok) {
        if (session?.access_token) {
          const privateLoaded = await fetchPrivateWorld();
          if (!privateLoaded) {
            setError('This atlas is not available.');
          }
          setLoading(false);
          return;
        }
        setError('This atlas is not available.');
        setLoading(false);
        return;
      }

      const worldData = await worldRes.json();
      setWorld(worldData.data);
      setCountries((await countriesRes.json()).data || []);
      setRegions((await regionsRes.json()).data || []);
      setCharacters((await charactersRes.json()).data || []);
      setTimelines((await timelinesRes.json()).data || []);
      setEvents((await eventsRes.json()).data || []);
      setLocations((await locationsRes.json()).data || []);
      setElementTypes((await elementTypesRes.json()).data || []);
      setDynamicElements((await dynamicElementsRes.json()).data || []);
      setIsPrivatePreview(false);
    } catch (err) {
      console.error('Failed to load atlas data', err);
      setError('Failed to load atlas data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrivateWorld = async (): Promise<boolean> => {
    if (!session?.access_token || !worldId) return false;
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${session.access_token}` };
      const [
        worldRes,
        countriesRes,
        regionsRes,
        charactersRes,
        timelinesRes,
        eventsRes,
        locationsRes,
        elementTypesRes,
        dynamicElementsRes,
      ] = await Promise.all([
        fetch(`${API_URL}/api/worlds/${worldId}`, { headers }),
        fetch(`${API_URL}/api/worlds/${worldId}/countries`, { headers }),
        fetch(`${API_URL}/api/worlds/${worldId}/regions`, { headers }),
        fetch(`${API_URL}/api/worlds/${worldId}/characters`, { headers }),
        fetch(`${API_URL}/api/worlds/${worldId}/timelines`, { headers }),
        fetch(`${API_URL}/api/worlds/${worldId}/events`, { headers }),
        fetch(`${API_URL}/api/worlds/${worldId}/locations`, { headers }),
        fetch(`${API_URL}/api/element-types?world_id=${worldId}`, { headers }),
        fetch(`${API_URL}/api/worlds/${worldId}/elements`, { headers }),
      ]);

      if (!worldRes.ok) {
        setLoading(false);
        return false;
      }

      const worldData = await worldRes.json();
      setWorld(worldData.data);
      setCountries((await countriesRes.json()).data || []);
      setRegions((await regionsRes.json()).data || []);
      setCharacters((await charactersRes.json()).data || []);
      setTimelines((await timelinesRes.json()).data || []);
      setEvents((await eventsRes.json()).data || []);
      setLocations((await locationsRes.json()).data || []);
      setElementTypes((await elementTypesRes.json()).data || []);
      setDynamicElements((await dynamicElementsRes.json()).data || []);
      // Only set private preview if world is actually private
      setIsPrivatePreview(worldData.data?.visibility !== 'public');
      setError(null);
      return true;
    } catch (err) {
      console.error('Failed to load private atlas', err);
      setError('Failed to load atlas data.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const elementTypeMap = useMemo(
    () => new Map(elementTypes.map((type) => [type.id, type])),
    [elementTypes]
  );

  const overviewEntry: AtlasEntry | null = world
    ? {
        id: world.id,
        kind: 'overview',
        name: world.title,
        description: world.description,
        coverImage: world.cover_image,
        gallery: [],
        data: world,
      }
    : null;

  const countryEntries: AtlasEntry[] = countries.map((country) => ({
    id: country.id,
    kind: 'country',
    name: country.name,
    description: country.description,
    coverImage: country.flag_image || country.map_image,
    gallery: country.gallery || [],
    data: country,
  }));

  const regionEntries: AtlasEntry[] = regions.map((region) => ({
    id: region.id,
    kind: 'region',
    name: region.name,
    description: region.description,
    coverImage: region.map_image,
    gallery: region.gallery || [],
    data: region,
  }));

  const characterEntries: AtlasEntry[] = characters.map((character) => ({
    id: character.id,
    kind: 'character',
    name: character.name,
    description: character.description,
    coverImage: character.portrait_image,
    gallery: character.gallery || [],
    data: character,
  }));

  const timelineEntries: AtlasEntry[] = timelines.map((timeline) => ({
    id: timeline.id,
    kind: 'timeline',
    name: timeline.title,
    description: timeline.description,
    data: timeline,
  }));

  const eventEntries: AtlasEntry[] = events.map((event) => ({
    id: event.id,
    kind: 'event',
    name: event.title,
    description: event.description,
    data: event,
  }));

  const locationEntries: AtlasEntry[] = locations.map((location) => ({
    id: location.id,
    kind: 'location',
    name: location.name,
    description: location.description,
    coverImage: location.map_image,
    gallery: location.gallery || [],
    data: location,
  }));

  const dynamicEntries: AtlasEntry[] = dynamicElements.map((element) => ({
    id: element.id,
    kind: 'dynamic',
    name: element.name,
    description: element.description,
    coverImage: element.cover_image,
    gallery: element.gallery || [],
    data: element,
    elementType: elementTypeMap.get(element.element_type_id),
  }));

  const allEntries: AtlasEntry[] = [
    ...(overviewEntry ? [overviewEntry] : []),
    ...countryEntries,
    ...regionEntries,
    ...locationEntries,
    ...characterEntries,
    ...timelineEntries,
    ...eventEntries,
    ...dynamicEntries,
  ];

  const entryLookup = useMemo(() => {
    const map = new Map<string, AtlasEntry>();
    allEntries.forEach((entry) => {
      map.set(entryKey(entry), entry);
    });
    return map;
  }, [allEntries]);

  useEffect(() => {
    if (!activeEntry && overviewEntry) {
      setActiveEntry(overviewEntry);
    }
  }, [activeEntry, overviewEntry]);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const isSearching = normalizedSearch.length > 0;

  const matchSearch = (entry: AtlasEntry) => {
    if (!isSearching) return true;
    const typeLabel =
      entry.kind === 'dynamic'
        ? entry.elementType?.name || 'Custom'
        : entry.kind;
    return `${entry.name} ${entry.description || ''} ${typeLabel}`
      .toLowerCase()
      .includes(normalizedSearch);
  };

  const getClassicFieldValue = (value: any) => {
    if (value && typeof value === 'object' && 'name' in value) return value.name;
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return value;
  };

  const formatValue = (value: any) => {
    if (value === undefined || value === null || value === '') return '';
    if (typeof value === 'number') return value.toLocaleString();
    return String(value);
  };

  const getQuickStats = (entry: AtlasEntry): QuickStat[] => {
    if (entry.kind === 'overview') {
      return [
        { label: 'Countries', value: `${countries.length}`, icon: GlobeAltIcon },
        { label: 'Characters', value: `${characters.length}`, icon: UserGroupIcon },
        { label: 'Locations', value: `${locations.length}`, icon: MapPinIcon },
        { label: 'Lore Entries', value: `${dynamicEntries.length}`, icon: SparklesIcon },
      ];
    }

    if (entry.kind === 'dynamic') {
      const fields = entry.elementType?.fields || [];
      const featured = fields.filter((field) => field.is_featured || field.show_in_list).slice(0, 4);
      return featured
        .map((field) => {
          const value = formatValue(entry.data.properties?.[field.slug]);
          if (!value) return null;
          return {
            label: field.name,
            value,
            icon: SparklesIcon,
          } as QuickStat;
        })
        .filter(Boolean) as QuickStat[];
    }

    const stats = CLASSIC_QUICK_STATS[entry.kind];
    return stats
      .map((stat) => {
        const rawValue = getClassicFieldValue(entry.data[stat.key]);
        const value = formatValue(rawValue);
        if (!value) return null;
        return {
          label: stat.label,
          value,
          icon: STAT_ICON_MAP[stat.label] || Square3Stack3DIcon,
        } as QuickStat;
      })
      .filter(Boolean) as QuickStat[];
  };

  const getHierarchyEntries = (entry: AtlasEntry): AtlasEntry[] => {
    if (entry.kind === 'country') {
      return [
        ...regionEntries.filter((region) => region.data.country_id === entry.id),
        ...locationEntries.filter((location) => location.data.country_id === entry.id),
      ];
    }

    if (entry.kind === 'region') {
      return locationEntries.filter((location) => location.data.region_id === entry.id);
    }

    if (entry.kind === 'timeline') {
      return eventEntries.filter((event) => event.data.timeline_id === entry.id);
    }

    if (entry.kind === 'dynamic') {
      const relationships: ElementRelationship[] = entry.data.relationships || [];
      return relationships
        .filter((rel) => ['member', 'school', 'subdiscipline', 'subtype'].includes(rel.relationship_type))
        .map((rel) => resolveRelationshipEntry(rel))
        .filter((relEntry): relEntry is AtlasEntry => Boolean(relEntry));
    }

    return [];
  };

  const resolveRelationshipEntry = (rel: ElementRelationship): AtlasEntry | null => {
    if (!rel?.target_id || !rel.target_type) return null;
    switch (rel.target_type) {
      case 'world_elements':
        return entryLookup.get(`dynamic:${rel.target_id}`) || null;
      case 'characters':
        return entryLookup.get(`character:${rel.target_id}`) || null;
      case 'countries':
        return entryLookup.get(`country:${rel.target_id}`) || null;
      case 'regions':
        return entryLookup.get(`region:${rel.target_id}`) || null;
      case 'locations':
        return entryLookup.get(`location:${rel.target_id}`) || null;
      case 'events':
        return entryLookup.get(`event:${rel.target_id}`) || null;
      case 'timelines':
        return entryLookup.get(`timeline:${rel.target_id}`) || null;
      default:
        return null;
    }
  };

  const getConnections = (entry: AtlasEntry): AtlasEntry[] => {
    if (entry.kind === 'character') {
      return eventEntries.filter((event) => (event.data.participants || []).includes(entry.id));
    }

    if (entry.kind === 'event') {
      return characterEntries.filter((character) => (entry.data.participants || []).includes(character.id));
    }

    if (entry.kind === 'location') {
      return eventEntries.filter((event) => event.data.location_id === entry.id);
    }

    if (entry.kind === 'dynamic') {
      const relationships: ElementRelationship[] = entry.data.relationships || [];
      return relationships
        .map((rel) => resolveRelationshipEntry(rel))
        .filter((relEntry): relEntry is AtlasEntry => Boolean(relEntry));
    }

    return [];
  };

  const getRelatedFootnotes = (entry: AtlasEntry): ElementRelationship[] => {
    if (entry.kind !== 'dynamic') return [];
    return (entry.data.relationships || []).filter((rel: ElementRelationship) => rel.description);
  };

  // Get all properties for an entry (excluding metadata/internal fields)
  const getAllProperties = (entry: AtlasEntry): Array<{ label: string; value: string }> => {
    if (!entry) return [];
    
    // Skip overview entries - they use a different display
    if (entry.kind === 'overview') return [];
    
    const skipFields = new Set(['id', 'world_id', 'is_public', 'is_private', 'created_at', 'updated_at', 'metadata', 'custom_attributes', 'gallery', 'cover_image', 'portrait_image', 'flag_image', 'map_image', 'description', 'name', 'title', 'tags']);
    
    if (entry.kind === 'dynamic') {
      // For dynamic elements, show all fields from the element type
      const fields = entry.elementType?.fields || [];
      const properties = entry.data.properties || {};
      const customAttributes = properties.custom_attributes || {};
      
      const props: Array<{ label: string; value: string }> = [];
      
      // Add all defined fields
      fields.forEach((field) => {
        const value = properties[field.slug];
        if (value !== undefined && value !== null && value !== '') {
          props.push({
            label: field.name,
            value: formatValue(value),
          });
        }
      });
      
      // Add custom attributes
      Object.entries(customAttributes).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          props.push({
            label: key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
            value: formatValue(value),
          });
        }
      });
      
      return props;
    }
    
    // For classic elements, show all properties except metadata/internal fields
    const props: Array<{ label: string; value: string }> = [];
    const data = entry.data;
    
    // Define all possible classic element fields with labels
    const classicFieldLabels: Record<string, Record<string, string>> = {
      country: {
        capital: 'Capital',
        population: 'Population',
        government_type: 'Government',
        culture: 'Culture',
        history: 'History',
        geography: 'Geography',
        type: 'Type',
      },
      region: {
        type: 'Type',
        climate: 'Climate',
        population: 'Population',
        geography: 'Geography',
      },
      character: {
        full_name: 'Full Name',
        aliases: 'Aliases',
        role: 'Role',
        status: 'Status',
        birth_date: 'Birth Date',
        death_date: 'Death Date',
        age: 'Age',
        gender: 'Gender',
        species: 'Species',
        occupation: 'Occupation',
        appearance: 'Appearance',
        personality: 'Personality',
        backstory: 'Backstory',
        motivations: 'Motivations',
      },
      timeline: {
        era: 'Era',
        start_date: 'Start Date',
        end_date: 'End Date',
      },
      event: {
        date: 'Date',
        end_date: 'End Date',
        location: 'Location',
        significance: 'Significance',
        participants: 'Participants',
      },
      location: {
        type: 'Type',
        population: 'Population',
        climate: 'Climate',
        notable_features: 'Notable Features',
      },
    };
    
    const labels = classicFieldLabels[entry.kind] || {};
    
    // Get all fields from the data, excluding skipped fields
    Object.keys(data || {}).forEach((key) => {
      if (skipFields.has(key)) return;
      
      const value = data[key];
      // Allow zero values and empty arrays/objects (they might be valid)
      if (value === undefined || value === null) return;
      // Only skip empty strings, not numbers (including 0)
      if (value === '') return;
      
      const label = labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      const formattedValue = formatValue(getClassicFieldValue(value));
      
      if (formattedValue) {
        props.push({ label, value: formattedValue });
      }
    });
    
    // Also include custom_properties if they exist and have values
    if (data.custom_properties && typeof data.custom_properties === 'object') {
      const customPropsEntries = Object.entries(data.custom_properties).filter(([_, value]) => 
        value !== undefined && value !== null && value !== ''
      );
      if (customPropsEntries.length > 0) {
        customPropsEntries.forEach(([key, value]) => {
          props.push({
            label: key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
            value: formatValue(value),
          });
        });
      }
    }
    
    return props;
  };

  const getHeroImage = (entry: AtlasEntry | null): string | undefined => {
    if (!entry) return undefined;
    if (entry.coverImage) return entry.coverImage;
    const gallery = entry.gallery || [];
    if (gallery.length > 0) return gallery[0].url;
    return world?.cover_image;
  };

  const handleShare = async () => {
    if (isPrivatePreview) {
      setShareStatus('Make the world public to share this atlas.');
      setTimeout(() => setShareStatus(''), 2500);
      return;
    }
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setShareStatus('Link copied to clipboard');
        setTimeout(() => setShareStatus(''), 2000);
      }
    } catch (err) {
      console.error('Share failed', err);
    }
  };

  const navSection = (
    label: string,
    entries: AtlasEntry[],
    icon: ComponentType<{ className?: string }>
  ) => {
    const Icon = icon;
    const filtered = entries.filter(matchSearch);
    if (filtered.length === 0) return null;

    return (
      <details className="group" open>
        <summary className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer transition-all list-none">
          <ChevronRightIcon className="h-4 w-4 text-slate-500 group-open:rotate-90 transition-transform" />
          <Icon className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{label}</span>
          <span className="ml-auto text-xs text-slate-500">{filtered.length}</span>
        </summary>
        <div className="pl-8 py-2 space-y-1 border-l border-white/5 ml-4 mt-1">
          {filtered.map((entry) => (
            <button
              key={entryKey(entry)}
              onClick={() => setActiveEntry(entry)}
              className={`w-full text-left text-sm px-2 py-1 rounded-lg transition-colors ${
                activeEntry?.id === entry.id && activeEntry.kind === entry.kind
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-400 hover:text-primary'
              }`}
            >
              {entry.name}
            </button>
          ))}
        </div>
      </details>
    );
  };

  const dynamicSections = elementTypes.map((type) => {
    const entries = dynamicEntries.filter((entry) => entry.elementType?.id === type.id);
    if (entries.length === 0) return null;
    return navSection(type.name, entries, SparklesIcon);
  });

  const heroImage = getHeroImage(activeEntry);
  const quickStats = activeEntry ? getQuickStats(activeEntry) : [];
  const hierarchyEntries = activeEntry ? getHierarchyEntries(activeEntry) : [];
  const connections = activeEntry ? getConnections(activeEntry) : [];
  const footnotes = activeEntry ? getRelatedFootnotes(activeEntry) : [];

  const relatedEntries = [...hierarchyEntries, ...connections].filter(
    (entry, index, self) => self.findIndex((item) => entryKey(item) === entryKey(entry)) === index
  );

  const gallery = activeEntry?.gallery || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-slate-400">Loading atlas...</p>
        </div>
      </div>
    );
  }

  if (error || !world) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-3">Atlas unavailable</h2>
          <p className="text-slate-400 mb-6">{error || 'This world is private or no longer shared.'}</p>
          <Link to="/" className="btn btn-primary">
            Return to WriterSquire
          </Link>
        </div>
      </div>
    );
  }

  const shareDisabled = isPrivatePreview || world.visibility !== 'public';

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-white/5 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
            <ArrowLeftIcon className="h-4 w-4" />
            <span className="text-sm font-semibold">WriterSquire</span>
          </Link>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Digital Atlas</p>
            <h1 className="text-white font-bold tracking-tight">{world.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <MagnifyingGlassIcon className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search the atlas..."
              className="w-72 bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary focus:bg-white/10 transition-all outline-none"
            />
          </div>
          <button
            onClick={handleShare}
            disabled={shareDisabled}
            className={`btn btn-secondary border-white/10 text-slate-200 hover:bg-white/10 ${
              shareDisabled ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            <LinkIcon className="h-4 w-4" />
            Share
          </button>
          {shareStatus && <span className="text-xs text-primary">{shareStatus}</span>}
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="w-72 border-r border-white/5 bg-white/5 backdrop-blur-xl p-6 overflow-y-auto custom-scrollbar hidden lg:block">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">World Hierarchy</h3>
          <div className="space-y-2">
            {overviewEntry && navSection('World Overview', [overviewEntry], GlobeAltIcon)}
            {navSection('Countries', countryEntries, GlobeAltIcon)}
            {navSection('Regions', regionEntries, MapIcon)}
            {navSection('Locations', locationEntries, MapPinIcon)}
            {navSection('Characters', characterEntries, UserGroupIcon)}
            {navSection('Timelines', timelineEntries, ClockIcon)}
            {navSection('Events', eventEntries, CalendarIcon)}
            {dynamicEntries.length > 0 && (
              <details className="group" open>
                <summary className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer transition-all list-none">
                  <ChevronRightIcon className="h-4 w-4 text-slate-500 group-open:rotate-90 transition-transform" />
                  <SparklesIcon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Lore Collections</span>
                </summary>
                <div className="pl-5 mt-2 space-y-2">{dynamicSections}</div>
              </details>
            )}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {isPrivatePreview && world && world.visibility !== 'public' && (
            <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-100 px-8 py-3 text-sm">
              Private preview. Set this world to public to enable sharing.
              <Link to={`/worlds/${worldId}`} className="ml-2 underline underline-offset-2">
                Go to world settings
              </Link>
            </div>
          )}
          <div className="relative h-80 w-full">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: heroImage ? `url('${heroImage}')` : undefined,
              }}
            >
              {!heroImage && (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/40 via-slate-900 to-slate-950" />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-10 w-full">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-primary text-slate-950 text-[10px] font-bold uppercase tracking-widest rounded-full">
                  {activeEntry?.kind === 'overview' ? 'World Overview' : activeEntry?.kind || 'Entry'}
                </span>
                {activeEntry?.kind === 'dynamic' && activeEntry.elementType && (
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded-full border border-white/10">
                    {activeEntry.elementType.name}
                  </span>
                )}
              </div>
              <h2 className="text-5xl font-extrabold text-white tracking-tight mb-2">
                {activeEntry?.name || world.title}
              </h2>
              <p className="text-slate-300 text-sm max-w-2xl">
                {activeEntry?.description || world.description || 'A living atlas of worlds, lore, and history.'}
              </p>
            </div>
          </div>

          <div className="px-8 py-10 max-w-5xl mx-auto space-y-12">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quickStats.map((stat) => {
                const Icon = stat.icon || Square3Stack3DIcon;
                return (
                  <div
                    key={`${stat.label}-${stat.value}`}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
                        <p className="text-lg font-semibold text-white">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <section className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <BookOpenIcon className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
                  Hyper-Linked Lore
                </h3>
              </div>
              <div className="text-slate-200 leading-relaxed text-base">
                {activeEntry?.description ? (
                  <p className="first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-3 first-letter:float-left">
                    {activeEntry.description}
                  </p>
                ) : (
                  <p className="text-slate-400">
                    This entry is waiting for its first chronicle. Add descriptions, myths, and footnotes to bring it to
                    life.
                  </p>
                )}
              </div>
            </section>

            {/* All Properties Section */}
            {(() => {
              const allProperties = activeEntry ? getAllProperties(activeEntry) : [];
              if (allProperties.length === 0) return null;
              
              return (
                <section className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <Square3Stack3DIcon className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
                      All Characteristics
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {allProperties.map((prop, index) => (
                      <div key={`${prop.label}-${index}`} className="space-y-1">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{prop.label}</p>
                        <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{prop.value}</p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })()}

            <section className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-3">
                <PhotoIcon className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
                  Research & Reference Bin
                </h3>
              </div>
              {gallery.length === 0 && !heroImage ? (
                <p className="text-sm text-slate-500">
                  Store scanned maps, letters, mood boards, or video inspirations here.
                </p>
              ) : (
                <MediaGallery media={gallery} coverImage={heroImage} />
              )}
            </section>
          </div>
        </main>

        <aside className="w-80 border-l border-white/5 bg-white/5 backdrop-blur-xl p-6 hidden xl:flex flex-col gap-6 overflow-y-auto custom-scrollbar">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Related Entries
            </h3>
            <div className="space-y-3">
              {relatedEntries.length === 0 ? (
                <p className="text-xs text-slate-500">No linked entries yet.</p>
              ) : (
                relatedEntries.slice(0, 6).map((entry) => (
                  <button
                    key={entryKey(entry)}
                    onClick={() => setActiveEntry(entry)}
                    className="w-full text-left flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xs text-primary">
                      {(entry.kind === 'dynamic' ? entry.elementType?.icon : null) || '📘'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{entry.name}</p>
                      <p className="text-[10px] uppercase text-slate-500">
                        {entry.kind === 'dynamic' ? entry.elementType?.name : entry.kind}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <BookOpenIcon className="h-4 w-4" />
              Active Footnotes
            </h3>
            <div className="space-y-3">
              {footnotes.length === 0 ? (
                <p className="text-xs text-slate-500">No footnotes recorded yet.</p>
              ) : (
                footnotes.slice(0, 4).map((note, index) => (
                  <div key={`${note.target_id}-${index}`} className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <p className="text-[10px] font-bold text-primary uppercase mb-2">
                      {note.relationship_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">{note.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
