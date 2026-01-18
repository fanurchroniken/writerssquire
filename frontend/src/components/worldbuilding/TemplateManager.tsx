import { useState, useEffect } from 'react';
import { FIELD_TYPES, type ElementType, type ElementTypeField } from '../../types/worldbuilding';
import {
  PlusIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';

interface TemplateManagerProps {
  worldId: string;
  elementTypes: ElementType[];
  onTypesChange: () => void;
  apiUrl: string;
  accessToken: string;
}

interface FieldFormData {
  name: string;
  slug: string;
  field_type: string;
  description: string;
  placeholder: string;
  is_required: boolean;
  is_featured: boolean;
  show_in_list: boolean;
  options: { value: string; label: string }[];
  default_value: string;
}

export default function TemplateManager({
  worldId,
  elementTypes,
  onTypesChange,
  apiUrl,
  accessToken,
}: TemplateManagerProps) {
  const [selectedType, setSelectedType] = useState<ElementType | null>(null);
  const [showCreateType, setShowCreateType] = useState(false);
  const [showCreateField, setShowCreateField] = useState(false);
  const [editingField, setEditingField] = useState<ElementTypeField | null>(null);
  const [saving, setSaving] = useState(false);

  // Type form
  const [typeForm, setTypeForm] = useState({
    name: '',
    description: '',
    icon: '📝',
    color: '#d97706',
  });

  // Field form
  const [fieldForm, setFieldForm] = useState<FieldFormData>({
    name: '',
    slug: '',
    field_type: 'text',
    description: '',
    placeholder: '',
    is_required: false,
    is_featured: false,
    show_in_list: true,
    options: [],
    default_value: '',
  });

  const [newOption, setNewOption] = useState({ value: '', label: '' });

  // Filter to show only custom (non-system) types, plus system types for viewing
  const customTypes = elementTypes.filter(t => !t.is_system);
  const systemTypes = elementTypes.filter(t => t.is_system);

  const resetTypeForm = () => {
    setTypeForm({
      name: '',
      description: '',
      icon: '📝',
      color: '#d97706',
    });
  };

  const resetFieldForm = () => {
    setFieldForm({
      name: '',
      slug: '',
      field_type: 'text',
      description: '',
      placeholder: '',
      is_required: false,
      is_featured: false,
      show_in_list: true,
      options: [],
      default_value: '',
    });
    setNewOption({ value: '', label: '' });
  };

  // Create new element type
  const handleCreateType = async () => {
    if (!typeForm.name.trim()) return;
    
    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/api/worlds/${worldId}/element-types`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(typeForm),
      });

      if (res.ok) {
        resetTypeForm();
        setShowCreateType(false);
        onTypesChange();
      } else {
        const err = await res.json();
        alert(err.error?.message || 'Failed to create');
      }
    } catch (e) {
      alert('Failed to create element type');
    } finally {
      setSaving(false);
    }
  };

  // Delete element type
  const handleDeleteType = async (typeId: string) => {
    if (!confirm('Delete this element type? All elements of this type will also be deleted.')) return;
    
    try {
      const res = await fetch(`${apiUrl}/api/element-types/${typeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.ok) {
        if (selectedType?.id === typeId) setSelectedType(null);
        onTypesChange();
      } else {
        alert('Failed to delete');
      }
    } catch (e) {
      alert('Failed to delete element type');
    }
  };

  // Add field to type
  const handleCreateField = async () => {
    if (!selectedType || !fieldForm.name.trim()) return;
    
    setSaving(true);
    try {
      const slug = fieldForm.slug || fieldForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      
      const res = await fetch(`${apiUrl}/api/element-types/${selectedType.id}/fields`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ...fieldForm,
          slug,
          options: fieldForm.options.length > 0 ? fieldForm.options : undefined,
        }),
      });

      if (res.ok) {
        resetFieldForm();
        setShowCreateField(false);
        onTypesChange();
      } else {
        const err = await res.json();
        alert(err.error?.message || 'Failed to add field');
      }
    } catch (e) {
      alert('Failed to add field');
    } finally {
      setSaving(false);
    }
  };

  // Update field
  const handleUpdateField = async () => {
    if (!editingField) return;
    
    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/api/element-type-fields/${editingField.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ...fieldForm,
          options: fieldForm.options.length > 0 ? fieldForm.options : undefined,
        }),
      });

      if (res.ok) {
        resetFieldForm();
        setEditingField(null);
        onTypesChange();
      } else {
        alert('Failed to update field');
      }
    } catch (e) {
      alert('Failed to update field');
    } finally {
      setSaving(false);
    }
  };

  // Delete field
  const handleDeleteField = async (fieldId: string) => {
    if (!confirm('Delete this field?')) return;
    
    try {
      const res = await fetch(`${apiUrl}/api/element-type-fields/${fieldId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.ok) {
        onTypesChange();
      } else {
        alert('Failed to delete field');
      }
    } catch (e) {
      alert('Failed to delete field');
    }
  };

  const openEditField = (field: ElementTypeField) => {
    setEditingField(field);
    setFieldForm({
      name: field.name,
      slug: field.slug,
      field_type: field.field_type,
      description: field.description || '',
      placeholder: field.placeholder || '',
      is_required: field.is_required,
      is_featured: field.is_featured,
      show_in_list: field.show_in_list,
      options: field.options || [],
      default_value: field.default_value || '',
    });
  };

  const addOption = () => {
    if (newOption.value && newOption.label) {
      setFieldForm({
        ...fieldForm,
        options: [...fieldForm.options, { ...newOption }],
      });
      setNewOption({ value: '', label: '' });
    }
  };

  const removeOption = (index: number) => {
    setFieldForm({
      ...fieldForm,
      options: fieldForm.options.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Element Types List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="font-semibold text-white">Element Types</h3>
          <button
            onClick={() => setShowCreateType(true)}
            className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-gray-700 rounded-lg"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="divide-y divide-gray-700 max-h-[60vh] overflow-y-auto">
          {/* Custom Types */}
          {customTypes.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-gray-900 text-xs text-gray-500 uppercase tracking-wider">
                Custom Types
              </div>
              {customTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type)}
                  className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                    selectedType?.id === type.id
                      ? 'bg-amber-600/20 border-l-2 border-amber-500'
                      : 'hover:bg-gray-700/50'
                  }`}
                >
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                    style={{ backgroundColor: type.color ? `${type.color}20` : '#374151' }}
                  >
                    {type.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{type.name}</div>
                    <div className="text-xs text-gray-500">{type.fields?.length || 0} fields</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* System Types */}
          <div>
            <div className="px-4 py-2 bg-gray-900 text-xs text-gray-500 uppercase tracking-wider">
              System Templates
            </div>
            {systemTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type)}
                className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                  selectedType?.id === type.id
                    ? 'bg-gray-700/50 border-l-2 border-gray-500'
                    : 'hover:bg-gray-700/50'
                }`}
              >
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                  style={{ backgroundColor: type.color ? `${type.color}20` : '#374151' }}
                >
                  {type.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-300 font-medium truncate">{type.name}</div>
                  <div className="text-xs text-gray-500">{type.fields?.length || 0} fields</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Type Details */}
      <div className="lg:col-span-2">
        {selectedType ? (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            {/* Type Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: selectedType.color ? `${selectedType.color}20` : '#374151' }}
                >
                  {selectedType.icon}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedType.name}</h3>
                  {selectedType.description && (
                    <p className="text-sm text-gray-400">{selectedType.description}</p>
                  )}
                </div>
              </div>
              {!selectedType.is_system && (
                <button
                  onClick={() => handleDeleteType(selectedType.id)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Fields */}
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-white">Fields</h4>
                {!selectedType.is_system && (
                  <button
                    onClick={() => setShowCreateField(true)}
                    className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Field
                  </button>
                )}
              </div>

              {selectedType.fields && selectedType.fields.length > 0 ? (
                <div className="space-y-2">
                  {[...selectedType.fields].sort((a, b) => a.sort_order - b.sort_order).map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg group"
                    >
                      <Bars3Icon className="w-4 h-4 text-gray-500" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{field.name}</span>
                          <span className="text-xs px-2 py-0.5 bg-gray-600 text-gray-300 rounded">
                            {FIELD_TYPES[field.field_type as keyof typeof FIELD_TYPES]?.label || field.field_type}
                          </span>
                          {field.is_required && (
                            <span className="text-xs text-red-400">Required</span>
                          )}
                          {field.is_featured && (
                            <span className="text-xs text-amber-400">Featured</span>
                          )}
                        </div>
                        {field.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{field.description}</p>
                        )}
                      </div>
                      {!selectedType.is_system && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditField(field)}
                            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteField(field.id)}
                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No fields defined yet.</p>
                  {!selectedType.is_system && (
                    <button
                      onClick={() => setShowCreateField(true)}
                      className="mt-2 text-amber-400 hover:text-amber-300"
                    >
                      Add your first field
                    </button>
                  )}
                </div>
              )}

              {selectedType.is_system && (
                <p className="mt-4 text-sm text-gray-500 italic">
                  System templates cannot be edited. Create a custom type to define your own fields.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
            <p className="text-gray-400">Select an element type to view or edit its fields</p>
          </div>
        )}
      </div>

      {/* Create Type Modal */}
      {showCreateType && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Create Element Type</h3>
              <button onClick={() => setShowCreateType(false)} className="p-1 text-gray-400 hover:text-white">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                  <input
                    type="text"
                    value={typeForm.name}
                    onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="e.g., Vehicle, Faction"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Icon</label>
                  <input
                    type="text"
                    value={typeForm.icon}
                    onChange={(e) => setTypeForm({ ...typeForm, icon: e.target.value })}
                    className="w-16 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-xl"
                    maxLength={2}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={typeForm.description}
                  onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  rows={2}
                  placeholder="What is this element type for?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                <div className="flex gap-2">
                  {['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#6366F1'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setTypeForm({ ...typeForm, color })}
                      className={`w-8 h-8 rounded-lg border-2 ${typeForm.color === color ? 'border-white' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-gray-700">
              <button onClick={() => setShowCreateType(false)} className="px-4 py-2 text-gray-300 hover:text-white">
                Cancel
              </button>
              <button
                onClick={handleCreateType}
                disabled={saving || !typeForm.name.trim()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 text-white rounded-lg"
              >
                {saving ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Field Modal */}
      {(showCreateField || editingField) && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">
                {editingField ? 'Edit Field' : 'Add Field'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateField(false);
                  setEditingField(null);
                  resetFieldForm();
                }}
                className="p-1 text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                  <input
                    type="text"
                    value={fieldForm.name}
                    onChange={(e) => setFieldForm({ ...fieldForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="e.g., Population"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Type *</label>
                  <select
                    value={fieldForm.field_type}
                    onChange={(e) => setFieldForm({ ...fieldForm, field_type: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    {Object.entries(FIELD_TYPES).map(([key, { label, icon }]) => (
                      <option key={key} value={key}>{icon} {label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <input
                  type="text"
                  value={fieldForm.description}
                  onChange={(e) => setFieldForm({ ...fieldForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="Help text for this field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Placeholder</label>
                <input
                  type="text"
                  value={fieldForm.placeholder}
                  onChange={(e) => setFieldForm({ ...fieldForm, placeholder: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="Example value shown in empty field"
                />
              </div>

              {/* Options for select/multiselect */}
              {(fieldForm.field_type === 'select' || fieldForm.field_type === 'multiselect') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Options</label>
                  <div className="space-y-2 mb-2">
                    {fieldForm.options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-gray-700 rounded-lg">
                        <span className="text-white">{opt.label}</span>
                        <span className="text-gray-500">({opt.value})</span>
                        <button
                          type="button"
                          onClick={() => removeOption(idx)}
                          className="ml-auto p-1 text-gray-400 hover:text-red-400"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newOption.label}
                      onChange={(e) => setNewOption({ ...newOption, label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                      placeholder="Option label"
                    />
                    <button
                      type="button"
                      onClick={addOption}
                      className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={fieldForm.is_required}
                    onChange={(e) => setFieldForm({ ...fieldForm, is_required: e.target.checked })}
                    className="w-4 h-4 rounded bg-gray-700 border-gray-600"
                  />
                  Required
                </label>
                <label className="flex items-center gap-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={fieldForm.is_featured}
                    onChange={(e) => setFieldForm({ ...fieldForm, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded bg-gray-700 border-gray-600"
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={fieldForm.show_in_list}
                    onChange={(e) => setFieldForm({ ...fieldForm, show_in_list: e.target.checked })}
                    className="w-4 h-4 rounded bg-gray-700 border-gray-600"
                  />
                  Show in list
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-gray-700">
              <button
                onClick={() => {
                  setShowCreateField(false);
                  setEditingField(null);
                  resetFieldForm();
                }}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={editingField ? handleUpdateField : handleCreateField}
                disabled={saving || !fieldForm.name.trim()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 text-white rounded-lg"
              >
                {saving ? 'Saving...' : editingField ? 'Update' : 'Add Field'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
