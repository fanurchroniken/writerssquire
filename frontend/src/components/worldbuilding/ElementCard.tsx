import type { WorldElement, ElementType } from '../../types/worldbuilding';
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface ElementCardProps {
  element: WorldElement;
  elementType?: ElementType;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  onToggleVisibility?: () => void;
}

export default function ElementCard({
  element,
  elementType,
  onEdit,
  onDelete,
  onView,
  onToggleVisibility,
}: ElementCardProps) {
  // Get featured property values
  const featuredFields = elementType?.fields?.filter(f => f.is_featured) || [];
  const listFields = elementType?.fields?.filter(f => f.show_in_list && !f.is_featured) || [];

  const getPropertyValue = (slug: string): string | null => {
    const value = element.properties[slug];
    if (value === undefined || value === null || value === '') return null;
    
    // Handle arrays
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    
    // Handle booleans
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    return String(value);
  };

  const getFieldLabel = (slug: string, value: string): string => {
    const field = elementType?.fields?.find(f => f.slug === slug);
    if (field?.options) {
      const option = field.options.find(o => o.value === value);
      if (option) return option.label;
    }
    return value;
  };

  const isPublic = !element.is_private;

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-all group">
      {/* Cover Image */}
      {element.cover_image && (
        <div className="aspect-video bg-gray-900 relative overflow-hidden">
          <img
            src={element.cover_image}
            alt={element.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          {/* Element Type Badge */}
          {elementType && (
            <div
              className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
              style={{
                backgroundColor: elementType.color ? `${elementType.color}cc` : '#374151cc',
                color: 'white',
              }}
            >
              <span>{elementType.icon}</span>
              <span>{elementType.name}</span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {!element.cover_image && elementType && (
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                style={{
                  backgroundColor: elementType.color ? `${elementType.color}20` : '#374151',
                }}
              >
                {elementType.icon || '📝'}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-white truncate">{element.name}</h3>
              {!element.cover_image && elementType && (
                <span className="text-xs text-gray-500">{elementType.name}</span>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onToggleVisibility && (
              <button
                onClick={onToggleVisibility}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                title={isPublic ? 'Make private' : 'Make public'}
              >
                {isPublic ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
              </button>
            )}
            {onView && (
              <button
                onClick={onView}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                title="View"
              >
                <EyeIcon className="w-4 h-4" />
              </button>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                title="Edit"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg"
                title="Delete"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        {element.description && (
          <p className="mt-2 text-sm text-gray-400 line-clamp-2">
            {element.description}
          </p>
        )}

        <span className={`mt-3 inline-flex items-center text-xs px-2 py-0.5 rounded-full ${
          isPublic ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-700 text-gray-300'
        }`}>
          {isPublic ? 'Public' : 'Private'}
        </span>

        {/* Featured Properties */}
        {featuredFields.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {featuredFields.slice(0, 3).map((field) => {
              const value = getPropertyValue(field.slug);
              if (!value) return null;
              return (
                <span
                  key={field.slug}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-700 text-gray-300"
                >
                  <span className="text-gray-500 mr-1">{field.name}:</span>
                  {getFieldLabel(field.slug, value)}
                </span>
              );
            })}
          </div>
        )}

        {/* List Fields */}
        {listFields.length > 0 && (
          <div className="mt-3 space-y-1">
            {listFields.slice(0, 2).map((field) => {
              const value = getPropertyValue(field.slug);
              if (!value) return null;
              return (
                <div key={field.slug} className="text-xs text-gray-400">
                  <span className="text-gray-500">{field.name}:</span>{' '}
                  {getFieldLabel(field.slug, value)}
                </div>
              );
            })}
          </div>
        )}

        {/* Tags */}
        {element.tags && element.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {element.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 bg-gray-700/50 text-gray-400 text-xs rounded"
              >
                #{tag}
              </span>
            ))}
            {element.tags.length > 4 && (
              <span className="text-xs text-gray-500">+{element.tags.length - 4} more</span>
            )}
          </div>
        )}

        {/* Gallery Preview */}
        {element.gallery && element.gallery.length > 0 && !element.cover_image && (
          <div className="mt-3 flex -space-x-2">
            {element.gallery.slice(0, 4).map((media, idx) => (
              <div
                key={media.media_id}
                className="w-8 h-8 rounded-md bg-gray-700 border-2 border-gray-800 overflow-hidden"
              >
                <img
                  src={media.thumbnail_url || media.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {element.gallery.length > 4 && (
              <div className="w-8 h-8 rounded-md bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-xs text-gray-400">
                +{element.gallery.length - 4}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
