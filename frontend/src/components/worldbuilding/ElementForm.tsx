import { useState, useEffect } from 'react';
import type { ElementType, WorldElement, ElementTypeField } from '../../types/worldbuilding';
import DynamicFormField from './DynamicFormField';
import MediaGallery from './MediaGallery';
import CustomAttributesEditor from './CustomAttributesEditor';
import {
  XMarkIcon,
  PhotoIcon,
  PlusIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

interface ElementFormProps {
  elementType: ElementType;
  element?: WorldElement | null;
  worldId: string;
  onSave: (data: Partial<WorldElement>) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

export default function ElementForm({
  elementType,
  element,
  worldId,
  onSave,
  onCancel,
  saving = false,
}: ElementFormProps) {
  const initialProperties = element?.properties && typeof element.properties === 'object'
    ? element.properties
    : {};
  const {
    custom_attributes: initialCustomAttributes = {},
    ...baseProperties
  } = initialProperties as Record<string, any>;

  const [name, setName] = useState(element?.name || '');
  const [description, setDescription] = useState(element?.description || '');
  const [properties, setProperties] = useState<Record<string, any>>(baseProperties);
  const [customAttributes, setCustomAttributes] = useState<Record<string, string>>(
    typeof initialCustomAttributes === 'object' && initialCustomAttributes !== null
      ? initialCustomAttributes
      : {}
  );
  const [coverImage, setCoverImage] = useState(element?.cover_image || '');
  const [tags, setTags] = useState<string[]>(element?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [gallery, setGallery] = useState(element?.gallery || []);
  const [isPublic, setIsPublic] = useState(element ? !element.is_private : true);

  // Sort fields by sort_order
  const sortedFields = [...(elementType.fields || [])].sort((a, b) => a.sort_order - b.sort_order);
  const featuredFields = sortedFields.filter(f => f.is_featured);
  const otherFields = sortedFields.filter(f => !f.is_featured);

  const handlePropertyChange = (slug: string, value: any) => {
    setProperties(prev => ({
      ...prev,
      [slug]: value,
    }));
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleAddMedia = () => {
    if (mediaUrl.trim()) {
      setGallery([...gallery, { 
        media_id: `temp-${Date.now()}`, 
        url: mediaUrl.trim(), 
        thumbnail_url: mediaUrl.trim() 
      }]);
      setMediaUrl('');
      setShowMediaModal(false);
    }
  };

  const handleRemoveMedia = (mediaId: string) => {
    setGallery(gallery.filter(m => m.media_id !== mediaId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Name is required');
      return;
    }

    if (!elementType?.id) {
      console.error('Element type missing:', { elementType, hasId: !!elementType?.id });
      alert('Element type is required. Please select a type first.');
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      properties: {
        ...properties,
        custom_attributes: customAttributes,
      },
      cover_image: coverImage || undefined,
      gallery,
      tags,
      is_private: !isPublic,
      element_type_id: elementType.id,
    };

    console.log('ElementForm submitting:', { 
      elementTypeId: elementType.id,
      elementTypeName: elementType.name,
      payload 
    });

    await onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header with Element Type Info */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
            style={{ backgroundColor: elementType.color ? `${elementType.color}20` : '#374151' }}
          >
            {elementType.icon || '📝'}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {element ? 'Edit' : 'New'} {elementType.name}
            </h3>
            {elementType.description && (
              <p className="text-sm text-gray-400">{elementType.description}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
          aria-label="Close"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/60 border border-gray-700">
          <div>
            <p className="text-sm font-medium text-white">Public visibility</p>
            <p className="text-xs text-gray-400">
              {isPublic ? 'Visible in the shared atlas.' : 'Hidden from public atlas.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsPublic(!isPublic)}
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
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`Enter ${elementType.name.toLowerCase()} name...`}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe this element..."
            rows={3}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Cover Image */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Cover Image
        </label>
        {coverImage ? (
          <div className="relative inline-block">
            <img
              src={coverImage}
              alt="Cover preview"
              className="h-32 rounded-lg object-cover border border-gray-600"
            />
            <button
              type="button"
              onClick={() => setCoverImage('')}
              className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="Paste image URL..."
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div className="p-2 bg-gray-600 rounded-lg">
              <PhotoIcon className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        )}
      </div>

      {/* Featured Fields */}
      {featuredFields.length > 0 && (
        <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
            Key Properties
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredFields.map((field) => (
              <DynamicFormField
                key={field.id}
                field={field}
                value={properties[field.slug]}
                onChange={(value) => handlePropertyChange(field.slug, value)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Fields */}
      {otherFields.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Additional Properties
          </h4>
          <div className="space-y-4">
            {otherFields.map((field) => (
              <DynamicFormField
                key={field.id}
                field={field}
                value={properties[field.slug]}
                onChange={(value) => handlePropertyChange(field.slug, value)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Custom Attributes */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Custom Attributes
        </h4>
        <CustomAttributesEditor
          value={customAttributes}
          onChange={setCustomAttributes}
        />
      </div>

      {/* Gallery */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-300">
            Gallery
          </label>
          <button
            type="button"
            onClick={() => setShowMediaModal(true)}
            className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <PlusIcon className="w-4 h-4" />
            Add Media
          </button>
        </div>
        
        {gallery.length > 0 ? (
          <MediaGallery
            media={gallery}
            coverImage={coverImage}
            editable
            onRemoveMedia={handleRemoveMedia}
            onSetCover={setCoverImage}
            compact
          />
        ) : (
          <div className="p-8 border-2 border-dashed border-gray-700 rounded-lg text-center text-gray-500">
            <PhotoIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No media added yet</p>
            <button
              type="button"
              onClick={() => setShowMediaModal(true)}
              className="mt-2 text-amber-400 hover:text-amber-300 text-sm"
            >
              Add images or videos
            </button>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-700 text-gray-300"
            >
              <TagIcon className="w-3 h-3 mr-1" />
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 hover:text-red-400"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            placeholder="Add a tag..."
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white text-sm"
          >
            Add
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="px-6 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
        >
          {saving ? 'Saving...' : element ? 'Update' : 'Create'}
        </button>
      </div>

      {/* Add Media Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Add Media</h3>
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Image or Video URL
                </label>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="Paste URL (image, YouTube, Vimeo...)"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  autoFocus
                />
                <p className="mt-1 text-xs text-gray-500">
                  Supports: Image URLs, YouTube, Vimeo, and direct video links
                </p>
              </div>
              {mediaUrl && (
                <div className="p-3 bg-gray-900 rounded-lg">
                  <p className="text-sm text-gray-400 truncate">{mediaUrl}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-gray-700">
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddMedia}
                disabled={!mediaUrl.trim()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 text-white rounded-lg"
              >
                Add Media
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
