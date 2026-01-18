import { useState } from 'react';
import type { ElementTypeField } from '../../types/worldbuilding';
import { PhotoIcon, VideoCameraIcon, LinkIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface DynamicFormFieldProps {
  field: ElementTypeField;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}

export default function DynamicFormField({ field, value, onChange, disabled }: DynamicFormFieldProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(value || null);

  const baseInputClass = "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50";
  
  const renderField = () => {
    switch (field.field_type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            className={baseInputClass}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            rows={4}
            className={baseInputClass}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
            placeholder={field.placeholder}
            disabled={disabled}
            min={field.validation?.min}
            max={field.validation?.max}
            className={baseInputClass}
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={baseInputClass}
          >
            <option value="">Select {field.name.toLowerCase()}...</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedValues.map((v: string) => {
                const option = field.options?.find(o => o.value === v);
                return (
                  <span
                    key={v}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-900 text-amber-200"
                  >
                    {option?.label || v}
                    <button
                      type="button"
                      onClick={() => onChange(selectedValues.filter((sv: string) => sv !== v))}
                      className="ml-1 hover:text-white"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value && !selectedValues.includes(e.target.value)) {
                  onChange([...selectedValues, e.target.value]);
                }
              }}
              disabled={disabled}
              className={baseInputClass}
            >
              <option value="">Add {field.name.toLowerCase()}...</option>
              {field.options?.filter(opt => !selectedValues.includes(opt.value)).map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        );

      case 'boolean':
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
              className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-gray-300">{field.placeholder || 'Yes'}</span>
          </label>
        );

      case 'date':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || 'e.g., Year 1234, Spring of the Third Age'}
            disabled={disabled}
            className={baseInputClass}
          />
        );

      case 'image':
        return (
          <div className="space-y-3">
            {imagePreview && (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full h-40 object-contain rounded-lg border border-gray-600"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    onChange(null);
                  }}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-3">
              <input
                type="url"
                value={typeof value === 'string' ? value : ''}
                onChange={(e) => {
                  onChange(e.target.value);
                  setImagePreview(e.target.value);
                }}
                placeholder="Paste image URL..."
                disabled={disabled}
                className={`${baseInputClass} flex-1`}
              />
              <div className="flex items-center justify-center w-10 h-10 bg-gray-600 rounded-lg">
                <PhotoIcon className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Paste an image URL from the web or your media library
            </p>
          </div>
        );

      case 'video':
        return (
          <div className="space-y-3">
            {value && (
              <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
                {value.includes('youtube') ? (
                  <iframe
                    src={value.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    allowFullScreen
                  />
                ) : value.includes('vimeo') ? (
                  <iframe
                    src={value.replace('vimeo.com/', 'player.vimeo.com/video/')}
                    className="w-full h-full"
                    allowFullScreen
                  />
                ) : (
                  <video src={value} controls className="w-full h-full" />
                )}
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-3">
              <input
                type="url"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Paste YouTube, Vimeo, or video URL..."
                disabled={disabled}
                className={`${baseInputClass} flex-1`}
              />
              <div className="flex items-center justify-center w-10 h-10 bg-gray-600 rounded-lg">
                <VideoCameraIcon className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        );

      case 'link':
        return (
          <div className="flex items-center gap-3">
            <input
              type="url"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder || 'https://...'}
              disabled={disabled}
              className={`${baseInputClass} flex-1`}
            />
            {value && (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 bg-amber-600 rounded-lg hover:bg-amber-500 transition-colors"
              >
                <LinkIcon className="w-5 h-5 text-white" />
              </a>
            )}
          </div>
        );

      case 'element_ref':
        // This would need a selector component - for now, text input
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Element ID..."
            disabled={disabled}
            className={baseInputClass}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            className={baseInputClass}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
        {field.name}
        {field.is_required && <span className="text-red-400">*</span>}
        {field.is_featured && (
          <span className="text-xs px-2 py-0.5 bg-amber-900 text-amber-300 rounded">Featured</span>
        )}
      </label>
      {field.description && (
        <p className="text-xs text-gray-500">{field.description}</p>
      )}
      {renderField()}
    </div>
  );
}
