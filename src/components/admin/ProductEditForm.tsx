'use client';

interface Category {
  id: number;
  name: string;
}

interface ProductEditFormProps {
  formData: {
    name: string;
    description: string;
    price: number;
    categoryId: number;
  };
  categories: Category[];
  onChange: (data: Partial<ProductEditFormProps['formData']>) => void;
  loading?: boolean;
}

export default function ProductEditForm({
  formData,
  categories,
  onChange,
  loading = false,
}: ProductEditFormProps) {
  return (
    <div className="space-y-6">
      {/* Product Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Product Name
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Enter product name"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={loading}
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Enter product description"
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          disabled={loading}
        />
      </div>

      {/* Price & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Price */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Price (IDR)
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={formData.price}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              onChange({ price: value ? Number(value) : 0 });
            }}
            placeholder="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={loading}
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Category
            <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            value={formData.categoryId}
            onChange={(e) => onChange({ categoryId: Number(e.target.value) })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={loading}
            required
          >
            <option value={0} disabled>
              Select a category
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}