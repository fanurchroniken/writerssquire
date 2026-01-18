import { useEffect, useMemo, useRef, useState } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface CustomAttributesEditorProps {
  value: Record<string, string>;
  onChange: (nextValue: Record<string, string>) => void;
  label?: string;
}

interface AttributeRow {
  id: string;
  key: string;
  value: string;
}

const EMPTY_VALUE: Record<string, string> = {};

const buildRows = (input: Record<string, string>): AttributeRow[] =>
  Object.entries(input || {}).map(([key, value]) => ({
    id: `${key}-${Math.random().toString(36).slice(2)}`,
    key,
    value: value ?? '',
  }));

const rowsToObject = (rows: AttributeRow[]): Record<string, string> =>
  rows.reduce<Record<string, string>>((acc, row) => {
    const trimmedKey = row.key.trim();
    if (!trimmedKey) return acc;
    acc[trimmedKey] = row.value;
    return acc;
  }, {});

export default function CustomAttributesEditor({
  value,
  onChange,
  label = 'Custom attributes',
}: CustomAttributesEditorProps) {
  const initialValue = useMemo(() => value || EMPTY_VALUE, [value]);
  const [rows, setRows] = useState<AttributeRow[]>(() => buildRows(initialValue));
  const lastSerialized = useRef(JSON.stringify(initialValue));

  useEffect(() => {
    const serialized = JSON.stringify(value || EMPTY_VALUE);
    if (serialized === lastSerialized.current) return;
    lastSerialized.current = serialized;
    setRows(buildRows(value || EMPTY_VALUE));
  }, [value]);

  const updateRows = (nextRows: AttributeRow[]) => {
    setRows(nextRows);
    const nextValue = rowsToObject(nextRows);
    lastSerialized.current = JSON.stringify(nextValue);
    onChange(nextValue);
  };

  const handleAddRow = () => {
    updateRows([
      ...rows,
      { id: `row-${Date.now()}-${Math.random().toString(36).slice(2)}`, key: '', value: '' },
    ]);
  };

  const handleRemoveRow = (rowId: string) => {
    updateRows(rows.filter((row) => row.id !== rowId));
  };

  const handleKeyChange = (rowId: string, nextKey: string) => {
    updateRows(
      rows.map((row) => (row.id === rowId ? { ...row, key: nextKey } : row))
    );
  };

  const handleValueChange = (rowId: string, nextValue: string) => {
    updateRows(
      rows.map((row) => (row.id === rowId ? { ...row, value: nextValue } : row))
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-300">{label}</label>
        <button
          type="button"
          onClick={handleAddRow}
          className="btn btn-secondary btn-sm"
        >
          <PlusIcon className="w-4 h-4" />
          Add attribute
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-700 px-4 py-6 text-center text-sm text-gray-500">
          Add custom attributes to capture details unique to this element.
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] items-center"
            >
              <input
                type="text"
                value={row.key}
                onChange={(event) => handleKeyChange(row.id, event.target.value)}
                placeholder="Attribute"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <input
                type="text"
                value={row.value}
                onChange={(event) => handleValueChange(row.id, event.target.value)}
                placeholder="Value"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => handleRemoveRow(row.id)}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg"
                aria-label="Remove attribute"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
