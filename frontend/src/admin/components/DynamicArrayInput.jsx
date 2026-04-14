import { FaPlus, FaTrash } from 'react-icons/fa';

const parseItems = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try { const p = JSON.parse(value); return Array.isArray(p) ? p : []; }
    catch { return []; }
  }
  return [];
};

const DynamicArrayInput = ({ value, onChange, label, placeholder = "Enter item..." }) => {
  const items = parseItems(value);

  const updateParent = (newItems) => {
    onChange(JSON.stringify(newItems));
  };

  const addItem = () => {
    updateParent([...items, '']);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    updateParent(newItems);
  };

  const updateItem = (index, newValue) => {
    const newItems = items.map((item, i) => i === index ? newValue : item);
    updateParent(newItems);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-2 text-sm bg-cyan-600 text-white px-3 py-1.5 rounded-lg hover:bg-cyan-700 transition-colors"
        >
          <FaPlus className="text-xs" />
          Add Item
        </button>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No items yet. Click "Add Item" to get started.</p>
        ) : (
          items.map((item, index) => (
            <div key={index} className="space-y-1">
              <label className="block text-sm font-medium text-gray-600">
                {label} {index + 1}
              </label>
              <div className="flex items-start gap-2">
                <textarea
                  value={item}
                  onChange={(e) => updateItem(index, e.target.value)}
                  placeholder={placeholder}
                  rows={3}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-vertical"
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  title="Remove item"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DynamicArrayInput;
