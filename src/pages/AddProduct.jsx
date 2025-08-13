import React, { useState } from 'react';
import axios from 'axios';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    product_name: '',
    product_description: '',
    brand: '',
    category: '',
    features: '',
    color: '',
    stock_quantity: '',
    cost_price: '',
    selling_price: '',
    rating: '',
  });
  const [productPhoto, setProductPhoto] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = e => {
    setProductPhoto(e.target.files[0]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      if (productPhoto) data.append('product_photo', productPhoto);

      const response = await axios.post('https://biz4293.pythonanywhere.com/api/add_product', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Product added successfully');
      setFormData({
        product_name: '',
        product_description: '',
        brand: '',
        category: '',
        features: '',
        color: '',
        stock_quantity: '',
        cost_price: '',
        selling_price: '',
        rating: '',
      });
      setProductPhoto(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-[#5a3921] mb-6">Add New Product</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
        <input
          type="text"
          name="product_name"
          placeholder="Product Name"
          value={formData.product_name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8c5e3b]"
        />
        <textarea
          name="product_description"
          placeholder="Product Description"
          value={formData.product_description}
          onChange={handleChange}
          required
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#8c5e3b]"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            name="brand"
            placeholder="Brand"
            value={formData.brand}
            onChange={handleChange}
            required
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8c5e3b]"
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            required
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8c5e3b]"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            name="features"
            placeholder="Features"
            value={formData.features}
            onChange={handleChange}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8c5e3b]"
          />
          <input
            type="text"
            name="color"
            placeholder="Color"
            value={formData.color}
            onChange={handleChange}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8c5e3b]"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="number"
            name="stock_quantity"
            placeholder="Stock Quantity"
            value={formData.stock_quantity}
            onChange={handleChange}
            required
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8c5e3b]"
          />
          <input
            type="number"
            step="0.01"
            name="cost_price"
            placeholder="Cost Price"
            value={formData.cost_price}
            onChange={handleChange}
            required
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8c5e3b]"
          />
          <input
            type="number"
            step="0.01"
            name="selling_price"
            placeholder="Selling Price"
            value={formData.selling_price}
            onChange={handleChange}
            required
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8c5e3b]"
          />
        </div>
        <input
          type="number"
          step="0.1"
          name="rating"
          placeholder="Rating (0 to 5)"
          value={formData.rating}
          onChange={handleChange}
          min="0"
          max="5"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8c5e3b]"
        />
        <div>
          <label className="block mb-2 font-medium text-gray-700">Product Photo</label>
          <input
            type="file"
            name="product_photo"
            accept="image/*"
            onChange={handleFileChange}
            required
            className="w-full text-gray-700"
          />
        </div>
        {error && <p className="text-red-600 font-medium">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md transition duration-200 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
